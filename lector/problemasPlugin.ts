import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

const virtualId = 'virtual:problemas'
const resolvedId = '\0' + virtualId

interface Fuente {
  id: string
  markdown: string
  solution: string | null
}

function listar(repoRoot: string): Fuente[] {
  const entries = fs.readdirSync(repoRoot, { withFileTypes: true })
  const files = entries
    .filter((entry) => entry.isFile() && !entry.name.startsWith('.'))
    .map((entry) => entry.name)

  const cpp = new Set(files.filter((name) => name.endsWith('.cpp')))

  return files
    .filter((name) => name.endsWith('.md'))
    .map((name) => {
      const id = name.slice(0, -'.md'.length)
      const markdown = fs.readFileSync(path.join(repoRoot, name), 'utf8')
      const cppName = `${id}.cpp`
      const solution = cpp.has(cppName)
        ? fs.readFileSync(path.join(repoRoot, cppName), 'utf8')
        : null
      return { id, markdown, solution }
    })
    .sort((a, b) => a.id.localeCompare(b.id, 'es'))
}

export function problemasRepo(repoRoot: string): Plugin {
  return {
    name: 'problemas-repo',
    resolveId(id) {
      if (id === virtualId) return resolvedId
    },
    load(id) {
      if (id !== resolvedId) return null
      const json = JSON.stringify(listar(repoRoot)).replace(/</g, '\\u003c')
      return `export default ${json}`
    },
  }
}
