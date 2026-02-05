"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import MyDataTable from "@/components/ui/MyDataTable";
import GetAPI from "@/utilities/GetAPI";
import { PostAPI } from "@/utilities/PostAPI";
import Loader from "@/components/ui/Loader";
import ErrorHandler from "@/utilities/ErrorHandler";
import { success_toaster } from "@/utilities/Toaster";
import { useDataContext } from "@/utilities/DataContext";
import { CiMenuBurger } from "react-icons/ci";
import { useUserType } from "@/utilities/useUserType";
import { Calendar } from "primereact/calendar";
import Select from "react-select";
import selectStyles from "@/utilities/SelectStyle";
import dayjs from "dayjs";
import { formatDateTimeISO } from "@/utilities/constants";

const EMAIL_TYPE_OPTIONS = [
  { value: "", label: "All types" },
  { value: "Success", label: "Success" },
  { value: "Failed", label: "Failed" },
  { value: "invoice_sent", label: "Invoice sent" },
  { value: "invoice_reminder", label: "Payment reminder" },
  { value: "paid_receipt", label: "Paid receipt (customer)" },
  { value: "paid_receipt_admin", label: "Paid receipt (admin/partner)" },
  { value: "supplier_new_order", label: "Supplier new order" },
];

function getEmailTypeLabel(emailType) {
  const opt = EMAIL_TYPE_OPTIONS.find((o) => o.value === emailType);
  return opt ? opt.label : emailType || "—";
}

function parseMetadata(metadata) {
  if (!metadata || typeof metadata !== "string") return {};
  try {
    return JSON.parse(metadata);
  } catch {
    return {};
  }
}

