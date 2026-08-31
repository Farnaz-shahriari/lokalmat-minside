import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// BASE_PATH lets the same build work at a domain root (Vercel/Netlify, "/")
// and under a GitHub Pages project path ("/lokalmat-minside/").
// The Pages workflow sets BASE_PATH; local dev and root hosting leave it unset.
export default defineConfig({
  base: process.env.BASE_PATH ?? "/",
  plugins: [react(), tailwindcss()],
});
