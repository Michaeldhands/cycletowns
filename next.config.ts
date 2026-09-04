import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN, // optional: only needed to upload source maps
  silent: true,                             // don't clutter the build log
  widenClientFileUpload: true,
  disableLogger: true,                      // drop Sentry's own debug logging from the bundle
  telemetry: false,
});
