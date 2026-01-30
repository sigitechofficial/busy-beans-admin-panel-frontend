"use client";

import { Dialog } from "primereact/dialog";
import Select from "react-select";
import { selectStyles2 } from "@/utilities/SelectStyle";
import { useState, useEffect } from "react";
import { PostAPI } from "@/utilities/PostAPI";
import { PatchAPI } from "@/utilities/PatchAPI";
import { DeleteAPI } from "@/utilities/DeleteAPI";
import { info_toaster, success_toaster } from "@/utilities/Toaster";
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
import Image from "next/image";

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
  const [editEntryId, setEditEntryId] = useState(null);
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

  const salesRepPriceUrl =
    addProductModal && userID
      ? `api/v1/admin/sales-rep-product-price?salesRepId=${userID}&status=true`
      : "";
  const { data: salesRepProductPriceData, reFetch: reFetchSalesRepPrices } =
    GetAPI(salesRepPriceUrl, "sales-rep-product-price");

  const modalProductsUrl = addProductModal
    ? `api/v1/admin/products/sales-rep/import`
    : "";
  const { data: modalProductsData } = GetAPI(modalProductsUrl, "product");

  const catOptions = [{ value: "", label: "All" }];
  category?.data?.data?.map((item) => {
    catOptions.push({ value: item?.id, label: item?.name });
  });

  const productsArray = Array.isArray(data?.data?.data)
    ? data?.data?.data
    : Array.isArray(data?.data)
      ? data?.data
      : [];

  const salesRepPriceEntries =
    salesRepProductPriceData?.data?.data ??
    salesRepProductPriceData?.data ??
    [];
  const existingProductIds = Array.isArray(salesRepPriceEntries)
    ? salesRepPriceEntries.map((e) => e?.productId).filter(Boolean)
    : [];
  const customPriceMap = {};
  if (Array.isArray(salesRepPriceEntries)) {
    salesRepPriceEntries.forEach((e) => {
      if (e?.productId != null) {
        customPriceMap[e.productId] = { pid: e.pid, price: e.price };
      }
    });
  }

  const isSalesRep = userType === "salesRepresentative";

  const columns = isSalesRep
    ? [
        { field: "sl", header: "SL", sort: true },
        { field: "image", header: "Image" },
        { field: "name", header: "Name" },
        // { field: "quantity", header: "Quantity" },
        { field: "weight", header: "Weight", sort: true },
        { field: "price", header: "Price ($)", sort: true },
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

  const fetchProductEntry = async (productId) => {
    if (!userID || !productId) return null;
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token") || localStorage.getItem("accessToken")
          : "";
      const res = await fetch(
        `${BASE_URL}api/v1/admin/sales-rep-product-price?productId=${productId}&salesRepId=${userID}&status=true`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            feature: "sales-rep-product-price",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );
      const json = await res.json();
      if (json?.status === "success" && json?.data?.data?.length > 0) {
        return json.data.data[0];
      }
      return null;
    } catch (err) {
      return null;
    }
  };

  const handleEditClick = async (productId, productName, productPrice) => {
    const entry =
      customPriceMap[productId] || (await fetchProductEntry(productId));
    setEditEntryId(entry?.pid ?? null);
    setEditProductId(productId);
    setEditProductName(productName ?? "");
    setEditPrice(
      entry?.price != null ? String(entry.price) : String(productPrice ?? ""),
    );
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
    setEditEntryId(null);
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
    setEditLoader(true);
    try {
      if (editEntryId) {
        const pid = editEntryId; // pid from product detail (sales-rep-product-price entry)
        const res = await PatchAPI(
          "api/v1/admin/sales-rep-product-price",
          [{ id: pid, price: priceNum }],
          "sales-rep-product-price",
        );
        if (res?.data?.status === "success") {
          success_toaster("Price updated successfully.");
          closeEditModal();
          reFetchSalesRepPrices?.();
          reFetch?.();
        } else {
          throw new Error(res?.data?.message || "Failed to update price.");
        }
      } else {
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
          success_toaster("Product added to your inventory.");
          closeEditModal();
          reFetchSalesRepPrices?.();
          reFetch?.();
        } else {
          throw new Error(res?.data?.message || "Failed to add product.");
        }
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
        reFetchSalesRepPrices?.();
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

  const toggleProductSelection = (productId, defaultPrice) => {
    const numPrice = Number(defaultPrice);
    const price = Number.isFinite(numPrice) ? numPrice : 0;
    setSelectedProducts((prev) => {
      const exists = prev.some((p) => p.productId === productId);
      if (exists) return prev.filter((p) => p.productId !== productId);
      return [
        ...prev,
        { productId, salesRepId: Number(userID), price, status: true },
      ];
    });
  };

  const updateSelectedPrice = (productId, value) => {
    const num = Number(value);
    const price = Number.isFinite(num) && num >= 0 ? num : 0;
    setSelectedProducts((prev) =>
      prev.map((p) => (p.productId === productId ? { ...p, price } : p)),
    );
  };

  const getSelectedPrice = (productId) => {
    const found = selectedProducts.find((p) => p.productId === productId);
    return found != null ? found.price : "";
  };

  const isProductSelected = (productId) =>
    selectedProducts.some((p) => p.productId === productId);

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
      status: true,
    }));
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
        reFetchSalesRepPrices?.();
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

  const modalProductsArray = Array.isArray(modalProductsData?.data?.data)
    ? modalProductsData.data.data
    : Array.isArray(modalProductsData?.data)
      ? modalProductsData.data
      : [];
  const modalProductList = modalProductsArray.filter((p) => {
    const name = (p?.name ?? "").toLowerCase();
    const code = (p?.productCode ?? "").toLowerCase();
    const sku = (p?.sku ?? "").toLowerCase();
    const q = modalSearch.trim().toLowerCase();
    if (!q) return true;
    return name.includes(q) || code.includes(q) || sku.includes(q);
  });

  const selectableInModal = modalProductList.filter(
    (p) => !existingProductIds.includes(p?.id),
  );
  const selectableIds = new Set(selectableInModal.map((p) => p?.id));
  const allSelectableSelected =
    selectableInModal.length > 0 &&
    selectableInModal.every((p) => isProductSelected(p?.id));

  const handleSelectAll = (checked) => {
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
  };

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
          className="font-nunito w-[90%] lg:w-[50vw] max-h-[90vh]"
          dismissableMask={true}
          onHide={closeAddProductModal}
          header={
            <div className="font-nunito font-bold lg:text-xl text-center">
              Add Product to Your Inventory
            </div>
          }
        >
          <form
            onSubmit={handleAddProductSubmit}
            className="space-y-4 flex flex-col"
          >
            <div className="flex flex-col gap-2">
              <label className="text-labelColor font-medium font-satoshi">
                Search products
              </label>
              <input
                type="text"
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                placeholder="Search by name, product code, SKU..."
                className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
              />
            </div>

            <div className="border border-borderColor rounded-md p-3 max-h-[50vh] overflow-y-auto space-y-2">
              {modalProductList.length === 0 ? (
                <p className="text-gray-500 text-sm">No products found.</p>
              ) : (
                <>
                  {selectableInModal.length > 0 && (
                    <div className="flex items-center gap-3 py-2 border-b border-gray-200 font-medium sticky -top-3 bg-white z-10">
                      <input
                        type="checkbox"
                        checked={allSelectableSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-labelColor text-sm">
                        Select all
                      </span>
                    </div>
                  )}
                  {modalProductList.map((prod) => {
                    const alreadyAdded = existingProductIds.includes(prod?.id);
                    const selected = isProductSelected(prod?.id);
                    const defaultPrice = prod?.price ?? 0;
                    return (
                      <div
                        key={prod?.id}
                        className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex-shrink-0 pt-0.5">
                          {!alreadyAdded ? (
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() =>
                                toggleProductSelection(prod?.id, defaultPrice)
                              }
                              className="rounded"
                            />
                          ) : (
                            <span className="w-5 block" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex gap-3">
                          <Image
                            src={
                              prod?.image && prod.image.trim() !== ""
                                ? BASE_URL + prod.image
                                : "/images/logocoffee.png"
                            }
                            alt={prod?.name || "product"}
                            width={56}
                            height={56}
                            className="w-14 h-14 object-contain rounded border border-gray-200 flex-shrink-0"
                            onError={(e) => {
                              // Show default brand logo if image fails to load (even if path exists but is incorrect)
                              if (e.target.src !== "/images/logocoffee.png") {
                                e.target.src = "/images/logocoffee.png";
                              }
                            }}
                            unoptimized
                          />
                          <div className="min-w-0 flex-1 space-y-0.5 text-sm">
                            <p
                              className="font-semibold text-black truncate"
                              title={prod?.name}
                            >
                              {prod?.name ?? ""}
                            </p>
                            <p className="text-labelColor">
                              <span className="font-medium">ID:</span>{" "}
                              {prod?.id ?? "—"}
                              {" · "}
                              <span className="font-medium">SKU:</span>{" "}
                              {prod?.sku ?? "—"}
                              {" · "}
                              <span className="font-medium">Code:</span>{" "}
                              {prod?.productCode ?? "—"}
                            </p>
                            {prod?.desc && (
                              <p className="text-labelColor text-xs line-clamp-2">
                                {prod.desc}
                              </p>
                            )}
                            <p className="text-labelColor">
                              <span className="font-medium">Weight:</span>{" "}
                              {prod?.weight ?? "—"} lbs
                              {" · "}
                              <span className="font-medium">Price:</span> $
                              {prod?.price ?? "—"}
                            </p>
                          </div>
                        </div>
                        <div className="flex-shrink-0 w-28">
                          {alreadyAdded ? (
                            <span className="text-sm text-green-600 font-medium">
                              Already Added
                            </span>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <label className="text-xs text-labelColor font-medium">
                                Your price ($)
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                  selected
                                    ? getSelectedPrice(prod?.id)
                                    : (prod?.price ?? "")
                                }
                                onChange={(e) =>
                                  updateSelectedPrice(prod?.id, e.target.value)
                                }
                                disabled={!selected}
                                className="w-full border border-borderColor rounded px-2 py-1.5 text-black disabled:bg-gray-100 disabled:cursor-not-allowed"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-x-4 [&>button]:font-nunito [&>button]:py-3 [&>button]:font-medium">
              <button
                type="button"
                onClick={closeAddProductModal}
                className="hover:bg-theme hover:text-white duration-150 rounded-lg border border-theme text-theme shadow-buttonShadow px-6"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitLoader || selectedProducts.length === 0}
                className="rounded-lg border border-theme text-white px-10 bg-theme disabled:opacity-50"
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
                disabled={editLoader}
                className="rounded-lg border border-theme text-white px-10 bg-theme disabled:opacity-50"
              >
                {editLoader ? (
                  <span className="flex items-center gap-2">
                    <MiniLoader /> Updating...
                  </span>
                ) : (
                  "Update Price"
                )}
              </button>
            </div>
          </form>
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
              disabled={deleteLoader}
              className="rounded-lg border border-red-500 text-white px-10 bg-red-500 hover:bg-red-600 disabled:opacity-50"
            >
              {deleteLoader ? (
                <span className="flex items-center gap-2">
                  <MiniLoader /> Removing...
                </span>
              ) : (
                "Remove"
              )}
            </button>
          </div>
        </Dialog>
      </div>
    </div>
  );
}