export default function EmailLogsPage() {
  const { isAllowed } = useUserType("admin");
  const { setToggle, toggle } = useDataContext();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [emailType, setEmailType] = useState("");
  const [orderId, setOrderId] = useState("");
  const [orderIdDebounced, setOrderIdDebounced] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [retryEmailLogId, setRetryEmailLogId] = useState(null);
  const [retryCooldownEndsAt, setRetryCooldownEndsAt] = useState({});
  const [, setCooldownTick] = useState(0);

  // Debounce Order ID 500ms before updating API params
  useEffect(() => {
    const timer = setTimeout(() => {
      setOrderIdDebounced(orderId);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [orderId]);

  // Date range validation: from must be <= to when both set
  const isDateRangeValid = useMemo(() => {
    if (!fromDate || !toDate) return true;
    const from = dayjs(fromDate).startOf("day");
    const to = dayjs(toDate).startOf("day");
    return from.isSame(to) || from.isBefore(to);
  }, [fromDate, toDate]);

  const dateRangeError =
    fromDate && toDate && !isDateRangeValid
      ? "From date must be before or equal to To date."
      : null;

  // When date range is invalid, do not hit the API at all
  const apiUrl = useMemo(() => {
    if (dateRangeError) return "";
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (emailType === "Success" || emailType === "Failed") {
      params.set("emailSent", emailType);
    } else if (emailType) {
      params.set("emailType", emailType);
    }
    if (orderIdDebounced?.trim())
      params.set("orderId", orderIdDebounced.trim());
    if (isDateRangeValid && fromDate && toDate) {
      params.set("from", dayjs(fromDate).format("YYYY-MM-DD"));
      params.set("to", dayjs(toDate).format("YYYY-MM-DD"));
    }
    return `api/v1/admin/order-management/email-log?${params.toString()}`;
  }, [page, limit, emailType, orderIdDebounced, fromDate, toDate, isDateRangeValid, dateRangeError]);

  const { data, isLoading, reFetch: reFetchEmailLogs } = GetAPI(apiUrl);

  // When date error: show empty (no API hit). Otherwise use current response.
  const rawLogs =
    dateRangeError
      ? []
      : Array.isArray(data?.data?.emailLogs)
        ? data.data.emailLogs
        : [];
  const pagination = dateRangeError ? {} : (data?.data?.pagination ?? {});

  const logEmailTypeToApi = {
    invoice_sent: "invoice-sent",
    invoice_reminder: "invoice-reminder",
    paid_receipt: "paid-invoice",
    paid_receipt_admin: "paid-invoice",
    supplier_new_order: "order-ship-supplier",
  };

  const handleRetryEmail = async (entry) => {
    const apiEmailType = logEmailTypeToApi[entry.emailType] || entry.emailType;
    const orderTypeApi =
      entry.orderType === "local-partner" ? "local-partner" : "customer";
    setRetryEmailLogId(entry.id);
    try {
      const res = await PostAPI(
        "api/v1/admin/order-management/email-helper",
        {
          orderId: String(entry.orderId),
          orderType: orderTypeApi,
          emailType: apiEmailType,
        }
      );
      if (res?.data?.status === "success" || res?.data?.status === true) {
        success_toaster("Email sent successfully");
      } else {
        throw new Error(res?.data?.message || "Failed to send email.");
      }
    } catch (error) {
      ErrorHandler(error);
    } finally {
      setRetryEmailLogId(null);
      setRetryCooldownEndsAt((prev) => ({
        ...prev,
        [entry.id]: Date.now() + 30000,
      }));
    }
  };

  const cooldownEndsAtRef = useRef(retryCooldownEndsAt);
  useEffect(() => {
    cooldownEndsAtRef.current = retryCooldownEndsAt;
  }, [retryCooldownEndsAt]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const prev = cooldownEndsAtRef.current;
      const next = {};
      Object.entries(prev).forEach(([id, end]) => {
        if (end > now) next[id] = end;
      });
      const hadActive = Object.keys(prev).length > 0;
      const lastTimerEnded = hadActive && Object.keys(next).length === 0;
      setRetryCooldownEndsAt(Object.keys(next).length ? next : {});
      if (lastTimerEnded) {
        reFetchEmailLogs();
      }
      setCooldownTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [reFetchEmailLogs]);

  const tableData = useMemo(() => {
    return rawLogs.map((entry) => {
      const meta = parseMetadata(entry.metadata);
      const isFailed = entry.emailSent === "Failed";
      const cooldownEnd = retryCooldownEndsAt[entry.id];
      const remainingSeconds = cooldownEnd
        ? Math.max(0, Math.ceil((cooldownEnd - Date.now()) / 1000))
        : 0;
      const isRetrying = retryEmailLogId === entry.id;
      const retryDisabled = isRetrying || remainingSeconds > 0;

      return {
        id: entry.id,
        sentAt: entry.sentAt
          ? formatDateTimeISO(entry.sentAt, "datetime")
          : "—",
        emailType: getEmailTypeLabel(entry.emailType),
        orderId: entry.orderId ?? "—",
        orderType: entry.orderType ?? "—",
        recipients: entry.recipients ?? "—",
        subject: meta.subject ?? "—",
        status:
          entry.emailSent === "Failed" ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wide border bg-red-50 text-red-700 border-red-200">
              Failed
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wide border bg-green-50 text-green-700 border-green-200">
              {entry.emailSent || "Sent"}
            </span>
          ),
        errorMessage: entry.errorMessage ?? "—",
        action: isFailed ? (
          <button
            type="button"
            onClick={() => handleRetryEmail(entry)}
            disabled={retryDisabled}
            className="px-4 py-2 rounded-lg border-2 border-theme text-theme text-sm font-semibold hover:bg-theme hover:text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isRetrying
              ? "Sending…"
              : remainingSeconds > 0
              ? `Retry (${remainingSeconds}s)`
              : "Retry"}
          </button>
        ) : (
          "—"
        ),
      };
    });
  }, [rawLogs, retryEmailLogId, retryCooldownEndsAt]);

  const columns = [
    { field: "sentAt", header: "Sent at", sort: false },
    { field: "emailType", header: "Type", sort: false },
    { field: "orderId", header: "Order ID", sort: false },
    { field: "orderType", header: "Order type", sort: false },
    { field: "recipients", header: "Recipients", sort: false },
    { field: "subject", header: "Subject", sort: false },
    { field: "status", header: "Status", sort: false },
    { field: "errorMessage", header: "Error", sort: false },
    { field: "action", header: "Action", sort: false },
  ];

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleEmailTypeChange = (option) => {
    setEmailType(option?.value ?? "");
    setPage(1);
  };

  const handleOrderIdChange = (e) => {
    setOrderId(e.target?.value ?? "");
  };

  const handleFromChange = (e) => {
    setFromDate(e.value ?? null);
    setPage(1);
  };

  const handleToChange = (e) => {
    setToDate(e.value ?? null);
    setPage(1);
  };

  if (!isAllowed) return <Loader />;

  return (
    <div className="w-full">
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed">
        <div className="flex items-center gap-2">
          <p
            onClick={() => setToggle(!toggle)}
            className="cursor-pointer md:hidden"
          >
            <CiMenuBurger size={20} />
          </p>
          <h2 className="text-xl font-inter font-semibold">Email Logs</h2>
        </div>
      </div>

      <div className="space-y-6 pb-6 pt-28 2xl:pt-32 px-6 2xl:px-12">
        {/* Filters */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-borderColor shadow-tableShadow flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5 min-w-[180px]">
            <label className="text-sm font-medium text-gray-700">Email type</label>
            <Select
              options={EMAIL_TYPE_OPTIONS}
              value={EMAIL_TYPE_OPTIONS.find((o) => o.value === emailType)}
              onChange={handleEmailTypeChange}
              styles={selectStyles}
              placeholder="All types"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Order ID</label>
            <input
              type="number"
              value={orderId}
              onChange={handleOrderIdChange}
              placeholder="Filter by order ID"
              className="h-10 rounded-lg border border-gray-300 px-3 w-[160px] sm:w-[180px] outline-none focus:border-theme"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">From date</label>
            <Calendar
              value={fromDate}
              onChange={handleFromChange}
              dateFormat="mm/dd/yy"
              placeholder="MM/DD/YYYY"
              showIcon
              className="w-[160px] sm:w-[180px]"
              inputClassName="h-10 rounded-lg border border-gray-300 px-2"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">To date</label>
            <Calendar
              value={toDate}
              onChange={handleToChange}
              dateFormat="mm/dd/yy"
              placeholder="MM/DD/YYYY"
              showIcon
              className="w-[160px] sm:w-[180px]"
              inputClassName="h-10 rounded-lg border border-gray-300 px-2"
            />
          </div>
          {dateRangeError && (
            <p className="text-red-600 text-sm font-medium w-full flex items-center gap-1">
              {dateRangeError}
            </p>
          )}
        </div>

        <MyDataTable
          columns={columns}
          data={tableData}
          pagination
          serverPagination={{
            page: pagination.page ?? page,
            limit: pagination.limit ?? limit,
            totalRecords: pagination.total ?? 0,
            totalPages: pagination.totalPages ?? 0,
            onPageChange: handlePageChange,
            onLimitChange: handleLimitChange,
          }}
          dataKey="id"
          hide
        />
      </div>
    </div>
  );
}
