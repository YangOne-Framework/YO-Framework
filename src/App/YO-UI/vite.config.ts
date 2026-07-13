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
    },
  },
});
