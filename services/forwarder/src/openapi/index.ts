import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { z } from "./zod";
import { OnboardingPayloadSchema } from "../schemas/onboarding";

export const registry = new OpenAPIRegistry();

// Schemas
export const OnboardingPayloadOpenApi = registry.register(
  "OnboardingPayload",
  OnboardingPayloadSchema
);

// Paths
registry.registerPath({
  method: "post",
  path: "/onboarding",
  request: {
    body: {
      content: {
        "application/json": {
          schema: OnboardingPayloadOpenApi
        }
      }
    }
  },
  responses: {
    202: {
      description: "Accepted and forwarded to downstream ingestion service",
      content: {
        "application/json": {
          schema: z.object({ ok: z.boolean() })
        }
      }
    },
    400: { description: "Invalid request body" },
    502: { description: "Downstream ingest error" }
  }
});

export function generateOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: "3.0.3",
    info: {
      title: "Forbright Onboarding Forwarder",
      version: "1.0.0"
    }
  });
}
