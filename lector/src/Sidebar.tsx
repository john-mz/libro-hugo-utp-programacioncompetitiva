import { useEffect, useMemo, useRef, useState } from "react";
import type { Problem } from "virtual:problems";

type SidebarProps = {
  problems: Problem[];
  activeId: string;
  onSelect: (id: string) => void;
};

export function Sidebar({ problems, activeId, onSelect }: SidebarProps) {
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const filteredRef = useRef<Problem[]>(problems);
  const activeRef = useRef(activeId);
  const onSelectRef = useRef(onSelect);

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("es");
    if (!needle) return problems;
    return problems.filter((problem) => problem.title.toLocaleLowerCase("es").includes(needle));
  }, [problems, query]);

  filteredRef.current = filtered;
  activeRef.current = activeId;
  onSelectRef.current = onSelect;

  useEffect(() => {
    const list = listRef.current;
    const item = list?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!list || !item) return;
    const top = item.offsetTop;
    const bottom = top + item.offsetHeight;
    if (top < list.scrollTop) list.scrollTop = top;
    else if (bottom > list.scrollTop + list.clientHeight) {
      list.scrollTop = bottom - list.clientHeight;
    }
  }, [activeId]);

  useEffect(() => {
    const move = (delta: number) => {
      const items = filteredRef.current;
      if (items.length === 0) return;
      const index = items.findIndex((problem) => problem.id === activeRef.current);
      if (index === -1) {
        onSelectRef.current(items[delta > 0 ? 0 : items.length - 1].id);
        return;
      }
      const next = index + delta;
      if (next < 0 || next >= items.length) return;
      onSelectRef.current(items[next].id);
    };

    const onKey = (event: KeyboardEvent) => {
      const target = event.target;
      const typing =
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);

      if (event.key === "/" && !typing && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
        return;
      }

      if (!event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === "ArrowUp") {
        event.preventDefault();
        move(-1);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        move(1);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const index = filtered.findIndex((problem) => problem.id === activeId);

  const moveFromClick = (delta: number) => {
    if (filtered.length === 0) return;
    if (index === -1) {
      onSelect(filtered[delta > 0 ? 0 : filtered.length - 1].id);
      return;
    }
    const next = index + delta;
    if (next < 0 || next >= filtered.length) return;
    onSelect(filtered[next].id);
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="hat" aria-hidden="true">
          <span className="hat-white" />
          <span className="hat-blue" />
        </div>
        <div>
          <p className="eyebrow">Tierra de Ooo</p>
          <h2>Problemas</h2>
        </div>
      </div>

      <label className="search press">
        <span className="sr-only">Buscar problemas</span>
        <input
          ref={searchRef}
          type="search"
          value={query}
          placeholder="Filtrar por título"
          autoComplete="off"
          onChange={(event) => setQuery(event.target.value)}
        />
        <kbd aria-hidden="true">/</kbd>
      </label>

      <p className="count">
        {problems.length === 1 ? "1 problema" : `${problems.length} problemas`}
      </p>

      {filtered.length === 0 ? (
        <div className="empty-search">
          <p>Ningún problema coincide con «{query.trim()}».</p>
          <p>Prueba con otro título.</p>
        </div>
      ) : (
        <ul ref={listRef} className="problem-list" aria-label="Problemas">
          {filtered.map((problem) => {
            const open = problem.id === activeId;
            return (
              <li key={problem.id}>
                <button
                  type="button"
                  className="nav-item press"
                  aria-current={open ? "true" : undefined}
                  onClick={() => onSelect(problem.id)}
                >
                  <span className="fill" aria-hidden="true" />
                  <span className="accent" aria-hidden="true" />
                  <span className="label">{problem.title}</span>
                  <span className="badge" aria-hidden="true">
                    Abierto
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="pager">
        <button
          type="button"
          className="press"
          onClick={() => moveFromClick(-1)}
          disabled={filtered.length === 0 || index <= 0}
          aria-keyshortcuts="Alt+ArrowUp"
        >
          Anterior
        </button>
        <button
          type="button"
          className="press"
          onClick={() => moveFromClick(1)}
          disabled={filtered.length === 0 || index === -1 || index >= filtered.length - 1}
          aria-keyshortcuts="Alt+ArrowDown"
        >
          Siguiente
        </button>
      </div>
      <p className="hints">
        <kbd>Alt</kbd>+<kbd>↑</kbd> anterior
        <span className="dot" aria-hidden="true">
          ·
        </span>
        <kbd>Alt</kbd>+<kbd>↓</kbd> siguiente
        <span className="dot" aria-hidden="true">
          ·
        </span>
        <kbd>/</kbd> buscar
      </p>
    </aside>
  );
}
