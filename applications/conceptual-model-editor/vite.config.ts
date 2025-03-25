import path  from "path";
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5173,
  },
  base: "./",
  plugins: [
    react(),
    tailwindcss(),
  ],
  // See https://vitejs.dev/guide/dep-pre-bundling#monorepos-and-linked-dependencies
  // When making changes to the linked dep, restart the dev server with
  // the --force command line option for the changes to take effect.
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
        diagram: path.resolve(__dirname, "diagram.html"),
      },
    }
  },
  resolve: {
    alias: {
      // Hack to make polyfill to null.
      // We need this as the "fs", packages/core/lib/io/fetch/fetch-nodejs.js.
      "fs": "path",
      // https://ui.shadcn.com/docs/installation/vite
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
