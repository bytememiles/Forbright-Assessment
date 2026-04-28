import dotenv from "dotenv";
dotenv.config();

import express from "express";
import pinoHttp from "pino-http";

import { logger } from "./logging/logger";
import { requestContext, REQUEST_ID_HEADER } from "./middleware/requestContext";
import { ingestRouter } from "./routes/ingest";

export function createApp() {
  const app = express();
  app.use(express.json({ limit: "64kb" }));
  app.use(requestContext);

  app.use(
    pinoHttp({
      logger,
      customProps: (req) => ({
        requestId: (req as unknown as { requestId?: string }).requestId
      }),
      customLogLevel: (_req, res, err) => {
        if (err || res.statusCode >= 500) return "error";
        if (res.statusCode >= 400) return "warn";
        return "info";
      }
    })
  );

  app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true });
  });

  app.use(ingestRouter);
  return app;
}

async function main() {
  const app = createApp();
  const port = Number(process.env.PORT ?? 8080);

  app.listen(port, () => {
    logger.info(
      {
        port,
        healthUrl: `http://localhost:${port}/health`,
        requestIdHeader: REQUEST_ID_HEADER
      },
      "server_listening"
    );
  });
}

void main();
