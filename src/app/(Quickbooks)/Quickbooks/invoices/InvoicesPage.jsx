/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import BackButton from "@/components/ui/BackButton";
import Loader from "@/components/ui/Loader";
import MyDataTable from "@/components/ui/MyDataTable";
import { useDataContext } from "@/utilities/DataContext";
import GetAPI from "@/utilities/GetAPI";
import { drawerSelectStyles } from "@/utilities/SelectStyle";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CiMenuBurger } from "react-icons/ci";
import { ImCross } from "react-icons/im";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import Select from "react-select";
import { PULLOUT_INTENT_QBO_SYNC } from "../../../(reportManagement)/reports/report.testid";
import dayjs from "dayjs";
import { formatUSD } from "@/utilities/constants";
import { hasPermission } from "@/utilities/Permission";
import { canAccessFeatureScope, isStoredSubAdmin } from "@/utilities/subAdminNav";
import { error_toaster, success_toaster, info_toaster } from "@/utilities/Toaster";
import { PostAPI } from "@/utilities/PostAPI";
import ErrorHandler from "@/utilities/ErrorHandler";

const SYNC_CHUNK = 100;

function formatPulloutDate(val) {
  if (val === null || val === undefined || val === "") return "-";
  const asNumber = Number(val);
  if (!Number.isNaN(asNumber) && asNumber > 0) {
    return dayjs(asNumber).format("MM/DD/YYYY");
  }
  const parsed = dayjs(val);
  return parsed.isValid() ? parsed.format("MM/DD/YYYY") : "-";
}

function outcomeBadgeClass(outcome) {
  if (outcome === "synced") return "bg-emerald-100 text-emerald-900 border-emerald-200";
  if (outcome === "skipped") return "bg-amber-100 text-amber-900 border-amber-200";
  if (outcome === "failed") return "bg-red-100 text-red-900 border-red-200";
  return "bg-stone-100 text-stone-800";
}

/** Known `reason` values from Pullout_Custom_Field_Sync_Frontend_Guide — for clearer tooltips. */
function syncReasonLabel(reason) {
  if (!reason) return "";
  const map = {
    pullout_gates_not_met: "Order no longer passes sync gates (try refresh).",
    skipped_admin_sync_direct_partner_order: "Admin QBO is not used for this direct-partner order.",
    skipped_admin_sync_dropship_direct_invoice_order: "Admin QBO is not used for this dropship direct-invoice order.",
    admin_qbo_not_connected: "Admin QuickBooks is disconnected — reconnect QBO.",
    admin_qbo_customer_not_connected: "Customer not mapped to admin QBO yet.",
    admin_qbo_token_or_realm_missing: "QBO token or realm missing — reconnect QuickBooks.",
    pullout_already_set: "Pullout intent already on QBO; database reconciled to synced.",
    no_admin_invoice_id: "No admin invoice id yet; backend created or linked an invoice (see sync result).",
  };
  return map[reason] ?? "";
}

/** Table row shape (must match MyDataTable `data` rows for selection). */
function mapServiceRowToData(row, sl) {
  const receivableOn =
    row.adminReceivableStatus === true ||
    row.adminReceivableStatus === 1 ||
    row.adminReceivableStatus === "1";
  return {
    id: row.id,
    orderId: row.id,
    sl,
    invoiceNumber: row.invoiceNumber || "-",
    orderDate: row.on ? dayjs(row.on).format("MM/DD/YYYY") : "-",
    companyName: row.companyName || "-",
    salesRepName: row.salesRepName || "-",
    partnerType: row.partnerType || "-",
    paymentStatus: row.paymentStatus || "-",
    totalBill: formatUSD(parseFloat(row.totalBill) || 0),
    adminReceivable: receivableOn ? "Yes" : "No",
    adminReceivableAmount: formatUSD(parseFloat(row.adminReceivableAmount) || 0),
    localPatnerCommission: formatUSD(parseFloat(row.localPatnerCommission) || 0),
    pulloutIntentId: row.pulloutIntentId || "-",
    pulloutDate: formatPulloutDate(row.pulloutDate),
    quickBooksInvoiceId: row.quickBooksInvoiceId || "-",
    pulloutIntentIdSynced: row.pulloutIntentIdSynced || "-",
    pendingReason: row.pendingReason || "-",
  };
}

