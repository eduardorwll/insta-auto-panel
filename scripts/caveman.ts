#!/usr/bin/env bun
/**
 * Caveman Input-Only Context & Brief Compressor + Telemetry Engine
 * Implements the rules of JuliusBrussee/caveman (caveman-compress + Read-less input shrink)
 * strictly for INPUT context (briefs, logs, test outputs, context docs, subagent inputs),
 * while keeping user-facing output in the full standard engineering report format.
 *
 * Commands:
 *   bun run caveman compress <file> [--out <path>]   Compress prose in markdown/text while preserving code blocks, inline code, paths, URLs, and numbers 100% verbatim.
 *   bun run caveman shrink-log <file|stdin>          Compress noisy test/build/JSON output before feeding to an agent/subagent.
 *   bun run caveman stats                            Print consolidated token-savings telemetry across Graft, Graphify, Caveman, and Delegate-Skills.
 *   bun run caveman record <engine> <tokensSaved>    Record token savings for end-of-task report.
 */

import fs from "node:fs";
import path from "node:path";

const REPO_ROOT = path.resolve(import.meta.dirname, "..");
const TELEMETRY_PATH = path.join(REPO_ROOT, ".prowl", "token-telemetry.json");
const BACKUP_DIR = "/tmp/caveman-compress-backups";

interface TelemetryEntry {
  timestamp: string;
  engine: "graft" | "graphify" | "caveman" | "delegate-skills";
  operation: string;
  tokensSaved: number;
}

interface TelemetryStore {
  entries: TelemetryEntry[];
}

function loadTelemetry(): TelemetryStore {
  try {
    if (fs.existsSync(TELEMETRY_PATH)) {
      return JSON.parse(fs.readFileSync(TELEMETRY_PATH, "utf-8")) as TelemetryStore;
    }
  } catch {
    // ignore corrupt telemetry
  }
  return { entries: [] };
}

export function recordTelemetry(
  engine: TelemetryEntry["engine"],
  operation: string,
  tokensSaved: number
): void {
  if (tokensSaved <= 0) return;
  const dir = path.dirname(TELEMETRY_PATH);
  fs.mkdirSync(dir, { recursive: true });
  const store = loadTelemetry();
  store.entries.push({
    timestamp: new Date().toISOString(),
    engine,
    operation,
    tokensSaved,
  });
  fs.writeFileSync(TELEMETRY_PATH, JSON.stringify(store, null, 2), "utf-8");
}

function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

/**
 * Compress prose line while keeping inline backticks (`...`), URLs, and paths untouched.
 */
