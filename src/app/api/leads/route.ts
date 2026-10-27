import { NextRequest, NextResponse } from "next/server";
import { LeadSubmissionSchema } from "../../../lib/validation";
import { checkRateLimit } from "../../../lib/server/rate-limit";
import { saveLeadSubmission } from "../../../lib/server/lead-service";
import { isSessionValid } from "../../../lib/server/analytics";
import { LeadRequestConflictError } from "../../../lib/server/lead-errors";

import { isAllowedOrigin } from "../../../lib/server/security";

const MAX_PAYLOAD_BYTES = 8 * 1024; // 8 KB

export async function POST(req: NextRequest) {
  try {
    // A07 / B03: Origin / Referer check
    if (!isAllowedOrigin(req)) {
      return NextResponse.json(
        { success: false, error: "Neplatný původ požadavku." },
        { status: 403 }
      );
    }

    // A07: Content-Type verification
    const contentType = req.headers.get("content-type");
    if (!contentType || !contentType.toLowerCase().includes("application/json")) {
      return NextResponse.json(
        { success: false, error: "Neplatný formát požadavku (očekáván application/json)." },
        { status: 415 }
      );
    }

    // 1. Content size check (header)
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_BYTES) {
      return NextResponse.json(
        { success: false, error: "Požadavek překračuje povolenou velikost." },
        { status: 413 }
      );
    }

    // 2. Rate limit check
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rateResult = await checkRateLimit(clientIp);
    if (!rateResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Příliš mnoho pokusů. Zkuste to prosím znovu za ${rateResult.retryAfterSeconds} sekund.`,
          retryAfterSeconds: rateResult.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    // 3. Body validation & exact UTF-8 byte size limit
    let bodyText: string;
    try {
      bodyText = await req.text();
    } catch {
      return NextResponse.json(
        { success: false, error: "Neplatné tělo požadavku." },
        { status: 400 }
      );
    }

    if (Buffer.byteLength(bodyText, "utf8") > MAX_PAYLOAD_BYTES) {
      return NextResponse.json(
        { success: false, error: "Požadavek překračuje povolenou velikost." },
        { status: 413 }
      );
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(bodyText);
    } catch {
      return NextResponse.json(
        { success: false, error: "Neplatný formát JSON." },
        { status: 400 }
      );
    }

    const validationResult = LeadSubmissionSchema.safeParse(parsedJson);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]?.message || "Neplatná data formuláře.";
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 400 }
      );
    }

    const payload = validationResult.data;

    // A06: Extract and strictly validate analytics session cookie before linking
    let validatedSessionId: string | null = null;
    const sessionIdCookie = req.cookies.get("etf_session")?.value || null;
    if (sessionIdCookie) {
      const valid = await isSessionValid(sessionIdCookie);
      if (valid) {
        validatedSessionId = sessionIdCookie;
      }
    }

    // 5. Save lead atomically
    const result = await saveLeadSubmission(payload, validatedSessionId);

    return NextResponse.json({
      success: true,
      reportUrl: result.reportUrl,
      isDuplicateRequest: result.isDuplicateRequest,
    });
  } catch (err: unknown) {
    if (err instanceof LeadRequestConflictError) {
      return NextResponse.json(
        {
          success: false,
          errorCode: err.code,
          error: "Údaje tohoto požadavku se změnily. Zkontrolujte formulář a odešlete jej znovu jako nový požadavek.",
        },
        { status: 409 }
      );
    }
    console.error("Error processing lead submission:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      {
        success: false,
        error: "Dočasná chyba serveru při ukládání kontaktu. Zkuste to prosím znovu.",
      },
      { status: 503 }
    );
  }
}

