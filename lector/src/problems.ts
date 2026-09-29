import fuentes from 'virtual:problemas'
import { titleFromMarkdown } from './title'

export interface Problem {
  id: string
  title: string
  markdown: string
  solution: string | null
}

const MARKS = /\p{M}/gu

export const problems: Problem[] = fuentes
  .map((source) => ({
    id: source.id,
    title: titleFromMarkdown(source.markdown, source.id),
    markdown: source.markdown,
    solution: source.solution,
  }))
  .sort((a, b) => a.title.localeCompare(b.title, 'es', { numeric: true, sensitivity: 'base' }))

export const problemById = new Map(problems.map((problem) => [problem.id, problem]))

export function fold(value: string): string {
  return value.normalize('NFD').replace(MARKS, '').toLocaleLowerCase('es')
}

export function filterProblems(list: Problem[], query: string): Problem[] {
  const needle = fold(query.trim())
  if (!needle) return list
  return list.filter(
    (problem) => fold(problem.title).includes(needle) || fold(problem.id).includes(needle),
  )
}

export function idFromLocation(): string {
  const hash = window.location.hash
  if (hash.length <= 1) return ''
  const raw = hash.slice(1)
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}
