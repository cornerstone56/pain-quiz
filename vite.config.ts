import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Project site: https://cornerstone56.github.io/pain-quiz/
export default defineConfig({
  base: "/pain-quiz/",
  plugins: [react()],
});
