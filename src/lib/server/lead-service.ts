import crypto from "node:crypto";
import {
  getSupabaseServerClient,
  memoryStore,
  LeadSubmissionRow,
} from "./db";
import { LeadSubmissionPayload } from "../validation";
import { canonicalizeLeadRequest, leadRequestFingerprint } from "../lead-request";
import { LeadRequestConflictError } from "./lead-errors";
import { isDemoEmail, markMemoryTestSessions } from "./test-traffic";

export interface LeadSaveResult {
  success: boolean;
  leadId: string;
  submissionId: string;
  reportUrl: string;
  isNewLead: boolean;
  isDuplicateRequest: boolean;
}

export async function saveLeadSubmission(
  payload: LeadSubmissionPayload,
  analyticsSessionId: string | null
): Promise<LeadSaveResult> {
  if (!payload || !payload.email || !payload.email.trim() || !payload.requestId) {
    throw new Error("INVALID_PAYLOAD: email and requestId are required to save lead submission");
  }

  const canonical = canonicalizeLeadRequest(payload);
  const normalizedEmail = canonical.email;
  const datasetVersion = process.env.DATASET_VERSION || "2026-10-11";
  const requestedReportUrl = `/report?amount=${canonical.positionValueCzk}&etfs=${canonical.selectedEtfs.join(",")}`;

  const supabase = getSupabaseServerClient();

  // A01: In production environment, permanent storage is strictly required
  if (process.env.NODE_ENV === "production" && !supabase) {
    throw new Error(
      "PRODUCTION_STORAGE_NOT_CONFIGURED: Permanent storage is required in production environment."
    );
  }

  if (supabase) {
    // B01: Strictly require atomic database RPC procedure (single Postgres transaction)
    const { data: rpcResult, error: rpcErr } = await supabase.rpc("submit_lead", {
      p_request_id: payload.requestId,
      p_email: payload.email.trim(),
      p_normalized_email: normalizedEmail,
      p_selected_etfs: canonical.selectedEtfs,
      p_position_value_czk: payload.positionValueCzk,
      p_privacy_version: payload.privacyVersion,
      p_dataset_version: datasetVersion,
      p_analytics_session_id: analyticsSessionId,
    });

    if (rpcErr?.code === "PT409") {
      throw new LeadRequestConflictError();
    }
    if (rpcErr || !rpcResult || !rpcResult.success) {
      // Provider details can contain row values. Log the category only.
      console.error("Database submit_lead RPC failed:", rpcErr?.code || "INVALID_RESPONSE");
      throw new Error("DATABASE_SAVE_FAILED");
    }

    const reportUrl = `/report?amount=${rpcResult.position_value_czk}&etfs=${(rpcResult.selected_etfs || []).join(",")}`;
    return {
      success: true,
      leadId: rpcResult.lead_id,
      submissionId: rpcResult.submission_id,
      reportUrl,
      isNewLead: rpcResult.is_new_lead,
      isDuplicateRequest: rpcResult.is_duplicate_request,
    };
  }

  // Fallback to MemoryStore (strictly for local development and test environment)
  // 1. Check idempotency
  const existingSub = memoryStore.submissions.find((s) => s.request_id === payload.requestId);
  if (existingSub) {
    const existingLead = memoryStore.leads.find((lead) => lead.id === existingSub.lead_id);
    if (
      !existingLead ||
      existingSub.dataset_version !== datasetVersion ||
      leadRequestFingerprint({
        email: existingLead.normalized_email,
        selectedEtfs: existingSub.selected_etfs,
        positionValueCzk: existingSub.position_value_czk,
        privacyVersion: existingSub.privacy_version,
      }) !== leadRequestFingerprint(canonical)
    ) {
      throw new LeadRequestConflictError();
    }
    // A matching retry returns the original result without creating a submission.
    const originalReportUrl = `/report?amount=${existingSub.position_value_czk}&etfs=${existingSub.selected_etfs.join(",")}`;
    return {
      success: true,
      leadId: existingSub.lead_id,
      submissionId: existingSub.id,
      reportUrl: originalReportUrl,
      isNewLead: false,
      isDuplicateRequest: true,
    };
  }

  // 2. Find or create lead
  let lead = memoryStore.leads.find((l) => l.normalized_email === normalizedEmail);
  let isNewLead = false;

  if (!lead) {
    lead = {
      id: crypto.randomUUID(),
      email: payload.email.trim(),
      normalized_email: normalizedEmail,
      created_at: new Date().toISOString(),
    };
    memoryStore.leads.push(lead);
    isNewLead = true;
  }

  // 3. Create submission
  const submission: LeadSubmissionRow = {
    is_test: isDemoEmail(normalizedEmail) || memoryStore.sessions.some(s => s.id === analyticsSessionId && s.is_test),
    id: crypto.randomUUID(),
    request_id: payload.requestId,
    lead_id: lead.id,
    selected_etfs: canonical.selectedEtfs,
    position_value_czk: payload.positionValueCzk,
    privacy_version: payload.privacyVersion,
    dataset_version: datasetVersion,
    analytics_session_id: analyticsSessionId,
    created_at: new Date().toISOString(),
  };
  memoryStore.submissions.push(submission);
  if (submission.is_test) markMemoryTestSessions(payload.requestId, analyticsSessionId);

  return {
    success: true,
    leadId: lead.id,
    submissionId: submission.id,
    reportUrl: requestedReportUrl,
    isNewLead,
    isDuplicateRequest: false,
  };
}
