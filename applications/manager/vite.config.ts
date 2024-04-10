import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
 
export default defineConfig({
  base: "",
  plugins: [react()],
  optimizeDeps: {
    include: ["@dataspecer/core-v2/project", "@dataspecer/core/**", "@dataspecer/core-v2/**"]
  },
  build: {
    commonjsOptions: {
      include: [/packages\//, /node_modules/],
    },
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "fs": "path", // Hack to make polyfill to null
    },
  },
})