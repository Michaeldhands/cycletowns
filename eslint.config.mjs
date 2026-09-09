import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Behind Netlify the request's own origin is the deploy-specific host, which changes
    // every deploy. Building an outbound URL from it either gets rejected by a third party
    // or silently redirects a rider off cycletowns.com, where their session doesn't exist.
    // Both have happened. Use siteUrl() from @/lib/site instead.
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/lib/site.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "MemberExpression[property.name='origin'][object.property.name='nextUrl']",
          message: "Don't use req.nextUrl.origin for outbound URLs — it's the Netlify deploy host. Use siteUrl() from @/lib/site.",
        },
        {
          selector: "MemberExpression[property.name='origin'][object.callee.name='URL']",
          message: "Don't take .origin from the incoming request URL — it's the Netlify deploy host. Use siteUrl() from @/lib/site.",
        },
        {
          selector: "MemberExpression[property.name='origin'][object.object.name='location'][object.property.name='location']",
          message: "Use siteUrl() from @/lib/site rather than window.location.origin for anything handed to a third party.",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
