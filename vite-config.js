import viteBasicSslPlugin from "@vitejs/plugin-basic-ssl";
import { resolve } from 'path'

export default {
  root: './',
  publicDir: './public/',
  base: './',
  server:
    {
      host: true,
      https: {
        key: './projet-velo-vr-privateKey.key',
        cert: './projet-velo-vr.crt'
      }
    },
  build:
    {
      emptyOutDir: true,
      sourcemap: true,
      rollupOptions: {
        input: {
          main: resolve(dirname, 'index.html'),
          xrpart: resolve(dirname, 'xr-part.html'),
        },
        output: {
          manualChunks: {
            three: ['three'],
          },
        }
      }
    },
  resolve: {
    alias: {
      '@assets': '/assets',
      '@js': '/src',
    }
  },
  plugins: [
    viteBasicSslPlugin()
    ]
}