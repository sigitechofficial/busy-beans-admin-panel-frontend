"use client";

import { Dialog } from "primereact/dialog";
import Select from "react-select";
import { selectStyles2 } from "@/utilities/SelectStyle";
import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { PostAPI } from "@/utilities/PostAPI";
import { PatchAPI } from "@/utilities/PatchAPI";
import { DeleteAPI } from "@/utilities/DeleteAPI";
import { error_toaster, info_toaster, success_toaster } from "@/utilities/Toaster";
import GetAPI from "@/utilities/GetAPI";
import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import { BASE_URL } from "@/utilities/URL";
import Loader from "@/components/ui/Loader";
import MiniLoader from "@/components/ui/MiniLoader";
import ErrorHandler from "@/utilities/ErrorHandler";
import { useDataContext } from "@/utilities/DataContext";
import { CiMenuBurger } from "react-icons/ci";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { LuSearch } from "react-icons/lu";
import Image from "next/image";

// Memoized Product Item Component to prevent unnecessary re-renders
const ProductItem = memo(({ 
  prod, 
  selected, 
  onToggle, 
  onPriceChange, 
  getPrice 
}) => {
  return (
    <div
      onClick={() => onToggle(prod?.id, prod?.price ?? 0, prod?.wholesalePrice ?? 0)}
      className={`flex items-center gap-3 py-3 border-b border-gray-100 last:border-0 cursor-pointer rounded-lg px-3 transition-all ${
        selected 
          ? "bg-blue-50 border-blue-200 shadow-sm" 
          : "hover:bg-gray-50"
      }`}
    >
      {/* Product Image */}
      <div className="flex-shrink-0">
        <Image
          src={
            prod?.image && prod.image.trim() !== ""
              ? BASE_URL + prod.image
              : "/images/logocoffee.png"
          }
          alt={prod?.name || "product"}
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
          {prod?.name ?? ""}
        </p>
        <p className="text-xs text-gray-600">
          <span className="font-medium">Wholesale Price:</span> ${prod?.wholesalePrice ? parseFloat(prod?.wholesalePrice).toFixed(2) : "0.00"}
        </p>
        <p className="text-xs text-gray-500">
          <span className="font-medium">SKU:</span> {prod?.sku ?? "—"}
          {" · "}
          <span className="font-medium">Code:</span> {prod?.productCode ?? "—"}
          {" · "}
          <span className="font-medium">Weight:</span> {prod?.weight ?? "—"} lbs
          {" · "}
          <span className="font-medium">Selling Price:</span> ${prod?.price ?? "—"}
        </p>
      </div>
      
      {/* Price Input */}
      <div className="flex-shrink-0 w-28">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-labelColor font-medium">
            Your price ($)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={selected ? getPrice(prod?.id) : (prod?.price ?? "")}
            onChange={(e) => {
              e.stopPropagation();
              onPriceChange(prod?.id, e.target.value);
            }}
            onClick={(e) => e.stopPropagation()}
            disabled={!selected}
            className="w-full border border-borderColor rounded px-2 py-1.5 text-black disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  return (
    prevProps.prod?.id === nextProps.prod?.id &&
    prevProps.selected === nextProps.selected &&
    prevProps.getPrice(prevProps.prod?.id) === nextProps.getPrice(nextProps.prod?.id)
  );
});

ProductItem.displayName = 'ProductItem';

