"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import MyDataTable from "@/components/ui/MyDataTable";
import GetAPI from "@/utilities/GetAPI";
import { PostAPI } from "@/utilities/PostAPI";
import Loader from "@/components/ui/Loader";
import ErrorHandler from "@/utilities/ErrorHandler";
import { success_toaster, info_toaster } from "@/utilities/Toaster";
import { useDataContext } from "@/utilities/DataContext";
import { CiMenuBurger } from "react-icons/ci";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import InfoTooltip from "@/components/ui/InfoTooltip";
import { useUserType } from "@/utilities/useUserType";
import { Calendar } from "primereact/calendar";
import Select from "react-select";
import selectStyles from "@/utilities/SelectStyle";
import dayjs from "dayjs";
import { formatDateTimeISO } from "@/utilities/constants";
import {
  getEmailLogTypeLabel,
  getDisplayOrderId,
  entryToBulkEmailItem,
  dedupeOrdersToSentEmail,
} from "@/utilities/emailLogTypes";

const EMAIL_TYPE_OPTIONS = [
  { value: "", label: "All types" },
  { value: "Success", label: "Success" },
  { value: "Failed", label: "Failed" },
  { value: "invoice_sent", label: "Invoice sent" },
  { value: "invoice_reminder", label: "Payment reminder" },
  { value: "paid_receipt", label: "Paid receipt (customer)" },
  { value: "paid_receipt_admin", label: "Paid receipt (admin/partner)" },
  { value: "supplier_new_order", label: "Supplier new order" },
  { value: "order_confirmation", label: "Order confirmation" },
  { value: "order_dispatch", label: "Order dispatch" },
  { value: "order_shipped", label: "Order shipped" },
];

function getEmailTypeLabel(emailType) {
  return getEmailLogTypeLabel(emailType);
}

function parseMetadata(metadata) {
  if (!metadata || typeof metadata !== "string") return {};
  try {
    return JSON.parse(metadata);
  } catch {
    return {};
  }
}

function isRetryAlreadySent(entry) {
  return (
    entry?.retrySuccess === true ||
    entry?.retrySuccess === 1 ||
    entry?.retrySuccess === "1" ||
    entry?.retrySuccess === "true"
  );
}

function parseRecipientList(recipients) {
  if (!recipients?.trim()) return [];
  return recipients
    .split(/[,;]+/)
    .map((email) => email.trim())
    .filter(Boolean);
}

