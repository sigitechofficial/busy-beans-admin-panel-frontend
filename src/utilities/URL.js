import { error_toaster } from "./Toaster";

// Build-time override: NEXT_PUBLIC_APP_ENV=local|staging|aws|production (falls back to the value below).
// main (production) falls back to "production" so the live admin keeps https://backendbb.trimworldwide.com/
// without extra settings; Qurban (staging) falls back to "staging"; local dev sets NEXT_PUBLIC_APP_ENV=local.
const ENV = process.env.NEXT_PUBLIC_APP_ENV || "production"; // "local" | "staging" | "production"

const CONFIG = {
  local: {
    BASE_URL: "http://localhost:8013/",
    // BASE_URL: "http://192.168.18.143:8013/",
    // BASE_URL: "http://192.168.1.8:8013/",
    STRIPE_PUBLIC_KEY:
      "pk_test_51RPXZNCxTuXimvwHkvKO6MrVTckQ45X3JC2AkCVyV9fxLCK442YPbG8yM2NOexEqnD3wNAXdKfrOyEH2dTSzYKpt00WTyK7kzl",
    RETURN_URL: "http://localhost:3002",
    // Campaign Builder (page-builder-nextjs) origin. Empty = button hidden.
    CAMPAIGN_BUILDER_URL: "http://localhost:3000",
  },

  staging: {
    BASE_URL: "https://testingbb.trimworldwide.com/",
    STRIPE_PUBLIC_KEY:
      "pk_test_51RPXZNCxTuXimvwHkvKO6MrVTckQ45X3JC2AkCVyV9fxLCK442YPbG8yM2NOexEqnD3wNAXdKfrOyEH2dTSzYKpt00WTyK7kzl",
    RETURN_URL: "https://stageadmin.busybeancoffee.com/",
    CAMPAIGN_BUILDER_URL: "",
  },

  aws: {
    BASE_URL: "https://backend.busybeancoffee.com/",
    STRIPE_PUBLIC_KEY:
      "pk_test_51RPXZNCxTuXimvwHkvKO6MrVTckQ45X3JC2AkCVyV9fxLCK442YPbG8yM2NOexEqnD3wNAXdKfrOyEH2dTSzYKpt00WTyK7kzl",
    RETURN_URL: "https://aws-amplify.d28m7twubc7u9n.amplifyapp.com/",
    CAMPAIGN_BUILDER_URL: "",
  },

  production: {
    BASE_URL: "https://backendbb.trimworldwide.com/",
    STRIPE_PUBLIC_KEY:
      "pk_live_51HGqhQECVLSM4sc2866ixi0jd0ea0W098psMgLPNLRQZ6GpoSXQnK96aeIS9wxKVm3tF0HLQKDt7ezUjZxW65NJZ00Am8ZIdU3",
    RETURN_URL: "https://admin.busybeancoffee.com/",
    CAMPAIGN_BUILDER_URL: "",
  },
};

const CURRENT = CONFIG[ENV];

if (!CURRENT) {
  error_toaster("❌ Invalid environment:", ENV);
}

export const BASE_URL = CURRENT?.BASE_URL || "";
export const STRIPE_PUBLIC_KEY = CURRENT?.STRIPE_PUBLIC_KEY || "";
export const RETURN_URL = CURRENT?.RETURN_URL || "";
// Origin only (no path); NEXT_PUBLIC_CAMPAIGN_BUILDER_URL overrides per deployment.
export const CAMPAIGN_BUILDER_URL = (
  process.env.NEXT_PUBLIC_CAMPAIGN_BUILDER_URL ||
  CURRENT?.CAMPAIGN_BUILDER_URL ||
  ""
).replace(/\/+$/, "");
export const GOOGLE_API_KEY = "AIzaSyD68_vw1gGE7LVVjJ5ZShy7qWwm9Rq0CBQ";
export const RECAPTCHA_SITE_KEY = "6Lfy_PwrAAAAAHCJ7TQAw3g1K-LhLM5qFCtoJpbi";
// reCAPTCHA secret is server-only: read from process.env.RECAPTCHA_SECRET_KEY in src/app/api/captcha/route.js.