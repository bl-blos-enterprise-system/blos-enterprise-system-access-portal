import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const ORGANIZATION_ID = "6cd3a2be-bf4d-4873-b930-17e5840fdc5a";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Cache-Control": "public, max-age=300",
  "X-Content-Type-Options": "nosniff",
};

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });
}

function safeFilename(value: string) {
  return value.replace(/[\r\n"\\]/g, "_").replace(/[^\x20-\x7e]/g, "_") || "documento-bes";
}

function decodeBase64(value: string) {
  const normalized = value.replace(/\s/g, "");
  const binary = atob(normalized);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function serveAsset(requestUrl: URL) {
  const assetId = requestUrl.searchParams.get("asset_id");
  const action = requestUrl.searchParams.get("action") === "view" ? "view" : "download";
  if (!assetId) return json({ ok: false, error: "asset_id_required" }, 400);

  const { data: asset, error } = await admin
    .from("document_assets")
    .select("id,filename,file_extension,mime_type,file_size_bytes,checksum_sha256,content_base64,visibility,status,metadata")
    .eq("id", assetId)
    .eq("organization_id", ORGANIZATION_ID)
    .eq("status", "active")
    .eq("visibility", "public")
    .single();

  if (error || !asset || asset.metadata?.public_release !== true) {
    return json({ ok: false, error: "public_asset_not_found" }, 404);
  }

  const bytes = decodeBase64(asset.content_base64 ?? "");
  const filename = safeFilename(asset.filename ?? `documento-bes.${asset.file_extension ?? "bin"}`);
  const inline = action === "view" && asset.mime_type === "application/pdf";
  return new Response(bytes, {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": asset.mime_type || "application/octet-stream",
      "Content-Length": String(bytes.byteLength),
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${filename}"`,
      "X-BES-Checksum-SHA256": asset.checksum_sha256 || "",
    },
  });
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "GET") return json({ ok: false, error: "method_not_allowed" }, 405);

  const requestUrl = new URL(request.url);
  if (requestUrl.searchParams.has("asset_id")) return serveAsset(requestUrl);

  try {
    const { data: docs, error: docsError } = await admin
      .from("documents")
      .select("id,code,title,purpose,scope,status,confidentiality,current_version,document_type_code,domain_id,source_file_url,approved_at,approved_by_user_id,metadata,updated_at")
      .eq("organization_id", ORGANIZATION_ID)
      .eq("status", "published")
      .eq("confidentiality", "public")
      .order("code", { ascending: true });
    if (docsError) throw docsError;

    const { data: domains, error: domainsError } = await admin
      .from("enterprise_domains")
      .select("id,code,name,sequence,domain_type")
      .eq("organization_id", ORGANIZATION_ID)
      .eq("active", true)
      .order("sequence", { ascending: true });
    if (domainsError) throw domainsError;

    const { data: storedAssets, error: assetsError } = await admin
      .from("document_assets")
      .select("id,document_id,asset_type,filename,file_extension,mime_type,file_size_bytes,checksum_sha256,visibility,allowed_roles,download_label,metadata")
      .eq("organization_id", ORGANIZATION_ID)
      .eq("status", "active")
      .eq("visibility", "public")
      .order("filename", { ascending: true });
    if (assetsError) throw assetsError;

    const endpoint = `${requestUrl.origin}${requestUrl.pathname}`;
    const domainMap = new Map((domains ?? []).map((domain: any) => [domain.id, domain]));
    const assetsByDocument = new Map<string, any[]>();

    for (const asset of storedAssets ?? []) {
      if (asset.metadata?.public_release !== true) continue;
      const viewUrl = `${endpoint}?asset_id=${encodeURIComponent(asset.id)}&action=view`;
      const downloadUrl = `${endpoint}?asset_id=${encodeURIComponent(asset.id)}&action=download`;
      const isPdf = asset.mime_type === "application/pdf" || asset.file_extension === "pdf";
      const item = {
        id: asset.id,
        asset_type: asset.asset_type,
        filename: asset.filename,
        file_extension: asset.file_extension,
        mime_type: asset.mime_type,
        file_size_bytes: asset.file_size_bytes,
        checksum_sha256: asset.checksum_sha256,
        label: asset.download_label || (isPdf ? "Ver PDF" : "Descargar archivo"),
        visibility: "public",
        allowed_roles: ["public"],
        public_url: isPdf ? viewUrl : downloadUrl,
        view_url: viewUrl,
        download_url: downloadUrl,
        actions: { view: isPdf, print: isPdf, download: true, editable: !isPdf, restricted: false, restricted_label: null },
      };
      const bucket = assetsByDocument.get(asset.document_id) ?? [];
      bucket.push(item);
      assetsByDocument.set(asset.document_id, bucket);
    }

    const documents = (docs ?? []).map((doc: any) => {
      const domain = domainMap.get(doc.domain_id) ?? null;
      const assets = assetsByDocument.get(doc.id) ?? [];
      const hasExternalPdf = doc.metadata?.public_release === true &&
        typeof doc.source_file_url === "string" &&
        doc.source_file_url.startsWith("https://bl-blos-enterprise-system.github.io/");
      if (hasExternalPdf) {
        assets.push({
          id: `published-${doc.id}`,
          asset_type: "published_pdf",
          filename: doc.source_file_url.split("/").pop() || `${doc.code}.pdf`,
          file_extension: "pdf",
          mime_type: "application/pdf",
          file_size_bytes: doc.metadata?.source_file_size_bytes ?? null,
          checksum_sha256: doc.metadata?.source_file_sha256 ?? null,
          label: "Ver PDF publicado",
          visibility: "public",
          allowed_roles: ["public"],
          public_url: doc.source_file_url,
          view_url: doc.source_file_url,
          download_url: doc.source_file_url,
          actions: { view: true, print: true, download: true, editable: false, restricted: false, restricted_label: null },
        });
      }
      return {
        id: doc.id,
        code: doc.code,
        title: doc.title,
        purpose: doc.purpose,
        scope: doc.scope,
        status: doc.status,
        confidentiality: doc.confidentiality,
        current_version: doc.current_version,
        document_type_code: doc.document_type_code,
        approved_at: doc.approved_at,
        approved_by_user_id: doc.approved_by_user_id,
        approved_by_name: doc.metadata?.approved_by_name ?? "Alejandro Mart\u00ednez",
        pillar_code: domain?.code ?? doc.metadata?.pillar_code ?? doc.metadata?.pillar ?? "BES",
        pillar_name: domain?.name ?? doc.metadata?.pillar_name ?? doc.metadata?.module ?? "Biblioteca BES",
        module: domain?.name ?? doc.metadata?.pillar_name ?? doc.metadata?.module ?? "Biblioteca BES",
        assets,
      };
    });

    return json({
      ok: true,
      generated_at: new Date().toISOString(),
      policy: {
        portal: "Biblioteca documental BES aprobada y de acceso p\u00fablico.",
        assets: "Los activos vigentes reclasificados como p\u00fablicos pueden consultarse sin autenticaci\u00f3n.",
        approval: "Aprobaci\u00f3n formal registrada por Alejandro Mart\u00ednez el 14 de agosto de 2026.",
      },
      approval: {
        approved_by_name: "Alejandro Mart\u00ednez",
        approved_by_user_id: "6c86bb48-a0ef-4406-827e-2743410c0f9a",
        approved_at: documents[0]?.approved_at ?? null,
      },
      modules: domains ?? [],
      documents,
    });
  } catch (error) {
    console.error("BES public catalog error", error);
    return json({ ok: false, error: "public_catalog_error" }, 500);
  }
});
