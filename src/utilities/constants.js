import axios from "axios";
import { error_toaster } from "./Toaster";
import { BASE_URL } from "./URL";
import { hasPermission } from "./Permission";
import dayjs from "dayjs";

export const locales = ["es", "en"];

export const QuickbooksPingCheck = async () => {
  if (
    typeof window !== "undefined" &&
    !hasPermission("quickbooks_view") &&
    !hasPermission("quickbooks-invoices_view")
  ) {
    return;
  }

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

export const formatUSD = (price) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2
  }).format(price);
}


export const formatDateTime = (date, type = "datetime") => {
  switch (type) {
    case "date":
      return dayjs(date).format("MM/DD/YYYY");

    case "time":
      return dayjs(date).format("hh:mm A");

    case "datetime":
    default:
      return dayjs(date).format("MM/DD/YYYY hh:mm A");
  }
}


// "2025-12-04T09:21:01.000Z"
export const formatDateTimeISO = (dateString, type = "datetime") => {
  const d = dayjs(dateString);

  if (!d.isValid()) return "";

  switch (type) {
    case "date":
      return d.format("MM/DD/YYYY");

    case "time":
      return d.format("hh:mm A");

    case "datetime":
    default:
      return d.format("MM/DD/YYYY hh:mm A");
  }
}

