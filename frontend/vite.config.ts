import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import viteCompression from "vite-plugin-compression";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backendOrigin = (
    env.VITE_API_BASE_URL || "http://localhost:3001/api"
  ).replace(/\/api\/?$/, "");

  return {
  plugins: [
    react(),
    tailwindcss(),

    // Brotli compression (best ratio, modern browsers)
    viteCompression({
      algorithm: "brotliCompress",
      ext: ".br",
      threshold: 1024,
      deleteOriginFile: false,
      compressionOptions: {
        level: 11,
      },
    }),

    // Gzip compression (fallback)
    viteCompression({
      algorithm: "gzip",
      ext: ".gz",
      threshold: 1024,
      deleteOriginFile: false,
      compressionOptions: {
        level: 9,
      },
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    outDir: "../backend/dist", // Output to backend dist folder
    emptyOutDir: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    target: "es2015",
    minify: "esbuild",
    cssCodeSplit: true,
    cssMinify: true,

    // Improve build performance
    reportCompressedSize: false, // Skip gzip size reporting (faster builds)

    commonjsOptions: {
      include: ["node_modules/**"],
      transformMixedEsModules: true,
    },
  },

  css: {
    devSourcemap: false,
  },

  // Esbuild options for better tree-shaking
  esbuild: {
    // drop: ['console', 'debugger'],
    legalComments: "none",
    treeShaking: true,
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
  },

  // Performance optimizations
  server: {
    hmr: {
      overlay: true,
    },
    // Uploaded photo/asset URLs come back from the API as root-relative
    // paths (e.g. /uploads/photos/xyz.webp). In production the Express
    // backend serves both the API and these static files from one origin,
    // but in dev the frontend runs on a separate Vite port - proxy them
    // through so <img src="/uploads/..."> resolves correctly.
    proxy: {
      "/uploads": backendOrigin,
    },
  },

  // Improve production build performance
  worker: {
    format: "es",
  },
  };
});
