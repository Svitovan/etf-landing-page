import crypto from "node:crypto";
import {
  getSupabaseServerClient,
  memoryStore,
  LeadRow,
  LeadSubmissionRow,
} from "./db";
import { LeadSubmissionPayload } from "../validation";

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
  const normalizedEmail = payload.email.trim().toLowerCase();
  const datasetVersion = process.env.DATASET_VERSION || "2026-10-11";
  const requestedReportUrl = `/report?amount=${payload.positionValueCzk}&etfs=${payload.selectedEtfs.join(",")}`;

  const supabase = getSupabaseServerClient();

  // A01: In production environment, permanent storage is strictly required
  if (process.env.NODE_ENV === "production" && !supabase) {
    throw new Error(
      "PRODUCTION_STORAGE_NOT_CONFIGURED: Permanent storage is required in production environment."
    );
  }

  if (supabase) {
    // A02: Attempt atomic database RPC procedure first (single Postgres transaction)
    try {
      const { data: rpcResult, error: rpcErr } = await supabase.rpc("submit_lead", {
        p_request_id: payload.requestId,
        p_email: payload.email.trim(),
        p_normalized_email: normalizedEmail,
        p_selected_etfs: payload.selectedEtfs,
        p_position_value_czk: payload.positionValueCzk,
        p_privacy_version: payload.privacyVersion,
        p_dataset_version: datasetVersion,
        p_analytics_session_id: analyticsSessionId,
      });

      if (!rpcErr && rpcResult && rpcResult.success) {
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
    } catch {
      // Fall through to sequential handling with rollback if RPC is not deployed yet
    }

    // 1. Check idempotency: Has this requestId already been processed?
    const { data: existingSub } = await supabase
      .from("lead_submissions")
      .select("id, lead_id, request_id, position_value_czk, selected_etfs")
      .eq("request_id", payload.requestId)
      .single();

    if (existingSub) {
      // A03: Return the original submission parameters, ignoring any modified retry payload
      const originalReportUrl = `/report?amount=${existingSub.position_value_czk}&etfs=${(existingSub.selected_etfs || []).join(",")}`;
      return {
        success: true,
        leadId: existingSub.lead_id,
        submissionId: existingSub.id,
        reportUrl: originalReportUrl,
        isNewLead: false,
        isDuplicateRequest: true,
      };
    }

    // 2. Check if lead already exists for normalizedEmail
    let leadId: string;
    let isNewLead = false;

    const { data: existingLead } = await supabase
      .from("leads")
      .select("id")
      .eq("normalized_email", normalizedEmail)
      .single();

    if (existingLead) {
      leadId = existingLead.id;
    } else {
      const { data: newLead, error: leadErr } = await supabase
        .from("leads")
        .insert({
          email: payload.email.trim(),
          normalized_email: normalizedEmail,
        })
        .select("id")
        .single();

      if (leadErr || !newLead) {
        throw new Error(`Failed to save lead: ${leadErr?.message || "Unknown error"}`);
      }
      leadId = newLead.id;
      isNewLead = true;
    }

    // 3. Insert submission (with rollback of orphan lead if new lead was created)
    const { data: newSub, error: subErr } = await supabase
      .from("lead_submissions")
      .insert({
        request_id: payload.requestId,
        lead_id: leadId,
        selected_etfs: payload.selectedEtfs,
        position_value_czk: payload.positionValueCzk,
        privacy_version: payload.privacyVersion,
        dataset_version: datasetVersion,
        analytics_session_id: analyticsSessionId,
      })
      .select("id")
      .single();

    if (subErr || !newSub) {
      if (isNewLead) {
        // Rollback inserted lead to avoid orphan contact records without submissions
        await supabase.from("leads").delete().eq("id", leadId);
      }
      throw new Error(`Failed to save submission: ${subErr?.message || "Unknown error"}`);
    }

    return {
      success: true,
      leadId,
      submissionId: newSub.id,
      reportUrl: requestedReportUrl,
      isNewLead,
      isDuplicateRequest: false,
    };
  }

  // Fallback to MemoryStore (strictly for local development and test environment)
  // 1. Check idempotency
  const existingSub = memoryStore.submissions.find((s) => s.request_id === payload.requestId);
  if (existingSub) {
    // A03: Return the original submission parameters, ignoring any modified retry payload
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
    id: crypto.randomUUID(),
    request_id: payload.requestId,
    lead_id: lead.id,
    selected_etfs: payload.selectedEtfs,
    position_value_czk: payload.positionValueCzk,
    privacy_version: payload.privacyVersion,
    dataset_version: datasetVersion,
    analytics_session_id: analyticsSessionId,
    created_at: new Date().toISOString(),
  };
  memoryStore.submissions.push(submission);

  return {
    success: true,
    leadId: lead.id,
    submissionId: submission.id,
    reportUrl: requestedReportUrl,
    isNewLead,
    isDuplicateRequest: false,
  };
}
