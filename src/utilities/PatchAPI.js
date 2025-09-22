import { info_toaster } from "./Toaster";
import api from "./StatusErrorHandler";

export const PatchAPI = async (url, postData, feature='') => {
  let config = {
    headers: {
      // accessToken: localStorage.getItem("accessToken"),
      feature,
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  };
  try {
    let response = await api.patch(url, postData, config);
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

      info_toaster(errorMessage);
      throw new Error(`HTTP Error: - ${errorMessage}`);
    } else if (error.request) {
      throw new Error("Network Error: No response received from the server.");
    } else {
      throw new Error(`Error: ${error.message}`);
    }
  }
};
