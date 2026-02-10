import { generateOpenApiDocument } from "trpc-to-openapi";
import { appRouter } from "../routers";

export function generateOpenAPISpec() {
  return generateOpenApiDocument(appRouter, {
    title: "x4 API",
    description: "x4-mono platform API — built with Hono + tRPC v11",
    version: "1.0.0",
    baseUrl: "http://localhost:3002/api",
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  });
}
