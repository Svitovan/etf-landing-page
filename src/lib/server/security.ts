import { NextRequest } from "next/server";

export function isAllowedOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");

  // If neither Origin nor Referer is present, allow (e.g. internal server requests)
  if (!origin && !referer) {
    return true;
  }

  const allowedHosts = new Set<string>();

  // 1. Explicit APP_ORIGIN from env
  const appOrigin = process.env.APP_ORIGIN;
  if (appOrigin) {
    try {
      const parsed = new URL(appOrigin).host.toLowerCase().split(":")[0];
      allowedHosts.add(parsed);
    } catch {}
  }

  // 2. Vercel deployment URLs
  const vercelUrl = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL;
  if (vercelUrl) {
    try {
      const parsed = (vercelUrl.startsWith("http") ? new URL(vercelUrl).host : vercelUrl)
        .toLowerCase()
        .split(":")[0];
      allowedHosts.add(parsed);
    } catch {}
  }

  // 3. Incoming Host / Forwarded-Host headers
  const reqHost =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    req.nextUrl?.host;
  if (reqHost) {
    allowedHosts.add(reqHost.toLowerCase().split(":")[0]);
  }

  // 4. In development, allow localhost and 127.0.0.1
  if (process.env.NODE_ENV !== "production") {
    allowedHosts.add("localhost");
    allowedHosts.add("127.0.0.1");
  }

  if (origin) {
    try {
      const originHost = new URL(origin).host.toLowerCase().split(":")[0];
      if (!allowedHosts.has(originHost)) {
        return false;
      }
    } catch {
      return false; // Malformed Origin header
    }
  }

  if (referer) {
    try {
      const refererHost = new URL(referer).host.toLowerCase().split(":")[0];
      if (!allowedHosts.has(refererHost)) {
        return false;
      }
    } catch {
      return false; // Malformed Referer header
    }
  }

  return true;
}
