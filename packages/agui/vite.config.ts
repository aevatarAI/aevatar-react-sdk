import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { resolve, isAbsolute } from "node:path";
import pkg from "./package.json";
import { vitestConfigObj } from "../../vitest-config";

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    sourcemap: true,
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: pkg.name,
      fileName: "index",
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: (id) => !(isAbsolute(id) || id.startsWith(".")),
      output: {
        globals: {},
      },
    },
  },
  test: vitestConfigObj,
});
