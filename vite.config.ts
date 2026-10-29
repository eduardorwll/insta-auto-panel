import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import fs from "fs";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "archify-static-diagram",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const reqUrl = req.url?.split("?")[0];
          if (reqUrl === "/architecture" || reqUrl === "/architecture.html") {
            const archPath = path.resolve(
              import.meta.dirname,
              "./docs/architecture.html"
            );
            if (fs.existsSync(archPath)) {
              res.setHeader("Content-Type", "text/html; charset=utf-8");
              res.end(fs.readFileSync(archPath, "utf-8"));
              return;
            }
          }
          next();
        });
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/architecture": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/renders": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
