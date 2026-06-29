import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/area-manager-dashboard/",
  plugins: [react()],
});
