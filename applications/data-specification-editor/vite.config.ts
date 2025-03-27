import path from "path"
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import i18nextLoader from 'vite-plugin-i18next-loader'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: env.VITE_BASE_PATH ?? "/",
    server: {
      port: 5175,
    },
    plugins: [
      react(),
      i18nextLoader({
        paths: ['./locales'],
        namespaceResolution: 'basename'
      })
    ],
    optimizeDeps: {
      // grep -roh @dataspecer/[^\"\']* | sort | uniq | xargs -I- echo "        \"-\","
      include: [
        "@dataspecer/backend-utils/**",
        "@dataspecer/core-v2/**",
        "@dataspecer/core/**",
        "@dataspecer/csv/**",
        "@dataspecer/federated-observable-store-react/**",
        "@dataspecer/federated-observable-store/**",
        "@dataspecer/json-example",
        "@dataspecer/json/**",
        "@dataspecer/openapi",
        "@dataspecer/plant-uml",
        "@dataspecer/rdfs-adapter",
        "@dataspecer/sgov-adapter",
        "@dataspecer/shacl",
        "@dataspecer/shex",
        "@dataspecer/sparql-query",
        "@dataspecer/documentation/**",
        "@dataspecer/wikidata-experimental-adapter/**",
        "@dataspecer/xml/**",
        "@dataspecer/specification/**",
      ]
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
  };
})
