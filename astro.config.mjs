// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

const isProjectPages =
  process.env.GITHUB_ACTIONS === 'true' &&
  process.env.GITHUB_REPOSITORY === 'ROBERT1515/-roman-visualss-new';

export default defineConfig({
  site: isProjectPages ? 'https://robert1515.github.io' : undefined,
  base: isProjectPages ? '/-roman-visualss-new' : '/',
  vite: {
    plugins: [tailwindcss()],
  },
});
