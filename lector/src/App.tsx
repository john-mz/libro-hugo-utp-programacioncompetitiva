import { useCallback, useEffect, useState } from "react";
import { problems, type Problem } from "virtual:problems";
import { Reader } from "./Reader";
import { Sidebar } from "./Sidebar";

function problemIdFromHash(): string | null {
  const raw = location.hash.replace(/^#/, "");
  if (!raw) return null;
  try {
    const id = decodeURIComponent(raw);
    return problems.some((problem) => problem.id === id) ? id : null;
  } catch {
    return null;
  }
}

function currentHashId(): string | null {
  const raw = location.hash.replace(/^#/, "");
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return null;
  }
}

export function App() {
  const [activeId, setActiveId] = useState<string | null>(
    () => problemIdFromHash() ?? problems[0]?.id ?? null,
  );

  const problem: Problem | null = problems.find((item) => item.id === activeId) ?? null;

  useEffect(() => {
    const id = problemIdFromHash() ?? problems[0]?.id;
    if (!id || currentHashId() === id) return;
    history.replaceState(null, "", `#${encodeURIComponent(id)}`);
  }, []);

  useEffect(() => {
    const sync = () => {
      const id = problemIdFromHash();
      if (id) setActiveId(id);
    };
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);

  useEffect(() => {
    document.title = problem ? `${problem.title} · Lector` : "Lector de problemas";
  }, [problem]);

  const selectProblem = useCallback((id: string) => {
    setActiveId(id);
    if (currentHashId() === id) return;
    history.pushState(null, "", `#${encodeURIComponent(id)}`);
  }, []);

  if (problems.length === 0 || !problem) {
    return (
      <main className="empty-library">
        <div className="hat" aria-hidden="true">
          <span className="hat-white" />
          <span className="hat-blue" />
        </div>
        <h1>No hay problemas para mostrar.</h1>
        <p>Agrega un archivo Markdown en la raíz del repositorio y vuelve a cargar.</p>
      </main>
    );
  }

  return (
    <>
      <a className="skip" href="#problema">
        Saltar al problema
      </a>
      <div className="app">
        <Sidebar problems={problems} activeId={problem.id} onSelect={selectProblem} />
        <Reader problem={problem} />
      </div>
    </>
  );
}
