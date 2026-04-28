import { Router } from "express";
import { OnboardingPayloadSchema } from "../schemas/onboarding";
import { forwardToIngest } from "../clients/ingestClient";

export const onboardingRouter = Router();

onboardingRouter.post("/onboarding", async (req, res) => {
  const log = req.log.child({ requestId: req.requestId });

  log.info({ event: "request_received" }, "onboarding_request_received");

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
      "onboarding_validation_failed"
    );
    return res.status(400).json({
      error: "Invalid request body",
      details: parsed.error.issues.map((i) => ({
        path: i.path,
        message: i.message
      }))
    });
  }

  log.info({ event: "validation_ok" }, "onboarding_validation_ok");

  try {
    log.info({ event: "forwarding_start" }, "forwarding_to_ingest_start");
    const result = await forwardToIngest(parsed.data, req.requestId);

    if (result.status < 200 || result.status >= 300) {
      log.error(
        {
          event: "forwarding_result",
          downstreamStatus: result.status
        },
        "forwarding_to_ingest_non_2xx"
      );
      return res.status(502).json({
        error: "Downstream ingest service returned non-success status",
        downstreamStatus: result.status
      });
    }

    log.info(
      {
        event: "forwarding_result",
        downstreamStatus: result.status
      },
      "forwarding_to_ingest_success"
    );

    return res.status(202).json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    log.error({ event: "forwarding_result", err: { message } }, "forwarding_to_ingest_error");
    return res.status(502).json({ error: "Failed to forward to downstream ingest service" });
  }
});
