import { db, sqlite } from "./client";
import { companies } from "./schema";
import { ne } from "drizzle-orm";
import { runSeed } from "./seed";
import fs from "node:fs/promises";
import path from "node:path";

/**
 * Sanitiza o banco de dados e os diretórios de artefatos em disco,
 * garantindo que apenas a empresa canônica ('demo_corp') permaneça.
 * Remove quaisquer empresas de teste (e2e_*, studio_co_*, cfg_co_*, etc.)
 * e diretórios temporários associados.
 */
export async function sanitizeDatabase(targetDb = db) {
  // 1. Identificar empresas de teste a remover
  const nonDemoCompanies = await targetDb
    .select({ id: companies.id, name: companies.name })
    .from(companies)
    .where(ne(companies.id, "demo_corp"));

  const removedIds = nonDemoCompanies.map((c) => c.id);

  if (removedIds.length > 0) {
    console.log(`[Sanitizer] Removendo ${removedIds.length} empresas de teste:`, removedIds);
    await targetDb.delete(companies).where(ne(companies.id, "demo_corp"));
  } else {
    console.log("[Sanitizer] Nenhuma empresa de teste residual encontrada.");
  }

  // 2. Limpar diretórios temporários de renders que não sejam demo_corp
  const rendersDir = path.resolve(import.meta.dirname, "../../../data/renders");
  try {
    const renderEntries = await fs.readdir(rendersDir, { withFileTypes: true });
    for (const entry of renderEntries) {
      if (entry.isDirectory() && entry.name !== "demo_corp") {
        const targetPath = path.join(rendersDir, entry.name);
        await fs.rm(targetPath, { recursive: true, force: true });
        console.log(`[Sanitizer] Removido diretório de renderização órfão: ${entry.name}`);
      }
    }
  } catch {}

  // 3. Limpar perfis temporários de autosocial (.profiles) que não sejam demo_corp
  const profilesDir = path.resolve(import.meta.dirname, "../../../data/autosocial/.profiles");
  try {
    const profileEntries = await fs.readdir(profilesDir, { withFileTypes: true });
    for (const entry of profileEntries) {
      if (entry.isDirectory() && entry.name !== "demo_corp") {
        const targetPath = path.join(profilesDir, entry.name);
        await fs.rm(targetPath, { recursive: true, force: true });
        console.log(`[Sanitizer] Removido perfil de sessão órfão: ${entry.name}`);
      }
    }
  } catch {}

  // 4. Executar seed para garantir integridade da demo_corp
  await runSeed(targetDb);
  console.log("[Sanitizer] Seed canônico verificado com sucesso para demo_corp.");

  return {
    removedCompaniesCount: removedIds.length,
    removedIds,
  };
}

// Execução CLI direta via `bun run src/server/db/sanitize.ts`
if (import.meta.main) {
  sanitizeDatabase()
    .then((result) => {
      console.log(`[Sanitizer] Concluído com sucesso. ${result.removedCompaniesCount} empresas removidas.`);
      process.exit(0);
    })
    .catch((err) => {
      console.error("[Sanitizer] Erro ao sanitizar banco de dados:", err);
      process.exit(1);
    });
}
