import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// The API keeps a CORS allow-list, so in development the browser talks to /api
// on its own origin and Vite forwards the request to the backend. The browser
// still sends an Origin header on POST/PATCH, which the API would reject for an
// unknown dev port, so the proxy drops it: a request without Origin is treated
// as a server-to-server call and passes the allow-list.
const proxy = {
  "/api": {
    target: process.env.VITE_PROXY_TARGET || "http://localhost:5001",
    changeOrigin: true,
    configure: (instance) => {
      instance.on("proxyReq", (proxyReq) => proxyReq.removeHeader("origin"));
    },
  },
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5180,
    host: true,
    // Set VITE_API_URL to an absolute URL to skip the proxy.
    proxy,
  },
  preview: {
    port: 5180,
    proxy,
  },
});
