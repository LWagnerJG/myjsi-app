import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        strictPort: true
    },
    build: {
        chunkSizeWarningLimit: 1000,
        target: 'es2020',
        sourcemap: false,
        cssMinify: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-react': ['react', 'react-dom'],
                    'vendor-ui': ['lucide-react', 'framer-motion'],
                    'vendor-charts': ['recharts'],
                    'vendor-dnd': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
                }
            }
        }
    }
})
