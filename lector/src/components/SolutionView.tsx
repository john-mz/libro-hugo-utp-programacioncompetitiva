import { memo, useMemo, useState } from 'react'
import { highlightCpp } from '../highlightCpp'

export const SolutionView = memo(function SolutionView({
  code,
  fileName,
}: {
  code: string
  fileName: string
}) {
  const html = useMemo(() => highlightCpp(code), [code])
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="solution-code">
      <div className="solution-meta">
        <p className="file-name">{fileName}</p>
        <button type="button" className="copy" onClick={() => void copy()}>
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <pre className="codeblock">
        <code className="hljs language-cpp" dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  )
})
