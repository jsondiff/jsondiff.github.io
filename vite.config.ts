import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Inline all JS + CSS into a single index.html so it can be served
// directly from Bitbucket raw file hosting — no web server required.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    // Inline assets under this size threshold (set very high to catch everything)
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    outDir: 'dist',
  },
})
