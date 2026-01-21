import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Trigger build refresh
export default defineConfig({
  base: '/Exchange/',
  plugins: [react()],
})
