import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { problemasRepo } from './problemasPlugin'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(projectRoot, '..')

export default defineConfig({
  plugins: [react(), problemasRepo(repoRoot)],
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
})
