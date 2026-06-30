import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite の設定です。React プラグインを有効にすると JSX/TSX を扱えるようになります。
export default defineConfig({
  plugins: [react()],
})
