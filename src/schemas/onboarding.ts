import { z } from "../openapi/zod";

export const OnboardingPayloadSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: z.string().trim().email()
});

export type OnboardingPayload = z.infer<typeof OnboardingPayloadSchema>;
