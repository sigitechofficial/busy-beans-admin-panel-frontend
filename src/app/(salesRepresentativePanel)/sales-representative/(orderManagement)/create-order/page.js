"use client";
import { useState } from "react";
import Loader from "@/components/ui/Loader";
import StockCard from "@/components/ui/StockCard";
import GetAPI from "@/utilities/GetAPI";
import DrawerBeans from "@/components/ui/DrawerBeans";
import Select from "react-select";
import selectStyles, { selectStyles2 } from "@/utilities/SelectStyle";
import { info_toaster, success_toaster } from "@/utilities/Toaster";
import ErrorHandler from "@/utilities/ErrorHandler";
import { BASE_URL } from "@/utilities/URL";
import axios from "axios";

export default function CreateOrder() {
  if (typeof window !== "undefined") {
    var createOrderDataList =
      JSON.parse(localStorage.getItem("createOrderData")) || [];
    var userID = localStorage.getItem("userID");
    var connectAccountId = localStorage.getItem("connectAccountId");
    var isAccountConnected = localStorage.getItem("isAccountConnected");
    var url = window.location.href;
  }

  const [createOrderData, setCreateOrderData] = useState(createOrderDataList);
  const [visibleRight, setVisibleRight] = useState(false);

  const { data, reFetch } = GetAPI("api/v1/admin/product");

  const handlePlus = (id, itemQuantity) => {
    const findItemIndex = createOrderData?.findIndex((item) => item?.id === id);
    if (findItemIndex === -1) {
      const item = data?.data?.data.find((item) => item?.id === id);
      createOrderData.push({ ...item, qty: itemQuantity });
      setCreateOrderData([...createOrderData]);
      localStorage.setItem("createOrderData", JSON.stringify(createOrderData));
      success_toaster("Item Added Successfully");
    } else {
      createOrderData[findItemIndex]["qty"] = itemQuantity;
      setCreateOrderData(createOrderData);
      localStorage.setItem("createOrderData", JSON.stringify(createOrderData));
      success_toaster("Item Updated Successfully");
    }
  };

  const handleMinus = (id, itemQuantity) => {
    const findItemIndex = createOrderData?.findIndex((item) => item?.id === id);
    if (findItemIndex !== -1) {
      if (itemQuantity === 0) {
        const filteredQuotationItem = createOrderData?.filter(
          (item) => item?.id !== id
        );
        setCreateOrderData(filteredQuotationItem);
        localStorage.setItem(
          "createOrderData",
          JSON.stringify(filteredQuotationItem)
        );
        success_toaster("Item Removed Successfully");
      } else {
        createOrderData[findItemIndex]["qty"] = itemQuantity;
        setCreateOrderData(createOrderData);
        localStorage.setItem(
          "createOrderData",
          JSON.stringify(createOrderData)
        );
        success_toaster("Item Updated Successfully");
      }
    }
  };

  const handleQty = (id) => {
    const createOrderData =
      JSON.parse(localStorage.getItem("createOrderData")) || [];
    const InventoryItem = createOrderData.find((item) => item?.id === id);
    return InventoryItem ? Number(InventoryItem?.qty) : 0;
  };

  const handleConnectAccount = async () => {
    const path = url.split("/");
    if (isAccountConnected === "false" && connectAccountId !== "null") {
      try {
        const res = await axios.post(
          BASE_URL + `api/v1/admin/stripe-connect-account-url/${userID}`,
          {
            returnUrl:
              "https://" +
              path[2].trim() +
              "/sales-representative/stripe-account-connected",
          }
        );
        if (res?.data?.status === "success") {
          success_toaster(res?.data?.data?.message);
          if (res?.data?.data?.data?.connectAccount) {
            const link = document.createElement("a");
            link.href = res?.data?.data?.data?.connectAccount;
            link.target = "_self";
            link.click();
          }
        } else {
          throw new Error(
            res?.data?.message || "An unexpected error occurred."
          );
        }
      } catch (error) {
        ErrorHandler(error);
      }
    }
    if (
      (connectAccountId === "null" || !connectAccountId) &&
      isAccountConnected === "false"
    ) {
      try {
        const res = await axios.post(
          BASE_URL + `api/v1/admin/create-stripe-connect-account/${userID}`,
          {
            returnUrl:
              "https://" +
              path[2].trim() +
              "/sales-representative/stripe-account-connected",
          }
        );
        if (res?.data?.status === "success") {
          success_toaster(res?.data?.data?.message);
          localStorage.setItem(
            "connectAccountId",
            res?.data?.data?.data?.accountId
          );
          if (res?.data?.data?.data?.accountLink?.url) {
            const link = document.createElement("a");
            link.href = res?.data?.data?.data?.accountLink?.url;
            link.target = "_self";
            link.click();
          }
        } else {
          throw new Error(
            res?.data?.message || "An unexpected error occurred."
          );
        }
      } catch (error) {
        ErrorHandler(error);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl lg:text-2xl font-inter font-semibold">
          Create Order
        </h2>

        <Select placeholder="Filters" className="w-40" styles={selectStyles} />
        {/* <div className="flex items-center gap-x-4">
      <div>
        <button className="flex items-center gap-x-2 px-2 sm:px-5 md:px-8 py-2.5 md:py-3 rounded-lg shadow-buttonShadow border border-buttonBorderColor bg-white ">
          <RiFileDownloadLine size={24} />
          <span className="font-nunito text-black">Download CSV</span>
        </button>
      </div>
    </div> */}
      </div>
      <div
        className={`${
          connectAccountId !== "null" && isAccountConnected === "true"
            ? "hidden"
            : "flex justify-end"
        }`}
      >
        <button
          onClick={handleConnectAccount}
          className="rounded-lg font-inter font-medium text-white px-2 sm:px-3 py-2.5 sm:py-4 bg-theme"
        >
          {(connectAccountId === "null" || !connectAccountId) &&
          isAccountConnected === "false"
            ? "Connect Account"
            : "Complete Account Registration"}
        </button>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {data?.data?.data?.map((item, i) => (
            <StockCard
              key={i}
              id={item?.id}
              itemName={item?.name}
              quantity={item?.quantity}
              unit={item?.unit}
              imageURL={item?.image}
              qty={handleQty(item?.id)}
              handlePlus={handlePlus}
              handleMinus={handleMinus}
            />
          ))}
        </div>
        <div className="flex justify-end relative">
          <button
            onClick={() => setVisibleRight(true)}
            className="rounded-lg font-inter font-medium text-white px-2 sm:px-3 py-2.5 sm:py-4 bg-theme"
          >
            Create Order
            <div className="absolute -right-3 -top-3 bg-black size-7 rounded-full text-lg">
              {createOrderData?.length}
            </div>
          </button>
        </div>
        <DrawerBeans
          drawerOpen={visibleRight}
          setDrawerOpen={setVisibleRight}
          setQuotationData={setCreateOrderData}
          type="createOrder"
        />
      </div>
    </div>
  );
}