export default function SalesRepInventoryStockPage() {
  const [userType, setUserType] = useState(null);
  const [userID, setUserID] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setUserType(localStorage.getItem("userType") || "");
    setUserID(
      localStorage.getItem("userId") || localStorage.getItem("userID") || "",
    );
  }, []);

  const [filterId, setFilterId] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [searchQuery, setSearchQuery] = useState("");
  const [addProductModal, setAddProductModal] = useState(false);
  const [modalSearch, setModalSearch] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]); // [{ productId, price }]
  const [submitLoader, setSubmitLoader] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [editProductName, setEditProductName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editLoader, setEditLoader] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteEntryId, setDeleteEntryId] = useState(null);
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [deleteProductName, setDeleteProductName] = useState("");
  const [deleteLoader, setDeleteLoader] = useState(false);

  const baseUrl = "api/v1/admin/products/sales-rep";
  const params = new URLSearchParams();
  params.set("page", page.toString());
  params.set("limit", limit.toString());
  // if (userID) params.set("salesRepId", userID);
  if (filterId) {
    params.set("categoryId", String(filterId));
  }
  if (searchQuery.trim()) params.set("search", searchQuery.trim());
  const url = `${baseUrl}?${params.toString()}`;
  const { data, reFetch, isLoading } = GetAPI(url, "product");

  const { data: category } = GetAPI("api/v1/admin/category");

  const modalProductsUrl = addProductModal
    ? `api/v1/admin/products/sales-rep/import`
    : "";
  const { data: modalProductsData, isLoading: modalProductsLoading } = GetAPI(modalProductsUrl, "product");

  const catOptions = [{ value: "", label: "All" }];
  category?.data?.data?.map((item) => {
    catOptions.push({ value: item?.id, label: item?.name });
  });

  const productsArray = Array.isArray(data?.data?.data)
    ? data?.data?.data
    : Array.isArray(data?.data)
      ? data?.data
      : [];

  const isSalesRep = userType === "salesRepresentative";

  const columns = isSalesRep
    ? [
        { field: "sl", header: "SL", sort: true },
        { field: "image", header: "Image" },
        { field: "name", header: "Name" },
        // { field: "quantity", header: "Quantity" },
        { field: "weight", header: "Weight", sort: true },
        { field: "price", header: "Selling Price ($)", sort: true },
        { field: "wholesalePrice", header: "Wholesale Price ($)" },
        { field: "productCode", header: "Product Code" },
        { field: "sku", header: "SKU" },
        { field: "action", header: "Action" },
      ]
    : [
        { field: "sl", header: "SL", sort: true },
        { field: "image", header: "Image" },
        { field: "name", header: "Name" },
        // { field: "quantity", header: "Quantity" },
        { field: "weight", header: "Weight", sort: true },
        { field: "price", header: "Price ($)", sort: true },
        { field: "wholesalePrice", header: "Whole Sale Price ($)" },
        { field: "productCode", header: "Product Code" },
        { field: "sku", header: "SKU" },
        { field: "action", header: "Action" },
      ];

  const datas = [];
  productsArray.map((prod, i) => {
    return datas.push({
      id: prod?.id,
      sl: i + 1,
      name: prod?.name,
      quantity: prod?.quantity,
      price: "$" + prod?.price,
      weight: prod?.weight ? prod.weight + " lbs" : "",
      wholesalePrice: "$" + (prod?.wholesalePrice ?? ""),
      productCode: prod?.productCode ?? "",
      sku: prod?.sku ?? "",
      image: (
        <div className="size-20 p-1 bg-gray-100 rounded-sm flex items-center justify-center">
          <Image
            src={
              prod?.image && prod.image.trim() !== ""
                ? BASE_URL + prod.image
                : "/images/logocoffee.png"
            }
            alt={prod?.image || "product"}
            width={80}
            height={80}
            className="w-20 object-contain"
            onError={(e) => {
              // Show default brand logo if image fails to load (even if path exists but is incorrect)
              if (e.target.src !== "/images/logocoffee.png") {
                e.target.src = "/images/logocoffee.png";
              }
            }}
            unoptimized
          />
        </div>
      ),
      action: isSalesRep ? (
        <div className="flex gap-x-2">
          <button
            type="button"
            className="border border-theme rounded-md p-2 text-theme"
            onClick={() => handleEditClick(prod?.id, prod?.name, prod?.price)}
            title="Edit price"
          >
            <FaEdit size={24} />
          </button>
          <button
            type="button"
            className="border border-red-400 rounded-md p-2 text-red-400"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDeleteClick(prod?.pid, prod?.name);
            }}
            title="Remove from inventory"
          >
            <MdDelete size={24} />
          </button>
        </div>
      ) : (
        <span className="text-gray-400">—</span>
      ),
    });
  });

  const handleEditClick = (productId, productName, productPrice) => {
    setEditProductId(productId);
    setEditProductName(productName ?? "");
    setEditPrice(String(productPrice ?? ""));
    setEditModalOpen(true);
  };

  const handleDeleteClick = (productId, productName) => {
    // Open modal immediately without hitting any API
    setDeleteProductId(productId);
    setDeleteProductName(productName ?? "");
    setDeleteEntryId(null); // Will be fetched on confirm
    setDeleteModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditProductId(null);
    setEditProductName("");
    setEditPrice("");
  };

  const handleEditPriceSubmit = async (e) => {
    e.preventDefault();
    const priceNum = Number(editPrice);
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      info_toaster("Please enter a valid price.");
      return;
    }
    // Selling price must be >= wholesale price
    const product = productsArray.find((p) => p.id === editProductId);
    const wholesalePrice = Number(product?.wholesalePrice ?? 0);
    if (priceNum < wholesalePrice) {
      error_toaster("Selling price must be greater than or equal to wholesale price.");
      return;
    }
    setEditLoader(true);
    try {
      const payload = [
        {
          productId: editProductId,
          salesRepId: Number(userID),
          price: priceNum,
          status: true,
        },
      ];
      const res = await PatchAPI(
        "api/v1/admin/sales-rep-product-price",
        payload,
        "sales-rep-product-price",
      );
      if (res?.data?.status === "success") {
        success_toaster("Price updated successfully.");
        closeEditModal();
        reFetch?.();
      } else {
        throw new Error(res?.data?.message || "Failed to update price.");
      }
    } catch (err) {
      ErrorHandler(err);
    } finally {
      setEditLoader(false);
    }
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeleteEntryId(null);
    setDeleteProductId(null);
    setDeleteProductName("");
  };

  const handleDeleteConfirm = async () => {
    console.log("🚀 ~ handleDeleteConfirm ~ deleteProductId:", deleteProductId);
    if (!deleteProductId) return;
    setDeleteLoader(true);
    try {
      // DELETE API with product pid in parameter
      const res = await DeleteAPI(
        `api/v1/admin/sales-rep-product-price/${deleteProductId}`,
        "sales-rep-product-price",
      );
      if (res?.data?.status === "success") {
        success_toaster("Product removed from your inventory.");
        closeDeleteModal();
        reFetch?.();
      } else {
        throw new Error(res?.data?.message || "Failed to remove product.");
      }
    } catch (err) {
      ErrorHandler(err);
    } finally {
      setDeleteLoader(false);
    }
  };

  const openAddProductModal = () => {
    setSelectedProducts([]);
    setModalSearch("");
    setAddProductModal(true);
  };

  const closeAddProductModal = () => {
    setAddProductModal(false);
    setSelectedProducts([]);
    setModalSearch("");
  };

  const toggleProductSelection = useCallback((productId, defaultPrice, defaultWholesalePrice) => {
    const numPrice = Number(defaultPrice);
    const price = Number.isFinite(numPrice) ? numPrice : 0;
    const numWholesalePrice = Number(defaultWholesalePrice);
    const wholesalePrice = Number.isFinite(numWholesalePrice) ? numWholesalePrice : 0;
    setSelectedProducts((prev) => {
      const exists = prev.some((p) => p.productId === productId);
      if (exists) return prev.filter((p) => p.productId !== productId);
      return [
        ...prev,
        { productId, salesRepId: Number(userID), price, wholesalePrice, status: true },
      ];
    });
  }, [userID]);

  const updateSelectedPrice = useCallback((productId, value) => {
    const num = Number(value);
    const price = Number.isFinite(num) && num >= 0 ? num : 0;
    setSelectedProducts((prev) =>
      prev.map((p) => (p.productId === productId ? { ...p, price } : p)),
    );
  }, []);

  const getSelectedPrice = useCallback((productId) => {
    const found = selectedProducts.find((p) => p.productId === productId);
    return found != null ? found.price : "";
  }, [selectedProducts]);

  const isProductSelected = useCallback((productId) =>
    selectedProducts.some((p) => p.productId === productId),
    [selectedProducts]
  );

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProducts.length) {
      info_toaster("Please select at least one product.");
      return;
    }
    const payload = selectedProducts.map((p) => ({
      productId: p.productId,
      salesRepId: Number(userID),
      price: Number(p.price),
      wholesalePrice: Number(p.wholesalePrice || 0),
      status: true,
    }));
    // Wholesale price must be <= selling price for each product
    const invalidProduct = payload.find((p) => p.wholesalePrice > p.price);
    if (invalidProduct) {
      error_toaster("Selling price must be greater than or equal to wholesale price.");
      return;
    }
    setSubmitLoader(true);
    try {
      const res = await PostAPI(
        "api/v1/admin/sales-rep-product-price",
        payload,
        "sales-rep-product-price",
      );
      if (res?.data?.status === "success") {
        success_toaster("Products added to your inventory.");
        closeAddProductModal();
        reFetch?.();
      } else {
        throw new Error(res?.data?.message || "Failed to add products.");
      }
    } catch (err) {
      ErrorHandler(err);
    } finally {
      setSubmitLoader(false);
    }
  };

  const modalProductsArray = useMemo(() => 
    Array.isArray(modalProductsData?.data?.data)
      ? modalProductsData.data.data
      : Array.isArray(modalProductsData?.data)
        ? modalProductsData.data
        : [],
    [modalProductsData]
  );

  const modalProductList = useMemo(() => {
    const q = modalSearch.trim().toLowerCase();
    if (!q) return modalProductsArray;
    
    return modalProductsArray.filter((p) => {
      const name = (p?.name ?? "").toLowerCase();
      const code = (p?.productCode ?? "").toLowerCase();
      const sku = (p?.sku ?? "").toLowerCase();
      return name.includes(q) || code.includes(q) || sku.includes(q);
    });
  }, [modalProductsArray, modalSearch]);

  const selectableInModal = modalProductList;
  
  const selectableIds = useMemo(() => 
    new Set(selectableInModal.map((p) => p?.id)),
    [selectableInModal]
  );

  const allSelectableSelected = useMemo(() =>
    selectableInModal.length > 0 &&
    selectableInModal.every((p) => 
      selectedProducts.some((sp) => sp.productId === p?.id)
    ),
    [selectableInModal, selectedProducts]
  );

  const handleSelectAll = useCallback((checked) => {
    if (checked) {
      setSelectedProducts((prev) => {
        const existing = new Set(prev.map((x) => x.productId));
        const next = [...prev];
        selectableInModal.forEach((p) => {
          if (!existing.has(p?.id)) {
            existing.add(p?.id);
            next.push({
              productId: p?.id,
              salesRepId: Number(userID),
              price: Number(p?.price) || 0,
              wholesalePrice: Number(p?.wholesalePrice) || 0,
              status: true,
            });
          }
        });
        return next;
      });
    } else {
      setSelectedProducts((prev) =>
        prev.filter((p) => !selectableIds.has(p.productId)),
      );
    }
  }, [selectableInModal, selectableIds, userID]);

  const { toggle, setToggle } = useDataContext();

  if (userType === null) return null;

  return isLoading ? (
    <Loader />
  ) : (
    <div>
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed">
        <div className="flex items-center gap-2">
          <p
            onClick={() => setToggle(!toggle)}
            className="cursor-pointer md:hidden"
          >
            <CiMenuBurger size={20} />
          </p>
          <h2 className="text-xl font-inter font-semibold">
            Inventory Management
          </h2>
        </div>

        <ul className="flex items-center text-sm font-medium [&>li]:border-r [&>li]:px-2 [&>li]:cursor-pointer relative">
          {isSalesRep && <li onClick={openAddProductModal}>Import Product</li>}
        </ul>
      </div>

      <div className="space-y-8 pt-32 px-6 2xl:px-12">
        <div className="w-72 ml-auto">
          <Select
            placeholder="Select Category"
            options={catOptions}
            className="w-full text-black"
            styles={selectStyles2}
            defaultValue={catOptions[0]} // Default to "All"
            onChange={(e) => {
              // If "All" is selected (value is ""), remove categoryId filter
              setFilterId(e?.value ?? "");
              setPage(1);
            }}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <ManagementTab
            title="Total Products"
            desc={
              data?.pagination?.totalItems ??
              data?.data?.pagination?.totalItems ??
              datas?.length ??
              0
            }
          />
        </div>

        <div>
          <MyDataTable
            columns={columns}
            data={datas}
            placeholder="Search by Name, Product Code, SKU..."
            pagination={true}
            serverPagination={{
              page:
                data?.pagination?.page ?? data?.data?.pagination?.page ?? page,
              limit:
                data?.pagination?.limit ??
                data?.data?.pagination?.limit ??
                limit,
              totalRecords:
                data?.pagination?.totalItems ??
                data?.data?.pagination?.totalItems ??
                0,
              totalPages:
                data?.pagination?.totalPages ??
                data?.data?.pagination?.totalPages,
              onPageChange: (newPage) => setPage(newPage),
              onLimitChange: (newLimit) => {
                setLimit(newLimit);
                setPage(1);
              },
            }}
            searchValue={searchQuery}
            onSearchChange={(searchValue) => {
              setSearchQuery(searchValue);
              setPage(1);
            }}
            search={true}
          />
        </div>

        {/* Add Product Modal (sales rep only) */}
        <Dialog
          visible={addProductModal}
          className="font-nunito"
          style={{ width: "90vw", maxWidth: "800px" }}
          contentStyle={{ 
            padding: "1.5rem",
            maxHeight: "70vh",
            overflow: "visible"
          }}
          dismissableMask={true}
          onHide={closeAddProductModal}
          header={
            <div className="font-nunito font-bold text-xl text-center">
              Add Product to Your Inventory
            </div>
          }
        >
          <form
            onSubmit={handleAddProductSubmit}
            className="space-y-4 flex flex-col"
          >
            {/* Search */}
            <div className="relative">
              <input
                type="search"
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full h-12 bg-themeGray rounded-lg ps-10 pe-5 outline-none placeholder:font-inter placeholder:font-medium focus:bg-gray-200"
              />
              <LuSearch size={20} color="#111827" className="absolute top-3.5 left-3" />
            </div>

            {/* Products List */}
            <div className="border border-borderColor rounded-md p-3 max-h-[50vh] overflow-y-auto space-y-2">
              {modalProductsLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <MiniLoader />
                  <p className="text-gray-500 text-sm mt-4">Loading products...</p>
                </div>
              ) : modalProductList.length === 0 ? (
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
                  <p className="text-gray-600 font-medium mb-1">No products available</p>
                  <p className="text-gray-400 text-sm text-center">
                    There are no products to import at the moment.
                  </p>
                </div>
              ) : (
                <>
                  {/* Select All */}
                  {selectableInModal.length > 0 && (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectAll(!allSelectableSelected);
                      }}
                      className="flex items-center gap-3 py-3 px-3 border-b border-gray-200 font-medium sticky -top-3 bg-white z-10 cursor-pointer hover:bg-gray-50 rounded-lg transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={allSelectableSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectAll(e.target.checked);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded cursor-pointer"
                      />
                      <span className="text-gray-700 text-sm font-semibold">
                        Select All ({selectableInModal.length})
                      </span>
                    </div>
                  )}
                  
                  {modalProductList.map((prod) => (
                    <ProductItem
                      key={prod?.id}
                      prod={prod}
                      selected={isProductSelected(prod?.id)}
                      onToggle={toggleProductSelection}
                      onPriceChange={updateSelectedPrice}
                      getPrice={getSelectedPrice}
                    />
                  ))}
                </>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-x-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={closeAddProductModal}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitLoader || selectedProducts.length === 0}
                className="px-4 py-2 bg-theme text-white rounded-lg hover:bg-themeDark font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitLoader ? (
                  <span className="flex items-center gap-2">
                    <MiniLoader /> Adding...
                  </span>
                ) : (
                  "Add Product"
                )}
              </button>
            </div>
          </form>
        </Dialog>

        {/* Edit Price Modal (sales rep only – price can change, nothing else) */}
        <Dialog
          visible={editModalOpen}
          className="font-nunito w-[90%] max-w-md"
          dismissableMask={true}
          onHide={closeEditModal}
          header={
            <div className="font-nunito font-bold lg:text-xl text-center">
              Update Price
            </div>
          }
        >
          {editLoader ? (
            <div className="flex flex-col items-center justify-center py-12">
              <MiniLoader />
              <p className="text-gray-500 text-sm mt-4">Updating price...</p>
            </div>
          ) : (
            <form onSubmit={handleEditPriceSubmit} className="space-y-4">
              <p className="text-labelColor font-medium">
                Product:{" "}
                <span className="text-black font-semibold">
                  {editProductName}
                </span>
              </p>
              <div className="flex flex-col gap-2">
                <label className="text-labelColor font-medium font-satoshi">
                  Price ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  placeholder="Enter price"
                  className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-x-4 [&>button]:font-nunito [&>button]:py-3 [&>button]:font-medium">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="hover:bg-theme hover:text-white duration-150 rounded-lg border border-theme text-theme shadow-buttonShadow px-6"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg border border-theme text-white px-10 bg-theme"
                >
                  Update Price
                </button>
              </div>
            </form>
          )}
        </Dialog>

        {/* Delete confirmation modal */}
        <Dialog
          visible={deleteModalOpen}
          className="font-nunito w-[90%] max-w-md"
          dismissableMask={true}
          onHide={closeDeleteModal}
          header={
            <div className="font-nunito font-bold lg:text-xl text-center">
              Remove from Inventory
            </div>
          }
        >
          {deleteLoader ? (
            <div className="flex flex-col items-center justify-center py-12">
              <MiniLoader />
              <p className="text-gray-500 text-sm mt-4">Removing product...</p>
            </div>
          ) : (
            <>
              <p className="text-labelColor font-medium mb-4">
                Are you sure you want to remove{" "}
                <strong className="text-black">{deleteProductName}</strong> from
                your inventory? This will remove your custom price for this product.
              </p>
              <div className="flex items-center justify-end gap-x-4 [&>button]:font-nunito [&>button]:py-3 [&>button]:font-medium">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="hover:bg-theme hover:text-white duration-150 rounded-lg border border-theme text-theme shadow-buttonShadow px-6"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="rounded-lg border border-red-500 text-white px-10 bg-red-500 hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            </>
          )}
        </Dialog>
      </div>
    </div>
  );
}
