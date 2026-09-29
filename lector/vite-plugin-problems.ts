import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

const VIRTUAL_ID = "virtual:problems";
const RESOLVED_ID = "\0virtual:problems";

type ProblemFile = {
  id: string;
  title: string;
  statement: string;
  solution: string | null;
};

function extractTitle(markdown: string): string {
  const source = markdown.replace(/^\uFEFF/, "");
  const lines = source.split(/\r?\n/);

  for (const line of lines) {
    const heading = /^\s*#{1,6}\s+(.+?)\s*#*\s*$/.exec(line);
    if (heading) return stripInline(heading[1]);
  }

  for (const line of lines) {
    const bold = /^\s*\*\*(.+)\*\*\s*$/.exec(line);
    if (bold) return stripInline(bold[1]);
  }

  return "Problema sin título";
}

function stripInline(value: string): string {
  return value
    .replace(/\$\$[\s\S]+?\$\$/g, "")
    .replace(/\$[^$\n]+\$/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function readProblems(repoRoot: string): { problems: ProblemFile[]; files: string[] } {
  const names = fs
    .readdirSync(repoRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);

  const files: string[] = [];
  const problems = names
    .filter((name) => name.toLowerCase().endsWith(".md") && !name.startsWith("."))
    .map((name) => {
      const id = name.slice(0, -3);
      const mdPath = path.join(repoRoot, name);
      files.push(mdPath);
      const statement = fs.readFileSync(mdPath, "utf8");
      const cppName = `${id}.cpp`;
      const cppPath = path.join(repoRoot, cppName);
      let solution: string | null = null;
      if (names.includes(cppName)) {
        solution = fs.readFileSync(cppPath, "utf8");
        files.push(cppPath);
      }
      return {
        id,
        title: extractTitle(statement),
        statement,
        solution,
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title, "es", { numeric: true }));

  return { problems, files };
}

export function problemsPlugin(repoRoot: string): Plugin {
  return {
    name: "repo-problems",
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },
    load(id) {
      if (id !== RESOLVED_ID) return null;
      const { problems, files } = readProblems(repoRoot);
      for (const file of files) this.addWatchFile(file);
      const payload = JSON.stringify(problems).replace(/</g, "\\u003c");
      return `export const problems = ${payload}\n`;
    },
    configureServer(server) {
      const globs = [path.join(repoRoot, "*.md"), path.join(repoRoot, "*.cpp")];
      server.watcher.add(globs);
      const reload = (file: string) => {
        const resolved = path.resolve(file);
        if (path.dirname(resolved) !== path.resolve(repoRoot)) return;
        if (!resolved.endsWith(".md") && !resolved.endsWith(".cpp")) return;
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: "full-reload" });
      };
      server.watcher.on("add", reload);
      server.watcher.on("change", reload);
      server.watcher.on("unlink", reload);
    },
  };
}
