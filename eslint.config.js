// Modern ESLint configuration for Next.js 15 with TypeScript
// Targeted approach: lint source code, exclude config/build files
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next';
import securityPlugin from 'eslint-plugin-security';

export default tseslint.config(
  // Base recommended configs
  js.configs.recommended,
  ...tseslint.configs.recommended,
  
  // Main configuration for source code
  {
    files: [
      'app/**/*.{ts,tsx,js,jsx}',
      'src/**/*.{ts,tsx,js,jsx}',
      'lib/**/*.{ts,tsx,js,jsx}',
      'types/**/*.ts'
    ],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        },
      },
      globals: {
        React: 'readonly',
        JSX: 'readonly',
        NodeJS: 'readonly',
      }
    },
    plugins: {
      '@next/next': nextPlugin,
      'security': securityPlugin
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'security/detect-object-injection': 'warn',
      'security/detect-non-literal-regexp': 'warn',
      '@next/next/no-html-link-for-pages': 'warn',
      // Cursor rules: no console.log in production paths
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  },
  
  // Configuration for test files (more relaxed)
  {
    files: [
      '__tests__/**/*.{ts,tsx,js,jsx}',
      '**/*.test.{ts,tsx,js,jsx}',
      '**/*.spec.{ts,tsx,js,jsx}',
      'tests/**/*.{ts,tsx,js,jsx}'
    ],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      globals: {
        // Test framework globals
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        jest: 'readonly',
        vi: 'readonly',
        vitest: 'readonly',
        // Node.js globals for test utils
        process: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        // Browser globals for test utils
        window: 'readonly',
      }
    },
    rules: {
      // More relaxed rules for tests
      '@typescript-eslint/no-explicit-any': 'off',
      'security/detect-object-injection': 'off',
      'no-console': 'off',
    }
  },
  
  // Global ignores - files that should never be linted
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      // Config files
      '*.config.js',
      '*.config.mjs', 
      '*.config.cjs',
      'postcss.config.*',
      'tailwind.config.*',
      'vitest.config.*',
      'jest.config.*',
      'lighthouserc.js',
      '.eslintrc*',
      // Setup and build files
      'jest.setup.*',
      'vitest.setup.*',
      'server.js',
      'minimal-server.*',
      'safari-server.js',
      'test-server.js',
      // Scripts and tools
      'scripts/**',
      'ci/**',
      // Mock files
      '__mocks__/**',
      // Problematic test files
      '__tests__/utils/test-utils.js',
      '__tests__/utils/ci-test-mode.js',
      // Legacy test files with unused imports
      '__tests__/components/Todo.test.tsx',
      '__tests__/integration/ThemeSwitching.test.tsx',
      '__tests__/integration/TodoPage.test.tsx',
      '__tests__/middleware.test.ts',
      '__tests__/utils/responsive-test-utils.ts',
      '__tests__/utils/test-utils.ts',
      // Build artifacts
      '**/*.d.ts',
      'staticwebapp.config.json',
      // Test directories with different configs
      'test-minimal/**',
      'temp_page.html',
      'test-globe.html'
    ]
  }
);