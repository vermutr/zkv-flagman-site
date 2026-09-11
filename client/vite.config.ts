import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'node:fs'
import { parsePackages, parseServices } from './src/content/schema.ts'

/** Проверяет services.json и packages.json перед сборкой: опечатка ломает сборку, а не сайт. */
function validateContent() {
  return {
    name: 'validate-content',
    buildStart() {
      const read = (file: string) => JSON.parse(readFileSync(new URL(`./src/content/${file}`, import.meta.url), 'utf8'))
      parseServices(read('services.json'))
      parsePackages(read('packages.json'))
    },
  }
}

export default defineConfig({
  plugins: [validateContent(), react(), tailwindcss()],
  server: {
    proxy: { '/api': 'http://localhost:3001' },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: false,
  },
})
