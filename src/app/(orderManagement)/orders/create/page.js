"use client";
import { useState } from "react";
import Image from "next/image";
import Loader from "@/components/ui/Loader";
import MiniLoader from "@/components/ui/MiniLoader";
import StockCard from "@/components/ui/StockCard";
import GetAPI from "@/utilities/GetAPI";
import { PatchAPI } from "@/utilities/PatchAPI";
import { PostAPI } from "@/utilities/PostAPI";
import DrawerBeans from "@/components/ui/DrawerBeans";
import Select from "react-select";
import selectStyles, { selectStyles2 } from "@/utilities/SelectStyle";
import { info_toaster, success_toaster } from "@/utilities/Toaster";
import ErrorHandler from "@/utilities/ErrorHandler";
import { BASE_URL } from "@/utilities/URL";
import axios from "axios";
import { CiMenuBurger } from "react-icons/ci";
import { LuSearch } from "react-icons/lu";
import { MdEdit } from "react-icons/md";
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
  const [changePriceModalVisible, setChangePriceModalVisible] = useState(false);
  const [priceModalSearch, setPriceModalSearch] = useState("");
  const [editablePrices, setEditablePrices] = useState({}); // { productId: { price, wholesalePrice } }
  const [submitPriceLoader, setSubmitPriceLoader] = useState(false);
  const [addProductModalVisible, setAddProductModalVisible] = useState(false);
  const [addProductSearch, setAddProductSearch] = useState("");
  const [addProductPrices, setAddProductPrices] = useState({}); // { productId: { price, wholesalePrice } }
  const [submitAddProductLoader, setSubmitAddProductLoader] = useState(false);
  const [selectedAddProducts, setSelectedAddProducts] = useState([]); // Array of selected productIds

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

  // Fetch partner inventory for change price modal
  const partnerInventoryUrl = changePriceModalVisible && selectedPartnerId
    ? `api/v1/admin/products/sales-rep?salesRepId=${selectedPartnerId}&page=1&limit=100`
    : "";
  const { data: partnerInventoryData, isLoading: partnerInventoryLoading } = GetAPI(partnerInventoryUrl, "partner-inventory");

  // Extract partner inventory products
  const partnerInventoryProducts = partnerInventoryUrl && partnerInventoryData
    ? (Array.isArray(partnerInventoryData?.data?.data)
        ? partnerInventoryData?.data?.data
        : Array.isArray(partnerInventoryData?.data)
        ? partnerInventoryData?.data
        : [])
    : [];

  // Filter products in change price modal
  const filteredPriceModalProducts = partnerInventoryProducts.filter((item) => {
    const search = priceModalSearch.trim().toLowerCase();
    return (
      item?.name?.toLowerCase().includes(search) ||
      item?.sku?.toLowerCase().includes(search) ||
      item?.productCode?.toLowerCase().includes(search)
    );
  });

  // Fetch products for add product modal
  const addProductUrl = addProductModalVisible && selectedPartnerId
    ? `api/v1/admin/products/sales-rep/import/${selectedPartnerId}`
    : "";
  const { data: addProductData, isLoading: addProductLoading } = GetAPI(addProductUrl, "add-product-import");

  // Extract add product list
  const addProductList = addProductUrl && addProductData
    ? (Array.isArray(addProductData?.data?.data)
        ? addProductData?.data?.data
        : Array.isArray(addProductData?.data)
        ? addProductData?.data
        : [])
    : [];

  // Filter products in add product modal
  const filteredAddProducts = addProductList.filter((item) => {
    const search = addProductSearch.trim().toLowerCase();
    return (
      item?.name?.toLowerCase().includes(search) ||
      item?.sku?.toLowerCase().includes(search) ||
      item?.productCode?.toLowerCase().includes(search)
    );
  });

  // Handle price change in modal
  const handlePriceChange = (productId, field, value) => {
    setEditablePrices((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  };

  // Submit price changes
  const handleSubmitPriceChanges = async () => {
    const changedProducts = Object.entries(editablePrices).filter(
      ([productId, prices]) => prices.price !== undefined || prices.wholesalePrice !== undefined
    );

    if (changedProducts.length === 0) {
      info_toaster("No changes made");
      return;
    }

    setSubmitPriceLoader(true);
    try {
      const payload = changedProducts.map(([productId, prices]) => {
        const product = partnerInventoryProducts.find(p => p.id === Number(productId));
        return {
          productId: Number(productId),
          salesRepId: Number(selectedPartnerId),
          price: prices.price !== undefined ? Number(prices.price) : Number(product?.customPrice || product?.price || 0),
          wholesalePrice: prices.wholesalePrice !== undefined ? Number(prices.wholesalePrice) : Number(product?.wholesalePrice || 0),
          status: true,
        };
      });

      const res = await PatchAPI(
        "api/v1/admin/sales-rep-product-price",
        payload,
        "sales-rep-product-price"
      );

      if (res?.data?.status === "success") {
        success_toaster("Prices updated successfully");
        setChangePriceModalVisible(false);
        setEditablePrices({});
        setPriceModalSearch("");
        reFetch?.();
      } else {
        throw new Error(res?.data?.message || "Failed to update prices");
      }
    } catch (error) {
      ErrorHandler(error);
    } finally {
      setSubmitPriceLoader(false);
    }
  };

  // Toggle product selection in add product modal
  const toggleAddProductSelection = (productId) => {
    setSelectedAddProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // Select all products in add product modal
  const handleSelectAllAddProducts = (checked) => {
    if (checked) {
      const allIds = filteredAddProducts.map(p => p?.id);
      setSelectedAddProducts(allIds);
    } else {
      setSelectedAddProducts([]);
    }
  };

  // Handle price change in add product modal
  const handleAddProductPriceChange = (productId, field, value) => {
    setAddProductPrices((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  };

  // Submit add products
  const handleSubmitAddProducts = async () => {
    if (selectedAddProducts.length === 0) {
      info_toaster("Please select at least one product");
      return;
    }

    const productsToAdd = selectedAddProducts.map(productId => {
      const product = addProductList.find(p => p.id === productId);
      const prices = addProductPrices[productId] || {};
      return {
        productId: Number(productId),
        salesRepId: Number(selectedPartnerId),
        price: prices.price !== undefined ? Number(prices.price) : Number(product?.price || 0),
        wholesalePrice: prices.wholesalePrice !== undefined ? Number(prices.wholesalePrice) : Number(product?.wholesalePrice || 0),
        status: true,
      };
    });

    setSubmitAddProductLoader(true);
    try {
      const res = await PostAPI(
        "api/v1/admin/sales-rep-product-price",
        productsToAdd,
        "sales-rep-product-price"
      );

      if (res?.data?.status === "success") {
        success_toaster("Products added successfully");
        setAddProductModalVisible(false);
        setAddProductPrices({});
        setAddProductSearch("");
        setSelectedAddProducts([]);
        reFetch?.();
      } else {
        throw new Error(res?.data?.message || "Failed to add products");
      }
    } catch (error) {
      ErrorHandler(error);
    } finally {
      setSubmitAddProductLoader(false);
    }
  };
  
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
            {selectedPartnerId && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAddProductModalVisible(true)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-theme border border-theme rounded-lg hover:bg-themeDark transition-all duration-200"
                >
                  <MdEdit size={18} />
                  Add Product
                </button>
                <button
                  onClick={() => setChangePriceModalVisible(true)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-theme border border-theme rounded-lg hover:bg-theme hover:text-white transition-all duration-200"
                >
                  <MdEdit size={18} />
                  Change Price
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Page context info - outside View Products card */}
        {viewMode === "admin" && (
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-sm font-medium text-amber-800">
              You are viewing <strong>Admin inventory</strong>.
            </p>
            <p className="text-sm text-amber-700 mt-1">
              The order will be created for admin <strong>Customers/Partners</strong>. Add products, then click &quot;Create Order&quot; to open the drawer and select the customer/partner.
            </p>
          </div>
        )}
        {viewMode === "localPartner" && selectedPartnerId && (
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
            <p className="text-sm font-medium text-emerald-800">
              You are viewing <strong>{selectedPartnerName}&apos;s inventory</strong> (Local Partner).
            </p>
            <p className="text-sm text-emerald-700 mt-1">
              The order will be created for this <strong>partner&apos;s customers</strong>. Add products, then click &quot;Create Order&quot; to complete the order in the drawer.
            </p>
          </div>
        )}

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

        {/* Change Price Modal */}
        <Dialog
          visible={changePriceModalVisible}
          onHide={() => {
            setChangePriceModalVisible(false);
            setPriceModalSearch("");
            setEditablePrices({});
          }}
          dismissableMask={true}
          header={
            <div className="font-nunito font-bold text-xl text-center">
              Change Partner Inventory Prices - {selectedPartnerName}
            </div>
          }
          className="font-nunito"
          style={{ width: "90vw", maxWidth: "800px" }}
          contentStyle={{ 
            padding: "1.5rem",
            maxHeight: "70vh",
            overflow: "visible"
          }}
        >
          {submitPriceLoader ? (
            <div className="flex flex-col items-center justify-center py-12">
              <MiniLoader />
              <p className="text-gray-500 text-sm mt-4">Updating prices...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="search"
                  value={priceModalSearch}
                  onChange={(e) => setPriceModalSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full h-12 bg-themeGray rounded-lg ps-10 pe-5 outline-none placeholder:font-inter placeholder:font-medium focus:bg-gray-200"
                />
                <LuSearch size={20} color="#111827" className="absolute top-3.5 left-3" />
              </div>

              {/* Products List */}
              <div className="border border-borderColor rounded-md p-3 max-h-[50vh] overflow-y-auto space-y-2">
                {partnerInventoryLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <MiniLoader />
                    <p className="text-gray-500 text-sm mt-4">Loading products...</p>
                  </div>
                ) : filteredPriceModalProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <svg 
                      className="w-16 h-16 text-gray-300 mb-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1.5} 
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
                      />
                    </svg>
                    <p className="text-gray-600 font-medium mb-1">No products found</p>
                    <p className="text-gray-400 text-sm text-center">
                      {priceModalSearch ? "Try a different search term" : "No products in partner inventory"}
                    </p>
                  </div>
                ) : (
                  <>
                    {filteredPriceModalProducts.map((prod) => {
                      const currentPrice = editablePrices[prod?.id]?.price !== undefined 
                        ? editablePrices[prod?.id]?.price 
                        : (prod?.customPrice || prod?.price || "");
                      const currentWholesale = editablePrices[prod?.id]?.wholesalePrice !== undefined 
                        ? editablePrices[prod?.id]?.wholesalePrice 
                        : (prod?.wholesalePrice || "");

                      return (
                        <div
                          key={prod?.id}
                          className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0"
                        >
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            <Image
                              src={
                                prod?.image
                                  ? `${BASE_URL}${prod?.image}`
                                  : "/images/logocoffee.png"
                              }
                              alt={prod?.name || "Product"}
                              width={64}
                              height={64}
                              className="object-cover rounded-md border border-gray-200"
                              onError={(e) => {
                                if (e.target.src !== "/images/logocoffee.png") {
                                  e.target.src = "/images/logocoffee.png";
                                }
                              }}
                              unoptimized
                            />
                          </div>

                          <div className="flex-1 space-y-1">
                            <p className="font-semibold text-gray-800">
                              {prod?.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              <span className="font-medium">SKU:</span> {prod?.sku ?? "—"}
                              {" · "}
                              <span className="font-medium">Code:</span> {prod?.productCode ?? "—"}
                              {" · "}
                              <span className="font-medium">Weight:</span> {prod?.weight ?? "—"} lbs
                            </p>
                          </div>
                          
                          <div className="flex gap-3">
                            {/* Selling Price Input */}
                            <div className="flex flex-col gap-1 w-28">
                              <label className="text-xs text-labelColor font-medium">
                                Selling Price ($)
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={currentPrice}
                                onChange={(e) => handlePriceChange(prod?.id, "price", e.target.value)}
                                placeholder="0.00"
                                className="w-full border border-borderColor rounded px-2 py-1.5 text-black"
                              />
                            </div>

                            {/* Wholesale Price Input (Admin Only) */}
                            <div className="flex flex-col gap-1 w-28">
                              <label className="text-xs text-labelColor font-medium">
                                Wholesale ($)
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={currentWholesale}
                                onChange={(e) => handlePriceChange(prod?.id, "wholesalePrice", e.target.value)}
                                placeholder="0.00"
                                className="w-full border border-borderColor rounded px-2 py-1.5 text-black"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setChangePriceModalVisible(false);
                    setPriceModalSearch("");
                    setEditablePrices({});
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitPriceChanges}
                  disabled={Object.keys(editablePrices).length === 0}
                  className="px-4 py-2 bg-theme text-white rounded-lg hover:bg-themeDark font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update Prices
                </button>
              </div>
            </div>
          )}
        </Dialog>

        {/* Add Product Modal */}
        <Dialog
          visible={addProductModalVisible}
          onHide={() => {
            setAddProductModalVisible(false);
            setAddProductSearch("");
            setSelectedAddProducts([]);
            setAddProductPrices({});
          }}
          dismissableMask={true}
          header={
            <div className="font-nunito font-bold text-xl text-center">
              Add Products to Partner Inventory - {selectedPartnerName}
            </div>
          }
          className="font-nunito"
          style={{ width: "90vw", maxWidth: "800px" }}
          contentStyle={{ 
            padding: "1.5rem",
            maxHeight: "70vh",
            overflow: "visible"
          }}
        >
          {submitAddProductLoader ? (
            <div className="flex flex-col items-center justify-center py-12">
              <MiniLoader />
              <p className="text-gray-500 text-sm mt-4">Adding products...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Search */}
            <div className="relative">
              <input
                type="search"
                value={addProductSearch}
                onChange={(e) => setAddProductSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full h-12 bg-themeGray rounded-lg ps-10 pe-5 outline-none placeholder:font-inter placeholder:font-medium focus:bg-gray-200"
              />
              <LuSearch size={20} color="#111827" className="absolute top-3.5 left-3" />
            </div>

            {/* Products List */}
            <div className="border border-borderColor rounded-md p-3 max-h-[50vh] overflow-y-auto space-y-2">
              {addProductLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <MiniLoader />
                  <p className="text-gray-500 text-sm mt-4">Loading products...</p>
                </div>
              ) : filteredAddProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <svg 
                    className="w-16 h-16 text-gray-300 mb-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
                    />
                  </svg>
                  <p className="text-gray-600 font-medium mb-1">No products found</p>
                  <p className="text-gray-400 text-sm text-center">
                    {addProductSearch ? "Try a different search term" : "No products available to add"}
                  </p>
                </div>
              ) : (
                <>
                  {/* Select All */}
                  {filteredAddProducts.length > 0 && (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectAllAddProducts(selectedAddProducts.length !== filteredAddProducts.length);
                      }}
                      className="flex items-center gap-3 py-3 px-3 border-b border-gray-200 font-medium sticky -top-3 bg-white z-10 cursor-pointer hover:bg-gray-50 rounded-lg transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={filteredAddProducts.length > 0 && selectedAddProducts.length === filteredAddProducts.length}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectAllAddProducts(e.target.checked);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded cursor-pointer"
                      />
                      <span className="text-gray-700 text-sm font-semibold">
                        Select All ({filteredAddProducts.length})
                      </span>
                    </div>
                  )}

                  {filteredAddProducts.map((prod) => {
                    const isSelected = selectedAddProducts.includes(prod?.id);
                    return (
                      <div
                        key={prod?.id}
                        onClick={() => toggleAddProductSelection(prod?.id)}
                        className={`flex items-center gap-3 py-3 border-b border-gray-100 last:border-0 px-3 cursor-pointer rounded-lg transition-all ${
                          isSelected 
                            ? "bg-blue-50 border-blue-200 shadow-sm" 
                            : "hover:bg-gray-50"
                        }`}
                      >
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <Image
                          src={
                            prod?.image
                              ? `${BASE_URL}${prod?.image}`
                              : "/images/logocoffee.png"
                          }
                          alt={prod?.name || "Product"}
                          width={64}
                          height={64}
                          className="object-cover rounded-md border border-gray-200"
                          onError={(e) => {
                            if (e.target.src !== "/images/logocoffee.png") {
                              e.target.src = "/images/logocoffee.png";
                            }
                          }}
                          unoptimized
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 space-y-1">
                        <p className="font-semibold text-gray-800">
                          {prod?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          <span className="font-medium">SKU:</span> {prod?.sku ?? "—"}
                          {" · "}
                          <span className="font-medium">Code:</span> {prod?.productCode ?? "—"}
                          {" · "}
                          <span className="font-medium">Weight:</span> {prod?.weight ?? "—"} lbs
                        </p>
                      </div>
                      
                      {/* Price Inputs */}
                      <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
                        {/* Selling Price Input */}
                        <div className="flex flex-col gap-1 w-28">
                          <label className="text-xs text-labelColor font-medium">
                            Selling Price ($)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                              addProductPrices[prod?.id]?.price !== undefined 
                                ? addProductPrices[prod?.id]?.price 
                                : (prod?.price || "")
                            }
                            onChange={(e) => handleAddProductPriceChange(prod?.id, "price", e.target.value)}
                            disabled={!isSelected}
                            placeholder="0.00"
                            className="w-full border border-borderColor rounded px-2 py-1.5 text-black disabled:bg-gray-100 disabled:cursor-not-allowed"
                          />
                        </div>

                        {/* Wholesale Price Input */}
                        <div className="flex flex-col gap-1 w-28">
                          <label className="text-xs text-labelColor font-medium">
                            Wholesale ($)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                              addProductPrices[prod?.id]?.wholesalePrice !== undefined 
                                ? addProductPrices[prod?.id]?.wholesalePrice 
                                : (prod?.wholesalePrice || "")
                            }
                            onChange={(e) => handleAddProductPriceChange(prod?.id, "wholesalePrice", e.target.value)}
                            disabled={!isSelected}
                            placeholder="0.00"
                            className="w-full border border-borderColor rounded px-2 py-1.5 text-black disabled:bg-gray-100 disabled:cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </>
              )}
            </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setAddProductModalVisible(false);
                    setAddProductSearch("");
                    setAddProductPrices({});
                    setSelectedAddProducts([]);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitAddProducts}
                  disabled={selectedAddProducts.length === 0}
                  className="px-4 py-2 bg-theme text-white rounded-lg hover:bg-themeDark font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Products
                </button>
              </div>
            </div>
          )}
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
          {/* Section label: which products are shown and for whom the order will be */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <span className="font-medium text-gray-700">Products:</span>
            <span>
              {viewMode === "admin"
                ? "Admin inventory — order will be for customer/partner"
                : selectedPartnerId
                  ? `${selectedPartnerName}'s inventory — order will be for this partner's customers`
                  : "Select a Local Partner to see their products"}
            </span>
          </div>

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
