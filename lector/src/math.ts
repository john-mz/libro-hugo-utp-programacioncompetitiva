import type Katex from "katex";

let katexLib: typeof Katex | null = null;

function apply(katex: typeof Katex, root: ParentNode) {
  root.querySelectorAll<HTMLElement>(".math").forEach((el) => {
    if (el.dataset.ready === "1") return;
    const tex = decodeURIComponent(el.dataset.tex ?? "");
    const displayMode = el.dataset.display === "1";
    try {
      katex.render(tex, el, { throwOnError: false, displayMode });
      el.dataset.ready = "1";
    } catch {
      el.textContent = tex;
    }
  });
}

export function typesetSync(root: ParentNode): boolean {
  if (!katexLib) return false;
  apply(katexLib, root);
  return true;
}

export async function typeset(root: ParentNode) {
  if (!katexLib) {
    const [katexModule] = await Promise.all([import("katex"), import("katex/dist/katex.min.css")]);
    katexLib = katexModule.default;
  }
  apply(katexLib, root);
}
