import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: "0.0.0.0", // Luistert naar alle netwerkinterfaces
    port: 5173, // Optioneel: specificeer een poort
    proxy: {
      "/api": "http://localhost:8080",
    },
  },
});
