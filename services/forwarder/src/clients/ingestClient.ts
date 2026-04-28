import axios from "axios";
import type { OnboardingPayload } from "../schemas/onboarding";

export type IngestResult = {
  status: number;
  data: unknown;
};

function getRequiredEnv(name: string): string {
  const v = process.env[name];
  if (!v || v.trim().length === 0) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v;
}

function getTimeoutMs(): number {
  const raw = process.env.REQUEST_TIMEOUT_MS ?? "3000";
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return 3000;
  return n;
}

export async function forwardToIngest(
  payload: OnboardingPayload,
  requestId: string
): Promise<IngestResult> {
  const url = getRequiredEnv("INGEST_URL");

  const resp = await axios.post(url, payload, {
    timeout: getTimeoutMs(),
    headers: {
      "content-type": "application/json",
      "x-request-id": requestId
    },
    validateStatus: () => true
  });

  return { status: resp.status, data: resp.data };
}
