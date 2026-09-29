import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { problemsPlugin } from "./vite-plugin-problems";

const lectorDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(lectorDir, "..");

export default defineConfig({
  plugins: [react(), problemsPlugin(repoRoot)],
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
  build: {
    target: "es2022",
    modulePreload: {
      resolveDependencies(_filename, deps) {
        return deps.filter((dep) => !/katex|highlight\.js/.test(dep));
      },
    },
  },
});
