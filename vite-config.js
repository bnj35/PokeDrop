
import { resolve } from 'path'
const isCodeSandbox = 'SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env

export default {
  root: './',
  publicDir: '../public/',
  base: process.env.NODE_ENV === 'production' ? '/PokeDrop/' : '',
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
          main:resolve(__dirname,'index.html'),
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
      '@js': '/js',
      '@shaders': '/shaders',
    }
  }
}