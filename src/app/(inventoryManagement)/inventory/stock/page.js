"use client";
import StockCard from "@/components/ui/StockCard";
import { Dialog } from "primereact/dialog";
import { LuImageUp, LuSearch } from "react-icons/lu";
import { RiFileDownloadLine } from "react-icons/ri";
import Select from "react-select";
import selectStyles, { selectStyles2 } from "@/utilities/SelectStyle";
import { useState } from "react";
import { PostAPI } from "@/utilities/PostAPI";
import {
  error_toaster,
  info_toaster,
  success_toaster,
} from "@/utilities/Toaster";
import GetAPI from "@/utilities/GetAPI";
import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import { MdDelete, MdEdit } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import { BASE_URL } from "@/utilities/URL";
import { DeleteAPI } from "@/utilities/DeleteAPI";
import Switch from "react-switch";
import { PatchAPI } from "@/utilities/PatchAPI";
import Loader from "@/components/ui/Loader";
import MiniLoader from "@/components/ui/MiniLoader";
import ErrorHandler from "@/utilities/ErrorHandler";
import { useDataContext } from "@/utilities/DataContext";
import { CiMenuBurger } from "react-icons/ci";
import { hasPermission } from "@/utilities/Permission";
import { INVENTORY_MANAGEMENT } from "../stock.testid";
import Image from "next/image";
import { useUserType } from "@/utilities/useUserType";

