import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");

  const backendURL =
    env.VITE_PROXY_TARGET || "https://job-back-end.onrender.com";

  const proxy = {
    "/api": {
      target: backendURL,
      changeOrigin: true,
      secure: true,
      // Preserve Origin: backend CLIENT_ORIGIN must allow localhost:5180.
    },
  };

  return {
    plugins: [react(), tailwindcss()],

    server: {
      host: "localhost",
      port: 5180,
      strictPort: true,
      proxy,
    },

    preview: {
      host: "localhost",
      port: 5180,
      strictPort: true,
      proxy,
    },
  };
});
