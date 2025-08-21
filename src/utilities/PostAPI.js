"use client";
import api from "./StatusErrorHandler";
import { error_toaster } from "./Toaster";

export const PostAPI = async (url, postData, feature='') => {
  let config = {
    headers: {
      // accessToken: localStorage.getItem("accessToken"),
      feature,
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  };

  try {
    let response = await api.post(url, postData, config);
    if (!response) {
      throw new Error("No response from server.");
    } else if (response?.status == "error") {
      throw new Error(response?.message || "Somethong went wrong.");
    }
    return response;
  } catch (error) {
    if (error.response) {
      const errorMessage =
        error.response.data?.message ||
        error.response.statusText ||
        "Server Error";
      throw new Error(`${errorMessage}`);
    } else if (error.request) {
      throw new Error("Network Error: No response received from the server.");
    } else {
      throw new Error(`${error.message}`);
    }
  }
};

export const SignupAPI = async (url, postData) => {
  try {
    let response = await api.post(url, postData);
    if (!response) {
      throw new Error("No response from server.");
    } else if (response?.status == "error") {
      throw new Error(response?.message || "Somethong went wrong.");
    }
    return response;
  } catch (error) {
    if (error.response) {
      const errorMessage =
        error.response.data?.message ||
        error.response.statusText ||
        "Server Error";
      throw new Error(`${errorMessage}`);
    } else if (error.request) {
      throw new Error("Network Error: No response received from the server.");
    } else {
      throw new Error(`${error.message}`);
    }
  }
};

export const loginAPI = async (url, postData) => {
  try {
    const response = await api.post(url, postData);
    if (!response) {
      throw new Error("No response from server.");
    } else if (response?.status == "error") {
      throw new Error(response?.message || "Somethong went wrong.");
    }
    return response;
  } catch (error) {
    if (error.response) {
      const errorMessage =
        error.response.data?.message ||
        error.response.statusText ||
        "Server Error";
      throw new Error(`${errorMessage}`);
    } else if (error.request) {
      throw new Error("Network Error: No response received from the server.");
    } else {
      throw new Error(`${error.message}`);
    }
  }
};
