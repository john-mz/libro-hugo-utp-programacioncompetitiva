import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Problem } from "virtual:problems";
import { renderMarkdown } from "./markdown";
import type { highlightCpp } from "./highlight";
import type { typeset, typesetSync } from "./math";

const NARROW_QUERY = "(max-width: 959px)";

type MathModule = { typeset: typeof typeset; typesetSync: typeof typesetSync };
type HighlightFn = typeof highlightCpp;

let mathModule: MathModule | null = null;
let highlightFn: HighlightFn | null = null;

function useNarrow() {
  const [narrow, setNarrow] = useState(() => window.matchMedia(NARROW_QUERY).matches);
  useEffect(() => {
    const media = window.matchMedia(NARROW_QUERY);
    const onChange = () => setNarrow(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);
  return narrow;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const Statement = memo(function Statement({ markdown }: { markdown: string }) {
  const html = useMemo(() => renderMarkdown(markdown), [markdown]);
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (mathModule?.typesetSync(root)) return;
    let cancel = false;
    void import("./math").then((mod) => {
      mathModule = mod;
      if (!cancel && ref.current) void mod.typeset(ref.current);
    });
    return () => {
      cancel = true;
    };
  }, [html]);

  return <div ref={ref} className="prose" dangerouslySetInnerHTML={{ __html: html }} />;
});

const Solution = memo(function Solution({
  code,
  fileName,
}: {
  code: string | null;
  fileName: string;
}) {
  const [painted, setPainted] = useState<{ code: string; html: string } | null>(null);
  const html = code != null && highlightFn ? highlightFn(code) : painted?.code === code ? painted.html : null;

  useEffect(() => {
    if (code == null || highlightFn) return;
    let cancel = false;
    void import("./highlight").then((mod) => {
      highlightFn = mod.highlightCpp;
      if (!cancel) setPainted({ code, html: mod.highlightCpp(code) });
    });
    return () => {
      cancel = true;
    };
  }, [code]);

  if (code == null) {
    return (
      <div className="missing">
        <p className="missing-title">Aún no hay solución</p>
        <p>Cuando exista un archivo .cpp con el mismo nombre, se mostrará aquí.</p>
      </div>
    );
  }

  return (
    <div className="code-block">
      <p className="file-name">{fileName}</p>
      <pre className="cpp hljs">
        <code dangerouslySetInnerHTML={{ __html: html ?? escapeHtml(code) }} />
      </pre>
    </div>
  );
});

export const Reader = memo(function Reader({ problem }: { problem: Problem }) {
  const [tab, setTab] = useState<"enunciado" | "solucion">("enunciado");
  const narrow = useNarrow();
  const statementRef = useRef<HTMLElement>(null);
  const solutionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    statementRef.current?.scrollTo(0, 0);
    solutionRef.current?.scrollTo(0, 0);
  }, [problem.id]);

  return (
    <section className="reader" id="problema" tabIndex={-1} data-problem-id={problem.id}>
      <header className="reader-head">
        <p className="eyebrow">Problema abierto</p>
        <h1>{problem.title}</h1>
      </header>

      <div className="tabs" role="tablist" aria-label="Vista del problema">
        <button
          type="button"
          className="press"
          role="tab"
          aria-selected={tab === "enunciado"}
          onClick={() => setTab("enunciado")}
        >
          Enunciado
        </button>
        <button
          type="button"
          className="press"
          role="tab"
          aria-selected={tab === "solucion"}
          onClick={() => setTab("solucion")}
        >
          Solución
        </button>
      </div>

      <div className={tab === "solucion" ? "stage show-solution" : "stage"}>
        <div className="stage-track">
          <article
            ref={statementRef}
            className="panel panel-statement"
            role="tabpanel"
            aria-label="Enunciado"
            inert={narrow && tab !== "enunciado" ? true : undefined}
          >
            <div className="sheet" key={problem.id}>
              <h2>Enunciado</h2>
              <Statement markdown={problem.statement} />
            </div>
          </article>
          <article
            ref={solutionRef}
            className="panel panel-solution"
            role="tabpanel"
            aria-label="Solución"
            inert={narrow && tab !== "solucion" ? true : undefined}
          >
            <div className="sheet" key={`${problem.id}-solucion`}>
              <h2>Solución</h2>
              <Solution code={problem.solution} fileName={`${problem.id}.cpp`} />
            </div>
          </article>
        </div>
      </div>
    </section>
  );
});
