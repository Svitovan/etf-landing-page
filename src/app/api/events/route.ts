import { NextRequest, NextResponse } from "next/server";
import { AnalyticsEventSchema } from "../../../lib/validation";
import { recordAnalyticsEvent } from "../../../lib/server/analytics";

export async function POST(req: NextRequest) {
  try {
    const sessionId = req.cookies.get("etf_session")?.value;
    if (!sessionId) {
      // No active consented session cookie - silently ignore without error
      return NextResponse.json(
        { success: false, reason: "No active consented analytics session" },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
    }

    // STRICT CHECK T14: Browser cannot spoof lead_saved
    if (body.eventName === "lead_saved") {
      return NextResponse.json(
        { success: false, error: "T14: lead_saved cannot be recorded via browser events endpoint." },
        { status: 400 }
      );
    }

    const parsed = AnalyticsEventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0]?.message },
        { status: 400 }
      );
    }

    const ok = await recordAnalyticsEvent(sessionId, parsed.data);
    if (!ok) {
      return NextResponse.json(
        { success: false, error: "Session expired or invalid" },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}
