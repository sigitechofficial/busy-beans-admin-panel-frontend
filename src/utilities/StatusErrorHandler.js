"use client";
import axios from "axios";
import { BASE_URL } from "./URL";
import { info_toaster, success_toaster, error_toaster } from "./Toaster";

export const handleError = (errorResponse) => {
  if (typeof errorResponse === "string") return errorResponse;
  if (errorResponse?.Message) return errorResponse.Message;
  if (errorResponse?.message) return errorResponse.message;
  if (errorResponse?.response?.data?.message) return errorResponse.response.data.message;

  if (Array.isArray(errorResponse?.errors) && errorResponse.errors.every((e) => typeof e === "string")) {
    return errorResponse.errors.join(", ");
  }
  if (Array.isArray(errorResponse?.errors) && errorResponse.errors.every((e) => typeof e?.message === "string")) {
    return errorResponse.errors.map((e) => e.message).join(", ");
  }
  return "";
};

const api = axios.create({ baseURL: BASE_URL });

const shouldLogout = (error) => {
  const r = error?.response;
  const message = r?.data?.message ?? "";
  return (
    r?.data?.status === "authentication-fail" ||
    /not logged in/i.test(message) ||
    (r?.status === 401 &&
      /session expired|token revoked|invalid or expired token|please log in again/i.test(
        message,
      ))
  );
};

let LOGOUT_IN_PROGRESS = false;
let LAST_SESSION_TOAST_AT = 0;
const SESSION_TOAST_TTL = 4000; 

api.interceptors.request.use(
  (config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    config.headers.Accept = config.headers.Accept ?? "application/json";
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => {
    try {
      const method = (res.config?.method || "").toLowerCase();
      const hasMessage = !!res?.data?.message;
      const suppressed = !!res.config?.suppressSuccessToast;
      if (hasMessage && method !== "get" && !suppressed) {
        success_toaster(res.data.message);
      }
    } catch {}
    return res;
  },
  (err) => {
    // If token invalid / session expired
    if (typeof window !== "undefined" && shouldLogout(err)) {
      const now = Date.now();
      const shouldToast = now - LAST_SESSION_TOAST_AT > SESSION_TOAST_TTL;

      if (!LOGOUT_IN_PROGRESS) {
        LOGOUT_IN_PROGRESS = true;
        if (shouldToast) {
          try {
            info_toaster("Session expired. Please log in again.");
          } catch {}
          LAST_SESSION_TOAST_AT = now;
        }
        try {
          localStorage.clear();
        } catch {}
        Promise.resolve().then(() => {
          window.location.href = "/sign-in";
        });
      }
      return Promise.reject({ ...err, normalizedMessage: "Session expired" });
    }

    if (LOGOUT_IN_PROGRESS) {
      return Promise.reject({ ...err, normalizedMessage: "Session expired" });
    }

    const msgFromPayload = handleError(err?.response?.data || err);
    const networkFallback = !err?.response ? "Network error. Please check your connection." : "";
    const message = msgFromPayload || networkFallback || "Something went wrong.";

    const isGet = (err?.config?.method || "").toLowerCase() === "get";
    const permissionDenied =
      err?.response?.status === 403 &&
      (err?.response?.data?.status === "permission-fail" ||
        /^Missing permission /i.test(message) ||
        /do not have permission/i.test(message));

    try {
      if (!(isGet && permissionDenied)) {
        error_toaster(message);
      }
    } catch {}

    return Promise.reject({ ...err, normalizedMessage: message });
  }
);

export default api;
