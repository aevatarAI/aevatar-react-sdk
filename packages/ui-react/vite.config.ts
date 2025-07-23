import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import svgr from "vite-plugin-svgr";
import dts from "vite-plugin-dts";
import tailwindcss from "@tailwindcss/vite";
import pkg from "./package.json";
import { vitestConfigObj } from "../../vitest-config";
import { defineConfig as vitestConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({ include: "**/*.svg?react" }),
    dts({ insertTypesEntry: true, outDir: "dist/types" }),
    tailwindcss(),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, "index.ts"),
      name: pkg.name,
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: ["react", "react-dom", "buffer"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          buffer: "Buffer",
        },
      },
    },
  },
  test: {
    ...vitestConfigObj,
    environment: "happy-dom",
    setupFiles: ["./vitest.setup"],
  },
});
