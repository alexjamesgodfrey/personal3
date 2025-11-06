import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, envField } from 'astro/config';

export default defineConfig({
  integrations: [react(), mdx()],
  site: 'https://alexgodfrey.com',
  vite: {
    plugins: [tailwindcss()],
  },
  env: {
    schema: { CHATDB_URL: envField.string({ context: 'client', access: 'public' }) },
  },
});
