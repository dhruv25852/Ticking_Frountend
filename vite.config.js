import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const { VITE_BACKEND_URL = 'http://localhost:5000' } = loadEnv(
    mode,
    process.cwd(),
    'VITE_',
  );

  return {
    plugins: [
      react({
        include: '**/*.js',
      }),
    ],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: VITE_BACKEND_URL,
          changeOrigin: true,
        },
        '/uploads': {
          target: VITE_BACKEND_URL,
          changeOrigin: true,
        },
      },
    },
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.js$/,
      exclude: [],
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
  };
});
