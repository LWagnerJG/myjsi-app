import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        strictPort: true
    },
    build: {
        // Increase warning threshold to reduce noise for now
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                // Manual chunking for better code splitting
                manualChunks: {
                    // Vendor chunks
                    'vendor-react': ['react', 'react-dom'],
                    'vendor-ui': ['lucide-react', 'framer-motion'],
                    // Feature chunks (lazy loaded screens can stay in separate chunks)
                }
            }
        }
    }
})
