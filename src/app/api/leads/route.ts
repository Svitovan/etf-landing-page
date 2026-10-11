import { NextRequest, NextResponse } from "next/server";
import { LeadSubmissionSchema } from "../../../lib/validation";
import { checkRateLimit } from "../../../lib/server/rate-limit";
import { saveLeadSubmission } from "../../../lib/server/lead-service";

const MAX_PAYLOAD_BYTES = 8 * 1024; // 8 KB

export async function POST(req: NextRequest) {
  try {
    // 1. Content size check
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

    // 3. Body validation
    let bodyText: string;
    try {
      bodyText = await req.text();
    } catch {
      return NextResponse.json(
        { success: false, error: "Neplatné tělo požadavku." },
        { status: 400 }
      );
    }

    if (bodyText.length > MAX_PAYLOAD_BYTES) {
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
      const firstError = validationResult.error.errors[0]?.message || "Neplatná data formuláře.";
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 400 }
      );
    }

    const payload = validationResult.data;

    // 4. Extract analytics session cookie if user granted consent
    const sessionIdCookie = req.cookies.get("etf_session")?.value || null;

    // 5. Save lead atomically
    const result = await saveLeadSubmission(payload, sessionIdCookie);

    return NextResponse.json({
      success: true,
      reportUrl: result.reportUrl,
      isDuplicateRequest: result.isDuplicateRequest,
    });
  } catch (err: unknown) {
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
