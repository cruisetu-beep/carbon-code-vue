import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: './',          // 相对路径，dist/index.html 可双击直接在浏览器打开
  server: {
    proxy: {
      '/api': {
        target: 'https://www.ttbems.com:14442/CarbonData4AIAgentAPI',
        changeOrigin: true,
        secure: false,   // 忽略自签名证书
      }
    }
  }
})
