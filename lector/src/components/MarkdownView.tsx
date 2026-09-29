import { memo, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import { promoteDisplayMath } from '../displayMath'
import { expandLooseTables } from '../looseTable'
import { highlightCpp } from '../highlightCpp'
import { stripDisplayedTitle } from '../title'

const LANGUAGE = /language-([\w+#]+)/

const components: Components = {
  a({ href, children }) {
    const external = href?.startsWith('http://') || href?.startsWith('https://')
    return (
      <a href={href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
        {children}
      </a>
    )
  },
  code({ className, children }) {
    const text = String(children).replace(/\n$/, '')
    const language = LANGUAGE.exec(className ?? '')?.[1]?.toLowerCase()
    if (language === 'cpp' || language === 'c++' || language === 'c') {
      return (
        <code
          className="hljs language-cpp"
          dangerouslySetInnerHTML={{ __html: highlightCpp(text) }}
        />
      )
    }
    return <code className={className}>{text}</code>
  },
}

export const MarkdownView = memo(function MarkdownView({ markdown }: { markdown: string }) {
  const prepared = useMemo(
    () => expandLooseTables(promoteDisplayMath(stripDisplayedTitle(markdown))),
    [markdown],
  )
  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, [rehypeKatex, { throwOnError: false, strict: 'ignore' }]]}
        components={components}
      >
        {prepared}
      </ReactMarkdown>
    </div>
  )
})
