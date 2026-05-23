/** Allowed `emailType` values for bulk-email-helper / email-helper APIs. */
export const ALLOWED_BULK_EMAIL_TYPES = [
  "order-confirmation",
  "paid-invoice",
  "invoice-sent",
  "invoice-reminder",
  "order-dispatch",
  "order-shipped",
  "order-ship-supplier",
];

/** Email log DB values (snake_case) → bulk API (kebab-case). */
const LOG_EMAIL_TYPE_TO_API = {
  invoice_sent: "invoice-sent",
  invoice_reminder: "invoice-reminder",
  paid_receipt: "paid-invoice",
  paid_receipt_admin: "paid-invoice",
  supplier_new_order: "order-ship-supplier",
  order_confirmation: "order-confirmation",
  order_dispatch: "order-dispatch",
  order_shipped: "order-shipped",
  order_ship_supplier: "order-ship-supplier",
};

/**
 * Convert an email-log `emailType` to bulk/email-helper API `emailType`.
 */
export function logEmailTypeToBulkApi(rawType) {
  if (rawType == null || rawType === "") return "";
  const key = String(rawType).trim();
  if (LOG_EMAIL_TYPE_TO_API[key]) return LOG_EMAIL_TYPE_TO_API[key];
  if (ALLOWED_BULK_EMAIL_TYPES.includes(key)) return key;
  const kebab = key.replace(/_/g, "-");
  if (ALLOWED_BULK_EMAIL_TYPES.includes(kebab)) return kebab;
  return kebab;
}

/** Human labels for email-log type values (filter dropdown + table). */
export const EMAIL_LOG_TYPE_LABELS = {
  invoice_sent: "Invoice sent",
  invoice_reminder: "Payment reminder",
  paid_receipt: "Paid receipt (customer)",
  paid_receipt_admin: "Paid receipt (admin/partner)",
  supplier_new_order: "Supplier new order",
  order_confirmation: "Order confirmation",
  order_dispatch: "Order dispatch",
  order_shipped: "Order shipped",
  order_ship_supplier: "Supplier new order",
  "order-confirmation": "Order confirmation",
  "order-dispatch": "Order dispatch",
  "order-shipped": "Order shipped",
  "order-ship-supplier": "Supplier new order",
  "invoice-sent": "Invoice sent",
  "invoice-reminder": "Payment reminder",
  "paid-invoice": "Paid invoice",
};

export function getEmailLogTypeLabel(emailType) {
  if (!emailType) return "—";
  return EMAIL_LOG_TYPE_LABELS[emailType] || emailType;
}
