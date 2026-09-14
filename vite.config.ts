import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv, type PluginOption, type ServerOptions } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'node:fs'
import path from 'node:path'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { getPwaConfig } from './vite.pwa.config'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const keyPath  = path.resolve(__dirname, './localhost-key.pem')
  const certPath = path.resolve(__dirname, './localhost.pem')

  const hasLocalCert = fs.existsSync(keyPath) && fs.existsSync(certPath)

  const plugins: PluginOption[] = [
    vue(),
    getPwaConfig(env),
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
