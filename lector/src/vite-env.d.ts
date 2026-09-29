/// <reference types="vite/client" />

declare module 'virtual:problemas' {
  export interface FuenteProblema {
    id: string
    markdown: string
    solution: string | null
  }

  const problemas: FuenteProblema[]
  export default problemas
}
