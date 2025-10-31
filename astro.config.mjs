import react from "@astrojs/react";
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  integrations: [react()],
  site: "https://alexgodfrey.com",
  vite: {
    plugins: [tailwindcss()],
  },
});
