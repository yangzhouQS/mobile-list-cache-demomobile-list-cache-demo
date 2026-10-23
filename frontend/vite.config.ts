import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'


export default defineConfig({
    plugins: [
        vue(),
        vueJsx()
    ],
    server: {
        host: true,
        port: 5175,
        proxy: {
            // backend NestJS 服务（见 ../backend，默认端口 3000）
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true
            }
        }
    }
})