function getRetrySentTooltipMessage(entry) {
  const recipientList = parseRecipientList(entry?.recipients);
  const emailTypeLabel = getEmailLogTypeLabel(entry?.emailType);
  const orderId = getDisplayOrderId(entry);

  return (
    <div className="space-y-2.5">
      <p className="text-xs leading-relaxed text-slate-600">
        A retry email was successfully sent after the original failure. This entry is
        closed and cannot be retried again.
      </p>

      {(orderId != null || emailTypeLabel) && (
        <div className="rounded-md border border-emerald-100 bg-emerald-50/70 px-2.5 py-2 space-y-1">
          {orderId != null ? (
            <p className="text-xs text-slate-700">
              <span className="font-medium text-slate-800">Order ID:</span> {orderId}
            </p>
          ) : null}
          {emailTypeLabel ? (
            <p className="text-xs text-slate-700">
              <span className="font-medium text-slate-800">Email type:</span> {emailTypeLabel}
            </p>
          ) : null}
        </div>
      )}

      {recipientList.length > 0 ? (
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Delivered to
          </p>
          <ul className="max-h-28 space-y-1 overflow-y-auto pr-1">
            {recipientList.map((email) => (
              <li
                key={email}
                className="break-all rounded border border-slate-100 bg-slate-50 px-2 py-1 text-xs text-slate-700"
              >
                {email}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

const BULK_REFETCH_DELAY_MS = 8000;
const SINGLE_RETRY_COOLDOWN_MS = 12000;

function canRetryLogEntry(entry) {
  return entry?.emailSent === "Failed" && !isRetryAlreadySent(entry);
}

export default function EmailLogsPage() {
  const { isAllowed } = useUserType(["admin", "salesRepresentative"]);
  const { setToggle, toggle } = useDataContext();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [emailType, setEmailType] = useState("");
  const [orderId, setOrderId] = useState("");
  const [orderIdDebounced, setOrderIdDebounced] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [retryEmailLogId, setRetryEmailLogId] = useState(null);
  const [bulkSending, setBulkSending] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [bulkRefetchEndsAt, setBulkRefetchEndsAt] = useState(null);
  const [retryCooldownEndsAt, setRetryCooldownEndsAt] = useState({});
  const [, setCooldownTick] = useState(0);

  const isFailedFilter = emailType === "Failed";

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

  const runBulkEmailHelper = async (rawEntries, { singleLogId = null } = {}) => {
    const items = dedupeOrdersToSentEmail(rawEntries.map(entryToBulkEmailItem));
    if (!items.length) {
      info_toaster("Select at least one failed log to retry.");
      return;
    }

    if (singleLogId) {
      setRetryEmailLogId(singleLogId);
    } else {
      setBulkSending(true);
    }

    try {
      const res = await PostAPI(
        "api/v1/admin/order-management/bulk-email-helper",
        { ordersToSentEmail: items },
        "order-management",
        { suppressSuccessToast: true }
      );
      const body = res?.data;
      const ok = body?.status === "success" || body?.status === true;
      if (!ok) {
        throw new Error(body?.message || "Failed to send emails.");
      }

      const payload = body?.data ?? {};
      const summary = payload.summary ?? {};

      success_toaster(
        `Emails sent: ${summary.success ?? 0} succeeded, ${summary.failed ?? 0} failed` +
          (summary.duplicatesRemoved
            ? ` (${summary.duplicatesRemoved} duplicate${summary.duplicatesRemoved === 1 ? "" : "s"} removed)`
            : "")
      );

      const cooldownUpdate = {};
      const cooldownMs = singleLogId ? SINGLE_RETRY_COOLDOWN_MS : BULK_REFETCH_DELAY_MS;
      rawEntries.forEach((entry) => {
        if (entry?.id != null) {
          cooldownUpdate[entry.id] = Date.now() + cooldownMs;
        }
      });
      setRetryCooldownEndsAt((prev) => ({ ...prev, ...cooldownUpdate }));

      if (!singleLogId) {
        setSelectedRows([]);
      }

      if (singleLogId) {
        reFetchEmailLogs();
      } else {
        setBulkRefetchEndsAt(Date.now() + BULK_REFETCH_DELAY_MS);
      }
    } catch (error) {
      ErrorHandler(error);
    } finally {
      setRetryEmailLogId(null);
      setBulkSending(false);
    }
  };

  const handleRetryEmail = (entry) => {
    void runBulkEmailHelper([entry], { singleLogId: entry.id });
  };

  const handleBulkRetry = () => {
    const entries = selectedRows
      .filter((row) => row.canRetry)
      .map((row) => row._rawEntry)
      .filter(Boolean);
    void runBulkEmailHelper(entries);
  };

  const retryableSelectedCount = selectedRows.filter((row) => row.canRetry).length;

  const bulkRefetchRemainingSeconds = bulkRefetchEndsAt
    ? Math.max(0, Math.ceil((bulkRefetchEndsAt - Date.now()) / 1000))
    : 0;

  const bulkRefetchEndsAtRef = useRef(bulkRefetchEndsAt);
  useEffect(() => {
    bulkRefetchEndsAtRef.current = bulkRefetchEndsAt;
  }, [bulkRefetchEndsAt]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const refetchEnd = bulkRefetchEndsAtRef.current;
      if (refetchEnd && refetchEnd <= now) {
        setBulkRefetchEndsAt(null);
        setSelectedRows([]);
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
      const canRetry = canRetryLogEntry(entry);
      const cooldownEnd = retryCooldownEndsAt[entry.id];
      const remainingSeconds = cooldownEnd
        ? Math.max(0, Math.ceil((cooldownEnd - Date.now()) / 1000))
        : 0;
      const isRetrying = retryEmailLogId === entry.id;
      const retryDisabled = bulkSending || isRetrying || remainingSeconds > 0;

      return {
        id: entry.id,
        _rawEntry: entry,
        canRetry,
        sentAt: entry.sentAt
          ? formatDateTimeISO(entry.sentAt, "datetime")
          : "—",
        emailType: getEmailTypeLabel(entry.emailType),
        orderId: getDisplayOrderId(entry),
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
          isRetryAlreadySent(entry) ? (
            <InfoTooltip title="Retry completed" position="left">
              {getRetrySentTooltipMessage(entry)}
            </InfoTooltip>
          ) : isFailedFilter ? (
            <InfoTooltip variant="neutral" title="Not attempted retry" position="left" />
          ) : (
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
          )
        ) : (
          "—"
        ),
      };
    });
  }, [rawLogs, retryEmailLogId, bulkSending, retryCooldownEndsAt, isFailedFilter]);

  const columns = [
    { field: "orderId", header: "Order ID", sort: true },
    { field: "emailType", header: "Type", sort: false },
    { field: "orderType", header: "Order type", sort: false },
    { field: "recipients", header: "Recipients", sort: false },
    { field: "subject", header: "Subject", sort: false },
    { field: "status", header: "Status", sort: false },
    { field: "sentAt", header: "Sent at", sort: true },
    { field: "errorMessage", header: "Error", sort: false },
    { field: "action", header: "Retry", sort: false },
  ];

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleEmailTypeChange = (option) => {
    const next = option?.value ?? "";
    setEmailType(next);
    setPage(1);
    setSelectedRows([]);
    if (next !== "Failed") {
      setBulkRefetchEndsAt(null);
    }
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
          {isFailedFilter ? (
            <button
              type="button"
              disabled={
                bulkSending ||
                bulkRefetchRemainingSeconds > 0 ||
                retryableSelectedCount === 0
              }
              onClick={handleBulkRetry}
              className="inline-flex items-center justify-center gap-2 bg-theme text-white px-4 py-2 rounded-lg border border-theme hover:bg-white hover:text-theme transition-colors duration-200 font-medium disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-theme disabled:hover:text-white ml-auto"
            >
              {bulkSending
                ? "Sending…"
                : bulkRefetchRemainingSeconds > 0
                ? `Refreshing in ${bulkRefetchRemainingSeconds}s…`
                : `Retry selected (${retryableSelectedCount})`}
              {bulkSending && (
                <AiOutlineLoading3Quarters className="w-4 h-4 animate-spin flex-shrink-0" />
              )}
            </button>
          ) : null}
        </div>

        {dateRangeError ? (
          <p className="text-sm text-slate-600 rounded-xl border border-borderColor bg-white p-8 text-center shadow-tableShadow">
            Fix the date range above to load email logs.
          </p>
        ) : isLoading ? (
          <div className="flex min-h-[360px] items-center justify-center rounded-xl border border-borderColor bg-white shadow-tableShadow">
            <Loader />
          </div>
        ) : (
          <MyDataTable
            checkbox={isFailedFilter}
            isRowCheckboxDisabled={(row) => !row.canRetry}
            selectedRows={selectedRows}
            setSelectedRows={isFailedFilter ? setSelectedRows : undefined}
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
        )}
      </div>
    </div>
  );
}
