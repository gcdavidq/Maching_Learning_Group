import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// En desarrollo, la API corre aparte (uvicorn en :8000) y Vite le reenvía las peticiones.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:8000",
      "/ejemplos": "http://localhost:8000",
    },
  },
});
