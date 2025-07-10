import axios from "axios";
import { BASE_URL } from "./URL";
import { info_toaster } from "./Toaster";

export const PatchAPI = async (url, postData) => {
  let config = {
    headers: {
      accessToken: localStorage.getItem("accessToken"),
    },
  };
  try {
    let response = await axios.patch(
      BASE_URL + url,
      postData,
      config
    );
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

        info_toaster(errorMessage)
      throw new Error(`HTTP Error: - ${errorMessage}`);
    } else if (error.request) {
      throw new Error("Network Error: No response received from the server.");
    } else {
      throw new Error(`Error: ${error.message}`);
    }
  }
};
