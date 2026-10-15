import { LEAD_REQUEST_CONFLICT_CODE } from "../lead-request";

export class LeadRequestConflictError extends Error {
  readonly code = LEAD_REQUEST_CONFLICT_CODE;

  constructor() {
    super(LEAD_REQUEST_CONFLICT_CODE);
    this.name = "LeadRequestConflictError";
  }
}
