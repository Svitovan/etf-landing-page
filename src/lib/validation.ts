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

// A06: Strictly allowlisted properties preventing any PII (email, rawUrl, ip) from being ingested
export const AnalyticsPropertiesSchema = z
  .object({
    pageVersion: z.string().max(20).optional(),
    formVersion: z.string().max(30).optional(),
    selectedEtfs: z.string().max(50).optional(),
    ctaLocation: z.string().max(30).optional(),
    requestId: z.string().max(64).optional(),
    errorCode: z.string().max(50).optional(),
    amount: z.number().max(100_000_000).optional(),
    etfs: z.string().max(50).optional(),
  })
  .strict("Nepovolené vlastnosti analytické události (PII a neznámé klíče jsou zakázány)");

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
  properties: AnalyticsPropertiesSchema.optional(),
});

export type AnalyticsEventPayload = z.infer<typeof AnalyticsEventSchema>;

