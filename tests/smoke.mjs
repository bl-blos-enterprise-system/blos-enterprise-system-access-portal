import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const html = await readFile(resolve(root, "index.html"), "utf8");
const app = await readFile(resolve(root, "assets/js/app.js"), "utf8");
const config = await readFile(
  resolve(root, "assets/js/supabase-config.js"),
  "utf8",
);
const ublMigration = await readFile(
  resolve(root, "supabase/migrations/20260820_ubl_functional_portal.sql"),
  "utf8",
);
const integrityMigration = await readFile(
  resolve(root, "supabase/migrations/20260820_reconcile_public_asset_integrity.sql"),
  "utf8",
);
const image = await stat(resolve(root, "assets/bes-login-brand.jpg"));

assert.match(html, /Content-Security-Policy/);
assert.match(html, /id="loginForm"/);
assert.match(html, /id="publicView"/);
assert.match(html, /id="publicDocumentRows"/);
assert.match(html, /Biblioteca documental pública BES/);
assert.match(html, /id="passwordForm"/);
assert.match(html, /id="provisionUserForm"/);
assert.match(html, /id="newExpiryHours"/);
assert.match(html, /value="24">24 horas/);
assert.match(html, /value="48">48 horas/);
assert.match(html, /value="72">72 horas/);
assert.match(html, /assets\/bes-login-brand\.jpg/);
assert.match(html, /Solo el propietario BES puede crear identidades/);
assert.match(html, /id="documentRows"/);
assert.match(html, /id="pillarCatalog"/);
assert.match(html, /id="inventoryRows"/);
assert.match(html, /data-page="university"/);
assert.match(html, /id="ublAssessmentForm"/);
assert.match(html, /id="ublCohortRows"/);
assert.match(html, /id="publicReleaseSummary"/);
assert.match(html, /BES-04-KDX-001-v1\.0/);
assert.match(app, /callBesEdge\("bes-auth"/);
assert.match(app, /"bes-activate"/);
assert.match(app, /"bes-admin-users"/);
assert.match(app, /expires_in_hours:\s*Number\(select\("#newExpiryHours"\)\.value\)/);
assert.match(app, /temporary_password_expires_at/);
assert.match(app, /membership\?\.role_code === "owner"/);
assert.match(app, /newPassword\.length >= 14/);
assert.match(app, /bes-document-library/);
assert.match(app, /bes-public-catalog/);
assert.match(app, /function renderPublicLibrary/);
assert.match(app, /function canonicalPillarIndex/);
assert.match(app, /function loadDocumentLibrary/);
assert.match(app, /function loadUblDashboard/);
assert.match(app, /supabase\.rpc\("get_ubl_dashboard"/);
assert.match(app, /supabase\.rpc\("save_my_ubl_progress"/);
assert.match(app, /supabase\.rpc\("submit_ubl_assessment"/);
assert.match(app, /new Blob\(\[html\], \{ type: "text\/html;charset=utf-8" \}\)/);
assert.match(app, /const APP_VERSION = "2\.4\.0"/);
assert.match(app, /"APROBADO Y PUBLICADO"/);
assert.match(html, /id="publicApprovedCount"/);
assert.doesNotMatch(html, /Los 60 documentos y los 62 activos vigentes/);
assert.match(html, /APROBADO Y PUBLICADO/);
assert.equal(
  new Set([...html.matchAll(/name="q([1-8])"/g)].map((match) => match[1])).size,
  8,
  "La evaluación UBL debe incluir ocho reactivos",
);
assert.match(ublMigration, /create or replace function api\.submit_ubl_assessment/);
assert.match(ublMigration, /security invoker/);
assert.match(ublMigration, /revoke all on function api\.submit_ubl_assessment\(jsonb\) from public, anon/);
assert.match(ublMigration, /grant execute on function api\.submit_ubl_assessment\(jsonb\) to authenticated/);
assert.doesNotMatch(ublMigration, /p_payload\s*->>\s*'best_score'/);
assert.match(integrityMigration, /digest\(decode\(/);
assert.match(integrityMigration, /checksum_sha256 = canonical\.actual_sha256/);
assert.doesNotMatch(html, /BES2026|perfiles de demostraci[oó]n/i);
assert.doesNotMatch(html, /contraseña temporal se muestra una sola vez y no caduca/i);
assert.doesNotMatch(app, /signUp\s*\(/);
assert.doesNotMatch(config, /SUPABASE_SERVICE_ROLE_KEY|sb_secret_/i);
assert.ok(image.size > 100_000, "La imagen institucional parece incompleta");

console.log("BES portal smoke checks: PASS");
