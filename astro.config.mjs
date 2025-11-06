// @ts-check
import { defineConfig, envField } from 'astro/config';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  env: {
    schema: {
      API_URL: envField.string({ context: "client", access: "public", optional: true }),
    }
  },
  vite: {
    plugins: [tailwindcss()]
  }
});