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
  const reportUrl = `/report?amount=${payload.positionValueCzk}&etfs=${payload.selectedEtfs.join(",")}`;

  const supabase = getSupabaseServerClient();

  if (supabase) {
    // 1. Check idempotency: Has this requestId already been processed?
    const { data: existingSub } = await supabase
      .from("lead_submissions")
      .select("id, lead_id, request_id")
      .eq("request_id", payload.requestId)
      .single();

    if (existingSub) {
      return {
        success: true,
        leadId: existingSub.lead_id,
        submissionId: existingSub.id,
        reportUrl,
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

    // 3. Insert submission
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
      throw new Error(`Failed to save submission: ${subErr?.message || "Unknown error"}`);
    }

    return {
      success: true,
      leadId,
      submissionId: newSub.id,
      reportUrl,
      isNewLead,
      isDuplicateRequest: false,
    };
  }

  // Fallback to MemoryStore (local / test environment)
  // 1. Check idempotency
  const existingSub = memoryStore.submissions.find((s) => s.request_id === payload.requestId);
  if (existingSub) {
    return {
      success: true,
      leadId: existingSub.lead_id,
      submissionId: existingSub.id,
      reportUrl,
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
    reportUrl,
    isNewLead,
    isDuplicateRequest: false,
  };
}