function compressProseLine(line: string): string {
  // Preserve headings, tables borders, and empty lines
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#") || /^\|[\s:-]+\|$/.test(trimmed)) {
    return line;
  }

  // Split by inline code (`...`) or markdown links ([...](...)) so we never touch inside them
  const parts = line.split(/(`[^`]+`|\[[^\]]+\]\([^)]+\)|https?:\/\/\S+)/g);

  const compressedParts = parts.map((part, idx) => {
    // Odd indices are matched protected spans
    if (idx % 2 === 1) return part;

    return (
      part
        // English redundant phrases & fillers (from caveman-compress/SKILL.md)
        .replace(/\bin order to\b/gi, "to")
        .replace(/\bmake sure to\b/gi, "ensure")
        .replace(/\bthe reason is because\b/gi, "because")
        .replace(/\byou should always\b/gi, "")
        .replace(/\byou should\b/gi, "")
        .replace(/\bremember to\b/gi, "")
        .replace(/\bit is important to note that\b/gi, "")
        .replace(/\bplease note that\b/gi, "")
        .replace(
          /\b(just|really|basically|actually|simply|essentially|generally|furthermore|additionally|moreover)\b\s*/gi,
          ""
        )
        // Portuguese redundant phrases & fillers (for PT-BR specs/briefs/context)
        .replace(/\ba fim de que\b/gi, "para")
        .replace(/\bcom o objetivo de\b/gi, "para")
        .replace(/\batravés d[eoa]s?\b/gi, "via")
        .replace(/\bpor meio d[eoa]s?\b/gi, "via")
        .replace(/\bde acordo com\b/gi, "conforme")
        .replace(/\ba partir d[eoa]s?\b/gi, "de")
        .replace(/\bresponsável por\b/gi, "faz")
        .replace(/\bcapacidade de\b/gi, "")
        .replace(/\bde forma a\b/gi, "para")
        .replace(/\bde forma\b/gi, "")
        .replace(/\bde maneira\b/gi, "")
        .replace(/\bcertifique-se de que\b/gi, "garanta")
        .replace(/\bcertifique-se de\b/gi, "garanta")
        .replace(/\bé importante ressaltar que\b/gi, "")
        .replace(/\bvale destacar que\b/gi, "")
        .replace(/\bdevemos garantir que\b/gi, "garantir")
        .replace(/\bvocê deve sempre\b/gi, "")
        .replace(/\bvocê deve\b/gi, "")
        .replace(/\bé terminantemente proibido\b/gi, "proibido")
        .replace(/\búnica e exclusivamente\b/gi, "apenas")
        .replace(/\bde forma totalmente transparente\b/gi, "transparente")
        .replace(/\bimediatamente após\b/gi, "após")
        .replace(/\b(basicamente|realmente|simplesmente|essencialmente|geralmente|além disso|portanto|entretanto|contudo|outrossim|obrigatoriamente|automaticamente|perfeitamente|diretamente)\b,?\s*/gi, "")
        // Articles in prose (safe reduction outside code)
        .replace(/\b(a|an|the)\s+(?=[a-z]{4,})/gi, "")
        .replace(/\b(um|uma|uns|umas|o|a|os|as)\s+(?=[a-záéíóúâêôãõç]{5,})/gi, "")
        .replace(/\b(do|da|dos|das)\s+(?=[a-záéíóúâêôãõç]{5,})/gi, "de ")
        .replace(/\s{2,}/g, " ")
    );
  });

  return compressedParts.join("");
}

export function cavemanCompressMarkdown(content: string): string {
  const lines = content.split("\n");
  const out: string[] = [];
  let inFence = false;

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      inFence = !inFence;
      out.push(line);
      continue;
    }
    if (inFence) {
      // CRITICAL RULE: Anything inside ``` ... ``` must be copied EXACTLY.
      out.push(line);
      continue;
    }
    out.push(compressProseLine(line));
  }

  // Collapse 3+ consecutive blank lines into single blank line outside code blocks
  return out.join("\n").replace(/\n{3,}/g, "\n\n");
}

export function cavemanShrinkLog(content: string): string {
  const lines = content.split("\n");
  if (lines.length <= 30) return content;

  const kept: string[] = [];
  let omitted = 0;

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const isImportant =
      i < 8 ||
      i >= lines.length - 12 ||
      /error|fail|warn|pass|✓|✗|expect\(|built in|tokens|saved|nodes|edges/i.test(l);

    if (isImportant) {
      if (omitted > 0) {
        kept.push(`  [...caveman omitted ${omitted} repetitive lines...]`);
        omitted = 0;
      }
      kept.push(l);
    } else {
      omitted++;
    }
  }
  if (omitted > 0) {
    kept.push(`  [...caveman omitted ${omitted} repetitive lines...]`);
  }
  return kept.join("\n");
}

const [, , cmd, ...args] = process.argv;

if (!cmd || cmd === "--help" || cmd === "-h") {
  console.log(
    "Usage: caveman <compress|shrink-log|stats|record> [args]\n" +
      "  compress <file> [--out <file>]   Compress input markdown/brief preserving code blocks verbatim\n" +
      "  shrink-log <file>                Shrink verbose test/build logs for agent input\n" +
      "  stats                            Show consolidated token savings across all 4 engines\n" +
      "  record <engine> <tokens> [op]    Record token savings into .prowl/token-telemetry.json"
  );
  process.exit(0);
}

if (cmd === "compress") {
  const outIdx = args.indexOf("--out");
  const outFile = outIdx !== -1 ? args[outIdx + 1] : undefined;
  const target = args.find((a, idx) => !a.startsWith("-") && idx !== outIdx + 1);

  if (!target) {
    console.error("Usage: caveman compress <file> [--out <output-file>]");
    process.exit(1);
  }

  const absTarget = path.resolve(REPO_ROOT, target);
  if (!fs.existsSync(absTarget)) {
    console.error(`File not found: ${absTarget}`);
    process.exit(1);
  }

  // Refuse secret files
  if (/\.(env|pem|key)|credentials|secrets/i.test(path.basename(absTarget))) {
    console.error(`Refusing to compress secret-like file: ${absTarget}`);
    process.exit(1);
  }

  const original = fs.readFileSync(absTarget, "utf-8");
  const compressed = cavemanCompressMarkdown(original);

  const beforeTokens = estimateTokens(original);
  const afterTokens = estimateTokens(compressed);
  const saved = Math.max(0, beforeTokens - afterTokens);
  const pct = beforeTokens > 0 ? ((saved / beforeTokens) * 100).toFixed(1) : "0.0";

  if (outFile) {
    const absOut = path.resolve(REPO_ROOT, outFile);
    fs.mkdirSync(path.dirname(absOut), { recursive: true });
    fs.writeFileSync(absOut, compressed, "utf-8");
  } else {
    // Save backup in out-of-tree backup dir per caveman-compress spec
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const backupPath = path.join(BACKUP_DIR, `${path.basename(absTarget)}.original.md`);
    if (!fs.existsSync(backupPath)) {
      fs.writeFileSync(backupPath, original, "utf-8");
    }
    fs.writeFileSync(absTarget, compressed, "utf-8");
  }

  recordTelemetry("caveman", `compress:${path.basename(absTarget)}`, saved);
  console.log(
    `🪨 [caveman] input tokens saved ≈ ${saved.toLocaleString("en-US")} (${beforeTokens} → ${afterTokens} tokens, -${pct}%)`
  );
  process.exit(0);
}

if (cmd === "shrink-log") {
  const target = args[0];
  const raw = target && fs.existsSync(target) ? fs.readFileSync(target, "utf-8") : fs.readFileSync(0, "utf-8");
  const shrunk = cavemanShrinkLog(raw);
  const beforeTokens = estimateTokens(raw);
  const afterTokens = estimateTokens(shrunk);
  const saved = Math.max(0, beforeTokens - afterTokens);
  recordTelemetry("caveman", "shrink-log", saved);
  console.log(`🪨 [caveman] input tokens saved ≈ ${saved.toLocaleString("en-US")} (${beforeTokens} → ${afterTokens} tokens)`);
  console.log(shrunk);
  process.exit(0);
}

if (cmd === "record") {
  const engine = args[0] as TelemetryEntry["engine"];
  const tokens = Number(args[1] || 0);
  const op = args[2] || "manual";
  recordTelemetry(engine, op, tokens);
  console.log(`[telemetry] recorded ${tokens.toLocaleString("en-US")} tokens saved for ${engine} (${op})`);
  process.exit(0);
}

if (cmd === "stats") {
  const store = loadTelemetry();
  const totals: Record<string, { calls: number; tokens: number }> = {
    graft: { calls: 0, tokens: 0 },
    graphify: { calls: 0, tokens: 0 },
    caveman: { calls: 0, tokens: 0 },
    "delegate-skills": { calls: 0, tokens: 0 },
  };

  for (const e of store.entries) {
    if (!totals[e.engine]) totals[e.engine] = { calls: 0, tokens: 0 };
    totals[e.engine].calls++;
    totals[e.engine].tokens += e.tokensSaved;
  }

  const grandTotal = Object.values(totals).reduce((acc, v) => acc + v.tokens, 0);

  console.log("╭────────────────────────────────────────────────────────────────────╮");
  console.log("│  📊 SANDBOX TOKEN-SAVERS TELEMETRY (4 MANDATORY ENGINES)           │");
  console.log("├────────────────────────┬───────────────┬───────────────────────────┤");
  console.log("│ Engine                 │ Calls / Runs  │ Measured Tokens Saved     │");
  console.log("├────────────────────────┼───────────────┼───────────────────────────┤");
  console.log(
    `│ 🌱 Graft + Prowl       │ ${String(totals.graft.calls).padStart(13)} │ ~${totals.graft.tokens.toLocaleString("en-US").padStart(24)} │`
  );
  console.log(
    `│ 🕸️ Graphify AST        │ ${String(totals.graphify.calls).padStart(13)} │ ~${totals.graphify.tokens.toLocaleString("en-US").padStart(24)} │`
  );
  console.log(
    `│ 🪨 Caveman (Input)     │ ${String(totals.caveman.calls).padStart(13)} │ ~${totals.caveman.tokens.toLocaleString("en-US").padStart(24)} │`
  );
  console.log(
    `│ 🤝 Delegate-Skills     │ ${String(totals["delegate-skills"].calls).padStart(13)} │ ~${totals["delegate-skills"].tokens.toLocaleString("en-US").padStart(24)} │`
  );
  console.log("├────────────────────────┴───────────────┼───────────────────────────┤");
  console.log(
    `│ 💰 TOTAL TOKENS SAVED / OFFLOADED      │ ~${grandTotal.toLocaleString("en-US").padStart(24)} │`
  );
  console.log("╰────────────────────────────────────────┴───────────────────────────╯");
  process.exit(0);
}
