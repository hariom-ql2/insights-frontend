import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/locations': 'http://localhost:5001',
      '/sites': 'http://localhost:5001',
      '/pos': 'http://localhost:5001',
      '/contact-query': 'http://localhost:5001',
      '/create-payment-order': 'http://localhost:5001'
      // add other endpoints as needed
    }
  }
})
