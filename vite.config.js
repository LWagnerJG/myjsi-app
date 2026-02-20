import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        strictPort: true,
        // Enable SPA history fallback so React Router handles all paths
        historyApiFallback: true
    },
    build: {
        chunkSizeWarningLimit: 1000,
        target: 'es2020',
        sourcemap: false,
        cssMinify: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-ui': ['lucide-react', 'framer-motion'],
                    'vendor-charts': ['recharts'],
                    'vendor-dnd': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
                    'vendor-state': ['zustand'],
                }
            }
        }
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.js'],
        css: true,
        include: ['src/**/*.{test,spec}.{js,jsx}'],
    }
})
