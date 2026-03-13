export const DEFAULT_MAX_NUMBER_DIGITS = 10;

const countNumericDigits = (value = "") => String(value).replace(/\D/g, "").length;

export const hasExceededMaxNumericDigits = (
  value,
  maxDigits = DEFAULT_MAX_NUMBER_DIGITS
) => countNumericDigits(value) > maxDigits;

export const hasExceededMaxIntegerDigits = (
  value,
  maxDigits = DEFAULT_MAX_NUMBER_DIGITS
) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return true;
  const absValue = Math.abs(numericValue);
  if (absValue < 1) return false;
  return Math.floor(Math.log10(absValue)) + 1 > maxDigits;
};

export const normalizeQtyWithMaxDigits = (
  rawValue,
  maxDigits = DEFAULT_MAX_NUMBER_DIGITS
) => {
  const clean = String(rawValue ?? "")
    .replace(/\D/g, "")
    .slice(0, maxDigits);
  if (clean === "") return "";
  if (clean === "0") return 1;
  return parseInt(clean, 10);
};

export const preventInvalidNumberInputKeys = (
  e,
  maxDigits = DEFAULT_MAX_NUMBER_DIGITS
) => {
  if (["e", "E", "+", "-"].includes(e.key)) {
    e.preventDefault();
    return;
  }

  if (!/^\d$/.test(e.key)) return;

  const input = e.currentTarget;
  if (!input) return;

  const currentValue = String(input.value ?? "");
  const selectionStart = input.selectionStart ?? currentValue.length;
  const selectionEnd = input.selectionEnd ?? currentValue.length;

  const nextValue =
    currentValue.slice(0, selectionStart) +
    e.key +
    currentValue.slice(selectionEnd);

  if (countNumericDigits(nextValue) > maxDigits) {
    e.preventDefault();
  }
};

export const isValidTwoDecimalInput = (value) => {
  const stringValue = String(value);
  return stringValue === "" || /^\d*\.?\d{0,2}$/.test(stringValue);
};

export const formatToFixedTwo = (value) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const num = Number(raw);
  if (Number.isNaN(num) || num < 0) return "";
  return num.toFixed(2);
};
