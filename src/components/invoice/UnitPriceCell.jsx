"use client";
import React from "react";

/**
 * Unit price of an invoice product line. Users with the "Edit unit price" permission (the server
 * decides: order details → pricing.canEditUnitPrice) get an input; everyone else sees the price.
 * A custom price is final (no category discount on top) and stays on the invoice until reset.
 */
export default function UnitPriceCell({
  value,
  edited,
  canEdit,
  custom,
  catalogUnit,
  minUnit,
  onChange,
  onReset,
  resetLabel,
  note,
  testId,
}) {
  const num = Number(value);
  const shown = Number.isFinite(num) ? num.toFixed(2) : "0.00";
  const catalog = Number(catalogUnit);
  const hasCatalog = catalogUnit !== null && catalogUnit !== undefined && catalogUnit !== "" && Number.isFinite(catalog);
  const belowMin = minUnit != null && Number.isFinite(num) && Math.round(num * 100) < Math.round(Number(minUnit) * 100);

  if (!canEdit) {
    return (
      <div className="flex flex-col items-end gap-0.5">
        <span>{shown}</span>
        {custom && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
            Custom price
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-0.5">
      <input
        type="number"
        min={0.01}
        step="0.01"
        className={`w-24 border rounded px-1 py-1 text-right ${belowMin ? "border-red-400" : "border-gray-200"}`}
        value={edited ? (value ?? "") : Number.isFinite(num) ? Number(num.toFixed(2)) : ""}
        onWheel={(e) => e.currentTarget.blur()}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Unit price"
        data-testid={testId}
      />
      <div className="flex items-center gap-1.5 text-[10px] leading-tight">
        {custom && (
          <span className="font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">Custom</span>
        )}
        {hasCatalog && (custom || Math.round(num * 100) !== Math.round(catalog * 100)) && (
          <span className="text-gray-500">Catalog ${catalog.toFixed(2)}</span>
        )}
        {resetLabel && onReset && (
          <button type="button" onClick={onReset} className="text-theme underline">
            {resetLabel}
          </button>
        )}
      </div>
      {note && <span className="text-[10px] text-gray-500">{note}</span>}
      {belowMin && <span className="text-[10px] text-red-600">Min ${Number(minUnit).toFixed(2)} (partner wholesale)</span>}
    </div>
  );
}

/** Price fields for the update-order API: only what the user actually changed. */
export function unitPriceFields(line) {
  if (line?.resetPrice) return { resetPrice: true };
  if (line?.priceEdited) return { unitPrice: Number(line.unit) };
  return {};
}

/** First problem with the edited unit prices (shown before saving), or null. */
export function unitPriceProblem(lines) {
  for (const line of lines) {
    if (!line?.checked || !line?.priceEdited) continue;
    const name = line.product || line.productName || line.name || "a product";
    const n = Number(line.unit);
    if (line.unit === "" || !Number.isFinite(n)) return `Enter a unit price for ${name}.`;
    if (n < 0.01) return `Unit price for ${name} must be at least $0.01.`;
    if (Math.abs(n * 100 - Math.round(n * 100)) > 1e-6) return `Unit price for ${name} can have at most 2 decimals.`;
    if (line.minUnit != null && Math.round(n * 100) < Math.round(Number(line.minUnit) * 100)) {
      return `Minimum unit price for ${name} is $${Number(line.minUnit).toFixed(2)} (the partner's wholesale price).`;
    }
  }
  return null;
}
