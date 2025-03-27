import axios from "axios";
import { BASE_URL } from "./URL";

export const PatchAPI = async (url, postData) => {
  let config = {
    headers: {
      accessToken: localStorage.getItem("accessToken"),
    },
  };
  try {
    let res = await axios.patch(
      BASE_URL + url,
      postData,
      config
    );
    return res;
  } catch (error) {}
};
