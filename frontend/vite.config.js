import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync } from 'fs'

// SPA fallback: copy index.html to 200.html after build
// Vercel uses 200.html as the automatic SPA catch-all fallback
const spaFallback = () => ({
  name: 'spa-fallback',
  closeBundle() {
    const dist = resolve(__dirname, 'dist')
    copyFileSync(resolve(dist, 'index.html'), resolve(dist, '200.html'))
    console.log('✅ Created 200.html SPA fallback')
  }
})

export default defineConfig({
  plugins: [react(), spaFallback()],
})
