const MATH_BLOCK = /\$\$[\s\S]+?\$\$/g
const MATH_INLINE = /\$[^$\n]+?\$/g
const MARKDOWN_MARKS = /[*_`~]/g
const WHITESPACE = /\s+/g
const ATX_HEADING = /^#{1,6}[ \t]+(.+?)[ \t]*$/m
const BOLD_LINE = /^\s*\*\*(.+?)\*\*\s*$/

export function stripDisplayedTitle(markdown: string): string {
  const lines = markdown.split(/\r?\n/)
  const first = lines[0] ?? ''
  const isTitle = /^#{1,6}[ \t]+/.test(first) || /^\s*\*\*(.+?)\*\*\s*$/.test(first)
  if (!isTitle) return markdown
  lines.shift()
  if ((lines[0] ?? '').trim() === '') lines.shift()
  return lines.join('\n')
}

export function titleFromMarkdown(markdown: string, fallback: string): string {
  const heading = ATX_HEADING.exec(markdown)
  if (heading?.[1]) return cleanInline(heading[1])

  const firstBlock = markdown.split(/\n\s*\n/, 1)[0] ?? ''
  const bold = BOLD_LINE.exec(firstBlock)
  if (bold?.[1]) return cleanInline(bold[1])

  const readable = fallback.replaceAll('_', ' ').trim()
  return readable || fallback
}

function cleanInline(value: string): string {
  return value
    .replace(MATH_BLOCK, ' ')
    .replace(MATH_INLINE, ' ')
    .replace(MARKDOWN_MARKS, '')
    .replace(WHITESPACE, ' ')
    .trim()
}
