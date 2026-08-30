import { build as buildServer } from "esbuild";
import { rm } from "node:fs/promises";
import { build as buildClient } from "vite";

await rm("dist", { recursive: true, force: true });

await buildClient();

await buildServer({
  entryPoints: ["server/index.ts"],
  outfile: "dist/index.cjs",
  bundle: true,
  platform: "node",
  packages: "external",
  format: "cjs",
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  sourcemap: true,
});
