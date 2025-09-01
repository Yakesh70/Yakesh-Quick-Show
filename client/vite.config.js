import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),   // 👈 this enables Tailwind in Vite
  ],
  server: {
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
