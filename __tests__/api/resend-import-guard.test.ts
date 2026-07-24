import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

// Enforces the EmailProvider seam (plan A2): `resend` may be imported ONLY by
// resend-provider.ts. Any other importer means the seam has been bypassed and a
// future provider swap would no longer be a one-file change.
function collectTsFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...collectTsFiles(full));
    } else if (/\.(ts|tsx)$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

const RESEND_IMPORT = /from\s+["']resend["']|require\(\s*["']resend["']\s*\)/;

describe("EmailProvider seam import guard (A2)", () => {
  it("only resend-provider.ts imports `resend`", () => {
    const roots = [
      join(process.cwd(), "src", "lib", "api"),
      join(process.cwd(), "app", "api"),
    ];

    const offenders: string[] = [];
    for (const root of roots) {
      for (const file of collectTsFiles(root)) {
        if (file.endsWith("resend-provider.ts")) continue;
        if (RESEND_IMPORT.test(readFileSync(file, "utf8"))) {
          offenders.push(file);
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});
