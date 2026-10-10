// Labels and helpers shared by the Leads Kanban, its cards and the lead detail page.

/** Where the enquiry came from (leads.enquiryType, set by the API). */
export const ENQUIRY_LABELS = {
  machine: "Machine",
  contact: "Contact",
  tasting: "Tasting",
  machine_enquiry: "Machine enquiry",
  product_quote: "Product quote",
  landing_page: "Landing page",
  meta: "Meta ad",
  manual: "Manual",
};

export const enquiryLabel = (lead) => ENQUIRY_LABELS[lead?.enquiryType] || ENQUIRY_LABELS.machine;

export const LOST_REASONS = [
  "Price Too High",
  "Timeline Mismatch",
  "Chose Competitor",
  "Not Interested",
  "Budget Constraints",
  "Other",
];

/** "google / cpc" style source of the lead (the Campaign Builder lead), else its lead source. */
export function sourceLabel(lead) {
  const m = lead?.marketingSource;
  if (m?.source) return m.medium ? `${m.source} / ${m.medium}` : m.source;
  if (m?.channel) return m.channel;
  return lead?.leadSource || "";
}

export const campaignLabel = (lead) => lead?.marketingSource?.campaign || "";

export const assigneeName = (lead) =>
  lead?.assignedEmployee?.name || lead?.assignedSalesRep?.srName || "";

export function formatMoney(value) {
  const n = Number(value);
  if (value === null || value === undefined || value === "" || !Number.isFinite(n)) return "";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

const csvCell = (v) => {
  const s = v === null || v === undefined ? "" : String(v);
  // Leading = + - @ would run as a formula in Excel.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

/** Download the given leads as a CSV file. */
export function downloadLeadsCsv(leads, filename = "leads.csv") {
  const header = [
    "ID", "Created", "Stage", "Enquiry", "Company", "Contact", "Email", "Phone", "Machine",
    "Source", "Campaign", "Tag", "Assigned to", "Won amount", "Follow-up", "Notes",
  ];
  const rows = leads.map((l) => [
    l.id,
    l.createdAt ? new Date(l.createdAt).toISOString().slice(0, 10) : "",
    l.status,
    enquiryLabel(l),
    l.company,
    l.contactName,
    l.contactEmail,
    l.contactPhone,
    l.machineName,
    sourceLabel(l),
    campaignLabel(l),
    l.tag,
    assigneeName(l),
    l.wonAmount ?? "",
    l.followUpNextDate ? new Date(l.followUpNextDate).toISOString().slice(0, 10) : "",
    l.notes,
  ]);
  const csv = [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
