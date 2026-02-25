import { error_toaster } from "./Toaster";

const ENV = "staging"; // "local" | "staging" | "production" | "aws"

const CONFIG = {
  local: {
    BASE_URL: "http://192.168.18.143:8013/",
    STRIPE_PUBLIC_KEY:
      "pk_test_51RPXZNCxTuXimvwHkvKO6MrVTckQ45X3JC2AkCVyV9fxLCK442YPbG8yM2NOexEqnD3wNAXdKfrOyEH2dTSzYKpt00WTyK7kzl",
    RETURN_URL: "http://192.168.18.36:3000",
  },

  staging: {
    BASE_URL: "https://testingbb.trimworldwide.com/",
    STRIPE_PUBLIC_KEY:
      "pk_test_51RPXZNCxTuXimvwHkvKO6MrVTckQ45X3JC2AkCVyV9fxLCK442YPbG8yM2NOexEqnD3wNAXdKfrOyEH2dTSzYKpt00WTyK7kzl",
    RETURN_URL: "https://stageadmin.busybeancoffee.com/",
  },

  aws: {
    BASE_URL: "https://backend.busybeancoffee.com/",
    STRIPE_PUBLIC_KEY:
      "pk_test_51RPXZNCxTuXimvwHkvKO6MrVTckQ45X3JC2AkCVyV9fxLCK442YPbG8yM2NOexEqnD3wNAXdKfrOyEH2dTSzYKpt00WTyK7kzl",
    RETURN_URL: "https://aws-amplify.d28m7twubc7u9n.amplifyapp.com/",
  },

  production: {
    BASE_URL: "https://backendbb.trimworldwide.com/",
    STRIPE_PUBLIC_KEY:
      "pk_live_51HGqhQECVLSM4sc2866ixi0jd0ea0W098psMgLPNLRQZ6GpoSXQnK96aeIS9wxKVm3tF0HLQKDt7ezUjZxW65NJZ00Am8ZIdU3",
    RETURN_URL: "https://admin.busybeancoffee.com/",
  },
};

const CURRENT = CONFIG[ENV];

if (!CURRENT) {
  error_toaster("❌ Invalid environment:", ENV);
}

export const BASE_URL = CURRENT?.BASE_URL || "";

export const STRIPE_PUBLIC_KEY = CURRENT?.STRIPE_PUBLIC_KEY || "";

export const RETURN_URL = CURRENT?.RETURN_URL || "";

export const GOOGLE_API_KEY = "AIzaSyD68_vw1gGE7LVVjJ5ZShy7qWwm9Rq0CBQ";
export const RECAPTCHA_SITE_KEY = "6Lfy_PwrAAAAAHCJ7TQAw3g1K-LhLM5qFCtoJpbi";
export const RECAPTCHA_SECRET_KEY = "6Lfy_PwrAAAAAJrwzEdV9ElaUlZNOTSRBkSPa9zZ";
