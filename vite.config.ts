import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig( 
  {
    base: '/admin/',
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    fs: {
      deny: ['.env', '.env.*', '*.{crt,pem}', 'package.json', 'package-lock.json']
    }
  }
})
