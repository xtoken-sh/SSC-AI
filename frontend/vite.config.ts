import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 开发环境把 /api/* 转发到本地后端，避免浏览器跨域。
// 若后端监听非默认端口，可在 .env.development 中设置：
// VITE_DEV_API_PROXY_TARGET=http://localhost:3000
const devApiProxyTarget =
  process.env.VITE_DEV_API_PROXY_TARGET || 'http://localhost:8787'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: devApiProxyTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
