import { describe, test, expect } from "bun:test";
import { app } from "../index";

describe("Health check", () => {
  test("GET /health returns 200 with expected shape", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(typeof body.timestamp).toBe("string");
    expect(typeof body.version).toBe("string");
  });

  test("GET /health timestamp is valid ISO string", async () => {
    const res = await app.request("/health");
    const body = await res.json();

    const date = new Date(body.timestamp);
    expect(date.toISOString()).toBe(body.timestamp);
  });
});