export default function QuickBooksInvoicesPulloutSyncPage() {
  const [customDates, setCustomDates] = useState({ startDate: "", endDate: "" });
  const [selectedOption, setSelectedOption] = useState({
    value: "allTime",
    label: "All Time",
  });
  const [displayCustomFilters, setDisplayCustomFilters] = useState(false);

  const getInitialDateRange = () => {
    const today = dayjs();
    return {
      startDate: "2025-01-01",
      endDate: today.format("YYYY-MM-DD"),
    };
  };

  const [dateRange, setDateRange] = useState(getInitialDateRange());
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selectedSalesRep, setSelectedSalesRep] = useState({
    value: "all",
    label: "All Local Partners",
  });
  const [selectedRows, setSelectedRows] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ done: 0, total: 0 });
  const [lastSync, setLastSync] = useState(null);
  const reselectAfterSyncRef = useRef(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentSyncStatus =
    searchParams?.get("syncStatus") === "synced" ? "synced" : "unsynced";
  const [adminGate, setAdminGate] = useState("checking");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const userType = localStorage.getItem("userType");
    if (userType !== "admin") {
      info_toaster("This page is only available to admin users.");
      router.replace("/");
      setAdminGate("denied");
      return;
    }
    if (isStoredSubAdmin()) {
      const canOpen =
        hasPermission("quickbooks-invoices_view") ||
        hasPermission("quickbooks-invoices_update");
      if (!canOpen || !canAccessFeatureScope("quickbooks-invoices", "customer")) {
        info_toaster(
          "Pullout intent sync needs Customer QuickBooks Invoices access.",
        );
        router.replace("/");
        setAdminGate("denied");
        return;
      }
    }
    setAdminGate("ok");
  }, [router]);

  const { data: salesRepData } = GetAPI(adminGate === "ok" ? "api/v1/admin/sales-rep" : "");

  const salesRepOptions = [
    { value: "all", label: "All Local Partners" },
    ...(salesRepData?.data?.data
      ? salesRepData.data.data.map((rep) => ({
          value: rep.id,
          label: rep.srName || rep.name || `Sales Rep ${rep.id}`,
        }))
      : []),
  ];

  const listApiUrl = useMemo(() => {
    if (adminGate !== "ok") return "";
    const baseUrl = "api/v1/admin/admin-reports/pullout-intent-unsynced-orders";
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));

    if (currentSyncStatus === "synced") {
      if (dateRange?.startDate && dateRange?.endDate) {
        params.set("startDate", dateRange.startDate);
        params.set("endDate", dateRange.endDate);
      }
      if (selectedSalesRep.value !== "all") {
        params.set("salesRepId", String(selectedSalesRep.value));
      }
      params.set("syncStatus", "synced");
    }

    return `${baseUrl}?${params.toString()}`;
  }, [
    adminGate,
    currentSyncStatus,
    page,
    limit,
    dateRange?.startDate,
    dateRange?.endDate,
    selectedSalesRep.value,
  ]);

  const { data, isLoading, reFetch } = GetAPI(listApiUrl);

  /** API: `{ status, pagination, data: Row[] }` — rows are `data`, not `data.data`. */
  const rawRows = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data?.data?.data)) return data.data.data;
    return [];
  }, [data]);

  const pagination = data?.pagination || {};

  /** Keep SL aligned with loaded rows until the new page response arrives. */
  const paginationPending =
    isLoading &&
    pagination?.page != null &&
    (pagination.page !== page || pagination.limit !== limit);
  const slPage = paginationPending ? pagination.page : page;
  const slLimit = paginationPending ? pagination.limit : limit;

  const calculateDateRange = (value) => {
    const today = dayjs();
    switch (value) {
      case "today":
        return {
          startDate: today.format("YYYY-MM-DD"),
          endDate: today.format("YYYY-MM-DD"),
        };
      case "yesterday":
        const yesterday = today.subtract(1, "day");
        return {
          startDate: yesterday.format("YYYY-MM-DD"),
          endDate: yesterday.format("YYYY-MM-DD"),
        };
      case "last7Days":
        return {
          startDate: today.subtract(6, "day").format("YYYY-MM-DD"),
          endDate: today.format("YYYY-MM-DD"),
        };
      case "last30Days":
        return {
          startDate: today.subtract(29, "day").format("YYYY-MM-DD"),
          endDate: today.format("YYYY-MM-DD"),
        };
      case "last90Days":
        return {
          startDate: today.subtract(89, "day").format("YYYY-MM-DD"),
          endDate: today.format("YYYY-MM-DD"),
        };
      case "thisMonth":
        return {
          startDate: today.startOf("month").format("YYYY-MM-DD"),
          endDate: today.endOf("month").format("YYYY-MM-DD"),
        };
      case "lastMonth":
        const lastMonth = today.subtract(1, "month");
        return {
          startDate: lastMonth.startOf("month").format("YYYY-MM-DD"),
          endDate: lastMonth.endOf("month").format("YYYY-MM-DD"),
        };
      case "allTime":
      default:
        return getInitialDateRange();
    }
  };

  const columns = [
    { field: "sl", header: "SL", sort: true },
    { field: "invoiceNumber", header: "Invoice #", sort: true },
    { field: "orderDate", header: "Order date", sort: true },
    { field: "companyName", header: "Company", sort: true },
    { field: "salesRepName", header: "Sales rep", sort: true },
    { field: "partnerType", header: "Partner type", sort: true },
    { field: "paymentStatus", header: "Payment status", sort: true },
    { field: "totalBill", header: "Total bill $", sort: true },
    { field: "adminReceivable", header: "Admin receivable", sort: true },
    { field: "adminReceivableAmount", header: "Admin receivable $", sort: true },
    { field: "localPatnerCommission", header: "Partner commission $", sort: true },
    { field: "pulloutIntentId", header: "Pullout intent ID", minWidth: "14rem" },
    { field: "pulloutDate", header: "Pullout date", sort: true },
    { field: "quickBooksInvoiceId", header: "QBO invoice ID" },
    { field: "pulloutIntentIdSynced", header: "Sync state" },
    { field: "pendingReason", header: "Pending reason", minWidth: "12rem" },
  ];

  const datas = rawRows.map((row, i) =>
    mapServiceRowToData(row, (slPage - 1) * slLimit + i + 1)
  );

  useEffect(() => {
    const pending = reselectAfterSyncRef.current;
    if (!pending) return;
    const { failedIds } = pending;
    const next = rawRows
      .filter((row) => failedIds.has(Number(row.id)))
      .map((row, idx) => mapServiceRowToData(row, idx + 1));
    setSelectedRows(next);
    reselectAfterSyncRef.current = null;
  }, [rawRows]);

  const runBulkSync = useCallback(
    async (orderIds) => {
      const unique = [
        ...new Set(
          orderIds
            .map((id) => Number(id))
            .filter((id) => Number.isFinite(id) && id > 0)
        ),
      ];
      if (!unique.length) {
        info_toaster("Select at least one order.");
        return;
      }

      setSyncing(true);
      setSyncProgress({ done: 0, total: unique.length });
      const allResults = [];
      let agg = { total: 0, synced: 0, skipped: 0, failed: 0 };

      try {
        for (let i = 0; i < unique.length; i += SYNC_CHUNK) {
          const chunk = unique.slice(i, i + SYNC_CHUNK);
          const res = await PostAPI(
            "api/v1/admin/qbo/pullout-custom-field/sync",
            { orderIds: chunk },
            "quickbooks-invoices",
            { suppressSuccessToast: true }
          );
          const body = res?.data;
          if (body?.results?.length) {
            allResults.push(...body.results);
          }
          if (body?.summary) {
            agg.total += body.summary.total || 0;
            agg.synced += body.summary.synced || 0;
            agg.skipped += body.summary.skipped || 0;
            agg.failed += body.summary.failed || 0;
          }
          setSyncProgress({
            done: Math.min(i + chunk.length, unique.length),
            total: unique.length,
          });
        }

        setLastSync({ results: allResults, summary: agg });
        success_toaster(`Sync complete: ${agg.synced} synced, ${agg.skipped} skipped, ${agg.failed} failed.`);
        reselectAfterSyncRef.current = {
          failedIds: new Set(
            allResults
              .filter((r) => r.outcome === "failed")
              .map((r) => Number(r.orderId))
              .filter((id) => Number.isFinite(id))
          ),
        };
        reFetch?.();
      } catch (error) {
        ErrorHandler(error);
      } finally {
        setSyncing(false);
        setSyncProgress({ done: 0, total: 0 });
      }
    },
    [reFetch]
  );

  useEffect(() => {
    if (selectedOption.value !== "custom" && !displayCustomFilters) {
      const dates = calculateDateRange(selectedOption.value);
      setDateRange(dates);
      setPage(1);
    }
  }, [selectedOption, displayCustomFilters]);

  useEffect(() => {
    if (displayCustomFilters && customDates.startDate && customDates.endDate) {
      const start = dayjs(customDates.startDate);
      const end = dayjs(customDates.endDate);
      const today = dayjs();
      if (start.isAfter(end)) {
        error_toaster("Start date cannot be after end date.");
        return;
      }
      if (start.isAfter(today) || end.isAfter(today)) {
        error_toaster("Dates cannot be in the future.");
        return;
      }
      setDateRange({
        startDate: customDates.startDate,
        endDate: customDates.endDate,
      });
      setPage(1);
    }
  }, [customDates.startDate, customDates.endDate, displayCustomFilters]);

  const handleChange = (val) => {
    if (val?.value === "custom") {
      setDisplayCustomFilters(true);
    } else {
      setSelectedOption(val);
      setDisplayCustomFilters(false);
      const dates = calculateDateRange(val?.value);
      setDateRange(dates);
      setCustomDates({ startDate: "", endDate: "" });
      setPage(1);
    }
  };

  const handleCancel = () => {
    setDisplayCustomFilters(false);
    setCustomDates({ startDate: "", endDate: "" });
    setSelectedOption({ value: "allTime", label: "All Time" });
    setDateRange(getInitialDateRange());
    setPage(1);
  };

  const handleCustomDates = (e) => {
    setCustomDates({ ...customDates, [e.target.name]: e.target.value });
  };

  const handleSalesRepChange = (val) => {
    setSelectedSalesRep(val);
    setPage(1);
  };

  const handleSyncStatusChange = (value) => {
    setSelectedRows([]);
    setPage(1);
    if (value === "synced") {
      setLastSync(null);
      router.replace(`${pathname}?syncStatus=synced`);
    } else {
      router.replace(pathname);
    }
  };

  const { toggle, setToggle } = useDataContext();

  if (adminGate === "checking") {
    return <Loader />;
  }
  if (adminGate !== "ok") {
    return null;
  }

  return isLoading && !data ? (
    <Loader />
  ) : (
    <div data-testid={PULLOUT_INTENT_QBO_SYNC.root}>
      <div
        className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed"
        data-testid={PULLOUT_INTENT_QBO_SYNC.headerBar}
      >
        <div className="flex items-center gap-2">
          <p onClick={() => setToggle(!toggle)} className="cursor-pointer md:hidden">
            <CiMenuBurger size={20} />
          </p>
          <h2
            className="text-xl font-inter font-semibold"
            data-testid={PULLOUT_INTENT_QBO_SYNC.title}
          >
            QuickBooks invoices — pullout intent sync
          </h2>
        </div>
      </div>

      <div className="space-y-6 pt-28 2xl:pt-32 px-6 2xl:px-12">
        <div className="flex items-center flex-wrap">
          {[
            { value: "unsynced", label: "Not synced" },
            { value: "synced", label: "Synced" },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => handleSyncStatusChange(tab.value)}
              className={`${
                currentSyncStatus === tab.value
                  ? "bg-black text-white"
                  : "bg-white text-black"
              } font-workSans font-medium border border-black px-5 sm:px-8 py-2.5 duration-200`}
              data-testid={
                tab.value === "unsynced"
                  ? PULLOUT_INTENT_QBO_SYNC.tabNotSynced
                  : PULLOUT_INTENT_QBO_SYNC.tabSynced
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
        <p className="max-w-4xl text-sm text-secondary">
          {currentSyncStatus === "synced"
            ? "Customer orders that have already been synced to admin QuickBooks."
            : "Customer orders (dropship partner, bank check pullouts) whose PulloutIntentId is not yet on the admin QuickBooks invoice. Select rows and sync; successful rows disappear from this list on refresh."}
        </p>

        <div
          className="flex items-center justify-between flex-wrap gap-y-3"
          data-testid={PULLOUT_INTENT_QBO_SYNC.filterSection}
        >
          <div className="flex items-center gap-x-4 flex-wrap gap-y-3">
            <BackButton />
            {dateRange.startDate && dateRange.endDate && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-md border border-gray-200">
                <span className="text-sm font-inter font-medium text-gray-600">Date range:</span>
                <span className="text-sm font-inter font-semibold text-gray-900">
                  {dayjs(dateRange.startDate).format("MMM DD, YYYY")} —{" "}
                  {dayjs(dateRange.endDate).format("MMM DD, YYYY")}
                </span>
              </div>
            )}
            {!dateRange.startDate && !dateRange.endDate && (
              <span className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-1">
                {currentSyncStatus === "synced"
                  ? "No order-date filter (API returns all qualifying synced rows)."
                  : "No order-date filter (API returns all qualifying unsynced rows)."}
              </span>
            )}
            <Select
              value={selectedOption}
              onChange={handleChange}
              options={[
                { value: "allTime", label: "All Time" },
                { value: "today", label: "Today" },
                { value: "yesterday", label: "Yesterday" },
                { value: "last7Days", label: "Last 7 Days" },
                { value: "last30Days", label: "Last 30 Days" },
                { value: "last90Days", label: "Last 90 Days" },
                { value: "thisMonth", label: "This Month" },
                { value: "lastMonth", label: "Last Month" },
                { value: "custom", label: "Custom" },
              ]}
              styles={drawerSelectStyles}
              className="w-40"
              data-testid={PULLOUT_INTENT_QBO_SYNC.dateRangeSelect}
            />
            {displayCustomFilters && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  name="startDate"
                  value={customDates.startDate}
                  onChange={handleCustomDates}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  data-testid={PULLOUT_INTENT_QBO_SYNC.startDateInput}
                />
                <span className="text-sm text-gray-600">to</span>
                <input
                  type="date"
                  name="endDate"
                  value={customDates.endDate}
                  onChange={handleCustomDates}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  data-testid={PULLOUT_INTENT_QBO_SYNC.endDateInput}
                />
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-white text-black font-workSans font-medium border border-black px-5 py-2.5 duration-200 hover:bg-gray-50"
                  data-testid={PULLOUT_INTENT_QBO_SYNC.cancelCustomButton}
                >
                  Cancel
                </button>
              </div>
            )}
            <Select
              value={selectedSalesRep}
              onChange={handleSalesRepChange}
              options={salesRepOptions}
              styles={drawerSelectStyles}
              className="w-48"
              data-testid={PULLOUT_INTENT_QBO_SYNC.salesRepSelect}
            />
          </div>
          {currentSyncStatus === "unsynced" && (
            <div className="flex items-center flex-wrap gap-2">
              <button
                type="button"
                disabled={syncing || !selectedRows.length}
                onClick={() => runBulkSync(selectedRows.map((r) => r.id))}
                className="inline-flex items-center justify-center gap-2 bg-theme text-white px-4 py-2 rounded-lg border border-theme hover:bg-white hover:text-theme transition-colors duration-200 font-medium disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-theme disabled:hover:text-white"
                data-testid={PULLOUT_INTENT_QBO_SYNC.syncSelectedButton}
              >
                {syncing
                  ? `Syncing (${syncProgress.done}/${syncProgress.total})`
                  : `Sync selected (${selectedRows.length})`}
                {syncing && (
                  <AiOutlineLoading3Quarters className="w-4 h-4 animate-spin flex-shrink-0" />
                )}
              </button>
            </div>
          )}
        </div>

        {lastSync && currentSyncStatus === "unsynced" ? (
          <div
            className="rounded-lg border border-borderColor bg-stone-50 p-4 space-y-3"
            data-testid={PULLOUT_INTENT_QBO_SYNC.resultsPanel}
          >
            <h3 className="font-inter font-semibold text-secondary">Last sync summary</h3>
            <div className="flex flex-wrap gap-4 text-sm">
              <span>Total: {lastSync.summary?.total ?? 0}</span>
              <span className="text-emerald-800">Synced: {lastSync.summary?.synced ?? 0}</span>
              <span className="text-amber-800">Skipped: {lastSync.summary?.skipped ?? 0}</span>
              <span className="text-red-800">Failed: {lastSync.summary?.failed ?? 0}</span>
            </div>
            <div className="max-h-64 overflow-auto rounded border border-stone-200 bg-white">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-stone-100 font-semibold text-stone-700">
                  <tr>
                    <th className="px-2 py-2">Order ID</th>
                    <th className="px-2 py-2">Outcome</th>
                    <th className="px-2 py-2">Action</th>
                    <th className="px-2 py-2">QBO invoice</th>
                    <th className="px-2 py-2">HTTP</th>
                    <th className="px-2 py-2">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {(lastSync.results || []).map((r, idx) => {
                    const human = syncReasonLabel(r.reason);
                    const reasonTitle = human ? `${human} (${r.reason})` : r.reason || "";
                    return (
                      <tr key={`${r.orderId}-${idx}`} className="border-t border-stone-100">
                        <td className="px-2 py-1.5 font-mono">{r.orderId}</td>
                        <td className="px-2 py-1.5">
                          <span
                            className={`inline-block rounded border px-2 py-0.5 ${outcomeBadgeClass(r.outcome)}`}
                          >
                            {r.outcome}
                          </span>
                        </td>
                        <td className="px-2 py-1.5">{r.action ?? "—"}</td>
                        <td className="px-2 py-1.5 font-mono">{r.invoiceId ?? "—"}</td>
                        <td className="px-2 py-1.5">{r.statusCode != null ? r.statusCode : "—"}</td>
                        <td className="px-2 py-1.5 max-w-md truncate" title={reasonTitle}>
                          {r.reason || "—" }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        <div data-testid={PULLOUT_INTENT_QBO_SYNC.tableWrapper}>
          <MyDataTable
            checkbox={currentSyncStatus !== "synced"}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
            dataKey="id"
            columns={columns}
            data={datas}
            placeholder="Search table…"
            pagination
            search
            serverPagination={{
              page,
              limit,
              totalRecords: pagination?.total ?? 0,
              totalPages: pagination?.totalPages ?? 1,
              onPageChange: (newPage) => setPage(newPage),
              onLimitChange: (newLimit) => {
                setLimit(newLimit);
                setPage(1);
              },
            }}
            csvFileName={`quickbooks-pullout-sync-${dayjs().format("YYYY-MM-DD")}.csv`}
            rowTestId={(row) => `data-testid-${PULLOUT_INTENT_QBO_SYNC.row(row.id)}`}
          />
        </div>
      </div>
    </div>
  );
}