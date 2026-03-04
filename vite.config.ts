import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // ali.localhost gibi isimlere cevap vermesini sağlar
  }
})