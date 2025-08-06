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
import { CiMenuBurger } from "react-icons/ci";
import { LuSearch } from "react-icons/lu"; 
import { useDataContext } from "@/utilities/DataContext";

export default function CreateOrder() {
  if (typeof window !== "undefined") {
    var createOrderDataList =
      JSON.parse(localStorage.getItem("createOrderData")) || [];
    // var userID = localStorage.getItem("userID");
    // var connectAccountId = localStorage.getItem("connectAccountId");
    // var isAccountConnected = localStorage.getItem("isAccountConnected");
    // var url = window.location.href;
  }
  const [filterId, setFilterId] = useState("");
  const [createOrderData, setCreateOrderData] = useState(createOrderDataList);
  const [visibleRight, setVisibleRight] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: category } = GetAPI(`api/v1/admin/category`);
  let categoryList = [{ value: "", label: "All" }];
  if (category) {
    category?.data?.data?.map((cat) => {
      categoryList.push({ value: cat?.id, label: cat?.name });
    });
  }
  const url = filterId
    ? `api/v1/admin/product?categoryId=${filterId}`
    : `api/v1/admin/product`;

  const { data, reFetch } = GetAPI(url);
  
  const handlePlus = (id, itemQuantity) => {
    const findItemIndex = createOrderData?.findIndex((item) => item?.id === id);
    if (findItemIndex === -1) {
      const item = data?.data?.data.find((item) => item?.id === id);
      createOrderData.push({ ...item, qty: itemQuantity });
      setCreateOrderData([...createOrderData]);
      localStorage.setItem("createOrderData", JSON.stringify(createOrderData));
      // success_toaster("Item Added Successfully");
    } else {
      createOrderData[findItemIndex]["qty"] = itemQuantity;
      setCreateOrderData(createOrderData);
      localStorage.setItem("createOrderData", JSON.stringify(createOrderData));
      // success_toaster("Item Updated Successfully");
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
        // success_toaster("Item Removed Successfully");
      } else {
        createOrderData[findItemIndex]["qty"] = itemQuantity;
        setCreateOrderData(createOrderData);
        localStorage.setItem(
          "createOrderData",
          JSON.stringify(createOrderData)
        );
        // success_toaster("Item Updated Successfully");
      }
    }
  };

  const handleQty = (id) => {
    const createOrderData =
      JSON.parse(localStorage.getItem("createOrderData")) || [];
    const InventoryItem = createOrderData.find((item) => item?.id === id);
    return InventoryItem ? Number(InventoryItem?.qty) : 0;
  };

  // const handleConnectAccount = async () => {
  //   const path = url.split("/");
  //   if (isAccountConnected === "false" && connectAccountId !== "null") {
  //     try {
  //       const res = await axios.post(
  //         BASE_URL + `api/v1/admin/stripe-connect-account-url/${userID}`,
  //         {
  //           returnUrl:
  //             "https://" +
  //             path[2].trim() +
  //             "/sales-representative/stripe-account-connected",
  //         }
  //       );
  //       if (res?.data?.status === "success") {
  //         success_toaster(res?.data?.data?.message);
  //         if (res?.data?.data?.data?.connectAccount) {
  //           const link = document.createElement("a");
  //           link.href = res?.data?.data?.data?.connectAccount;
  //           link.target = "_self";
  //           link.click();
  //         }
  //       } else {
  //         throw new Error(
  //           res?.data?.message || "An unexpected error occurred."
  //         );
  //       }
  //     } catch (error) {
  //       ErrorHandler(error);
  //     }
  //   }
  //   if (
  //     (connectAccountId === "null" || !connectAccountId) &&
  //     isAccountConnected === "false"
  //   ) {
  //     try {
  //       const res = await axios.post(
  //         BASE_URL + `api/v1/admin/create-stripe-connect-account/${userID}`,
  //         {
  //           returnUrl:
  //             "https://" +
  //             path[2].trim() +
  //             "/sales-representative/stripe-account-connected",
  //         }
  //       );
  //       if (res?.data?.status === "success") {
  //         success_toaster(res?.data?.data?.message);
  //         localStorage.setItem(
  //           "connectAccountId",
  //           res?.data?.data?.data?.accountId
  //         );
  //         if (res?.data?.data?.data?.accountLink?.url) {
  //           const link = document.createElement("a");
  //           link.href = res?.data?.data?.data?.accountLink?.url;
  //           link.target = "_self";
  //           link.click();
  //         }
  //       } else {
  //         throw new Error(
  //           res?.data?.message || "An unexpected error occurred."
  //         );
  //       }
  //     } catch (error) {
  //       ErrorHandler(error);
  //     }
  //   }
  // };
  const { toggle, setToggle } = useDataContext();

  const filteredProducts = data?.data?.data?.filter((item) => {
    const search = searchTerm.toLowerCase();
    return (
      item?.name?.toLowerCase().includes(search) ||
      item?.sku?.toLowerCase().includes(search) ||
      item?.productCode?.toLowerCase().includes(search) ||
      String(item?.price).toLowerCase().includes(search) ||
      String(item?.wholesalePrice).toLowerCase().includes(search) ||
      String(item?.weight).toLowerCase().includes(search)
    );
  });

  return data?.length === 0 ? (
    <Loader />
  ) : (
    <div>
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed">
        <div className="flex items-center gap-2">
          <p onClick={() => setToggle(!toggle)} className="cursor-pointer md:hidden">
            <CiMenuBurger size={20} />
          </p>
          <h2 className="text-xl font-inter font-semibold">Create Order</h2>
        </div>
          <Select
            onChange={(e) => setFilterId(e?.value)}
            placeholder="Category"
            options={categoryList}
            className="w-40"
            styles={selectStyles}
          />
      </div>

      <div className="space-y-8 pt-28 2xl:pt-32 px-6 2xl:px-12">
        {/* <div className="flex items-center justify-between">
        <h2 className="text-xl lg:text-2xl font-inter font-semibold">
          Create Order
        </h2>

        <Select placeholder="Filters" className="w-40" styles={selectStyles} />
        <div className="flex items-center gap-x-4">
      <div>
        <button className="flex items-center gap-x-2 px-2 sm:px-5 md:px-8 py-2.5 md:py-3 rounded-lg shadow-buttonShadow border border-buttonBorderColor bg-white ">
          <RiFileDownloadLine size={24} />
          <span className="font-nunito text-black">Download CSV</span>
        </button>
      </div>
    </div>
      </div> */}
        {/* <div
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
      </div> */}
        <div className="relative">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="w-[220px] sm:w-[300px] md:w-[360px] h-10 md:h-12 bg-themeGray rounded-lg ps-10 pe-5 outline-none placeholder:font-inter placeholder:font-medium focus:bg-gray-200"
          />
          <LuSearch size={20} color="#111827" className="absolute top-3.5 left-3" />
        </div>
        <div className="space-y-4 relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {filteredProducts?.map((item, i) => (
              <StockCard
                key={i}
                id={item?.id}
                itemName={item?.name}
                grind={item?.grind}
                productCode={item?.productCode}
                sku={item?.sku}
                // stock={item?.quantity}
                weight={item?.weight}
                unit={item?.unit}
                imageURL={item?.image}
                qty={handleQty(item?.id)}
                wholesalePrice={item?.wholesalePrice}
                price={item?.price}
                handlePlus={handlePlus}
                handleMinus={handleMinus}
              />
            ))}
          </div>

          <div className="fixed right-10 bottom-10">
            <button
              onClick={() =>
                createOrderData?.length > 0
                  ? setVisibleRight(true)
                  : info_toaster("No Item is Selected")
              }
              className="text-xl rounded-lg font-inter font-medium text-white px-2 sm:px-4 py-2.5 sm:py-4 bg-theme"
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
            quotationData={createOrderData}
            type="createOrder"
          />
        </div>
      </div>
    </div>
  );
}
