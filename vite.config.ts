import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Static wedding invite. Assets live in public/assets so their URLs stay `assets/...`.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: true
  },
  build: {
    target: 'es2020',
    // Split the heavy three/R3F bundle out so the gate can paint before the rest parses.
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          r3f: ['@react-three/fiber', '@react-three/drei'],
        },
      },
    },
  },
})
