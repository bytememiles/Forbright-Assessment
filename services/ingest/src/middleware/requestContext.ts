import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

export const REQUEST_ID_HEADER = "x-request-id";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

export function requestContext(req: Request, res: Response, next: NextFunction) {
  const existing = req.header(REQUEST_ID_HEADER);
  const requestId = existing && existing.trim().length > 0 ? existing : randomUUID();

  req.requestId = requestId;
  res.setHeader(REQUEST_ID_HEADER, requestId);
  next();
}
