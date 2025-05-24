import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default () => defineConfig({
  base:  process.env.VITE_BASE_URL || '',
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
//export default ({ mode }) => {
//  process.env = {...process.env, ...loadEnv(mode, process.cwd())};
//
//  return defineConfig({
//    base:  process.env.VITE_BASE_URL || '',
//    plugins: [
//      vue(),
//    ],
//    resolve: {
//      alias: {
//        '@': fileURLToPath(new URL('./src', import.meta.url))
//      }
//    }
//  })
//}
