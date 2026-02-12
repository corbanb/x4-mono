const API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3002";

async function handler(request: Request) {
  const url = new URL(request.url);
  const targetUrl = `${API_URL}${url.pathname}${url.search}`;

  const headers = new Headers(request.headers);
  headers.set("host", new URL(API_URL).host);
  headers.delete("connection");

  const res = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: request.body,
    // @ts-expect-error -- duplex required for streaming request bodies
    duplex: "half",
    redirect: "manual",
  });

  const responseHeaders = new Headers();
  res.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "transfer-encoding") {
      responseHeaders.append(key, value);
    }
  });

  return new Response(res.body, {
    status: res.status,
    headers: responseHeaders,
  });
}

export const GET = handler;
export const POST = handler;
