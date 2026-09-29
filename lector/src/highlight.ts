import hljs from "highlight.js/lib/core";
import cpp from "highlight.js/lib/languages/cpp";

hljs.registerLanguage("cpp", cpp);

const cache = new Map<string, string>();

export function highlightCpp(code: string): string {
  const cached = cache.get(code);
  if (cached) return cached;
  const html = hljs.highlight(code, { language: "cpp" }).value;
  cache.set(code, html);
  return html;
}
