"use client";
import api from "./StatusErrorHandler";

export const PostAPI = async (url, postData, feature = "", options = {}, header = {}) => {
  const config = {
    headers: {
      feature,
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      ...header,
    },
    ...(options?.suppressSuccessToast ? { suppressSuccessToast: true } : {}),
  };

  try {
    const response = await api.post(url, postData, config);
    return response;
  } catch (err) {
    throw err;
  }
};

export const SignupAPI = async (url, postData, options = {}) => {
  try {
    const response = await api.post(url, postData, {
      ...(options?.suppressSuccessToast ? { suppressSuccessToast: true } : {}),
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const loginAPI = async (url, postData, options = {}) => {
  try {
    const response = await api.post(url, postData, {
      ...(options?.suppressSuccessToast ? { suppressSuccessToast: true } : {}),
    });
    return response;
  } catch (err) {
    throw err;
  }
};
