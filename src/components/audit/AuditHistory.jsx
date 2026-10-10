"use client";
import React, { useState } from "react";
import GetAPI from "@/utilities/GetAPI";

/**
 * History of a customer / local partner / supplier / sub-admin / employee / product: who created,
 * changed or deleted it, and which fields changed (old → new).
 * API: GET api/v1/admin/audit/:path/:id   (path: customer · sales-rep · supplier · sub-admin · employee · product)
 */
const ENTITY_LABEL = {
  admin: "Admin",
  subAdmin: "Sub-admin",
  adminEmployee: "Employee",
  localPartner: "Local partner",
  partnerEmployee: "Partner employee",
  supplier: "Supplier",
  user: "Customer",
  system: "System",
};

const FIELD_LABEL = {
  srName: "Name",
  supplierName: "Name",
  phoneNum: "Phone",
  phoneNumber: "Phone",
  countryCode: "Country code",
  companyName: "Company",
  saleTaxNumber: "Sales tax number",
  emailToSendInvoices: "Invoice email",
  dispatchEmail: "Dispatch email",
  approvedByAdmin: "Approved",
  defaultDiscount: "Default discount",
  preferredPaymentMethod: "Preferred payment",
  salesRepId: "Local partner",
  employeeId: "Assigned employee",
  partnerType: "Partner type",
  creditLimit: "Credit limit",
  territoryName: "Territory",
  addressOne: "Address line 1",
  addressTwo: "Address line 2",
  businessWeb: "Website",
  supplierType: "Supplier type",
  isDefaultSupplier: "Default supplier",
  commissionPercentage: "Commission %",
  employeeOf: "Employee of",
  zipCode: "ZIP",
  wholesalePrice: "Wholesale price",
  quantity: "Stock",
  sku: "SKU",
  productCode: "Product code",
  supplierSkus: "Supplier SKUs",
};
const label = (k) => FIELD_LABEL[k] || k.charAt(0).toUpperCase() + k.slice(1);
const show = (v) => {
  if (v === null || v === undefined || v === "") return "—";
  if (v === true || v === 1) return "Yes";
  if (v === false || v === 0) return "No";
  return String(v);
};
const when = (at) => {
  const d = new Date(at);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};

function ChangeList({ changes, depth = 0 }) {
  if (!changes || typeof changes !== "object") return null;
  return (
    <ul className={`text-xs text-gray-700 space-y-0.5 ${depth ? "ml-3" : ""}`}>
      {Object.entries(changes).map(([field, c]) => {
        if (c && (Array.isArray(c.added) || Array.isArray(c.removed))) {
          return (
            <li key={field}>
              <span className="font-medium">{label(field)}:</span>
              {c.added?.length ? <span className="text-green-700"> added {c.added.join(", ")}</span> : null}
              {c.removed?.length ? <span className="text-red-700"> removed {c.removed.join(", ")}</span> : null}
            </li>
          );
        }
        if (c && ("from" in c || "to" in c) && Object.keys(c).every((k) => k === "from" || k === "to")) {
          return (
            <li key={field}>
              <span className="font-medium">{label(field)}:</span> {show(c.from)} → <strong>{show(c.to)}</strong>
            </li>
          );
        }
        return (
          <li key={field}>
            <span className="font-medium">{label(field)}</span>
            <ChangeList changes={c} depth={depth + 1} />
          </li>
        );
      })}
    </ul>
  );
}

export default function AuditHistory({ path, id, title = "History" }) {
  const { data, isLoading } = GetAPI(path && id ? `api/v1/admin/audit/${path}/${id}` : null);
  const [open, setOpen] = useState({});
  const entries = data?.data?.entries || [];

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-5" aria-label={title}>
      <h3 className="text-base font-semibold text-themeDark mb-1">{title}</h3>
      <p className="text-xs text-gray-500 mb-4">Who created, changed or deleted this record, and when.</p>
      {isLoading && <p className="text-sm text-gray-500">Loading…</p>}
      {!isLoading && !entries.length && (
        <p className="text-sm text-gray-500">No changes recorded yet. Changes are recorded from this release on.</p>
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
            {e.changes && (
              <>
                <button
                  type="button"
                  className="text-xs text-theme underline mt-0.5"
                  onClick={() => setOpen((o) => ({ ...o, [e.id]: !o[e.id] }))}
                >
                  {open[e.id] ? "Hide changes" : "Changes"}
                </button>
                {open[e.id] && (
                  <div className="mt-2 bg-gray-50 rounded-lg p-3">
                    <ChangeList changes={e.changes} />
                  </div>
                )}
              </>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
