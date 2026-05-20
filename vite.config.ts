import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Uncomment the line below ONLY if deploying to GitHub Pages
  // (replace 'birthday-site' with your actual repo name):
  // base: "/birthday-site/",
});
