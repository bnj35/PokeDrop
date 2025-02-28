
import { resolve } from 'path'
const isCodeSandbox = 'SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env

export default {
  root: './src/',
  publicDir: '../public/',
  base: './',
  server:
    {
      host: true,
      open: !isCodeSandbox // Open if it's not a CodeSandbox
    },
  build:
    {
      outDir: '../dist',
      emptyOutDir: true,
      sourcemap: true,
      rollupOptions:{
        input:{
          main:resolve(__dirname,'src/index.html'),
        },
        output:{
          manualChunks: {
            three: ['three'],
          },
        }
      }
    },
  resolve: {
    alias: {
      '@assets': '/assets',
      '@shaders': '/shaders',
    }
  }
}