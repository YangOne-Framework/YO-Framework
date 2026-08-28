import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

function nvidiaProxyPlugin(): Plugin {
  return {
    name: "nvidia-proxy",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith("/api/nvidia-proxy")) return next();
        let body = Buffer.alloc(0);
        req.on("data", (c: Buffer) => body = Buffer.concat([body, c]));
        req.on("end", () => {
          const targetPath = req.url!.replace("/api/nvidia-proxy", "") || "/";
          const targetUrl = `https://integrate.api.nvidia.com${targetPath}`;
          const hdrs = { ...req.headers } as Record<string, string>;
          delete hdrs.host;
          delete hdrs["content-length"];
          delete hdrs["transfer-encoding"];
          delete hdrs["connection"];
          fetch(targetUrl, {
            method: req.method,
            headers: hdrs,
            body: body.length > 0 ? body : undefined,
          })
            .then(async (r) => {
              res.statusCode = r.status;
              r.headers.forEach((v, k) => res.setHeader(k, v));
              res.end(await r.text());
            })
            .catch((err: any) => {
              console.error("Proxy error:", err);
              if (!res.headersSent) {
                res.statusCode = 500;
                res.setHeader("content-type", "application/json");
                res.end(JSON.stringify({ error: err.message }));
              }
            });
        });
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    nvidiaProxyPlugin(),
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        // This will transform your SVG to a React component
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  define: {
    // Polyfill Node.js globals for browser
    global: "globalThis",
  },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // Split heavy vendors out of the entry chunk so the admin shell
        // paints without waiting for editors/charts/calendars to parse.
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          redux: ["@reduxjs/toolkit", "react-redux", "axios"],
          editor: ["@monaco-editor/react", "@tinymce/tinymce-react"],
          charts: ["apexcharts", "react-apexcharts"],
          calendar: [
            "@fullcalendar/core",
            "@fullcalendar/react",
            "@fullcalendar/daygrid",
            "@fullcalendar/timegrid",
            "@fullcalendar/list",
            "@fullcalendar/interaction",
          ],
          dnd: ["react-dnd", "react-dnd-html5-backend", "@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities"],
          forms: ["react-hook-form", "@hookform/resolvers", "@hookform/error-message", "react-select"],
          maps: ["@react-jvectormap/core", "@react-jvectormap/world"],
          motion: ["framer-motion", "swiper"],
          i18n: ["i18next", "react-i18next", "i18next-http-backend", "i18next-browser-languagedetector"],
          realtime: ["@microsoft/signalr", "@microsoft/signalr-protocol-msgpack"],
        },
      },
    },
  },
  server: {
    proxy: {
      "/api/v1": {
        target: "https://localhost:7259",
        changeOrigin: true,
        secure: false,
      },
      "/api/public": {
        target: "https://localhost:7259",
        changeOrigin: true,
        secure: false,
      },
      "/connect": {
        target: "https://localhost:7259",
        changeOrigin: true,
        secure: false,
      },
      "/uploads": {
        target: "https://localhost:7259",
        changeOrigin: true,
        secure: false,
      },
      "/themes": {
        target: "https://localhost:7259",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
