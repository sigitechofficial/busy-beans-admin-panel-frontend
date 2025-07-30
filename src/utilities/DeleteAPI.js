"use client";

import axios from "axios";
import { BASE_URL } from "./URL";

export const DeleteAPI = async (url) => {
  let config = {
    headers: {
      // accessToken: localStorage.getItem("accessToken"),
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  };
  try {
    let response = await axios.delete(BASE_URL + `${url}`, config);
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
      throw new Error(`HTTP Error: - ${errorMessage}`);
    } else if (error.request) {
      throw new Error("Network Error: No response received from the server.");
    } else {
      throw new Error(`Error: ${error.message}`);
    }
  }
};
