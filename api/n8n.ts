// Vercel Edge Function — proxy seguro pro n8n
// Injeta X-API-Key (env var) e faz forward pro webhook correspondente
//
// Uso pelo front:
//   POST /api/n8n?path=staage-emitir-ov
//   Body: payload JSON original
//
// Endpoints permitidos (whitelist anti-abuso):
//   staage-emitir-ov
//   staage-sync-eduzz
//   staage-sync-easyflow
//   staage-sync-tmb

export const config = { runtime: "edge" };

const ALLOWED_PATHS = new Set([
  "staage-emitir-ov",
  "staage-sync-eduzz",
  "staage-sync-easyflow",
  "staage-sync-tmb",
]);

const N8N_BASE = "https://n8n.main.mktlab.app/webhook";

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.searchParams.get("path") || "";

  if (!ALLOWED_PATHS.has(path)) {
    return new Response(
      JSON.stringify({ error: "path not allowed", path }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const apiKey = process.env.N8N_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "N8N_API_KEY not configured on server" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const targetUrl = `${N8N_BASE}/${path}`;

  const headers = new Headers();
  headers.set("X-API-Key", apiKey);
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);

  const init: RequestInit = {
    method: request.method,
    headers,
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.text();
  }

  try {
    const upstream = await fetch(targetUrl, init);
    const text = await upstream.text();
    const respHeaders = new Headers();
    const upstreamCT = upstream.headers.get("content-type");
    if (upstreamCT) respHeaders.set("Content-Type", upstreamCT);
    respHeaders.set("X-Proxy-Status", String(upstream.status));

    return new Response(text, {
      status: upstream.status,
      headers: respHeaders,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "upstream fetch failed",
        message: String(err),
      }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }
}