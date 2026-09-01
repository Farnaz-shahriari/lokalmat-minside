import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// BASE_PATH lets the same build work at a domain root (Vercel/Netlify, "/")
// and under a GitHub Pages project path ("/lokalmat-minside/").
// The Pages workflow sets BASE_PATH; local dev and root hosting leave it unset.
export default defineConfig({
  base: process.env.BASE_PATH ?? "/",
  plugins: [react(), tailwindcss()],
  server: {
    // Vite does not read PORT on its own — it would always take 5173 and collide
    // with anything already there. Honouring PORT lets the harness assign a free
    // port; falling back to 5173 keeps plain `npm run dev` behaving as before.
    port: Number(process.env.PORT) || 5173,
  },
});
