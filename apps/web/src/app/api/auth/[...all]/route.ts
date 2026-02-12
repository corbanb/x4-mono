import { NextRequest } from "next/server";

const API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3002";

async function handler(request: NextRequest) {
  const url = new URL(request.url);
  const targetUrl = `${API_URL}${url.pathname}${url.search}`;

  const headers = new Headers(request.headers);
  headers.set("host", new URL(API_URL).host);
  headers.delete("connection");
  headers.delete("accept-encoding");

  const res = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: request.body,
    // @ts-expect-error -- duplex required for streaming request bodies
    duplex: "half",
    redirect: "manual",
  });

  const body = await res.arrayBuffer();

  const responseHeaders = new Headers();
  res.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower === "set-cookie") {
      // Strip domain so cookies attach to the web app's origin
      const cleaned = value.replace(/;\s*domain=[^;]*/gi, "");
      responseHeaders.append(key, cleaned);
    } else if (lower !== "transfer-encoding" && lower !== "content-encoding") {
      responseHeaders.append(key, value);
    }
  });

  return new Response(body, {
    status: res.status,
    headers: responseHeaders,
  });
}

export const GET = handler;
export const POST = handler;
