const FENCE = /^\s*```/
const SAME_LINE_DISPLAY = /\$\$([^\n$]+?)\$\$/g

/** remark-math treats one-line `$$...$$` as inline. Block math in this book is `$$...$$`. */
export function promoteDisplayMath(markdown: string): string {
  const lines = markdown.split(/\r?\n/)
  let inFence = false
  const next = lines.map((line) => {
    if (FENCE.test(line)) {
      inFence = !inFence
      return line
    }
    if (inFence || !line.includes('$$')) return line
    return line.replace(SAME_LINE_DISPLAY, (_, expression: string) => `\n$$\n${expression.trim()}\n$$\n`)
  })
  return next.join('\n')
}
