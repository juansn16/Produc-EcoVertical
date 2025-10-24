import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        // Asegúrate de que esta línea esté presente y sea correcta
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      'process.env.VITE_API_URL': JSON.stringify(
        isProduction 
          ? process.env.VITE_API_URL || 'http://localhost:3000/api'
          : 'http://localhost:3000/api'
      ),
    },
    server: {
      allowedHosts: [
        'fees-sectors-comply-genre.trycloudflare.com' // ← Permite el host de Cloudflare
      ],
      force: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api')
        }
      }
    },
    optimizeDeps: {
      include: ['leaflet', 'react-leaflet'],
      exclude: ['react-hot-toast']
    },
    build: {
      rollupOptions: {
        external: [],
      },
      // Configuración para producción
      minify: 'esbuild', // Cambiar a esbuild que es más rápido y no requiere terser
      sourcemap: false,
      outDir: 'dist',
      assetsDir: 'assets',
    },
    // Configuración para el servidor de desarrollo
    preview: {
      port: 4173,
      strictPort: true,
      // Configurar para que todas las rutas sirvan index.html
      historyApiFallback: true,
    },
    css: {
      preprocessorOptions: {
        css: {
          charset: false,
        },
      },
    },
  };
});
