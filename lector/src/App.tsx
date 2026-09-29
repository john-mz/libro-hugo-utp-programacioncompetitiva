import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MarkdownView } from './components/MarkdownView'
import { SolutionView } from './components/SolutionView'
import { filterProblems, idFromLocation, problemById, problems } from './problems'

type Panel = 'enunciado' | 'solucion'
const WIDE_QUERY = '(min-width: 960px)'

function useWideScreen(): boolean {
  const [wide, setWide] = useState(() => window.matchMedia(WIDE_QUERY).matches)
  useEffect(() => {
    const media = window.matchMedia(WIDE_QUERY)
    const onChange = () => setWide(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])
  return wide
}

export function App() {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(idFromLocation)
  const [panel, setPanel] = useState<Panel>('enunciado')
  const wide = useWideScreen()
  const statementRef = useRef<HTMLDivElement>(null)
  const solutionRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => filterProblems(problems, query), [query])
  const problem = problemById.get(selectedId) ?? null

  const choose = useCallback((id: string, mode: 'push' | 'replace') => {
    setSelectedId(id)
    if (idFromLocation() === id) return
    const url = new URL(window.location.href)
    url.hash = id
    if (mode === 'replace') history.replaceState(null, '', url)
    else history.pushState(null, '', url)
  }, [])

  useEffect(() => {
    if (problems.length === 0 || idFromLocation() !== '') return
    const first = problems[0]
    if (first) choose(first.id, 'replace')
  }, [choose])

  useEffect(() => {
    const onPop = () => setSelectedId(idFromLocation())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    statementRef.current?.scrollTo(0, 0)
    solutionRef.current?.scrollTo(0, 0)
    if (!selectedId) return
    document.getElementById(`problema-${selectedId}`)?.scrollIntoView({ block: 'nearest' })
  }, [selectedId])

  useEffect(() => {
    const title = problem ? `${problem.title} · Libro de Hugo` : 'Libro de Hugo'
    document.title = title
  }, [problem])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target
      const typing =
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)

      if (event.key === '/' && !event.altKey && !event.ctrlKey && !event.metaKey) {
        if (typing) return
        event.preventDefault()
        searchRef.current?.focus()
        searchRef.current?.select()
        return
      }

      if (!event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
      if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
      event.preventDefault()
      if (filtered.length === 0) return
      const delta = event.key === 'ArrowDown' ? 1 : -1
      const index = filtered.findIndex((item) => item.id === selectedId)
      if (index === -1) {
        const fallback = delta > 0 ? filtered[0] : filtered[filtered.length - 1]
        if (fallback) choose(fallback.id, 'push')
        return
      }
      const next = filtered[index + delta]
      if (next) choose(next.id, 'push')
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [choose, filtered, selectedId])

  const showStatement = wide || panel === 'enunciado'
  const showSolution = wide || panel === 'solucion'

  return (
    <div className="landscape">
      <header className="sky">
        <div className="sun" aria-hidden="true" />
        <div className="sky-copy">
          <h1>Libro de Hugo</h1>
          <p>Enunciados y soluciones de programación competitiva.</p>
        </div>
        <p className="shortcuts">
          <span>
            <kbd>Alt</kbd>+<kbd>↑</kbd> anterior
          </span>
          <span>
            <kbd>Alt</kbd>+<kbd>↓</kbd> siguiente
          </span>
          <span>
            <kbd>/</kbd> buscar
          </span>
        </p>
      </header>

      {problems.length === 0 ? (
        <div className="library-empty">
          <div className="empty-card" role="status">
            <p className="empty-title">Todavía no hay problemas</p>
            <p>Agrega un archivo Markdown en la raíz del repositorio y vuelve a iniciar el lector.</p>
          </div>
        </div>
      ) : (
        <div className="book">
          <nav className="sidebar" aria-label="Problemas">
            <div className="search-block">
              <label htmlFor="buscar">Buscar</label>
              <input
                id="buscar"
                ref={searchRef}
                type="search"
                value={query}
                placeholder="ej. Dora"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                onChange={(event) => setQuery(event.target.value)}
              />
              <p className="count">
                {query.trim()
                  ? `${filtered.length} de ${problems.length}`
                  : problems.length === 1
                    ? '1 problema'
                    : `${problems.length} problemas`}
              </p>
            </div>
            {filtered.length === 0 ? (
              <div className="list-empty" role="status">
                <p className="empty-title">Ningún problema coincide</p>
                <p>Prueba con otra palabra del título.</p>
                <button type="button" className="text-button" onClick={() => setQuery('')}>
                  Limpiar búsqueda
                </button>
              </div>
            ) : (
              <ul className="problem-list">
                {filtered.map((item) => {
                  const open = item.id === selectedId
                  return (
                    <li key={item.id}>
                      <button
                        id={`problema-${item.id}`}
                        type="button"
                        className="problem-button"
                        aria-current={open ? 'page' : undefined}
                        onClick={() => choose(item.id, 'push')}
                      >
                        <span className="problem-title">{item.title}</span>
                        {item.solution === null ? (
                          <span className="missing-note">Sin solución</span>
                        ) : null}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </nav>

          <main className="reader">
            {problem ? (
              <>
                <div className="reader-toolbar">
                  <h2>{problem.title}</h2>
                  {wide ? null : (
                    <div className="switch" role="tablist" aria-label="Qué quieres leer">
                      <button
                        type="button"
                        role="tab"
                        aria-selected={panel === 'enunciado'}
                        onClick={() => setPanel('enunciado')}
                      >
                        Enunciado
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={panel === 'solucion'}
                        onClick={() => setPanel('solucion')}
                      >
                        Solución
                      </button>
                    </div>
                  )}
                </div>
                <div className="reader-panels">
                  <section className="panel statement" hidden={!showStatement} aria-label="Enunciado">
                    <h3 className="panel-label">Enunciado</h3>
                    <div className="panel-scroll" ref={statementRef}>
                      <MarkdownView markdown={problem.markdown} />
                    </div>
                  </section>
                  <section className="panel solution" hidden={!showSolution} aria-label="Solución">
                    <h3 className="panel-label">Solución</h3>
                    <div className="panel-scroll" ref={solutionRef}>
                      {problem.solution === null ? (
                        <div className="empty-card" role="status">
                          <p className="empty-title">Aún no hay solución</p>
                          <p>Cuando exista un archivo .cpp con el mismo nombre, se mostrará aquí.</p>
                        </div>
                      ) : (
                        <SolutionView code={problem.solution} fileName={`${problem.id}.cpp`} />
                      )}
                    </div>
                  </section>
                </div>
              </>
            ) : (
              <div className="library-empty">
                <div className="empty-card" role="status">
                  <p className="empty-title">Este enlace no coincide con ningún problema</p>
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => {
                      const first = problems[0]
                      if (first) choose(first.id, 'push')
                    }}
                  >
                    Abrir el primer problema
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      )}
      <div className="grass" aria-hidden="true" />
    </div>
  )
}
