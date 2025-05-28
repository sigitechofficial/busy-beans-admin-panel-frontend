export const emailValidity = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const passwordStrength = {
  weak: /^(?=.*[a-z]).{6,}$/, // Minimum 6 characters with at least one lowercase letter
  medium: /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/, // Minimum 6 characters with at least one lowercase and one uppercase letter
  strong: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}|:;<>?]).{6,}$/, // Minimum 6 characters with at least one lowercase, one uppercase, one digit, and one special character
};