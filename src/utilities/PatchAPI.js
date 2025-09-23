"use client";
import api from "./StatusErrorHandler";

export const PatchAPI = async (url, postData, feature = "", options = {}) => {
  const config = {
    headers: {
      feature,
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
    ...(options?.suppressSuccessToast ? { suppressSuccessToast: true } : {}),
  };

  try {
    const response = await api.patch(url, postData, config);
    return response;
  } catch (err) {
    throw err;
  }
};
