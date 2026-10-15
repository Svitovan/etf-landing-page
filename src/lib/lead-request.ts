export const LEAD_REQUEST_CONFLICT_CODE = "IDEMPOTENCY_CONFLICT";

export interface LeadRequestFields {
  email: string;
  selectedEtfs: readonly string[];
  positionValueCzk: number;
  privacyVersion: string;
}

export function canonicalizeLeadRequest(payload: LeadRequestFields) {
  return {
    email: payload.email.trim().toLowerCase(),
    selectedEtfs: [...new Set(payload.selectedEtfs)].sort(),
    positionValueCzk: payload.positionValueCzk,
    privacyVersion: payload.privacyVersion,
  };
}

export function leadRequestFingerprint(payload: LeadRequestFields): string {
  // Kept only in memory to distinguish attempts; never send this string to analytics.
  return JSON.stringify(canonicalizeLeadRequest(payload));
}

export interface LeadRequestAttempt {
  requestId: string;
  fingerprint: string;
}

export function getLeadRequestAttempt(
  previous: LeadRequestAttempt | null,
  payload: LeadRequestFields,
  createId: () => string = () => crypto.randomUUID()
): LeadRequestAttempt {
  const fingerprint = leadRequestFingerprint(payload);
  return previous?.fingerprint === fingerprint
    ? previous
    : { requestId: createId(), fingerprint };
}
