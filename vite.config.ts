import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type PluginOption, type ServerOptions } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'node:fs'
import path from 'node:path'
import basicSsl from '@vitejs/plugin-basic-ssl'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig(({ command }) => {
  const keyPath  = path.resolve(__dirname, './localhost-key.pem')
  const certPath = path.resolve(__dirname, './localhost.pem')

  const hasLocalCert = fs.existsSync(keyPath) && fs.existsSync(certPath)

  const plugins: PluginOption[] = [
    vue(),
  ]

  const serverConfig: ServerOptions = {
    host: true,
  }

  if (command === 'serve') {
    if (hasLocalCert) serverConfig.https = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    }
    else plugins.push(basicSsl())
  }

  return {
    base: process.env.VITE_BASE_URL || '',
    plugins: plugins,
    server: serverConfig,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
