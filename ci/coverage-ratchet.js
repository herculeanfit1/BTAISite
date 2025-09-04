#!/usr/bin/env node

/**
 * Coverage Ratchet - Prevents coverage regression
 * Compares current coverage against baseline and fails if any metric drops
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const COVERAGE_FILE = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
const BASELINE_FILE = path.join(process.cwd(), 'coverage', 'baseline.json');
const MIN_THRESHOLDS = {
  lines: 70,
  statements: 70,
  functions: 70,
  branches: 60
};

/**
 * Load coverage data from file
 */
function loadCoverage(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return data.total;
  } catch (error) {
    console.error(`❌ Error loading coverage from ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Save coverage data as baseline
 */
function saveBaseline(coverage) {
  try {
    const baselineData = {
      timestamp: new Date().toISOString(),
      coverage: coverage
    };
    fs.writeFileSync(BASELINE_FILE, JSON.stringify(baselineData, null, 2));
    console.log(`✅ Baseline saved: ${BASELINE_FILE}`);
  } catch (error) {
    console.error(`❌ Error saving baseline:`, error.message);
  }
}

/**
 * Compare coverage metrics
 */
function compareCoverage(current, baseline) {
  const results = {
    passed: true,
    details: []
  };

  for (const metric of ['lines', 'statements', 'functions', 'branches']) {
    const currentPct = current[metric].pct;
    const baselinePct = baseline[metric].pct;
    const minThreshold = MIN_THRESHOLDS[metric];

    // Check against absolute minimum
    if (currentPct < minThreshold) {
      results.passed = false;
      results.details.push({
        metric,
        current: currentPct,
        baseline: baselinePct,
        threshold: minThreshold,
        status: 'FAIL_THRESHOLD',
        message: `${metric} coverage ${currentPct}% is below minimum threshold ${minThreshold}%`
      });
      continue;
    }

    // Check against baseline (allow small fluctuations)
    const tolerance = 0.5; // 0.5% tolerance for measurement variations
    if (currentPct < baselinePct - tolerance) {
      results.passed = false;
      results.details.push({
        metric,
        current: currentPct,
        baseline: baselinePct,
        threshold: minThreshold,
        status: 'FAIL_REGRESSION',
        message: `${metric} coverage regressed from ${baselinePct}% to ${currentPct}% (dropped by ${(baselinePct - currentPct).toFixed(1)}%)`
      });
    } else if (currentPct > baselinePct + tolerance) {
      results.details.push({
        metric,
        current: currentPct,
        baseline: baselinePct,
        threshold: minThreshold,
        status: 'IMPROVED',
        message: `${metric} coverage improved from ${baselinePct}% to ${currentPct}% (+${(currentPct - baselinePct).toFixed(1)}%)`
      });
    } else {
      results.details.push({
        metric,
        current: currentPct,
        baseline: baselinePct,
        threshold: minThreshold,
        status: 'MAINTAINED',
        message: `${metric} coverage maintained at ${currentPct}%`
      });
    }
  }

  return results;
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const isUpdateBaseline = args.includes('--update-baseline');
  const isVerbose = args.includes('--verbose');

  console.log('🔍 Coverage Ratchet Analysis');
  console.log('============================');

  // Load current coverage
  const currentCoverage = loadCoverage(COVERAGE_FILE);
  if (!currentCoverage) {
    console.error('❌ No current coverage data found. Run tests with coverage first.');
    process.exit(1);
  }

  if (isVerbose) {
    console.log('📊 Current Coverage:');
    for (const [metric, data] of Object.entries(currentCoverage)) {
      if (typeof data === 'object' && data.pct !== undefined) {
        console.log(`  ${metric}: ${data.pct}% (${data.covered}/${data.total})`);
      }
    }
    console.log();
  }

  // Load baseline
  const baselineData = loadCoverage(BASELINE_FILE);
  
  if (!baselineData || isUpdateBaseline) {
    console.log('📝 Creating/updating baseline...');
    saveBaseline(currentCoverage);
    
    // Check against minimum thresholds
    let passedThresholds = true;
    for (const [metric, threshold] of Object.entries(MIN_THRESHOLDS)) {
      const current = currentCoverage[metric]?.pct || 0;
      if (current < threshold) {
        console.log(`❌ ${metric}: ${current}% < ${threshold}% (minimum threshold)`);
        passedThresholds = false;
      } else {
        console.log(`✅ ${metric}: ${current}% >= ${threshold}% (minimum threshold)`);
      }
    }
    
    if (!passedThresholds) {
      console.log('\n❌ Coverage below minimum thresholds');
      process.exit(1);
    }
    
    console.log('\n✅ Baseline established successfully');
    process.exit(0);
  }

  // Compare against baseline
  console.log('📈 Comparing against baseline...');
  const comparison = compareCoverage(currentCoverage, baselineData.coverage);

  // Report results
  console.log();
  for (const detail of comparison.details) {
    const icon = detail.status === 'IMPROVED' ? '📈' : 
                 detail.status === 'MAINTAINED' ? '✅' : '❌';
    console.log(`${icon} ${detail.message}`);
  }

  console.log();
  if (comparison.passed) {
    console.log('✅ Coverage ratchet passed - no regressions detected');
    
    // Update baseline if coverage improved significantly
    const hasSignificantImprovement = comparison.details.some(d => d.status === 'IMPROVED');
    if (hasSignificantImprovement) {
      console.log('📝 Updating baseline due to coverage improvements...');
      saveBaseline(currentCoverage);
    }
    
    process.exit(0);
  } else {
    console.log('❌ Coverage ratchet failed - regressions detected');
    console.log();
    console.log('💡 To fix:');
    console.log('  1. Add tests to improve coverage');
    console.log('  2. Or run with --update-baseline if intentional');
    process.exit(1);
  }
}

// Run main function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
