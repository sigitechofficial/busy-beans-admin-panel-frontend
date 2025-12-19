import { error_toaster } from "./Toaster";

const environment = "production"; // "local" | "staging" | "production"



export let BASE_URL = "";
export let STRIPE_PUBLIC_KEY = "";

switch (environment) {
  case "local":
    // export const BASE_URL = "http://192.168.1.109:8013/";
    BASE_URL = "http://192.168.18.21:8013/";
    STRIPE_PUBLIC_KEY =
      "pk_test_51RPXZNCxTuXimvwHkvKO6MrVTckQ45X3JC2AkCVyV9fxLCK442YPbG8yM2NOexEqnD3wNAXdKfrOyEH2dTSzYKpt00WTyK7kzl";
    break;

  case "staging":
    BASE_URL = "https://testingbb.trimworldwide.com/";
    STRIPE_PUBLIC_KEY =
      "pk_test_51RPXZNCxTuXimvwHkvKO6MrVTckQ45X3JC2AkCVyV9fxLCK442YPbG8yM2NOexEqnD3wNAXdKfrOyEH2dTSzYKpt00WTyK7kzl";
    break;

  case "production":
    BASE_URL = "https://backendbb.trimworldwide.com/";
    STRIPE_PUBLIC_KEY =
      "pk_live_51HGqhQECVLSM4sc2wb1g4dx3lUe61VcK3BMjnUPk28Y5qaRC9sDQ6X6Ar5OZHmVoAIVe2rXncVOxHUax10qb4d8L00KCAdXpd5";
    break;

  default:
    error_toaster("❌ Invalid environment:", environment);
}

export const googleApiKey = "AIzaSyD68_vw1gGE7LVVjJ5ZShy7qWwm9Rq0CBQ";
export const RECAPTCHA_SITE_KEY = "6Lfy_PwrAAAAAHCJ7TQAw3g1K-LhLM5qFCtoJpbi";
export const RECAPTCHA_SECRET_KEY = "6Lfy_PwrAAAAAJrwzEdV9ElaUlZNOTSRBkSPa9zZ";


// export const stripePublishKey = "pk_live_51HGqhQECVLSM4sc2wb1g4dx3lUe61VcK3BMjnUPk28Y5qaRC9sDQ6X6Ar5OZHmVoAIVe2rXncVOxHUax10qb4d8L00KCAdXpd5";
// export const stripePublishKeyTest = "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";
// export const stripePublishKeyTest = "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";