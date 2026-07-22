export const MIN_TRACKING_NUMBER_LENGTH = 5;

/** Letters, numbers, and hyphens only (blocks emojis and other symbols). */
const TRACKING_NUMBER_PATTERN = /^[A-Za-z0-9\-]+$/;

export const sanitizeTrackingNumberInput = (value) =>
  String(value ?? "").replace(/[^A-Za-z0-9\-]/g, "");

export const validateTrackingNumber = (value) => {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return "Tracking number is required";
  if (trimmed.length < MIN_TRACKING_NUMBER_LENGTH) {
    return `Tracking number must be at least ${MIN_TRACKING_NUMBER_LENGTH} characters`;
  }
  if (!TRACKING_NUMBER_PATTERN.test(trimmed)) {
    return "Tracking number can only contain letters, numbers, and hyphens";
  }
  return "";
};
