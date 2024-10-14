import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [react()],
  // See https://vitejs.dev/guide/dep-pre-bundling#monorepos-and-linked-dependencies
  optimizeDeps: {
    include: [
      "@dataspecer/core/**",
      "@dataspecer/core-v2/**"
    ]
  },
  build: {
    commonjsOptions: {
      include: [/packages\//, /node_modules/],
    },
    rollupOptions: {
      input: {
        diagram: resolve(__dirname, "diagram.html"),
      },
    }
  },
  resolve: {
    alias: {
      // Hack to make polyfill to null.
      // We need this as the "fs", packages/core/lib/io/fetch/fetch-nodejs.js.
      "fs": "path",
    },
  },
})
