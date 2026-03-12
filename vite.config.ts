import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// For GitHub Pages: set base to your repo name, e.g. base: '/pulsemix/'
export default defineConfig({
  plugins: [react()],
  base: '/pulsemix/',
})
