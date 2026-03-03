export const preventInvalidNumberInputKeys = (e) => {
  if (["e", "E", "+", "-"].includes(e.key)) {
    e.preventDefault();
  }
};

export const isValidTwoDecimalInput = (value) => {
  return value === "" || /^\d*\.?\d{0,2}$/.test(String(value));
};

export const formatToFixedTwo = (value) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const num = Number(raw);
  if (Number.isNaN(num) || num < 0) return "";
  return num.toFixed(2);
};
