import { it as test, expect, describe, beforeAll } from "vitest";

let nextConfig: Record<string, unknown>;

beforeAll(async () => {
  const configModule = await import("../next.config.js");
  nextConfig = configModule.default as Record<string, unknown>;
});

describe("Next.js Configuration", () => {
  test("has React strict mode enabled", () => {
    expect(nextConfig.reactStrictMode).toBe(true);
  });

  test("has X-Powered-By header disabled", () => {
    expect(nextConfig.poweredByHeader).toBe(false);
  });

  test("has compression enabled", () => {
    expect(nextConfig.compress).toBe(true);
  });

  test("has proper image optimization settings", () => {
    expect(nextConfig.images).toMatchObject({
      formats: expect.arrayContaining(["image/avif", "image/webp"]),
      deviceSizes: expect.arrayContaining([
        640, 750, 828, 1080, 1200, 1920, 2048,
      ]),
      imageSizes: expect.arrayContaining([16, 32, 48, 64, 96, 128, 256]),
      minimumCacheTTL: 60,
      dangerouslyAllowSVG: true,
    });
  });

  test("has TypeScript build enforcement enabled", () => {
    expect(nextConfig.typescript).toMatchObject({
      ignoreBuildErrors: false,
    });
  });

  test("has ESLint build enforcement enabled", () => {
    expect(nextConfig.eslint).toMatchObject({
      ignoreDuringBuilds: false,
    });
  });

  test("does not force static export (API routes enabled)", () => {
    expect(nextConfig.output).toBeUndefined();
  });
});
