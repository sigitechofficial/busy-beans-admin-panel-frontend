"use client";
import api from "./StatusErrorHandler";

export const DeleteAPI = async (url, feature = "", options = {}) => {
  const config = {
    headers: {
      feature,
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
    ...(options?.suppressSuccessToast ? { suppressSuccessToast: true } : {}),
  };

  try {
    const response = await api.delete(url, config);
    return response;
  } catch (err) {
    throw err;
  }
};
