import { error_toaster } from "./Toaster";

const ENV = "staging"; // "local" | "staging" | "production"

const CONFIG = {
  local: {
    BASE_URL: "http://192.168.18.21:8013/",
    STRIPE_PUBLIC_KEY:
      "pk_test_51RPXZNCxTuXimvwHkvKO6MrVTckQ45X3JC2AkCVyV9fxLCK442YPbG8yM2NOexEqnD3wNAXdKfrOyEH2dTSzYKpt00WTyK7kzl",
  },

  staging: {
    BASE_URL: "https://testingbb.trimworldwide.com/",
    STRIPE_PUBLIC_KEY:
      "pk_test_51RPXZNCxTuXimvwHkvKO6MrVTckQ45X3JC2AkCVyV9fxLCK442YPbG8yM2NOexEqnD3wNAXdKfrOyEH2dTSzYKpt00WTyK7kzl",
  },

  production: {
    BASE_URL: "https://backendbb.trimworldwide.com/",
    STRIPE_PUBLIC_KEY:
      "pk_live_51HGqhQECVLSM4sc2wb1g4dx3lUe61VcK3BMjnUPk28Y5qaRC9sDQ6X6Ar5OZHmVoAIVe2rXncVOxHUax10qb4d8L00KCAdXpd5",
  },
};

const CURRENT = CONFIG[ENV];

if (!CURRENT) {
  error_toaster("❌ Invalid environment:", ENV);
}

export const BASE_URL = CURRENT?.BASE_URL || "";

export const STRIPE_PUBLIC_KEY = CURRENT?.STRIPE_PUBLIC_KEY || "";

export const GOOGLE_API_KEY = "AIzaSyD68_vw1gGE7LVVjJ5ZShy7qWwm9Rq0CBQ";

export const RECAPTCHA_SITE_KEY = "6Lfy_PwrAAAAAHCJ7TQAw3g1K-LhLM5qFCtoJpbi";

export const RECAPTCHA_SECRET_KEY = "6Lfy_PwrAAAAAJrwzEdV9ElaUlZNOTSRBkSPa9zZ";
