import { Router } from "express";
import { prisma } from "../db/prisma";
import { OnboardingPayloadSchema } from "../schemas/onboarding";

export const ingestRouter = Router();

ingestRouter.post("/ingest", async (req, res) => {
  const log = req.log.child({ requestId: req.requestId });

  log.info({ event: "request_received" }, "ingest_request_received");

  const parsed = OnboardingPayloadSchema.safeParse(req.body);
  if (!parsed.success) {
    log.warn(
      {
        event: "validation_failed",
        issues: parsed.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message
        }))
      },
      "ingest_validation_failed"
    );
    return res.status(400).json({
      error: "Invalid request body",
      details: parsed.error.issues.map((i) => ({
        path: i.path,
        message: i.message
      }))
    });
  }

  try {
    log.info({ event: "db_insert_start" }, "ingest_db_insert_start");
    await prisma.$transaction([
      prisma.onboardingEvent.create({
        data: {
          requestId: req.requestId,
          payload: req.body
        }
      }),
      prisma.customer.upsert({
        where: { email: parsed.data.email },
        create: {
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          email: parsed.data.email
        },
        update: {
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName
        }
      })
    ]);

    log.info({ event: "db_insert_ok" }, "ingest_db_insert_ok");
    return res.status(201).json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    log.error({ event: "db_insert_error", err: { message } }, "ingest_db_insert_error");
    return res.status(500).json({ error: "Failed to persist ingested payload" });
  }
});
