import { defineConfig } from "vite";
import { resolve } from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/ascii-art/",
  root: "src",
  plugins: [
    tailwindcss(),
    viteStaticCopy({
      targets: [],
    }),
  ],
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    minify: "esbuild",
    rollupOptions: {
      input: {
        index: resolve(__dirname, "src/index.html"),
      },
      output: {
        // JS chunks and entries go to assets/js
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        // CSS files go to assets/css
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith(".css")) {
            return "assets/css/[name]-[hash][extname]";
          }
          // other assets (images/fonts) stay in their folder
          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },
});
