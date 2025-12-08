import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, envField } from 'astro/config';

export default defineConfig({
  integrations: [react(), mdx()],
  site: 'https://alexgodfrey.com',

  vite: {
    plugins: [tailwindcss()],
  },

  env: {
    schema: {
      CHATDB_URL: envField.string({ context: 'client', access: 'public' }),
      AGENTDB_API_URL: envField.string({ context: 'server', access: 'public' }),
      AGENTDB_API_KEY: envField.string({ context: 'server', access: 'secret' }),
      DATABASE_URL: envField.string({ context: 'server', access: 'secret' }),
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret' }),
    },
  },

  output: 'server',
  adapter: vercel(),
});
