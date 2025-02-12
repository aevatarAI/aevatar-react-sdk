import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import svgr from "vite-plugin-svgr";
import dts from "vite-plugin-dts";
import tailwindcss from "@tailwindcss/vite";

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
      name: "@aevatar-react-sdk/ui-react",
      formats: ["es", "cjs"],
      fileName: format => `index.${format}.js`,
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
});
