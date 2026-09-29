import { Marked } from "marked";

const marked = new Marked({ gfm: true, breaks: false });

type MathToken = { tex: string; display: boolean };

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function protectCode(source: string, blocks: string[]): string {
  const fenced = source.replace(/```[\s\S]*?```/g, (block) => {
    const index = blocks.push(block) - 1;
    return `%%C${index}%%`;
  });
  return fenced.replace(/`[^`\n]+`/g, (block) => {
    const index = blocks.push(block) - 1;
    return `%%C${index}%%`;
  });
}

function extractMath(source: string, maths: MathToken[]): string {
  const withoutDisplay = source.replace(/\$\$([\s\S]+?)\$\$/g, (_, tex: string) => {
    const index = maths.push({ tex: tex.trim(), display: true }) - 1;
    return `%%M${index}%%`;
  });
  return withoutDisplay.replace(/\$([^$\n]+?)\$/g, (_, tex: string) => {
    const index = maths.push({ tex: tex.trim(), display: false }) - 1;
    return `%%M${index}%%`;
  });
}

function restoreCode(source: string, blocks: string[]): string {
  return source.replace(/%%C(\d+)%%/g, (_, index: string) => blocks[Number(index)] ?? "");
}

function restoreMath(html: string, maths: MathToken[]): string {
  return html.replace(/%%M(\d+)%%/g, (_, index: string) => {
    const token = maths[Number(index)];
    if (!token) return "";
    const tag = token.display ? "div" : "span";
    const fallback = escapeHtml(token.display ? `$$${token.tex}$$` : `$${token.tex}$`);
    return `<${tag} class="math" data-display="${token.display ? "1" : "0"}" data-tex="${encodeURIComponent(token.tex)}">${fallback}</${tag}>`;
  });
}

function isTableStart(line: string): boolean {
  const pipes = line.match(/\|/g);
  return /^\s*\|/.test(line) && (pipes?.length ?? 0) >= 2;
}

function isTablePiece(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed === "") return true;
  if (trimmed.startsWith("%%C")) return false;
  if (trimmed.includes("|")) return true;
  if (trimmed.startsWith("<")) return true;
  return /^[\s*]+$/.test(trimmed);
}

function columnCount(line: string): number {
  const trimmed = line.trim();
  const parts = trimmed.split("|");
  if (trimmed.startsWith("|")) parts.shift();
  if (trimmed.endsWith("|") && parts.length > 0) parts.pop();
  return parts.length;
}

function parseRows(chunk: string[], columns: number): string[][] {
  const text = chunk
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");
  const rows: string[][] = [];
  let cells: string[] = [];
  let current = "";
  let started = false;

  for (const char of text) {
    if (char === "\n" || char === "\r") continue;
    if (char === "|") {
      if (!started) {
        started = true;
        current = "";
        continue;
      }
      cells.push(current.trim());
      current = "";
      if (cells.length === columns) {
        rows.push(cells);
        cells = [];
        started = false;
      }
      continue;
    }
    current += char;
  }

  return rows;
}

function isSeparator(row: string[]): boolean {
  return row.length > 0 && row.every((cell) => /^:?-{3,}:?$/.test(cell.replace(/\s/g, "")));
}

function cellHtml(raw: string): string {
  return escapeHtml(raw).replace(/&lt;br\s*\/?&gt;/gi, "<br>").replace(/ /g, "&nbsp;");
}

function tableToHtml(rows: string[][]): string {
  if (rows.length === 0) return "";
  const hasHead = rows.length >= 2 && isSeparator(rows[1]);
  const head = hasHead ? rows[0] : null;
  const body = hasHead ? rows.slice(2) : rows;
  const figure = rows.some((row) => row.some((cell) => /<br\s*\/?>/i.test(cell)));
  const headHtml = head
    ? `<thead><tr>${head.map((cell) => `<th>${cellHtml(cell)}</th>`).join("")}</tr></thead>`
    : "";
  const bodyHtml = body
    .map((row) => `<tr>${row.map((cell) => `<td>${cellHtml(cell)}</td>`).join("")}</tr>`)
    .join("");
  const className = figure ? "md-table is-figure" : "md-table";
  return `<div class="table-wrap"><table class="${className}">${headHtml}<tbody>${bodyHtml}</tbody></table></div>`;
}

function convertTables(source: string): string {
  const lines = source.split(/\r?\n/);
  const output: string[] = [];
  let index = 0;

  while (index < lines.length) {
    if (!isTableStart(lines[index])) {
      output.push(lines[index]);
      index += 1;
      continue;
    }

    const columns = columnCount(lines[index]);
    const chunk = [lines[index]];
    index += 1;

    while (index < lines.length && isTablePiece(lines[index])) {
      if (lines[index].trim() === "") {
        let look = index;
        while (look < lines.length && lines[look].trim() === "") look += 1;
        if (look >= lines.length || !isTablePiece(lines[look]) || lines[look].trim() === "") break;
      }
      chunk.push(lines[index]);
      index += 1;
    }

    const rows = columns > 0 ? parseRows(chunk, columns) : [];
    output.push(rows.length > 0 ? tableToHtml(rows) : chunk.join("\n"));
  }

  return output.join("\n");
}

export function renderMarkdown(source: string): string {
  try {
    const codeBlocks: string[] = [];
    const maths: MathToken[] = [];
    const protectedSource = protectCode(source.replace(/^\uFEFF/, ""), codeBlocks);
    const withMath = extractMath(protectedSource, maths);
    const withTables = convertTables(withMath);
    const restored = restoreCode(withTables, codeBlocks);
    const html = marked.parse(restored, { async: false }) as string;
    return restoreMath(html, maths);
  } catch {
    return `<pre>${escapeHtml(source)}</pre>`;
  }
}
