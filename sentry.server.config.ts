// Server-side error tracking. Loaded by instrumentation.ts.
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: process.env.NODE_ENV === "production",
  tracesSampleRate: 0.1,          // enough to spot a slow route, not enough to cost money
  sendDefaultPii: false,          // never ship rider emails or IPs to a third party
  ignoreErrors: ["NEXT_NOT_FOUND", "NEXT_REDIRECT"],
});
