'use client'
import { useEffect, useState } from "react";
import { info_toaster } from "./Toaster";
import axios from "axios";
import { BASE_URL } from "./URL";

const GetAPI = (url) => {
  const [data, setData] = useState([]);
  useEffect(() => {
    var config = {
      headers: {
        accessToken: localStorage.getItem("accessToken"),
      },
    };
    const fetchData = () => {
      axios.get(BASE_URL + url, config).then((dat) => {
        setData(dat.data);
      });
    };
    fetchData();
  }, [url]);

  const reFetch = async () => {
    var config = {
      headers: {
        accessToken: localStorage.getItem("accessToken"),
      },
    };
    try {
      axios.get(BASE_URL + url, config).then((dat) => {
        setData(dat.data);
      });
    } catch (err) {
      info_toaster(err);
    }
  };

  return { data, reFetch };
};

export const GetPackages = (url) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(BASE_URL + url, {
          headers: {
            accessToken: localStorage.getItem("accessToken"),
          },
        });
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [url]);
  return data;
};
export default GetAPI;
