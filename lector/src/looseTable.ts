const FENCE = /^\s*```/
const SEPARATOR =
  /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/
const ATX = /^#{1,6}\s/
const BOLD = /^\*\*.+\*\*$/
const RULE = /^---+$/
const BR_LINE = /^<br\b/i
const STAR_LINE = /^\*(?!\*)/

/**
 * GFM keeps each table row on a single line. The book draws some figures as a
 * pipe table whose cells span several lines (with <br>). Those blocks become
 * an HTML table so the asterisks stay in their cells.
 */
export function expandLooseTables(markdown: string): string {
  const lines = markdown.split(/\r?\n/)
  const out: string[] = []
  let inFence = false
  let index = 0

  while (index < lines.length) {
    const line = lines[index] ?? ''
    if (FENCE.test(line)) {
      inFence = !inFence
      out.push(line)
      index += 1
      continue
    }

    if (!inFence && isSeparator(lines[index + 1] ?? '') && isPipeRow(line)) {
      const converted = convertLooseTable(lines, index)
      if (converted) {
        out.push(converted.html)
        index = converted.next
        continue
      }
    }

    out.push(line)
    index += 1
  }

  return out.join('\n')
}

function isSeparator(line: string): boolean {
  return SEPARATOR.test(line.trim())
}

function isPipeRow(line: string): boolean {
  const trimmed = line.trim()
  return trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.split('|').length > 2
}

function isSingleRow(line: string): boolean {
  return isPipeRow(line) && !line.includes('\n')
}

function convertLooseTable(
  lines: string[],
  start: number,
): { html: string; next: number } | null {
  const headerLine = lines[start] ?? ''
  let index = start + 2
  const body: string[] = []

  while (index < lines.length) {
    const trimmed = (lines[index] ?? '').trim()
    if (trimmed === '') {
      body.push(lines[index] ?? '')
      index += 1
      continue
    }
    if (
      FENCE.test(trimmed) ||
      ATX.test(trimmed) ||
      trimmed.startsWith('**') ||
      BOLD.test(trimmed) ||
      RULE.test(trimmed)
    ) {
      break
    }
    const debris = trimmed.includes('|') || BR_LINE.test(trimmed) || STAR_LINE.test(trimmed)
    if (!debris) break
    body.push(lines[index] ?? '')
    index += 1
  }

  while (body.length > 0 && (body[body.length - 1] ?? '').trim() === '') {
    body.pop()
    index -= 1
  }

  const loose = body.some((line) => line.trim() === '' || !isSingleRow(line))
  if (!loose || body.length === 0) return null

  const headers = splitCells(headerLine)
  const cells = splitCells(body.join('\n'))
  if (headers.length === 0 || cells.length === 0) return null

  return { html: renderTable(headers, cells), next: index }
}

function splitCells(row: string): string[] {
  const parts = row.split('|').map((part) => part.trim())
  if (parts[0] === '') parts.shift()
  if (parts.length > 0 && parts[parts.length - 1] === '') parts.pop()
  return parts
}

function renderTable(headers: string[], cells: string[]): string {
  const ascii = cells.some((cell) => cell.includes('*') || /<br/i.test(cell))
  const className = ascii ? ' class="figura-ascii"' : ''
  const head = headers.map((cell) => `<th>${inlineHtml(cell)}</th>`).join('')
  const body = cells.map((cell) => `<td>${inlineHtml(cell)}</td>`).join('')
  return `<table${className}><thead><tr>${head}</tr></thead><tbody><tr>${body}</tr></tbody></table>`
}

function inlineHtml(value: string): string {
  const flat = value.replace(/\s*\n\s*/g, '')
  const withBreaks = flat
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&lt;br\s*\/?&gt;/gi, '<br>')
  return withBreaks.replace(/^(?:<br>)+/i, '').replace(/(?:<br>){2,}/gi, '<br>')
}
