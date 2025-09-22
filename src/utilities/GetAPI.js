"use client";
import { useEffect, useState } from "react";
import api from "./StatusErrorHandler";

const GetAPI = (url, feature = "") => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!url) return;

    const config = {
      headers: {
        feature,
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    };

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(url, config);
        setData(res.data);
        setError("");
      } catch (err) {
        setError(err?.normalizedMessage || err?.message || "Request failed.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [url, feature]);

  const reFetch = async () => {
    if (!url) return;
    setIsLoading(true);
    try {
      const res = await api.get(url, {
        headers: {
          feature,
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      setData(res.data);
      setError("");
    } catch (err) {
      setError(err?.normalizedMessage || err?.message || "Request failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return { data, reFetch, isLoading, error };
};

export const GetPackages = (url) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!url) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        setData(res.data);
        setError("");
      } catch (err) {
        setError(err?.normalizedMessage || err?.message || "Request failed.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, isLoading, error };
};

export default GetAPI;
