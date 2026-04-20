import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    define: {
        // Polyfill Node.js globals required by simple-peer / randombytes
        global: 'globalThis',
        'process.env': {},
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:5001',
                changeOrigin: true,
            },
        },
    },
    build: {
        outDir: 'build',
        sourcemap: false,
    },
});
