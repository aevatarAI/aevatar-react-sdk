import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import vike from "vike/plugin";
import { defineConfig } from "vite";
import { imagetools } from "vite-imagetools";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import svgr from "vite-plugin-svgr";
import tailwindcss from "@tailwindcss/vite";
// import mkcert from "vite-plugin-mkcert";

export default defineConfig((config) => ({
  plugins: [
    nodePolyfills(),
    vike({ prerender: true }),
    react({}),
    svgr(),
    imagetools(),
    tailwindcss(),
    // mkcert(),
  ],

  resolve: {
    alias: {
      "@": config.mode === "production" ? __dirname : resolve(__dirname, "./"),
    },
  },

  optimizeDeps: {
    // disabled: false,
    include: [],
    exclude: ["coverage"],
  },

  server: {
    cors: true,
    allowedHosts: true,
    proxy: {
      "/connect": {
        target: "https://auth-station-staging.aevatar.ai",
        changeOrigin: true,
        secure: true,
        // rewrite: (path) => path.replace(/^\/auth/, ''),
      },
      "/api": {
        target: "https://station-developer-staging.aevatar.ai/sdk-client",
        changeOrigin: true,
        secure: true,
        // rewrite: (path) => path.replace(/^\/test-client/, ''),
      },
    },
  },
}));
