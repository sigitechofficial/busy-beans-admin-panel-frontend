"use client";
import React, { useState } from "react";
import GetAPI from "@/utilities/GetAPI";

/**
 * Order / invoice activity history: who did what and when (invoice edits with before / after,
 * unit price changes, sent, deleted, status changes, marked paid, cheques, tracking, online payments).
 * API: GET api/v1/admin/order-management/activity/:orderType/:orderId
 */
const ENTITY_LABEL = {
  admin: "Admin",
  subAdmin: "Sub-admin",
  adminEmployee: "Employee",
  localPartner: "Local partner",
  partnerEmployee: "Partner employee",
  supplier: "Supplier",
  user: "Customer",
  guest: "Pay link",
};

const money = (n) => `$${Number(n || 0).toFixed(2)}`;
const when = (at) => {
  const d = new Date(at);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};

function Lines({ title, lines }) {
  if (!Array.isArray(lines) || !lines.length) return null;
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold text-gray-600 mb-1">{title}</p>
      <ul className="text-xs text-gray-700 space-y-0.5">
        {lines.map((l, i) => (
          <li key={i}>
            {l.type === "charges" ? `Charge: ${l.name || "—"}` : `Product #${l.productId}`} × {l.qty} = {money(l.total)}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Details({ entry }) {
  const d = entry.details;
  if (!d) return null;
  if (entry.action === "invoice_edited") {
    return (
      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 rounded-lg p-3">
        <div>
          <p className="text-xs text-gray-500">Before</p>
          <p className="text-sm">
            Total {money(d.before?.totalBill)}
            {d.before?.shippingCharges !== undefined ? ` · shipping ${money(d.before.shippingCharges)}` : ""}
          </p>
          <Lines title="Lines" lines={d.before?.lines} />
        </div>
        <div>
          <p className="text-xs text-gray-500">After</p>
          <p className="text-sm">
            Total {money(d.after?.totalBill)}
            {d.after?.shippingCharges !== undefined ? ` · shipping ${money(d.after.shippingCharges)}` : ""}
          </p>
          <Lines title="Lines" lines={d.after?.lines} />
        </div>
        {(d.priceChanges > 0 || d.emailToCustomer || d.chargeSavedCard) && (
          <p className="text-xs text-gray-600 md:col-span-2">
            {d.priceChanges > 0 ? `${d.priceChanges} unit price change(s). ` : ""}
            {d.emailToCustomer ? "Updated invoice emailed to the customer. " : ""}
            {d.chargeSavedCard ? "Saved card charged." : ""}
          </p>
        )}
      </div>
    );
  }
  const rows = Object.entries(d).filter(([, v]) => v !== undefined && v !== null && v !== "" && typeof v !== "object");
  if (!rows.length) return null;
  return (
    <p className="mt-1 text-xs text-gray-500">
      {rows.map(([k, v]) => `${k}: ${v}`).join(" · ")}
    </p>
  );
}

export default function OrderActivity({ orderType = "customer", orderId }) {
  const { data, isLoading } = GetAPI(orderId ? `api/v1/admin/order-management/activity/${orderType}/${orderId}` : null);
  const [open, setOpen] = useState({});
  const entries = data?.data?.entries || [];

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-5" aria-label="Activity history">
      <h3 className="text-base font-semibold text-themeDark mb-1">Activity history</h3>
      <p className="text-xs text-gray-500 mb-4">Who did what and when on this order and its invoice.</p>
      {isLoading && <p className="text-sm text-gray-500">Loading…</p>}
      {!isLoading && !entries.length && (
        <p className="text-sm text-gray-500">No activity recorded yet. Changes are recorded from this release on.</p>
      )}
      <ol className="relative border-l border-gray-200 ml-2 space-y-4">
        {entries.map((e) => (
          <li key={e.id} className="ml-4">
            <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-white bg-theme" />
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-sm font-medium text-gray-900">{e.summary || e.action}</span>
              <span className="text-xs text-gray-500">
                {when(e.at)} · {e.actor?.name || "—"}
                {e.actor?.entity ? ` (${ENTITY_LABEL[e.actor.entity] || e.actor.entity})` : ""}
              </span>
            </div>
            {e.details && (
              <button
                type="button"
                className="text-xs text-theme underline mt-0.5"
                onClick={() => setOpen((o) => ({ ...o, [e.id]: !o[e.id] }))}
              >
                {open[e.id] ? "Hide details" : "Details"}
              </button>
            )}
            {open[e.id] && <Details entry={e} />}
          </li>
        ))}
      </ol>
    </section>
  );
}
