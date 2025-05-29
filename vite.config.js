import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress warnings about /*#__PURE__*/ comments in SignalR
        if (warning.code === 'INVALID_ANNOTATION' && 
            warning.message?.includes('@microsoft/signalr') &&
            warning.message?.includes('/*#__PURE__*/')) {
          return;
        }
        warn(warning);
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          bootstrap: ['react-bootstrap'],
          icons: ['react-icons'],
          signalr: ['@microsoft/signalr'],
          utils: ['lodash-es', 'react-timeago', 'react-toastify']
        }
      }
    }
  }
})
