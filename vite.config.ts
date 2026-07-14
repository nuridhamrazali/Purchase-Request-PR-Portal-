import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    base: './',
    plugins: [react()],
    define: {
      // Maps process.env.API_KEY to the actual environment variable during build/dev
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});