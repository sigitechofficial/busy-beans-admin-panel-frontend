"use client";

import { useRouter } from "next/navigation";
import { MdReceiptLong, MdRequestQuote } from "react-icons/md";
import DASHBOARD from "@/app/dashboard.testids";

const INVOICE_TILES = [
  {
    key: "overdueShipped",
    title: "Overdue (shipped)",
    subtitle: "Unpaid invoice, already shipped",
    Icon: MdReceiptLong,
  },
  {
    key: "shippedNotInvoiced",
    title: "Shipped not invoiced",
    subtitle: "Shipped, no invoice yet",
    Icon: MdRequestQuote,
  },
];

export function invoiceExceptionHrefs(filters) {
  const owner =
    filters?.userType === "admin"
      ? "admin"
      : filters?.userType === "salesRep"
        ? "partner"
        : "";

  const href = (filter) => {
    const params = new URLSearchParams({ filter });
    if (owner) params.set("owner", owner);
    return `/all-invoices?${params.toString()}`;
  };

  return {
    overdueShipped: href("overdueShipped"),
    shippedNotInvoiced: href("shippedNotInvoiced"),
  };
}

export default function DashboardInvoices({ counts, hrefs }) {
  const router = useRouter();
  const payload = counts || {};
  const values = {
    overdueShipped: Number(payload.overdueShipped) || 0,
    shippedNotInvoiced: Number(payload.shippedNotInvoiced) || 0,
  };

  return (
    <div className="space-y-4 sm:space-y-5" data-testid={DASHBOARD.invoiceRoot}>
      <div>
        <h2 className="text-base sm:text-lg font-semibold text-gray-800">
          Invoices
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
          Shipped orders that still need payment or an invoice.
        </p>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
        data-testid={DASHBOARD.invoiceTiles}
      >
        {INVOICE_TILES.map(({ key, title, subtitle, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              if (hrefs?.[key]) router.push(hrefs[key]);
            }}
            className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 text-left hover:border-theme/40 hover:shadow-xl transition-shadow min-w-0"
            data-testid={DASHBOARD.invoiceTile(key)}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2 min-w-0">
                <Icon className="text-theme shrink-0" size={20} />
                <span className="truncate">{title}</span>
              </h3>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
              {values[key].toLocaleString()}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">{subtitle}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
