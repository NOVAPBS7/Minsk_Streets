import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import { visualizer } from "rollup-plugin-visualizer";
import { componentTagger } from "lovable-tagger";

function stableCustomHashFromName(name: string) {
  const hash = crypto.createHash("sha1").update(name).digest("hex");
  const chars = "1234567bcdefg";
  let out = "";
  for (let i = 0; i < hash.length; i++) {
    const code = parseInt(hash[i], 16);
    out += chars[(code + i) % chars.length];
  }
  return out
    .slice(0, 32)
    .replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5");
}

function replaceMediaLinksPlugin() {
  return {
    name: "replace-media-links",
    closeBundle() {
      const cdnBase = "https://assets.novapbs.ru/";
      const buildDir = path.resolve(__dirname, "build");

      const walk = (dir: string) => {
        for (const file of fs.readdirSync(dir)) {
          const full = path.join(dir, file);
          if (fs.statSync(full).isDirectory()) walk(full);
          else if (/\.(html|js|css)$/.test(full)) {
            let c = fs.readFileSync(full, "utf-8");
            c = c
              .replace(/(["'])\/images\//g, `$1${cdnBase}images/`)
              .replace(/(["'])\/videos\//g, `$1${cdnBase}videos/`)
              .replace(/url\(\/images\//g, `url(${cdnBase}images/`)
              .replace(/url\(\/videos\//g, `url(${cdnBase}videos/`);
            fs.writeFileSync(full, c);
          }
        }
      };

      walk(buildDir);
    },
  };
}

export default defineConfig(({ mode }) => ({
  base: "/",
  publicDir: "public",

  build: {
    outDir: "build",
    assetsDir: "",
    sourcemap: false,
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 900,

    rollupOptions: {
      output: {
        entryFileNames: "assets/js/app-[hash].js",
        chunkFileNames: "assets/js/chunk-[hash].js",

        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("three")) return "three";
            if (id.includes("gsap")) return "gsap";
            return "vendor";
          }

          if (id.includes("/src/pages/")) return "pages";
          if (id.includes("/src/components/AIChat/")) return "aichat";
          if (id.includes("/src/components/Map/")) return "map";
        },

        assetFileNames: ({ name }) => {
          if (!name) return "assets/[hash][extname]";
          const h = stableCustomHashFromName(name);

          if (/\.(png|jpe?g|gif|svg|webp)$/.test(name))
            return `images/${h}[extname]`;

          if (/\.mp4$/.test(name))
            return `videos/${h}[extname]`;

          if (/\.css$/.test(name))
            return "assets/css/styles-[hash][extname]";

          return "assets/[hash][extname]";
        },
      },
    },
  },

  server: {
    host: "0.0.0.0",
    port: 3000,
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  plugins: [
    react(),
    mode === "development" && componentTagger(),
    replaceMediaLinksPlugin(),
    mode === "production" &&
      visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
        filename: "stats.html",
      }),
  ].filter(Boolean),
}));