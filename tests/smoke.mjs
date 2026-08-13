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
assert.match(html, /BES-04-KDX-001-v1\.0/);
assert.match(app, /callBesEdge\("bes-auth"/);
assert.match(app, /"bes-activate"/);
assert.match(app, /"bes-admin-users"/);
assert.match(app, /expires_in_hours:\s*Number\(select\("#newExpiryHours"\)\.value\)/);
assert.match(app, /temporary_password_expires_at/);
assert.match(app, /membership\?\.role_code === "owner"/);
assert.match(app, /newPassword\.length >= 14/);
assert.match(app, /bes-document-library/);
assert.match(app, /function renderPublicLibrary/);
assert.match(app, /function canonicalPillarIndex/);
assert.match(app, /function loadDocumentLibrary/);
assert.match(app, /"EN ESPERA DE APROBACIÓN"/);
assert.doesNotMatch(html, /BES2026|perfiles de demostraci[oó]n/i);
assert.doesNotMatch(html, /contraseña temporal se muestra una sola vez y no caduca/i);
assert.doesNotMatch(app, /signUp\s*\(/);
assert.doesNotMatch(config, /SUPABASE_SERVICE_ROLE_KEY|sb_secret_/i);
assert.ok(image.size > 100_000, "La imagen institucional parece incompleta");

console.log("BES portal smoke checks: PASS");
