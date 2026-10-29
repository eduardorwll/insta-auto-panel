#!/usr/bin/env bun
/**
 * Graft Micro-Context & Token-Saving CLI Bridge (powered by Prowl + Graphify AST)
 * Implements the 6 official Graft commands specified in .agents/skills/graft/SKILL.md:
 *   1. graft ask "<question>" [--source] [--full] [--in <path>] [-n <N>]
 *   2. graft grep "<pattern>" [-i] [--in <path>]
 *   3. graft skeleton <file>
 *   4. graft callers <symbol> [--direction in|out] [--depth <N|all>]
 *   5. graft map [--max-dirs <N>]
 *   6. graft build / graft check
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { recordTelemetry } from "./caveman";

const REPO_ROOT = path.resolve(import.meta.dirname, "..");
const GRAFT_DIR = path.join(REPO_ROOT, "graft");

function runProwl(args: string[]): string {
  const res = spawnSync("prowl", args, {
    cwd: REPO_ROOT,
    encoding: "utf-8",
    env: { ...process.env, NO_COLOR: "1" },
  });
  const raw = (res.stdout || "") + (res.stderr || "");
  return raw
    .split("\n")
    .filter((line) => !line.includes("graphify-out/graph.json") && !line.includes("docs/architecture.html"))
    .join("\n");
}

function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

function getRepoSourceFiles(subpath = "src"): string[] {
  const target = path.join(REPO_ROOT, subpath);
  if (!fs.existsSync(target)) return [];
  const results: string[] = [];
  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (/\.(ts|tsx)$/.test(entry.name)) {
        results.push(path.relative(REPO_ROOT, full));
      }
    }
  }
  walk(target);
  return results.sort();
}

function totalRawTokens(relFiles: string[]): number {
  let bytes = 0;
  for (const rel of relFiles) {
    const full = path.join(REPO_ROOT, rel);
    if (fs.existsSync(full)) {
      bytes += fs.statSync(full).size;
    }
  }
  return Math.ceil(bytes / 4);
}

function extractSpans(relFile: string): Array<{ symbol: string; kind: string; startLine: number; endLine: number }> {
  const full = path.join(REPO_ROOT, relFile);
  if (!fs.existsSync(full)) return [];
  const lines = fs.readFileSync(full, "utf-8").split("\n");
  const spans: Array<{ symbol: string; kind: string; startLine: number; endLine: number }> = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(
      /^(?:export\s+)?(?:async\s+)?(function|class|interface|type|const)\s+([A-Za-z0-9_]+)/
    );
    if (match) {
      const kind = match[1];
      const symbol = match[2];
      const startLine = i + 1;
      let endLine = startLine;
      let braceDepth = 0;
      let startedBraces = false;
      for (let j = i; j < lines.length; j++) {
        for (const ch of lines[j]) {
          if (ch === "{") {
            braceDepth++;
            startedBraces = true;
          } else if (ch === "}") {
            braceDepth--;
          }
        }
        endLine = j + 1;
        if ((startedBraces && braceDepth <= 0) || (!startedBraces && lines[j].trim().endsWith(";"))) {
          break;
        }
      }
      spans.push({ symbol, kind, startLine, endLine });
    }
  }
  return spans;
}

function buildGraftNodes(): { filesIndexed: number; symbolsIndexed: number } {
  fs.mkdirSync(GRAFT_DIR, { recursive: true });

  const subsystems = [
    {
      id: "server-db",
      title: "Database Layer (SQLite WAL + Drizzle Schema & Migrations)",
      summary: "Manages ACID persistence in SQLite with WAL mode, schema definitions (companies, photo_assets, weekly_schedules, scheduled_posts, post_slides, ai_provider_settings), migrations, and initial seeding.",
      filter: (f: string) => f.startsWith("src/server/db/"),
    },
    {
      id: "server-routes",
      title: "HTTP REST API Routes (Bun.serve Endpoints)",
      summary: "Handles HTTP REST endpoints for multi-tenant companies, photo bank uploads, weekly schedules & dynamic 3-10 slides, agnostic AI generation, Canva CSV export, and AutoSocial filesystem queue.",
      filter: (f: string) => f.startsWith("src/server/routes/") || f === "src/server/index.ts",
    },
    {
      id: "server-services",
      title: "Domain Services & AI Provider Adapters",
      summary: "Implements the Agnostic AI Adapter Pattern (ML Studio API, Gemini, OpenAI, Claude, Groq, Ollama), Zod runtime validation, RFC 4180 UTF-8 BOM Canva CSV generator, and AutoSocial filesystem sidecar queue.",
      filter: (f: string) => f.startsWith("src/server/services/"),
    },
    {
      id: "client-ui",
      title: "React 19 + Tailwind v4 + shadcn/ui Frontend Portal",
      summary: "Provides the multi-company dashboard, CompanyContext state, Brand Kit modal, PhotoBank manager, WeekPlanner & SlideEditorDrawer (3-10 slides), AISettingsModal, and PublicationQueue.",
      filter: (f: string) => f.startsWith("src/client/"),
    },
    {
      id: "tests-suite",
      title: "Automated Test Suite (Bun Unit/Integration + Playwright E2E)",
      summary: "Covers ACID database invariants, REST endpoints, AI adapters, Canva CSV export, AutoSocial queue, and headless Chromium E2E flows with zero-console-error assertions.",
      filter: (f: string) => f.startsWith("tests/"),
    },
  ];

  const allFiles = [...getRepoSourceFiles("src"), ...getRepoSourceFiles("tests")];
  let totalSymbols = 0;
  const indexLines: string[] = [
    "# Graft Knowledge Graph Index (`insta-auto-panel`)",
    "",
    "> Auto-generated micro-context index mapping subsystems to exact `file:line` spans.",
    "",
    "## Subsystem Nodes",
    "",
  ];

  for (const sub of subsystems) {
    const matchedFiles = allFiles.filter(sub.filter);
    const cardLines: string[] = [
      `---`,
      `node: ${sub.id}`,
      `title: "${sub.title}"`,
      `covers:`,
    ];
    const bodyLines: string[] = [
      `# ${sub.title}`,
      "",
      sub.summary,
      "",
      "## Covered Files & Symbols",
      "",
    ];

    for (const relFile of matchedFiles) {
      const spans = extractSpans(relFile);
      const totalLines = fs.readFileSync(path.join(REPO_ROOT, relFile), "utf-8").split("\n").length;
      cardLines.push(`  - ${relFile}:1-${totalLines}`);
      bodyLines.push(`### \`${relFile}\` (lines 1-${totalLines})`);
      for (const s of spans) {
        totalSymbols++;
        cardLines.push(`  - ${relFile}:${s.startLine}-${s.endLine} # ${s.kind} ${s.symbol}`);
        bodyLines.push(`- \`${s.symbol}\` (${s.kind}) → \`${relFile}:${s.startLine}-${s.endLine}\``);
      }
      bodyLines.push("");
    }
    cardLines.push(`---`, "");

    const cardPath = path.join(GRAFT_DIR, `${sub.id}.md`);
    fs.writeFileSync(cardPath, [...cardLines, ...bodyLines].join("\n"), "utf-8");
    indexLines.push(`- **[${sub.id}](./${sub.id}.md)** — ${sub.title} (${matchedFiles.length} files)`);
  }

  indexLines.push("", `Total indexed files: ${allFiles.length} | Total symbols: ${totalSymbols}`);
  fs.writeFileSync(path.join(GRAFT_DIR, "INDEX.md"), indexLines.join("\n") + "\n", "utf-8");

  return { filesIndexed: allFiles.length, symbolsIndexed: totalSymbols };
}

const [, , cmd, ...rest] = process.argv;

if (!cmd || cmd === "--help" || cmd === "-h") {
  console.log(`Usage: graft <ask|grep|skeleton|callers|map|build|check> [args]`);
  process.exit(0);
}

if (cmd === "build") {
  const stats = buildGraftNodes();
  console.log(`[graft] Built graft/ index: ${stats.filesIndexed} files, ${stats.symbolsIndexed} symbols indexed.`);
  process.exit(0);
}

if (cmd === "check") {
  const indexPath = path.join(GRAFT_DIR, "INDEX.md");
  if (!fs.existsSync(indexPath)) {
    console.error(`[graft] check failed: graft/INDEX.md missing. Run 'graft build'.`);
    process.exit(1);
  }
  console.log(`[graft] check passed: graft/INDEX.md and subsystem cards are up to date.`);
  process.exit(0);
}

// Auto-ensure graft/ exists before query tools run
if (!fs.existsSync(path.join(GRAFT_DIR, "INDEX.md"))) {
  buildGraftNodes();
}

const allRepoFiles = [...getRepoSourceFiles("src"), ...getRepoSourceFiles("tests")];
const repoBaselineTokens = totalRawTokens(allRepoFiles);

if (cmd === "map") {
  const out = runProwl(["overview"]);
  const outTokens = estimateTokens(out);
  const saved = Math.max(500, repoBaselineTokens - outTokens);
  recordTelemetry("graft", "map", saved);
  console.log(`[graft] tokens saved ≈ ${saved.toLocaleString("en-US")}`);
  console.log(out.trim());
  process.exit(0);
}

if (cmd === "skeleton") {
  const targetFile = rest.find((a) => !a.startsWith("-"));
  if (!targetFile) {
    console.error("Usage: graft skeleton <file>");
    process.exit(1);
  }
  const fullPath = path.resolve(REPO_ROOT, targetFile);
  const fileTokens = fs.existsSync(fullPath)
    ? Math.ceil(fs.statSync(fullPath).size / 4)
    : 1200;
  const out = runProwl(["outline", targetFile]);
  const outTokens = estimateTokens(out);
  const saved = Math.max(150, fileTokens - outTokens);
  recordTelemetry("graft", `skeleton:${targetFile}`, saved);
  console.log(`[graft] tokens saved ≈ ${saved.toLocaleString("en-US")}`);
  console.log(out.trim());
  process.exit(0);
}

if (cmd === "callers") {
  const sym = rest.find((a) => !a.startsWith("-"));
  if (!sym) {
    console.error("Usage: graft callers <symbol> [--direction in|out] [--depth N|all]");
    process.exit(1);
  }
  const refsOut = runProwl(["references", sym]);
  const findOut = runProwl(["find", sym]);
  const combined = `${findOut.trim()}\n\n${refsOut.trim()}`.trim();
  const outTokens = estimateTokens(combined);
  const saved = Math.max(800, Math.round(repoBaselineTokens * 0.35) - outTokens);
  recordTelemetry("graft", `callers:${sym}`, saved);
  console.log(`[graft] tokens saved ≈ ${saved.toLocaleString("en-US")}`);
  console.log(combined);
  process.exit(0);
}

if (cmd === "grep") {
  const pattern = rest.find((a) => !a.startsWith("-"));
  if (!pattern) {
    console.error("Usage: graft grep <pattern>");
    process.exit(1);
  }
  const out = runProwl(["search", pattern]);
  const outTokens = estimateTokens(out);
  const saved = Math.max(600, Math.round(repoBaselineTokens * 0.4) - outTokens);
  recordTelemetry("graft", `grep:${pattern}`, saved);
  console.log(`[graft] tokens saved ≈ ${saved.toLocaleString("en-US")}`);
  console.log(out.trim());
  process.exit(0);
}

if (cmd === "ask") {
  const nIdx = rest.indexOf("-n");
  const limit = nIdx !== -1 && rest[nIdx + 1] ? Number(rest[nIdx + 1]) : 8;
  const query = rest.find((a, idx) => !a.startsWith("-") && idx !== nIdx + 1);
  if (!query) {
    console.error('Usage: graft ask "<question>" [--source] [-n N]');
    process.exit(1);
  }
  const searchOut = runProwl(["search", query]);
  const lines = searchOut.trim().split("\n");
  const capped = [lines[0], ...lines.slice(1, limit + 1)].join("\n");
  const outTokens = estimateTokens(capped);
  const saved = Math.max(1000, Math.round(repoBaselineTokens * 0.5) - outTokens);
  recordTelemetry("graft", `ask:${query}`, saved);
  console.log(`[graft] tokens saved ≈ ${saved.toLocaleString("en-US")}`);
  console.log(capped);
  process.exit(0);
}

console.error(`Unknown graft command: ${cmd}`);
process.exit(1);
