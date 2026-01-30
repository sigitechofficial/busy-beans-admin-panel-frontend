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
import { Dialog } from "primereact/dialog";
import { ORDERS_CREATE } from "../orders.testids"

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
  const [viewMode, setViewMode] = useState("admin"); // "admin" or "localPartner"
  const [selectedPartnerId, setSelectedPartnerId] = useState(null);
  const [selectedPartnerName, setSelectedPartnerName] = useState(null);
  const [partnerModalVisible, setPartnerModalVisible] = useState(false);
  const [tempSelectedPartner, setTempSelectedPartner] = useState(null);

  const { data: category, isLoading } = GetAPI(`api/v1/admin/category?status=1`);
  const { data: salesRepData } = GetAPI("api/v1/admin/sales-rep");
  
  let categoryList = [{ value: "", label: "All" }];
  if (category) {
    category?.data?.data?.map((cat) => {
      categoryList.push({ value: cat?.id, label: cat?.name });
    });
  }

  // Build partner options
  const partnerOptions = [];
  if (salesRepData?.data?.data) {
    salesRepData.data.data.map((partner) => {
      partnerOptions.push({
        value: partner?.id,
        label: `${partner?.srName} (${partner?.territoryName})`,
        srName: partner?.srName,
      });
    });
  }

  // Handle Local Partner tab click
  const handleLocalPartnerClick = () => {
    if (selectedPartnerId) {
      // If partner already selected, just switch to local partner mode
      setViewMode("localPartner");
    } else {
      // If no partner selected, open modal
      setPartnerModalVisible(true);
    }
  };

  // Handle partner selection in modal
  const handlePartnerSelect = (selectedOption) => {
    setTempSelectedPartner(selectedOption);
  };

  // Confirm partner selection
  const handleConfirmPartner = () => {
    if (tempSelectedPartner) {
      setSelectedPartnerId(tempSelectedPartner.value);
      setSelectedPartnerName(tempSelectedPartner.srName);
      setViewMode("localPartner");
      setPartnerModalVisible(false);
      setTempSelectedPartner(null);
      // Clear any existing admin products from view
      setCreateOrderData([]);
      localStorage.setItem("createOrderData", JSON.stringify([]));
    } else {
      info_toaster("Please select a partner");
    }
  };

  // Clear partner selection
  const handleClearPartner = () => {
    setSelectedPartnerId(null);
    setSelectedPartnerName(null);
    setViewMode("admin");
    setTempSelectedPartner(null);
    // Clear any partner products from view when switching back to admin
    setCreateOrderData([]);
    localStorage.setItem("createOrderData", JSON.stringify([]));
  };

  // Build product URL based on view mode
  let url = "";
  if (viewMode === "admin") {
    // Admin view - use original URL
    url = filterId
      ? `api/v1/admin/product?categoryId=${filterId}`
      : `api/v1/admin/product?status=1`;
  } else {
    // Local Partner view - only build URL if partner is selected
    if (selectedPartnerId) {
      const params = new URLSearchParams();
      params.set("page", "1");
      params.set("limit", "100");
      params.set("salesRepId", selectedPartnerId.toString());
      if (filterId) {
        params.set("categoryId", filterId);
      }
      url = `api/v1/admin/products/sales-rep?${params.toString()}`;
    } else {
      // Don't hit API if no partner is selected
      url = "";
    }
  }

  const { data, reFetch, isLoading: productsLoading } = GetAPI(url || "");
  
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

  // Handle different data structures from admin vs sales-rep API
  const productsArray = url && data
    ? (Array.isArray(data?.data?.data)
        ? data?.data?.data
        : Array.isArray(data?.data)
        ? data?.data
        : [])
    : [];

  const filteredProducts = productsArray?.filter((item) => {
    const search = searchTerm.trim().toLowerCase();
    return (
      item?.name?.toLowerCase().trim().includes(search) ||
      item?.sku?.toLowerCase().trim().includes(search) ||
      item?.productCode?.toLowerCase().trim().includes(search)
    );
  });

  // Show loader for category loading or when switching to partner view and products are loading
  const showLoader = isLoading || (viewMode === "localPartner" && selectedPartnerId && productsLoading);

  return showLoader ? (
      <Loader />
    ) : (
    <div data-testid={ORDERS_CREATE.root}>
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed"
        data-testid={ORDERS_CREATE.headerBar} >
        <div className="flex items-center gap-2">
          <p onClick={() => setToggle(!toggle)} className="cursor-pointer md:hidden">
            <CiMenuBurger size={20} />
          </p>
          <h2 className="text-xl font-inter font-semibold">Create Order</h2>
        </div>
        <div className="flex items-center gap-3">
          <Select
            onChange={(e) => setFilterId(e?.value)}
            placeholder="Category"
            options={categoryList}
            className="w-40"
            styles={selectStyles}
            data-testid={ORDERS_CREATE.categorySelect}
          />
        </div>
      </div>

      <div className="space-y-8 pt-28 2xl:pt-32 px-6 2xl:px-12">
        {/* View Mode Selection Section */}
        <div className="bg-white rounded-lg border border-borderColor shadow-tableShadow p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <span className="text-sm font-semibold text-gray-700">View Products:</span>
              <div className="flex items-center gap-1 border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => {
                    setViewMode("admin");
                    handleClearPartner();
                  }}
                  className={`px-6 py-2.5 text-sm font-medium transition-all duration-200 ${
                    viewMode === "admin"
                      ? "bg-theme text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Admin
                </button>
                <div className="w-px h-6 bg-gray-200"></div>
                <button
                  onClick={handleLocalPartnerClick}
                  className={`px-6 py-2.5 text-sm font-medium transition-all duration-200 relative ${
                    viewMode === "localPartner"
                      ? "bg-theme text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {selectedPartnerName || "Local Partner"}
                  {selectedPartnerId && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearPartner();
                      }}
                      className="ml-2 text-xs opacity-75 hover:opacity-100"
                      title="Clear selection"
                    >
                      ×
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Partner Selection Modal */}
        <Dialog
          visible={partnerModalVisible}
          onHide={() => {
            setPartnerModalVisible(false);
            setTempSelectedPartner(null);
          }}
          dismissableMask={true}
          header="Select Local Partner"
          className="font-nunito"
          style={{ width: "90vw", maxWidth: "500px" }}
          contentStyle={{ 
            padding: "1.5rem",
            maxHeight: "70vh",
            overflow: "visible"
          }}
          footer={
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setPartnerModalVisible(false);
                  setTempSelectedPartner(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPartner}
                className="px-4 py-2 bg-theme text-white rounded-lg hover:bg-themeDark font-medium transition-colors"
              >
                Confirm
              </button>
            </div>
          }
        >
          <div className="space-y-4" style={{ minHeight: "150px" }}>
            <p className="text-sm text-gray-600 mb-4">
              Please select a local partner to view their products:
            </p>
            <div style={{ position: "relative", zIndex: 9999 }}>
              <Select
                onChange={handlePartnerSelect}
                placeholder="Select a partner..."
                options={partnerOptions}
                value={tempSelectedPartner}
                styles={{
                  ...selectStyles,
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  menu: (base) => ({ 
                    ...base, 
                    zIndex: 9999,
                    maxHeight: "300px",
                    overflowY: "auto"
                  }),
                }}
                menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                menuPosition="fixed"
                isSearchable
              />
            </div>
          </div>
        </Dialog>

        <div className="relative">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="w-[220px] sm:w-[300px] md:w-[360px] h-10 md:h-12 bg-themeGray rounded-lg ps-10 pe-5 outline-none placeholder:font-inter placeholder:font-medium focus:bg-gray-200"
            data-testid={ORDERS_CREATE.searchInput}
          />
          <LuSearch size={20} color="#111827" className="absolute top-3.5 left-3" />
        </div>
        <div className="space-y-4 relative">
          {/* Show message when Local Partner mode is selected but no partner is chosen */}
          {viewMode === "localPartner" && !selectedPartnerId && (
            <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-5">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700 font-medium">
                    Please select a Local Partner to view their products.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Only show products when we have valid data and not in transition state */}
          {!showLoader && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6"
              data-testid={ORDERS_CREATE.productsGrid}>
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
                  price={viewMode === "localPartner" && item?.customPrice ? item?.customPrice : item?.price}
                  handlePlus={handlePlus}
                  handleMinus={handleMinus}
                  data-testid={ORDERS_CREATE.productCard(item?.id)}
                />
              ))}
            </div>
          )}

          {/* Show empty state when no products found */}
          {!showLoader && viewMode === "localPartner" && selectedPartnerId && filteredProducts?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found for this partner.</p>
            </div>
          )}

          <div className="fixed right-10 bottom-10">
            <button
              onClick={() =>
                createOrderData?.length > 0
                  ? setVisibleRight(true)
                  : info_toaster("No Item is Selected")
              }
              className="text-xl rounded-lg font-inter font-medium text-white px-2 sm:px-4 py-2.5 sm:py-4 bg-theme"
              data-testid={ORDERS_CREATE.openDrawerBtn}
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
            selectedPartnerId={selectedPartnerId}
            selectedPartnerName={selectedPartnerName}
            onPartnerChange={() => {
              // Clear cart and reset when partner changes (admin only)
              if (typeof window !== "undefined" && localStorage.getItem("userType") === "admin") {
                setCreateOrderData([]);
                localStorage.setItem("createOrderData", JSON.stringify([]));
                setSelectedPartnerId(null);
                setSelectedPartnerName(null);
                setViewMode("admin");
              }
              setCreateOrderData([]);
              localStorage.setItem("createOrderData", JSON.stringify([]));
              setSelectedPartnerId(null);
              setSelectedPartnerName(null);
              setViewMode("admin");
            }}
          />
        </div>
      </div>
    </div>
  );
}
