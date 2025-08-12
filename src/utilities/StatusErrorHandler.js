"use client";
import axios from "axios";
import { BASE_URL } from "./URL";
import { info_toaster } from "./Toaster";

const api = axios.create({ baseURL: BASE_URL });

const shouldLogout = (error) => {
  const r = error?.response;
  return (
    r?.status === 401 ||
    r?.data?.error?.statusCode === 401 ||
    r?.data?.status === "authentication-fail" ||
    /not logged in/i.test(r?.data?.message ?? "")
  );
};

api.interceptors.request.use(
  (config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (typeof window !== "undefined" && shouldLogout(err)) {
      try { info_toaster("Session expired. Please log in again."); } catch {}
      localStorage.clear()
      window.location.href = "/sign-in";
    }
    return Promise.reject(err);
  }
);

export default api;
