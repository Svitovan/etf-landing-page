import { z } from "zod";

export const ALLOWED_TICKERS = ["VOO", "IVV", "SPY"] as const;

export const LeadSubmissionSchema = z.object({
  requestId: z.string().uuid("Neplatný identifikátor požadavku"),
  email: z
    .string()
    .trim()
    .min(3, "E-mail je příliš krátký")
    .max(254, "E-mail je příliš dlouhý")
    .email("Zadejte prosím platnou e-mailovou adresu (např. jmeno@domena.cz)"),
  selectedEtfs: z
    .array(z.enum(ALLOWED_TICKERS))
    .min(1, "Vyberte alespoň jeden fond")
    .default(["VOO", "IVV", "SPY"]),
  positionValueCzk: z
    .number()
    .min(1_000, "Minimální částka pro kalkulaci je 1 000 Kč")
    .max(10_000_000, "Maximální částka pro kalkulaci je 10 000 000 Kč")
    .default(100_000),
  privacyVersion: z.string().default("2026-10-11"),
  website: z.string().max(0, "Neplatný požadavek (honeypot)").optional().or(z.literal("")),
});

export type LeadSubmissionPayload = z.infer<typeof LeadSubmissionSchema>;

export const AnalyticsEventSchema = z.object({
  eventId: z.string().uuid("Neplatné eventId"),
  eventName: z.enum([
    "landing_observed",
    "comparison_viewed",
    "calculator_used",
    "lead_cta_clicked",
    "form_started",
    "form_submit_attempted",
    "form_submit_failed",
    "report_opened",
  ]),
  properties: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
});

export type AnalyticsEventPayload = z.infer<typeof AnalyticsEventSchema>;
