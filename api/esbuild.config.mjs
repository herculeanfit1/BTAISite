import { readFileSync } from "node:fs";
import { build } from "esbuild";

const pkg = JSON.parse(readFileSync("./package.json", "utf8"));

const external = Object.keys(pkg.dependencies || {});

await build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  outfile: "dist/index.js",
  format: "esm",
  platform: "node",
  target: "node22",
  external,
  sourcemap: true,
});
