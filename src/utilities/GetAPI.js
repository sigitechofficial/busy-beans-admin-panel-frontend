"use client";
import { useEffect, useState } from "react";
import { error_toaster } from "./Toaster";
import api from "./StatusErrorHandler";

const GetAPI = (url, feature = "") => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!url) return; 

    const config = {
      headers: {
        feature,
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    };

    const fetchData = async () => {
      try {
        const dat = await api.get(url, config);
        setData(dat.data);
      } catch (error) {
        if (error.response) {
          const errorMessage =
            error.response.data?.message ||
            error.response.statusText ||
            "Server Error";
          error_toaster(
            `HTTP Error: ${error.response.status} - ${errorMessage}`
          );
        } else if (error.request) {
          error_toaster("Network Error: No response received from the server.");
        } else {
          error_toaster(`Error: ${error.message}`);
        }
      }
    };

    fetchData();
  }, [url, feature]);

  const reFetch = async () => {
    if (!url) return; 

    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    };

    try {
      const dat = await api.get(url, config);
      setData(dat.data);
    } catch (error) {
      if (error.response) {
        const errorMessage =
          error.response.data?.message ||
          error.response.statusText ||
          "Server Error";
        error_toaster(`HTTP Error: ${error.response.status} - ${errorMessage}`);
      } else if (error.request) {
        error_toaster("Network Error: No response received from the server.");
      } else {
        error_toaster(`Error: ${error.message}`);
      }
    }
  };

  return { data, reFetch };
};

export const GetPackages = (url) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!url) return; 

    const fetchData = async () => {
      try {
        const response = await api.get(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        setData(response.data);
      } catch (error) {
        if (error.response) {
          const errorMessage =
            error.response.data?.message ||
            error.response.statusText ||
            "Server Error";
          error_toaster(
            `HTTP Error: ${error.response.status} - ${errorMessage}`
          );
        } else if (error.request) {
          error_toaster("Network Error: No response received from the server.");
        } else {
          error_toaster(`Error: ${error.message}`);
        }
      }
    };

    fetchData();
  }, [url]);

  return data;
};

export default GetAPI;
