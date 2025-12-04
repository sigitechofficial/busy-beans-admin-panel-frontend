import axios from "axios";
import { error_toaster } from "./Toaster";
import { BASE_URL } from "./URL";

export const locales = ["es", "en"];

export const QuickbooksPingCheck = async () => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    };

    const res = await axios.get(BASE_URL + "qbo/ping", config);

    if (res?.data?.status === "error") {
      error_toaster("Quickbook login required to sync orders");
    }
  } catch (err) {
    console.error("❌ QuickbooksPingCheck error:", err);

    // Backend returned 500
    error_toaster(
      err?.response?.data?.message ||
        "Quickbooks Server Error. Please check backend logs."
    );
  }
};
