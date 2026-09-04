// Browser-side error tracking.
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: process.env.NODE_ENV === "production",
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,    // no session recording — riders aren't test subjects
  replaysOnErrorSampleRate: 0,
  sendDefaultPii: false,
  ignoreErrors: [
    "ResizeObserver loop limit exceeded",  // browser noise, not a bug
    "Failed to fetch",                     // someone rode out of signal
    "NetworkError when attempting to fetch resource.",
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
