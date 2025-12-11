import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import postcssNesting from 'postcss-nesting'

// https://vitejs.dev/config/
export default defineConfig({
    define: {
        global: 'globalThis'
    },
    root: 'example',
    publicDir: '_public',
    plugins: [
        preact({
            devToolsEnabled: false,
            prefreshEnabled: true,
            babel: {
                plugins: [],
                sourceMaps: true
            }
        })
    ],
    build: {
        outDir: '../public',
        minify: false,
        sourcemap: 'inline',
        emptyOutDir: true
    },
    server: {
        port: 8888,
        host: true,
        open: true
    },
    css: {
        postcss: {
            plugins: [
                postcssNesting
            ]
        }
    },
    esbuild: {
        logOverride: { 'this-is-undefined-in-esm': 'silent' }
    }
})