export default function Stock() {
  const { isAllowed } = useUserType("admin");
  const [filterId, setFilterId] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [searchQuery, setSearchQuery] = useState("");

  // View mode: admin (default) = admin inventory; localPartner = partner's inventory
  const [viewMode, setViewMode] = useState("admin");
  const [selectedPartnerId, setSelectedPartnerId] = useState(null);
  const [selectedPartnerName, setSelectedPartnerName] = useState(null);
  const [partnerModalVisible, setPartnerModalVisible] = useState(false);
  const [tempSelectedPartner, setTempSelectedPartner] = useState(null);
  const [changePriceModalVisible, setChangePriceModalVisible] = useState(false);
  const [priceModalSearch, setPriceModalSearch] = useState("");
  const [editablePrices, setEditablePrices] = useState({});
  const [submitPriceLoader, setSubmitPriceLoader] = useState(false);
  const [addProductModalVisible, setAddProductModalVisible] = useState(false);
  const [addProductSearch, setAddProductSearch] = useState("");
  const [addProductPrices, setAddProductPrices] = useState({});
  const [submitAddProductLoader, setSubmitAddProductLoader] = useState(false);
  const [selectedAddProducts, setSelectedAddProducts] = useState([]);
  const [exportModalVisible, setExportModalVisible] = useState(false);

  const { data: salesRepData } = GetAPI("api/v1/admin/sales-rep");
  const partnerOptions = [];
  if (salesRepData?.data?.data) {
    salesRepData.data.data.forEach((partner) => {
      partnerOptions.push({
        value: partner?.id,
        label: `${partner?.srName ?? partner?.name} (${
          partner?.territoryName ?? ""
        })`,
        srName: partner?.srName ?? partner?.name,
      });
    });
  }

  const handleLocalPartnerClick = () => {
    if (selectedPartnerId) {
      setViewMode("localPartner");
    } else {
      setPartnerModalVisible(true);
    }
  };

  const handlePartnerSelect = (selectedOption) => {
    setTempSelectedPartner(selectedOption);
  };

  const handleConfirmPartner = () => {
    if (tempSelectedPartner) {
      setSelectedPartnerId(tempSelectedPartner.value);
      setSelectedPartnerName(tempSelectedPartner.srName);
      setViewMode("localPartner");
      setPartnerModalVisible(false);
      setTempSelectedPartner(null);
      setPage(1);
    } else {
      info_toaster("Please select a partner");
    }
  };

  const handleClearPartner = () => {
    setSelectedPartnerId(null);
    setSelectedPartnerName(null);
    setViewMode("admin");
    setTempSelectedPartner(null);
    setPage(1);
  };

  // Build API URL: admin = product list; localPartner = partner's products
  const baseUrl =
    viewMode === "admin"
      ? "api/v1/admin/product"
      : selectedPartnerId
      ? "api/v1/admin/products/sales-rep"
      : "";
  const params = new URLSearchParams();
  params.set("page", page.toString());
  params.set("limit", limit.toString());
  if (viewMode === "admin") {
    if (filterId) params.set("categoryId", filterId);
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
  } else if (selectedPartnerId) {
    params.set("salesRepId", selectedPartnerId.toString());
    if (filterId) params.set("categoryId", filterId);
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
  }
  const url = baseUrl ? `${baseUrl}?${params.toString()}` : "";
  const { data, reFetch, isLoading } = GetAPI(url || "", "product");

  // Partner inventory for Change Price modal
  const partnerInventoryUrl =
    changePriceModalVisible && selectedPartnerId
      ? `api/v1/admin/products/sales-rep?salesRepId=${selectedPartnerId}&page=1&limit=100`
      : "";
  const { data: partnerInventoryData, isLoading: partnerInventoryLoading } =
    GetAPI(partnerInventoryUrl, "partner-inventory");
  const partnerInventoryProducts =
    partnerInventoryUrl && partnerInventoryData
      ? Array.isArray(partnerInventoryData?.data?.data)
        ? partnerInventoryData?.data?.data
        : Array.isArray(partnerInventoryData?.data)
        ? partnerInventoryData?.data
        : []
      : [];
  const filteredPriceModalProducts = partnerInventoryProducts.filter((item) => {
    const search = priceModalSearch.trim().toLowerCase();
    return (
      item?.name?.toLowerCase().includes(search) ||
      item?.sku?.toLowerCase().includes(search) ||
      item?.productCode?.toLowerCase().includes(search)
    );
  });

  // Add Product modal: products available to add to partner (import list)
  const addProductUrl =
    addProductModalVisible && selectedPartnerId
      ? `api/v1/admin/products/sales-rep/import/${selectedPartnerId}`
      : "";
  const { data: addProductData, isLoading: addProductLoading } = GetAPI(
    addProductUrl,
    "add-product-import"
  );
  const addProductList =
    addProductUrl && addProductData
      ? Array.isArray(addProductData?.data?.data)
        ? addProductData?.data?.data
        : Array.isArray(addProductData?.data)
        ? addProductData?.data
        : []
      : [];
  const filteredAddProducts = addProductList.filter((item) => {
    const search = addProductSearch.trim().toLowerCase();
    return (
      item?.name?.toLowerCase().includes(search) ||
      item?.sku?.toLowerCase().includes(search) ||
      item?.productCode?.toLowerCase().includes(search)
    );
  });

  const handlePriceChange = (productId, field, value) => {
    setEditablePrices((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], [field]: value },
    }));
  };

  const handleSubmitPriceChanges = async () => {
    const changedProducts = Object.entries(editablePrices).filter(
      ([, prices]) =>
        prices.price !== undefined || prices.wholesalePrice !== undefined
    );
    if (changedProducts.length === 0) {
      info_toaster("No changes made");
      return;
    }
    // Validate: wholesale price must be <= selling price for each product
    for (const [productId, prices] of changedProducts) {
      const product = partnerInventoryProducts.find(
        (p) => p.id === Number(productId)
      );
      const sellingPrice =
        prices.price !== undefined
          ? Number(prices.price)
          : Number(product?.customPrice || product?.price || 0);
      const wholesalePrice =
        prices.wholesalePrice !== undefined
          ? Number(prices.wholesalePrice)
          : Number(product?.wholesalePrice || 0);
      if (wholesalePrice > sellingPrice) {
        error_toaster("Wholesale price must be less than or equal to selling price.");
        return;
      }
    }
    setSubmitPriceLoader(true);
    try {
      const payload = changedProducts.map(([productId, prices]) => {
        const product = partnerInventoryProducts.find(
          (p) => p.id === Number(productId)
        );
        return {
          productId: Number(productId),
          salesRepId: Number(selectedPartnerId),
          price:
            prices.price !== undefined
              ? Number(prices.price)
              : Number(product?.customPrice || product?.price || 0),
          wholesalePrice:
            prices.wholesalePrice !== undefined
              ? Number(prices.wholesalePrice)
              : Number(product?.wholesalePrice || 0),
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

  const toggleAddProductSelection = (productId) => {
    setSelectedAddProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAllAddProducts = (checked) => {
    if (checked) setSelectedAddProducts(filteredAddProducts.map((p) => p?.id));
    else setSelectedAddProducts([]);
  };

  const handleAddProductPriceChange = (productId, field, value) => {
    setAddProductPrices((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], [field]: value },
    }));
  };

  const handleSubmitAddProducts = async () => {
    if (selectedAddProducts.length === 0) {
      info_toaster("Please select at least one product");
      return;
    }
    const productsToAdd = selectedAddProducts.map((productId) => {
      const product = addProductList.find((p) => p.id === productId);
      const prices = addProductPrices[productId] || {};
      return {
        productId: Number(productId),
        salesRepId: Number(selectedPartnerId),
        price:
          prices.price !== undefined
            ? Number(prices.price)
            : Number(product?.price || 0),
        wholesalePrice:
          prices.wholesalePrice !== undefined
            ? Number(prices.wholesalePrice)
            : Number(product?.wholesalePrice || 0),
        status: true,
      };
    });
    // Validate: wholesale price must be <= selling price for each product
    const invalidProduct = productsToAdd.find((p) => p.wholesalePrice > p.price);
    if (invalidProduct) {
      error_toaster("Wholesale price must be less than or equal to selling price.");
      return;
    }
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

  const { data: category, reFetch: categoryRefetch } = GetAPI(
    "api/v1/admin/category"
  );

  const { data: suppliersRes, reFetch: reFetchSuppliers } = GetAPI(
    "api/v1/admin/supplier?status=1"
  );

  const supplierList = suppliersRes?.data?.data ?? suppliersRes?.data ?? [];

  const [supplierSkus, setSupplierSkus] = useState({});

  const handleSupplierSkuChange = (supplierId, value) => {
    setSupplierSkus((prev) => ({ ...prev, [supplierId]: value }));
  };

  const getSupplierAndSkusPayload = () =>
    Object.entries(supplierSkus)
      .filter(([, sku]) => (sku ?? "").trim().length)
      .map(([supplierId, supplierSku]) => ({
        supplierId: Number(supplierId),
        supplierSku: supplierSku.trim(),
      }));

  const catOptions = [{ value: "", label: "All" }];
  category?.data?.data?.map((item) => {
    catOptions.push({ value: item?.id, label: item?.name });
  });

  const [productDetail, setProductDetail] = useState({
    name: "",
    quantity: "",
    unit: "",
    image: "",
    price: "",
    desc: "",
    category: "",
    wholesalePrice: "",
    productCode: "",
    sku: "",
    grind: "",
    weight: "",
  });
  const [productID, setProductID] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [modal, setModal] = useState("");
  const [loader, setLoader] = useState("");

  const parseNum = (v) => {
    if (v === null || v === undefined) return NaN;
    if (typeof v === "number") return v;
    const s = String(v)
      .replace(/[^\d.-]/g, "")
      .trim();
    if (s === "" || s === "." || s === "-" || s === "-.") return NaN;
    const n = Number(s);
    return Number.isFinite(n) ? n : NaN;
  };

  const validateProduct = (mode) => {
    const name = (productDetail?.name ?? "").trim();
    const quantityNum = parseNum(productDetail?.quantity);
    const unit = productDetail?.unit;
    const priceNum = parseNum(productDetail?.price);
    const weightNum = parseNum(productDetail?.weight);
    const wholesaleNum = parseNum(productDetail?.wholesalePrice);
    const desc = (productDetail?.desc ?? "").trim();
    const categoryVal = productDetail?.category?.value;

    if (name === "") return "Product Name cannot be empty";

    if (!Number.isFinite(quantityNum)) return "Invalid Product quantity";
    if (!unit) return "Product unit cannot be empty";

    if (!Number.isFinite(priceNum)) return "Invalid Product price";
    if (!Number.isFinite(weightNum)) return "Invalid Product weight";
    if (!Number.isFinite(wholesaleNum)) return "Invalid whole sale price";

    if (desc.length === 0) return "Product description cannot be empty";
    if (!categoryVal) return "Please select a category";

    if (wholesaleNum >= priceNum) {
      return "Whole sale price must be less than product price";
    }

    if (mode === "add" && !productDetail?.image) {
      return "Product image cannot be empty";
    }

    return null;
  };

  const handleChange = (e) => {
    setProductDetail({ ...productDetail, [e.target.name]: e.target.value });
  };

  const handleImageClick = () => {
    const image = document.querySelector(".image");
    image.click();
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProductDetail({ ...productDetail, image: file });
      const imageURL = URL.createObjectURL(file);
      setImagePreview(imageURL);
    }
  };

  const buildFormData = () => {
    const formData = new FormData();
    formData.append("name", productDetail?.name);
    formData.append(
      "quantity",
      String(parseNum(productDetail?.quantity) ?? "")
    );
    formData.append("unit", productDetail?.unit?.value);
    formData.append("price", String(parseNum(productDetail?.price) ?? ""));
    formData.append("weight", String(parseNum(productDetail?.weight) ?? ""));
    formData.append(
      "wholesalePrice",
      String(parseNum(productDetail?.wholesalePrice) ?? "")
    );
    formData.append("desc", productDetail?.desc);
    if (productDetail?.image instanceof File) {
      formData.append("image", productDetail?.image);
    }
    formData.append("categoryId", productDetail?.category?.value);
    formData.append("productCode", productDetail?.productCode ?? "");
    formData.append("sku", productDetail?.sku ?? "");
    formData.append("grind", productDetail?.grind ?? "");
    const supplierPayload = getSupplierAndSkusPayload();
    formData.append("supplierAndSkus", JSON.stringify(supplierPayload));
    return formData;
  };

  const handleStock = async (e) => {
    e.preventDefault();

    if (modal === "add") {
      const err = validateProduct("add");
      if (err) {
        info_toaster(err);
        return;
      }
      const formData = buildFormData();
      setLoader("add");
      try {
        const res = await PostAPI("api/v1/admin/product", formData, "product");
        if (res?.data?.status === "success") {
          success_toaster("Product Added Successfully");
          setProductDetail({
            name: "",
            quantity: "",
            unit: "",
            image: "",
            category: "",
            weight: "",
            productCode: "",
            sku: "",
            grind: "",
            price: "",
            wholesalePrice: "",
            desc: "",
          });
          setModal("");
          setLoader("");
          reFetch();
          setImagePreview("");
          setSupplierSkus({});
        } else {
          throw new Error(
            res?.data?.message || "An unexpected error occurred."
          );
        }
      } catch (error) {
        ErrorHandler(error);
        setLoader("");
      }
    } else if (modal === "edit") {
      const err = validateProduct("edit");
      if (err) {
        info_toaster(err);
        return;
      }
      setLoader("edit");
      const formData = buildFormData();
      try {
        const res = await PatchAPI(
          `api/v1/admin/product/${productID}`,
          formData,
          "product"
        );
        if (res?.data?.status === "success") {
          success_toaster("Product Updated Successfully");
          setProductDetail({
            name: "",
            quantity: "",
            unit: "",
            image: "",
            weight: "",
            productCode: "",
            sku: "",
            grind: "",
            price: "",
            wholesalePrice: "",
            desc: "",
            category: "",
          });
          setModal("");
          setLoader("");
          reFetch();
          setImagePreview("");
          setSupplierSkus({});
        } else {
          throw new Error(
            res?.data?.message || "An unexpected error occurred."
          );
        }
      } catch (error) {
        ErrorHandler(error);
        setLoader("");
      }
    } else {
      setLoader("delete");
      try {
        const res = await DeleteAPI(
          `api/v1/admin/product/${productID}`,
          "product"
        );
        if (res?.data?.status === "success") {
          success_toaster("Product Deleted Successfully");
          reFetch();
          setModal("");
          setLoader("");
        } else {
          throw new Error(
            res?.data?.message || "An unexpected error occurred."
          );
        }
      } catch (error) {
        ErrorHandler(error);
        setLoader("");
      }
    }
  };

  const handleCancel = () => {
    setProductDetail({
      name: "",
      quantity: "",
      weight: "",
      unit: "",
      image: "",
      price: "",
      desc: "",
      productCode: "",
      sku: "",
      grind: "",
      wholesalePrice: "",
      category: "",
    });
    setModal("");
    setSupplierSkus({});
    setImagePreview("");
  };

  const handleStatus = async (id, status) => {
    try {
      const res = await PatchAPI(
        `api/v1/admin/product/${id}`,
        {
          status: !status,
        },
        "product"
      );
      if (res?.data?.status === "success") {
        success_toaster("Status updated successfully");
        reFetch();
      } else {
        throw new Error(res?.data?.message || "An unexpected error occurred.");
      }
    } catch (error) {
      ErrorHandler(error);
    }
  };

  const handleCategory = (id) => {
    const categoryData = category?.data?.data.find((cat) => cat?.id === id);
    return { value: categoryData?.id ?? "", label: categoryData?.name ?? "" };
  };

  const buildExportData = () => {
    const productsArray = Array.isArray(data?.data?.data)
      ? data?.data?.data
      : Array.isArray(data?.data)
      ? data?.data
      : [];
    const isPartnerView = viewMode === "localPartner" && selectedPartnerId;
    const escapeCsv = (v) => {
      const s = v == null ? "" : String(v);
      const needsQuotes = /[",\n]/.test(s);
      const safe = s.replace(/"/g, '""');
      return needsQuotes ? `"${safe}"` : safe;
    };
    const headers = [
      "SL",
      "Name",
      "Weight (lbs)",
      "Price ($)",
      "Wholesale Price ($)",
      "Product Code",
      "SKU",
      "Grind",
      "Status",
    ].join(",");
    const rows = productsArray.map((prod, i) => {
      const displayPrice =
        isPartnerView && (prod?.customPrice != null || prod?.customPrice === 0)
          ? prod.customPrice
          : prod?.price;
      return [
        i + 1,
        prod?.name ?? "",
        prod?.weight ?? "",
        displayPrice ?? "",
        prod?.wholesalePrice ?? "",
        prod?.productCode ?? "",
        prod?.sku ?? "",
        prod?.grind && prod?.grind !== "null" ? prod?.grind : "",
        prod?.status ? "Active" : "Inactive",
      ]
        .map(escapeCsv)
        .join(",");
    });
    return [headers, ...rows].join("\n");
  };

  const handleExportProducts = (format) => {
    const productsArray = Array.isArray(data?.data?.data)
      ? data?.data?.data
      : Array.isArray(data?.data)
      ? data?.data
      : [];
    if (!productsArray.length) {
      setExportModalVisible(false);
      info_toaster("No products to export");
      return;
    }
    const csv = buildExportData();
    const dateStr = new Date().toISOString().slice(0, 10);
    const isExcel = format === "excel";
    const blob = new Blob(["\uFEFF" + csv], {
      type: isExcel
        ? "application/vnd.ms-excel;charset=utf-8;"
        : "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = isExcel
      ? `inventory-stock-${dateStr}.xls`
      : `inventory-stock-${dateStr}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportModalVisible(false);
  };

  const columns = [
    { field: "sl", header: "SL", sort: true },
    { field: "image", header: "Image" },
    { field: "name", header: "Name" },
    { field: "weight", header: "Weight", sort: true },
    { field: "price", header: "Price ($)", sort: true },
    { field: "wholesalePrice", header: "Whole Sale Price ($)" },
    { field: "productCode", header: "Product Code" },
    { field: "sku", header: "SKU" },
    { field: "grind", header: "Grind" },
    // {
    //   field: "currentStatus",
    //   header: "Current Status",
    // },
    {
      field: "changeStatus",
      header: "Change Status",
    },
    { field: "action", header: "Action" },
  ];

  const openEditModal = async (id) => {
    try {
      setLoader("prefill");
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token") || localStorage.getItem("accessToken")
          : "";
      const res = await fetch(`${BASE_URL}api/v1/admin/product/${id}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          feature: "product",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json();

      if (json?.status !== "success") {
        throw new Error(json?.message || "Failed to load product");
      }

      const p = json?.data?.product;

      const catVal = handleCategory(p?.categoryId)?.value
        ? handleCategory(p?.categoryId)
        : { value: p?.categoryId, label: "" };

      setProductDetail({
        name: p?.name ?? "",
        category: catVal,
        quantity: p?.quantity ?? "",
        unit:
          p?.unit === "lbs"
            ? { value: "lbs", label: "LBS" }
            : p?.unit
            ? { value: p?.unit, label: p?.unit }
            : "",
        image: p?.image ?? "",
        price: p?.price ?? "",
        weight: p?.weight ?? "",
        wholesalePrice: p?.wholesalePrice ?? "",
        desc: p?.desc ?? "",
        productCode: p?.productCode ?? "",
        sku: p?.sku ?? "",
        grind: p?.grind && p?.grind !== "null" ? p?.grind : "",
      });

      setProductID(p?.id);
      setImagePreview(p?.image ? BASE_URL + p.image : "");

      setSupplierSkus(
        Array.isArray(p?.skuSuppliers)
          ? p.skuSuppliers.reduce((acc, s) => {
              if (s?.supplierId) acc[s.supplierId] = s?.supplierSku ?? "";
              return acc;
            }, {})
          : {}
      );

      setModal("edit");
    } catch (err) {
      ErrorHandler(err);
    } finally {
      setLoader("");
    }
  };

  const datas = [];
  // Handle both possible API response structures: { data: [...], pagination: {...} } or { data: { data: [...], pagination: {...} } }
  const productsArray = Array.isArray(data?.data?.data)
    ? data?.data?.data
    : Array.isArray(data?.data)
    ? data?.data
    : [];

  const isPartnerView = viewMode === "localPartner" && selectedPartnerId;

  productsArray.map((prod, i) => {
    const displayPrice =
      isPartnerView && (prod?.customPrice != null || prod?.customPrice === 0)
        ? prod.customPrice
        : prod?.price;
    return datas.push({
      id: prod?.id,
      sl: i + 1,
      name: prod?.name,
      price: "$" + (displayPrice ?? ""),
      weight: prod?.weight ? prod.weight + " lbs" : "",
      wholesalePrice: "$" + (prod?.wholesalePrice ?? ""),
      productCode: prod?.productCode ?? "",
      sku: prod?.sku ?? "",
      grind: prod?.grind && prod?.grind !== "null" ? prod?.grind : "",
      image: (
        <div className="size-20 p-1 bg-gray-200 rounded flex justify-center items-center">
          <img
            src={prod?.image ? BASE_URL + prod.image : "/images/logocoffee.png"}
            alt={prod?.name || "Product"}
            className="w-full object-contain"
            onError={(e) => {
              if (e.target.src !== "/images/logocoffee.png")
                e.target.src = "/images/logocoffee.png";
            }}
          />
        </div>
      ),
      // currentStatus: (
      //   <div>
      //     {prod?.status ? (
      //       <div className="w-24 bg-theme text-white font-semibold p-2 rounded-md flex justify-center">
      //         Active
      //       </div>
      //     ) : (
      //       <div className="w-24 bg-[#EE4A4A14] text-[#EE4A4A] font-semibold p-2 rounded-md flex justify-center">
      //         Inactive
      //       </div>
      //     )}
      //   </div>
      // ),
      changeStatus: isPartnerView ? (
        <div>
          {prod?.status ? (
            <div className="w-max text-xs bg-theme text-white font-semibold p-2 rounded-md flex justify-center">
              Active
            </div>
          ) : (
            <div className="w-max text-xs bg-[#EE4A4A14] text-[#EE4A4A] font-semibold p-2 rounded-md flex justify-center">
              Inactive
            </div>
          )}
        </div>
      ) : hasPermission("product_update") ? (
        <label className="flex items-center gap-2">
          <div>
            {prod?.status ? (
              <div className="w-max text-xs bg-theme text-white font-semibold p-2 rounded-md flex justify-center">
                Active
              </div>
            ) : (
              <div className="w-max text-xs bg-[#EE4A4A14] text-[#EE4A4A] font-semibold p-2 rounded-md flex justify-center">
                Inactive
              </div>
            )}
          </div>
          <Switch
            onChange={() => handleStatus(prod?.id, prod?.status)}
            checked={prod?.status}
            uncheckedIcon={false}
            checkedIcon={false}
            onColor="#86644c"
            onHandleColor="#fff"
            className="react-switch"
            boxShadow="none"
          />
        </label>
      ) : (
        <span className="text-gray-400">No Access</span>
      ),
      action: isPartnerView ? (
        <span className="text-gray-500 text-sm">Use Change Price above</span>
      ) : (
        <div className="flex gap-x-2">
          {hasPermission("product_update") && (
            <button
              className="border border-theme rounded-md p-2 text-theme"
              onClick={() => openEditModal(prod?.id)}
            >
              <FaEdit size={24} />
            </button>
          )}
          {hasPermission("product_delete") && (
            <button
              className="border border-red-400 rounded-md p-2 text-red-400"
              onClick={() => {
                setProductID(prod?.id);
                setModal("delete");
              }}
            >
              <MdDelete size={24} />
            </button>
          )}
        </div>
      ),
    });
  });
  const { toggle, setToggle } = useDataContext();

  if (!isAllowed) {
    return <Loader />;
  }

  return isLoading ? (
    <Loader />
  ) : (
    <div data-testid={INVENTORY_MANAGEMENT.root}>
      <div
        className="w-full md:w=[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed"
        data-testid={INVENTORY_MANAGEMENT.headerBar}
      >
        <div className="flex items-center gap-2">
          <p
            onClick={() => setToggle(!toggle)}
            className="cursor-pointer md:hidden"
          >
            <CiMenuBurger size={20} />
          </p>
          <h2
            className="text-xl font-inter font-semibold"
            data-testid={INVENTORY_MANAGEMENT.title}
          >
            Inventory Management
          </h2>
        </div>

        <ul className="flex items-center text-sm font-medium [&>li]:border-r [&>li]:px-2 [&>li]:cursor-pointer relative">
          {hasPermission("product_create") && viewMode === "admin" && (
            <li
              onClick={() => {
                setSupplierSkus({});
                setModal("add");
              }}
              data-testid={INVENTORY_MANAGEMENT.addProductBtn}
            >
              New Product
            </li>
          )}
          {/* <li data-testid={INVENTORY_MANAGEMENT.importProductBtn}>Import</li> */}
          <li
            onClick={() => {
              const productsArray = Array.isArray(data?.data?.data)
                ? data?.data?.data
                : Array.isArray(data?.data)
                ? data?.data
                : [];
              if (!productsArray.length) {
                info_toaster("No products to export");
                return;
              }
              setExportModalVisible(true);
            }}
            className="cursor-pointer"
            data-testid={INVENTORY_MANAGEMENT.exportProductBtn}
          >
            Export
          </li>
        </ul>
      </div>
      <div className="space-y-8 pt-32 px-6 2xl:px-12">
        {/* Total Products card (left) and Category filter (right) - above CTA section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-[250px]">
            <ManagementTab
              title="Total Products"
              desc={
                data?.pagination?.totalItems ||
                data?.data?.pagination?.totalItems ||
                datas?.length ||
                0
              }
              data-testid={INVENTORY_MANAGEMENT.totalStocksCard}
            />
          </div>
          <div
            className="w-48 sm:w-52 ml-auto"
            data-testid={INVENTORY_MANAGEMENT.categoryFilter}
          >
            <Select
              placeholder="Select Category"
              options={catOptions}
              value={
                catOptions.find((opt) => opt.value == filterId) ?? catOptions[0]
              }
              className="w-full text-black"
              styles={selectStyles2}
              onChange={(e) => {
                setFilterId(e?.value ?? "");
                setPage(1);
              }}
            />
          </div>
        </div>

        {/* View Mode: Admin inventory (default) | Local Partner inventory - below category and cards */}
        <div className="bg-white rounded-lg border border-borderColor shadow-tableShadow p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <span className="text-sm font-semibold text-gray-700">
                View inventory:
              </span>
              <div className="flex items-center gap-1 border border-gray-200 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleClearPartner()}
                  className={`px-6 py-2.5 text-sm font-medium transition-all duration-200 ${
                    viewMode === "admin"
                      ? "bg-theme text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Admin
                </button>
                <div className="w-px h-6 bg-gray-200" />
                <button
                  type="button"
                  onClick={handleLocalPartnerClick}
                  className={`px-6 py-2.5 text-sm font-medium transition-all duration-200 ${
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
                  type="button"
                  onClick={() => setAddProductModalVisible(true)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-theme border border-theme rounded-lg hover:opacity-90 transition-all"
                >
                  <MdEdit size={18} />
                  Add Product
                </button>
                <button
                  type="button"
                  onClick={() => setChangePriceModalVisible(true)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-theme border border-theme rounded-lg hover:bg-theme hover:text-white transition-all"
                >
                  <MdEdit size={18} />
                  Change Price
                </button>
              </div>
            )}
          </div>
        </div>
        {viewMode === "admin" && (
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-sm font-medium text-amber-800">
              You are viewing <strong>Admin inventory</strong>.
            </p>
          </div>
        )}
        {viewMode === "localPartner" && selectedPartnerId && (
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
            <p className="text-sm font-medium text-emerald-800">
              You are viewing{" "}
              <strong>{selectedPartnerName}&apos;s inventory</strong> (Local
              Partner). Use &quot;Change Price&quot; or &quot;Add Product&quot;
              to manage.
            </p>
          </div>
        )}
        {viewMode === "localPartner" && !selectedPartnerId && (
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm font-medium text-blue-800">
              Select a Local Partner above to view and manage their inventory.
            </p>
          </div>
        )}

        <div className="inventory-stock-table">
          <MyDataTable
            columns={columns}
            data={datas}
            placeholder={"Search by Name, Product Code, SKU..."}
            pagination={true}
            serverPagination={{
              page:
                data?.pagination?.page || data?.data?.pagination?.page || page,
              limit:
                data?.pagination?.limit ||
                data?.data?.pagination?.limit ||
                limit,
              totalRecords:
                data?.pagination?.totalItems ||
                data?.data?.pagination?.totalItems ||
                0,
              totalPages:
                data?.pagination?.totalPages ||
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
              setPage(1); // Reset to first page when search changes
            }}
            search={true}
            rowTestId={(row) =>
              `data-testid-${INVENTORY_MANAGEMENT.row(row.id)}`
            }
          />
        </div>

        {/* Export format modal */}
        <Dialog
          visible={exportModalVisible}
          onHide={() => setExportModalVisible(false)}
          dismissableMask={true}
          header={
            <div className="text-center w-full pr-8">
              <h3 className="text-lg font-semibold text-gray-800">
                Export products
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Choose format for current products
              </p>
            </div>
          }
          className="font-nunito rounded-2xl overflow-hidden shadow-xl"
          style={{ width: "90vw", maxWidth: "460px" }}
          contentStyle={{ padding: "1.5rem 1.5rem 1.25rem" }}
          footer={
            <div className="flex justify-end pt-2 pb-1 px-1">
              <button
                type="button"
                onClick={() => setExportModalVisible(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          }
        >
          <div className="flex flex-col sm:flex-row gap-5">
            <button
              type="button"
              onClick={() => handleExportProducts("csv")}
              className="flex-1 flex flex-col items-center justify-center gap-3.5 p-6 rounded-xl border border-gray-200 bg-white hover:border-theme hover:bg-theme/5 hover:shadow-md transition-all duration-200 group"
            >
              <div className="w-14 h-14 rounded-full bg-gray-50 border border-gray-100 group-hover:bg-theme/10 flex items-center justify-center">
                <RiFileDownloadLine className="text-xl text-gray-600 group-hover:text-theme" />
              </div>
              <span className="font-semibold text-gray-800">Export as CSV</span>
              <span className="text-xs text-gray-500 text-center leading-relaxed">
                Comma-separated values
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleExportProducts("excel")}
              className="flex-1 flex flex-col items-center justify-center gap-3.5 p-6 rounded-xl border border-gray-200 bg-white hover:border-theme hover:bg-theme/5 hover:shadow-md transition-all duration-200 group"
            >
              <div className="w-14 h-14 rounded-full bg-gray-50 border border-gray-100 group-hover:bg-theme/10 flex items-center justify-center">
                <RiFileDownloadLine className="text-xl text-gray-600 group-hover:text-theme" />
              </div>
              <span className="font-semibold text-gray-800">
                Export as Excel
              </span>
              <span className="text-xs text-gray-500 text-center leading-relaxed">
                Open in Excel / Sheets
              </span>
            </button>
          </div>
        </Dialog>

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
            overflow: "visible",
          }}
          footer={
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setPartnerModalVisible(false);
                  setTempSelectedPartner(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPartner}
                className="px-4 py-2 bg-theme text-white rounded-lg font-medium"
              >
                Confirm
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Select a local partner to view and manage their inventory:
            </p>
            <Select
              onChange={handlePartnerSelect}
              placeholder="Select a partner..."
              options={partnerOptions}
              value={tempSelectedPartner}
              styles={{
                ...selectStyles2,
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                menu: (base) => ({ ...base, zIndex: 9999, maxHeight: "300px" }),
              }}
              menuPortalTarget={
                typeof document !== "undefined" ? document.body : null
              }
              menuPosition="fixed"
              isSearchable
            />
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
              Change Partner Inventory Prices – {selectedPartnerName}
            </div>
          }
          className="font-nunito"
          style={{ width: "90vw", maxWidth: "800px" }}
          contentStyle={{
            padding: "1.5rem",
            maxHeight: "85vh",
            minHeight: 0,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {submitPriceLoader ? (
            <div className="flex flex-col items-center justify-center py-12">
              <MiniLoader />
              <p className="text-gray-500 text-sm mt-4">Updating prices...</p>
            </div>
          ) : (
            <div className="flex flex-col min-h-0 flex-1 gap-4">
              <div className="flex-shrink-0">
                <div className="relative">
                  <input
                    type="search"
                    value={priceModalSearch}
                    onChange={(e) => setPriceModalSearch(e.target.value)}
                    placeholder="Search products..."
                    className="w-full h-12 bg-themeGray rounded-lg ps-10 pe-5 outline-none placeholder:font-inter placeholder:font-medium focus:bg-gray-200"
                  />
                  <LuSearch
                    size={20}
                    color="#111827"
                    className="absolute top-3.5 left-3"
                  />
                </div>
              </div>
              <div className="border border-borderColor rounded-md p-3 flex-1 min-h-0 overflow-y-auto space-y-2">
                {partnerInventoryLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <MiniLoader />
                    <p className="text-gray-500 text-sm mt-4">
                      Loading products...
                    </p>
                  </div>
                ) : filteredPriceModalProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <p className="text-gray-600 font-medium mb-1">
                      No products found
                    </p>
                    <p className="text-gray-400 text-sm">
                      {priceModalSearch
                        ? "Try a different search"
                        : "No products in partner inventory"}
                    </p>
                  </div>
                ) : (
                  filteredPriceModalProducts.map((prod) => {
                    const currentPrice =
                      editablePrices[prod?.id]?.price !== undefined
                        ? editablePrices[prod?.id]?.price
                        : prod?.customPrice ?? prod?.price ?? "";
                    const currentWholesale =
                      editablePrices[prod?.id]?.wholesalePrice !== undefined
                        ? editablePrices[prod?.id]?.wholesalePrice
                        : prod?.wholesalePrice ?? "";
                    return (
                      <div
                        key={prod?.id}
                        className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0"
                      >
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
                            unoptimized
                            onError={(e) => {
                              if (e.target.src !== "/images/logocoffee.png")
                                e.target.src = "/images/logocoffee.png";
                            }}
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="font-semibold text-gray-800">
                            {prod?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            SKU: {prod?.sku ?? "—"} · Code:{" "}
                            {prod?.productCode ?? "—"} · Weight:{" "}
                            {prod?.weight ?? "—"} lbs
                            {(prod?.grind && prod?.grind !== "null") && (
                              <> · Grind: {prod?.grind}</>
                            )}
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <div className="flex flex-col gap-1 w-28">
                            <label className="text-xs text-labelColor font-medium">
                              Selling Price ($)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={currentPrice}
                              onChange={(e) =>
                                handlePriceChange(
                                  prod?.id,
                                  "price",
                                  e.target.value
                                )
                              }
                              placeholder="0.00"
                              className="w-full border border-borderColor rounded px-2 py-1.5 text-black"
                            />
                          </div>
                          <div className="flex flex-col gap-1 w-28">
                            <label className="text-xs text-labelColor font-medium">
                              Wholesale ($)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={currentWholesale}
                              onChange={(e) =>
                                handlePriceChange(
                                  prod?.id,
                                  "wholesalePrice",
                                  e.target.value
                                )
                              }
                              placeholder="0.00"
                              className="w-full border border-borderColor rounded px-2 py-1.5 text-black"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="flex-shrink-0 flex justify-end gap-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setChangePriceModalVisible(false);
                    setPriceModalSearch("");
                    setEditablePrices({});
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitPriceChanges}
                  disabled={Object.keys(editablePrices).length === 0}
                  className="px-4 py-2 bg-theme text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
              Add Products to Partner Inventory – {selectedPartnerName}
            </div>
          }
          className="font-nunito"
          style={{ width: "90vw", maxWidth: "800px" }}
          contentStyle={{
            padding: "1.5rem",
            maxHeight: "85vh",
            minHeight: 0,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {submitAddProductLoader ? (
            <div className="flex flex-col items-center justify-center py-12">
              <MiniLoader />
              <p className="text-gray-500 text-sm mt-4">Adding products...</p>
            </div>
          ) : (
            <div className="flex flex-col min-h-0 flex-1 gap-4">
              <div className="flex-shrink-0 space-y-4">
                <div className="relative">
                  <input
                    type="search"
                    value={addProductSearch}
                    onChange={(e) => setAddProductSearch(e.target.value)}
                    placeholder="Search products..."
                    className="w-full h-12 bg-themeGray rounded-lg ps-10 pe-5 outline-none placeholder:font-inter placeholder:font-medium focus:bg-gray-200"
                  />
                  <LuSearch
                    size={20}
                    color="#111827"
                    className="absolute top-3.5 left-3"
                  />
                </div>
              </div>
              <div className="border border-borderColor rounded-md p-3 flex-1 min-h-0 overflow-y-auto space-y-2">
                {addProductLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <MiniLoader />
                    <p className="text-gray-500 text-sm mt-4">
                      Loading products...
                    </p>
                  </div>
                ) : filteredAddProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <p className="text-gray-600 font-medium mb-1">
                      No products found
                    </p>
                    <p className="text-gray-400 text-sm">
                      {addProductSearch
                        ? "Try a different search"
                        : "No products available to add"}
                    </p>
                  </div>
                ) : (
                  <>
                    {filteredAddProducts.length > 0 && (
                      <div
                        onClick={() =>
                          handleSelectAllAddProducts(
                            selectedAddProducts.length !==
                              filteredAddProducts.length
                          )
                        }
                        className="flex items-center gap-3 py-3 px-3 border-b border-gray-200 font-medium sticky -top-3 bg-white z-10 cursor-pointer hover:bg-gray-50 rounded-lg"
                      >
                        <input
                          type="checkbox"
                          checked={
                            filteredAddProducts.length > 0 &&
                            selectedAddProducts.length ===
                              filteredAddProducts.length
                          }
                          onChange={(e) =>
                            handleSelectAllAddProducts(e.target.checked)
                          }
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
                          className={`flex items-center gap-3 py-3 border-b border-gray-100 last:border-0 px-3 cursor-pointer rounded-lg ${
                            isSelected
                              ? "bg-blue-50 border-blue-200"
                              : "hover:bg-gray-50"
                          }`}
                        >
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
                              unoptimized
                              onError={(e) => {
                                if (e.target.src !== "/images/logocoffee.png")
                                  e.target.src = "/images/logocoffee.png";
                              }}
                            />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="font-semibold text-gray-800">
                              {prod?.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              SKU: {prod?.sku ?? "—"} · Code:{" "}
                              {prod?.productCode ?? "—"} · Weight:{" "}
                              {prod?.weight ?? "—"} lbs
                              {(prod?.grind && prod?.grind !== "null") && (
                                <> · Grind: {prod?.grind}</>
                              )}
                            </p>
                          </div>
                          <div
                            className="flex gap-3"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex flex-col gap-1 w-28">
                              <label className="text-xs text-labelColor font-medium">
                                Selling Price ($)
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                  addProductPrices[prod?.id]?.price !==
                                  undefined
                                    ? addProductPrices[prod?.id]?.price
                                    : prod?.price ?? ""
                                }
                                onChange={(e) =>
                                  handleAddProductPriceChange(
                                    prod?.id,
                                    "price",
                                    e.target.value
                                  )
                                }
                                disabled={!isSelected}
                                placeholder="0.00"
                                className="w-full border border-borderColor rounded px-2 py-1.5 text-black disabled:bg-gray-100 disabled:cursor-not-allowed"
                              />
                            </div>
                            <div className="flex flex-col gap-1 w-28">
                              <label className="text-xs text-labelColor font-medium">
                                Wholesale ($)
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                  addProductPrices[prod?.id]?.wholesalePrice !==
                                  undefined
                                    ? addProductPrices[prod?.id]?.wholesalePrice
                                    : prod?.wholesalePrice ?? ""
                                }
                                onChange={(e) =>
                                  handleAddProductPriceChange(
                                    prod?.id,
                                    "wholesalePrice",
                                    e.target.value
                                  )
                                }
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
              <div className="flex-shrink-0 flex justify-end gap-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setAddProductModalVisible(false);
                    setAddProductSearch("");
                    setAddProductPrices({});
                    setSelectedAddProducts([]);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitAddProducts}
                  disabled={selectedAddProducts.length === 0}
                  className="px-4 py-2 bg-theme text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Products
                  {selectedAddProducts.length > 0 && (
                    <span className="ml-1.5 opacity-90">
                      ({selectedAddProducts.length})
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </Dialog>

        {/* <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {data?.data?.data?.map((item, i) => (
          <StockCard
            key={i}
            itemName={item?.name}
            quantity={item?.quantity}
            unit={item?.unit}
            imageURL={item?.image}
          />
        ))}
      </div> */}
        {/* Modal */}
        <Dialog
          visible={modal === "add" || modal === "edit" || modal === "delete"}
          // style={{ width: "40vw" }}
          // breakpoints={{ "1496px": "40vw", "1024px": "70vw", "641px": "80vw" }}
          className="font-nunito w-[80%] lg:w-[40vw]"
          data-testid={INVENTORY_MANAGEMENT.stockModal}
          dismissableMask={true}
          onHide={handleCancel}
          header={
            <div
              className="font-nunito font-bold lg:text-2xl text-center"
              data-testid={INVENTORY_MANAGEMENT.stockModalTitle}
            >
              {modal === "add"
                ? "Add"
                : modal === "edit"
                ? "Update"
                : modal === "delete"
                ? "Delete"
                : ""}{" "}
              Stock/ Inventory
            </div>
          }
        >
          {loader === "add" ||
          loader === "edit" ||
          loader === "delete" ||
          loader === "prefill" ? (
            <MiniLoader data-testid={INVENTORY_MANAGEMENT.miniLoader} />
          ) : (
            <form
              onSubmit={handleStock}
              className="space-y-4 flex flex-col items-center"
            >
              {/* header */}
              {modal !== "delete" && (
                <button
                  type="button"
                  onClick={handleImageClick}
                  className="overflow-hidden rounded-xl border border-tabBorderColor border-opacity-40 size-28 flex items-center justify-center"
                  data-testid={INVENTORY_MANAGEMENT.stockImageInput}
                >
                  <input
                    type="file"
                    name="name"
                    className="image hidden"
                    onChange={handleImage}
                  />
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="product image"
                      className="h-full w-full object-cover object-center"
                    />
                  ) : (
                    <LuImageUp size={"100"} color="rgba(0, 0, 0, 0.6)" />
                  )}
                </button>
              )}

              {/* body */}
              <div className="w-full space-y-4">
                {modal === "delete" ? (
                  <p className="text-labelColor font-nunito font-medium text-lg text-center">
                    Are you sure you want to delete this Stock ?
                  </p>
                ) : (
                  <div className="space-y-4">
                    <div
                      className="flex flex-col gap-y-2 w-full"
                      data-testid={INVENTORY_MANAGEMENT.stockNameInput}
                    >
                      <label className="text-labelColor font-medium font-satoshi">
                        Item Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={productDetail?.name}
                        onChange={handleChange}
                        placeholder="Enter Item Name"
                        className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                      />
                    </div>

                    <div className="flex flex-col gap-y-2">
                      <label className="text-labelColor font-medium font-satoshi">
                        Description
                      </label>
                      <input
                        type="text"
                        name="desc"
                        value={productDetail?.desc}
                        onChange={handleChange}
                        placeholder="Enter Description"
                        className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                      />
                    </div>

                    <div
                      className="flex flex-col gap-y-2 w-full"
                      data-testid={INVENTORY_MANAGEMENT.stockCategorySelect}
                    >
                      <label className="text-labelColor font-medium font-satoshi">
                        Category
                      </label>
                      {/* <input
                        type="text"
                        name="unit"
                        value={productDetail?.unit}
                        onChange={handleChange}
                        placeholder="Enter unit"
                        className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                      /> */}
                      <Select
                        placeholder="Category"
                        className="w-full"
                        value={productDetail?.category}
                        styles={selectStyles2}
                        options={catOptions}
                        onChange={(e) => {
                          setProductDetail({ ...productDetail, category: e });
                        }}
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-y-4 gap-x-6">
                      <div className="flex flex-col gap-y-2 w-full">
                        <label className="text-labelColor font-medium font-satoshi">
                          Price($)
                        </label>
                        <input
                          type="text"
                          name="price"
                          min="0"
                          value={productDetail?.price}
                          onChange={handleChange}
                          placeholder="Enter price"
                          className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                          data-testid={INVENTORY_MANAGEMENT.stockPriceInput}
                        />
                        <div
                          className={`text-red-600 space-y-1 pb-1 ${
                            !/^\d*\.?\d*$/.test(productDetail?.price ?? "")
                              ? "block"
                              : "hidden"
                          }`}
                        >
                          <hr className="border-none h-0.5 bg-white bg-opacity-20" />
                          <p>Invalid Price</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-y-2 w-full">
                        <label className="text-labelColor font-medium font-satoshi">
                          Whole Sale Price($)
                        </label>
                        <input
                          type="text"
                          name="wholesalePrice"
                          min="0"
                          value={productDetail?.wholesalePrice}
                          onChange={handleChange}
                          placeholder="Enter whole sale price"
                          className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                          data-testid={
                            INVENTORY_MANAGEMENT.stockWholesalePriceInput
                          }
                        />
                        <div
                          className={`text-red-600 space-y-1 pb-1 ${
                            !/^\d*\.?\d*$/.test(
                              productDetail?.wholesalePrice ?? ""
                            )
                              ? "block"
                              : "hidden"
                          }`}
                        >
                          <hr className="border-none h-0.5 bg-white bg-opacity-20" />
                          <p>Invalid whole sale price</p>
                        </div>
                        {/* <Select
                  placeholder="Kg"
                  className="w-full"
                  styles={selectStyles2}
                /> */}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-y-4 gap-x-6">
                      <div className="flex flex-col gap-y-2 w-full">
                        <label className="text-labelColor font-medium font-satoshi">
                          Product Code
                        </label>
                        <input
                          type="text"
                          name="productCode"
                          min="0"
                          value={productDetail?.productCode}
                          onChange={handleChange}
                          placeholder="Enter Product Code"
                          className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                        />
                      </div>
                      <div className="flex flex-col gap-y-2 w-full">
                        <label className="text-labelColor font-medium font-satoshi">
                          SKU
                        </label>
                        <input
                          type="text"
                          name="sku"
                          min="0"
                          value={productDetail?.sku}
                          onChange={handleChange}
                          placeholder="Enter SKU"
                          className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                        />
                      </div>
                      <div className="flex flex-col gap-y-2 w-full">
                        <label className="text-labelColor font-medium font-satoshi">
                          Grind
                        </label>
                        <input
                          type="text"
                          name="grind"
                          min="0"
                          value={productDetail?.grind}
                          onChange={handleChange}
                          placeholder="Enter Grind"
                          className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-y-4 gap-x-6">
                      <div className="flex flex-col gap-y-2">
                        <label className="text-labelColor font-medium font-satoshi">
                          Quanity
                        </label>
                        <input
                          type="text"
                          name="quantity"
                          min="0"
                          value={productDetail?.quantity}
                          onChange={handleChange}
                          placeholder="Enter Quantity"
                          className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                        />
                        <div
                          className={`text-red-600 space-y-1 pb-1 ${
                            !/^\d*\.?\d*$/.test(productDetail?.quantity ?? "")
                              ? "block"
                              : "hidden"
                          }`}
                        >
                          <hr className="border-none h-0.5 bg-white bg-opacity-20" />
                          <p>Invalid Quantity</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-y-2">
                        <label className="text-labelColor font-medium font-satoshi">
                          Weight
                        </label>
                        <input
                          type="text"
                          name="weight"
                          min="0"
                          value={productDetail?.weight}
                          onChange={handleChange}
                          placeholder="Enter Weight"
                          className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                        />
                        {/* <div
                        className={`text-red-600 space-y-1 pb-1 ${
                          !/^\d*\.?\d*$/?.test(productDetail?.weight)
                            ? "block"
                            : "hidden"
                        }`}
                      >
                        <hr className="border-none h-0.5 bg-white bg-opacity-20" />
                        <p>Invalid Weight</p>
                      </div> */}
                      </div>

                      <div className="flex flex-col gap-y-2 w-full">
                        <label className="text-labelColor font-medium font-satoshi">
                          Units
                        </label>
                        <Select
                          placeholder="Kg"
                          className="w-full"
                          styles={selectStyles2}
                          options={[{ value: "lbs", label: "Pounds (lbs)" }]}
                          value={productDetail?.unit}
                          onChange={(e) => {
                            setProductDetail({ ...productDetail, unit: e });
                          }}
                        />
                      </div>
                    </div>

                    {/* Supplier SKUs */}
                    <div className="space-y-2 mt-4">
                      <label className="text-labelColor font-medium font-satoshi">
                        Supplier SKUs
                      </label>

                      <div className="border border-borderColor rounded-md p-3 max-h-64 overflow-y-auto space-y-3">
                        {supplierList?.length ? (
                          supplierList.map((sup) => (
                            <div
                              key={sup.id}
                              className="grid gap-3 sm:grid-cols-2 items-center"
                            >
                              <input
                                type="text"
                                readOnly
                                value={sup.supplierName ?? ""}
                                className="border border-borderColor rounded-[4px] px-2.5 py-3 bg-gray-50 text-black"
                              />
                              <input
                                type="text"
                                placeholder={`Enter SKU for ${
                                  sup.supplierName ?? "supplier"
                                }`}
                                value={supplierSkus[sup.id] ?? ""}
                                onChange={(e) =>
                                  handleSupplierSkuChange(
                                    sup.id,
                                    e.target.value
                                  )
                                }
                                className="border border-borderColor rounded-[4px] px-2.5 py-3 text-black placeholder:text-secondary"
                              />
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500">
                            No suppliers found.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-end gap-x-4 [&>button]:font-nunito [&>button]:py-3 [&>button]:font-medium">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="hover:bg-theme hover:text-white duration-150 rounded-lg border border-theme text-theme shadow-buttonShadow  px-6"
                    data-testid={INVENTORY_MANAGEMENT.stockModalCancelBtn}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg border border-theme text-white px-10  bg-theme"
                    data-testid={INVENTORY_MANAGEMENT.stockModalSubmitBtn}
                  >
                    {modal === "add"
                      ? "Add"
                      : modal === "edit"
                      ? "Update"
                      : modal === "delete"
                      ? "Delete"
                      : ""}{" "}
                    Stock
                  </button>
                </div>
              </div>
            </form>
          )}
        </Dialog>
      </div>
    </div>
  );
}
