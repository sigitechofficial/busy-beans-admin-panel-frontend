"use client";

import ManagementTab from "@/components/ui/ManagementTab";
import GetAPI from "@/utilities/GetAPI";
import Loader from "@/components/ui/Loader";
import dayjs from "dayjs";
import { useDataContext } from "@/utilities/DataContext";
import { CiMenuBurger } from "react-icons/ci";
import { useState, useEffect, useMemo, useRef } from "react";
// import DrawerBeansGenerateInvoice from "@/components/ui/DrawerBeansGenerateInvoice";
import MiniLoader from "@/components/ui/MiniLoader";
import { PostAPI } from "@/utilities/PostAPI";
import selectStyles, { selectStyles2, drawerSelectStyles } from "@/utilities/SelectStyle";
import { success_toaster, info_toaster } from "@/utilities/Toaster";
import { useRouter } from "next/navigation";
import { Dialog } from "primereact/dialog";
import { IoIosSearch } from "react-icons/io";
import Select from "react-select";
import { QuickbooksPingCheck } from "@/utilities/constants";
import axios from "axios";
import { BASE_URL } from "@/utilities/URL";
import ErrorHandler from "@/utilities/ErrorHandler";
import { hasPermission } from "@/utilities/Permission";
import Switch from "react-switch";
import { MdInsertComment, MdOutlineConfirmationNumber } from "react-icons/md";
import {
  preventInvalidNumberInputKeys,
  isValidTwoDecimalInput,
  formatToFixedTwo,
  normalizeQtyWithMaxDigits,
  hasExceededMaxNumericDigits,
  hasExceededMaxIntegerDigits,
} from "@/utilities/numberInput";

export default function CreateInvoice() {
  const MAX_CREATE_INVOICE_QTY_DIGITS = 5;
  const MAX_CREATE_INVOICE_UNIT_DIGITS = 6;

  const router = useRouter();
  let userID, userType, partnerType;
  if (typeof window !== "undefined") {
    userID = localStorage.getItem("userID");
    userType = localStorage.getItem("userType");
    partnerType = localStorage.getItem("partnerType");
  }

  const [isAdminEmployee, setIsAdminEmployee] = useState(false);
  const [isSalesRepEmployee, setIsSalesRepEmployee] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const userT = localStorage.getItem("userType");
    const isEmp = localStorage.getItem("isEmployee") === "true";
    setIsAdminEmployee(userT === "admin" && isEmp);
    setIsSalesRepEmployee(userT === "salesRepresentative" && isEmp);
  }, []);

  const { data, isLoading } = GetAPI(
    userType === "salesRepresentative"
      ? `api/v1/admin/orders?salesRepId=${userID}`
      : `api/v1/admin/orders`
  );

  const datas = [];
  const resultedOrders = data?.data?.data?.filter((detail) => {
    return (
      (detail?.paymentStatus === "pending" || detail?.paymentStatus === "done") &&
      datas.push({
        id: detail?.id,
        invoiceNumber: detail?.invoiceNumber,
        companyName: detail?.companyName,
        totalBill: "$" + detail?.totalBill,
        paymentStatus: detail?.paymentStatus === "done" ? "Paid" : "Unpaid",
        orderDate: dayjs(detail?.on).format("MM/DD/YYYY"),
      })
    );
  });

  const { toggle, setToggle } = useDataContext();
  const [invoiceData, setInvoiceData] = useState([]);
  
  // Single page - no step management needed

  // ========== DRAWER FUNCTIONALITY STATE ==========
  const [companyNameOptions, setCompanyNameOptions] = useState([]);
  const [fullData, setFullData] = useState("");
  const [emailOptions, setEmailOptions] = useState([]);
  const [addressOptions, setAddressOptions] = useState([]);
  const [email, setEmail] = useState("");
  const [loader, setLoader] = useState(false);
  const [partnersOrder, setPartnersOrder] = useState(false);
  const [isSelfOrder, setIsSelfOrder] = useState(false);
  const [partners, setPartners] = useState([]);
  const [srNameOptions, setSrNameOptions] = useState([]);
  // View mode: "admin" = admin inventory | "localPartner" = partner's inventory + partner's customers (same as orders/create)
  const [viewMode, setViewMode] = useState("admin");
  const [selectedPartnerId, setSelectedPartnerId] = useState(null);
  const [selectedPartnerName, setSelectedPartnerName] = useState(null);
  const [partnerModalVisible, setPartnerModalVisible] = useState(false);
  const [tempSelectedPartner, setTempSelectedPartner] = useState(null);

  // Pagination state for customers
  const [customerPage, setCustomerPage] = useState(1);
  const [customerLimit] = useState(30);
  const [customerHasMore, setCustomerHasMore] = useState(true);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [allCustomers, setAllCustomers] = useState([]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const customerSearchTimeoutRef = useRef(null);
  const selectedCustomerRef = useRef(null);
  const isSelectingRef = useRef(false);

  // Drawer form state
  const [order, setOrder] = useState({
    note: "",
    paymentMethod: "",
    poNumber: "",
    addressId: "",
    userId: "",
    salesRepId: "",
    shippingCharges: "",
  });

  // Cart items from localStorage
  let cartItems = [];
  if (typeof window !== "undefined") {
    cartItems = JSON.parse(localStorage.getItem("createOrderData")) || [];
  }

  const totalPriceFromCart = cartItems?.reduce(
    (a, b) => Number(a) + Number(b?.price) * Number(b?.qty),
    0
  );
  const totalWeightFromCart = cartItems?.reduce(
    (a, b) => Number(a) + Number(b?.weight || 0) * Number(b?.qty || 0),
    0
  );

  const paymentMethodOptions = [
    { label: "Bank Check", value: "bank check" },
    { label: "Card", value: "card" },
  ];

  let isEmployee;
  if (typeof window !== "undefined") {
    isEmployee = localStorage.getItem("isEmployee") === "true";
  }

  // Items section state
  const [filterId, setFilterId] = useState("");
  const [loading, setLoading] = useState(false);
  const [manual, setManual] = useState({
    shippingCharge: "",
    show: false,
  });
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState("");
  const [modalProductList, setModalProductList] = useState(null);
  const [modalProductsLoading, setModalProductsLoading] = useState(false);

  // Use current state values directly (no formData needed)

  const { data: shippingChargesData } = GetAPI(
    "api/v1/admin/shipping-charges-list",
    "charges"
  );
  const { data: category } = GetAPI(`api/v1/admin/category`);
  const { data: salesRepData } = GetAPI("api/v1/admin/sales-rep");

  // Partner options for Local Partner selection modal (same as orders/create)
  const partnerOptions = [];
  if (salesRepData?.data?.data) {
    salesRepData.data.data.forEach((partner) => {
      partnerOptions.push({
        value: partner?.id,
        label: `${partner?.srName} (${partner?.territoryName})`,
        srName: partner?.srName,
      });
    });
  }
  
  let categoryList = [{ value: "", label: "All" }];
  if (category) {
    category?.data?.data?.map((cat) => {
      categoryList.push({ value: cat?.id, label: cat?.name });
    });
  }
  const url = filterId
    ? `api/v1/admin/product?categoryId=${filterId}`
    : `api/v1/admin/product`;
  const { data: ProductList, reFetch: ProductRefetch } = GetAPI(url);

  // Add Item modal products: API expects sales rep id in the path.
  // - Partner view + self order → POST .../sales-rep-products-for-order-creation/{salesRepId}
  // - Direct partner order (admin) → same POST (order.userId = selected partner)
  // - Local Partner view (no self order) → GET api/v1/admin/products/sales-rep?...
  const salesRepIdForProducts = partnersOrder
    ? (isSelfOrder ? (order?.salesRepId || userID) : order?.userId)
    : viewMode === "localPartner"
      ? selectedPartnerId
      : userType === "salesRepresentative"
        ? (order?.salesRepId || userID)
        : null;
  const isLocalPartnerCase =
    (viewMode === "localPartner" && selectedPartnerId) ||
    (userType === "salesRepresentative" && !isSelfOrder);
  useEffect(() => {
    if (!modal) {
      setModalProductList(null);
      return;
    }
    if (!salesRepIdForProducts) {
      return;
    }
    let cancelled = false;
    setModalProductsLoading(true);

    if (isLocalPartnerCase) {
      // Local partner view: GET api/v1/admin/products/sales-rep (partner's inventory - admin selected partner or logged-in partner's own)
      const params = new URLSearchParams();
      params.set("page", "1");
      params.set("limit", "100");
      params.set("salesRepId", salesRepIdForProducts.toString());
      if (filterId) params.set("categoryId", filterId);
      const getUrl = `api/v1/admin/products/sales-rep?${params.toString()}`;
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      axios
        .get(`${BASE_URL}${getUrl}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })
        .then((res) => {
          if (cancelled) return;
          const raw = res?.data?.data ?? res?.data ?? [];
          const list = Array.isArray(raw) ? raw : raw?.data ?? [];
          setModalProductList(list);
        })
        .catch(() => {
          if (!cancelled) setModalProductList([]);
        })
        .finally(() => {
          if (!cancelled) setModalProductsLoading(false);
        });
    } else {
      // Partner view + self order, or direct partner order: POST sales-rep-products-for-order-creation/{salesRepId}
      PostAPI(
        `api/v1/admin/sales-rep-products-for-order-creation/${salesRepIdForProducts}`,
        undefined
      )
        .then((res) => {
          if (cancelled) return;
          const list =
            res?.data?.products ??
            res?.data?.data?.products ??
            (Array.isArray(res?.data?.data) ? res?.data?.data : []) ??
            (Array.isArray(res?.data) ? res?.data : []);
          setModalProductList(Array.isArray(list) ? list : []);
        })
        .catch(() => {
          if (!cancelled) setModalProductList([]);
        })
        .finally(() => {
          if (!cancelled) setModalProductsLoading(false);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [modal, salesRepIdForProducts, isLocalPartnerCase, selectedPartnerId, filterId, userType, userID, isSelfOrder, partnersOrder, order?.salesRepId]);

  const getToday = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getDueDate = () => {
    const due = new Date();
    due.setDate(due.getDate() + 30);
    return due.toISOString().split("T")[0];
  };

  // States for invoice fields
  const [invoiceFields, setInvoiceFields] = useState({
    invoiceNumber: "",
    poNumber: order?.poNumber || "",
    invoiceDate: getToday(),
    terms: "30",
    dueDate: getDueDate(),
    discountPercentage: 0,
    note: order?.note || "",
    emailInvoiceToCustomer: true,
    invoicePdf: "",
    shippingCharges: order?.shippingCharges || "",
  });

  // Update invoice fields when order changes
  useEffect(() => {
    setInvoiceFields((prev) => ({
      ...prev,
      poNumber: order?.poNumber || prev.poNumber,
      note: order?.note || prev.note,
      shippingCharges: order?.shippingCharges || prev.shippingCharges,
    }));
  }, [order?.poNumber, order?.note, order?.shippingCharges]);

  // Items state - initialize from cartItems; clear when cart is empty (e.g. after toggle)
  // Use stable dependency (string key) to avoid infinite loop: cartItems array reference changes every render when empty
  const [items, setItems] = useState([]);
  const cartItemsKey =
    typeof window === "undefined"
      ? ""
      : (() => {
          const stored = JSON.parse(localStorage.getItem("createOrderData")) || [];
          return stored.length + "_" + stored.map((i) => i?.id ?? i?.productId ?? "").join(",");
        })();
  useEffect(() => {
    const stored = typeof window !== "undefined" ? (JSON.parse(localStorage.getItem("createOrderData")) || []) : [];
    if (!stored.length) {
      setItems([]);
    } else {
      setItems(
        stored.map((item) => ({
          ...item,
          checked: true,
          qty: item.qty || 1,
          weight: item.weight,
          unit: item.price / (item.qty || 1),
          product: item.name,
          productCode: item.productCode || item.code || "",
          productId: item.productId || item.id,
        }))
      );
    }
  }, [cartItemsKey]);

  // Extra rows state (for added delivery/extra charges)
  const [extraRows, setExtraRows] = useState([]);

  // Extra Charge Rows
  const [extraCharges, setExtraCharges] = useState([]);

  // Calculate if all items are checked
  const allChecked =
    items.length > 0 &&
    items.every((item) => item.checked) &&
    (extraRows.length === 0 || extraRows.every((item) => item.checked));

  // Master checkbox handler
  const handleCheckAll = (checked) => {
    setItems((prev) => prev.map((item) => ({ ...item, checked })));
    setExtraRows((prev) => prev.map((item) => ({ ...item, checked })));
  };

  // Item checkbox handler
  const handleItemCheck = (itemIdx, checked) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === itemIdx ? { ...item, checked } : item))
    );
  };

  const normalizeQty = (rawValue) => {
    return normalizeQtyWithMaxDigits(rawValue, MAX_CREATE_INVOICE_QTY_DIGITS);
  };

  const clampQtyValue = (value) => {
    const qty = Number(value) || 0;
    return Math.max(1, Math.min(99999, qty));
  };

  const isValidUnitPriceInput = (value) =>
    isValidTwoDecimalInput(value) &&
    !hasExceededMaxNumericDigits(value, MAX_CREATE_INVOICE_UNIT_DIGITS);

  const wouldExceedInvoiceDerivedLimits = (nextGrandTotal, nextTotalWeight) =>
    hasExceededMaxIntegerDigits(nextGrandTotal) ||
    hasExceededMaxIntegerDigits(nextTotalWeight);

  // Item qty handler
  const handleItemQtyChange = (itemIdx, value) => {
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== itemIdx) return item;
        const nextQty = normalizeQty(value);
        const oldQty = Number(item.qty) || 0;
        const safeNextQty = Number(nextQty) || 0;
        const unitPrice = Number(item.unit ?? item.price) || 0;
        const itemWeight = Number(item.weight) || 0;
        const nextGrandTotal = Number(total) - oldQty * unitPrice + safeNextQty * unitPrice;
        const nextTotalWeight =
          Number(calculatedTotalWeight) - oldQty * itemWeight + safeNextQty * itemWeight;

        if (wouldExceedInvoiceDerivedLimits(nextGrandTotal, nextTotalWeight)) {
          info_toaster("Values cannot make total weight or grand total exceed 10 digits.");
          return item;
        }

        return { ...item, qty: nextQty };
      })
    );
  };

  // Extra row checkbox handler
  const handleExtraRowCheck = (rowIdx, checked) => {
    setExtraRows((prev) =>
      prev.map((item, idx) => (idx === rowIdx ? { ...item, checked } : item))
    );
  };

  // Add delivery/extra charges row
  // Admin creating invoice for partner, or partner view + self order: use wholesale price as unit
  const unitPriceForNewItem = (prod) =>
    (userType === "admin" && partnersOrder) || (userType === "salesRepresentative" && isSelfOrder)
      ? Number(prod?.wholesalePrice ?? prod?.wholesale ?? 0) || Number(prod?.price ?? 0)
      : Number(prod?.price ?? 0);

  const handleAddExtra = (prod) => {
    const itemIdx = items.findIndex((item) => item.productId == prod?.id);
    if (itemIdx !== -1) {
      setItems((prev) =>
        prev.map((item, idx) =>
          idx === itemIdx ? { ...item, qty: clampQtyValue((Number(item.qty) || 0) + 1) } : item
        )
      );
      setModal(false);
      return;
    }

    setExtraRows((prev) => {
      const existingIdx = prev.findIndex((item) => item.productId == prod?.id);
      if (existingIdx !== -1) {
        return prev.map((item, idx) =>
          idx === existingIdx
            ? { ...item, qty: clampQtyValue((Number(item.qty) || 0) + 1) }
            : item
        );
      }
      const unit = unitPriceForNewItem(prod);
      return [
        ...prev,
        {
          id: `extra-${Date.now()}`,
          productId: prod?.id,
          code: prod?.productCode || prod?.code || "",
          name: prod?.name,
          qty: clampQtyValue(prod?.qty),
          unit,
          checked: true,
          weight: prod?.weight,
          productCode: prod?.productCode || prod?.code || "",
          wholesalePrice: prod?.wholesalePrice ?? prod?.wholesale ?? unit,
        },
      ];
    });

    setModal(false);
  };

  // Handle input change for extra rows
  const handleExtraInputChange = (rowIdx, field, value) => {
    setExtraRows((prev) =>
      prev.map((item, idx) => {
        if (idx !== rowIdx) return item;
        if (field === "qty") {
          const nextQty = normalizeQty(value);
          const oldQty = Number(item.qty) || 0;
          const safeNextQty = Number(nextQty) || 0;
          const unitPrice = Number(item.unit) || 0;
          const itemWeight = Number(item.weight) || 0;
          const nextGrandTotal = Number(total) - oldQty * unitPrice + safeNextQty * unitPrice;
          const nextTotalWeight =
            Number(calculatedTotalWeight) - oldQty * itemWeight + safeNextQty * itemWeight;

          if (wouldExceedInvoiceDerivedLimits(nextGrandTotal, nextTotalWeight)) {
            info_toaster("Values cannot make total weight or grand total exceed 10 digits.");
            return item;
          }

          return { ...item, qty: nextQty };
        }
        if (field === "unit") {
          if (!isValidUnitPriceInput(value)) return item;
          const nextUnit = value === "" ? 0 : parseFloat(value) || 0;
          const qty = Number(item.qty) || 0;
          const oldUnit = Number(item.unit) || 0;
          const nextGrandTotal = Number(total) - qty * oldUnit + qty * nextUnit;

          if (wouldExceedInvoiceDerivedLimits(nextGrandTotal, calculatedTotalWeight)) {
            info_toaster("Values cannot make total weight or grand total exceed 10 digits.");
            return item;
          }

          return {
            ...item,
            unit: nextUnit,
          };
        }
        return {
          ...item,
          [field]: value,
        };
      })
    );
  };

  const handleInvoiceFieldChange = (field, value) => {
    if (field === "emailInvoiceToCustomer" && value) {
      setInvoiceFields((prev) => ({
        ...prev,
        [field]: value,
        invoiceDate: value ? prev.invoiceDate || getToday() : prev.invoiceDate,
      }));
    } else {
      setInvoiceFields((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleAddChargeRow = () => {
    setExtraCharges((prev) => [
      ...prev,
      {
        type: "charges",
        code: "",
        name: "",
        qty: 1,
        unit: 0,
        checked: true,
      },
    ]);
  };

  const handleChargeInputChange = (rowIdx, field, value) => {
    setExtraCharges((prev) =>
      prev.map((item, idx) => {
        if (idx !== rowIdx) return item;
        if (field === "qty") {
          const nextQty = normalizeQty(value);
          const oldQty = Number(item.qty) || 0;
          const safeNextQty = Number(nextQty) || 0;
          const unitPrice = Number(item.unit) || 0;
          const nextGrandTotal = Number(total) - oldQty * unitPrice + safeNextQty * unitPrice;

          if (wouldExceedInvoiceDerivedLimits(nextGrandTotal, calculatedTotalWeight)) {
            info_toaster("Values cannot make total weight or grand total exceed 10 digits.");
            return item;
          }

          return { ...item, qty: nextQty };
        }
        if (field === "unit") {
          if (!isValidUnitPriceInput(value)) return item;
          const nextUnit = value === "" ? 0 : parseFloat(value) || 0;
          const qty = Number(item.qty) || 0;
          const oldUnit = Number(item.unit) || 0;
          const nextGrandTotal = Number(total) - qty * oldUnit + qty * nextUnit;

          if (wouldExceedInvoiceDerivedLimits(nextGrandTotal, calculatedTotalWeight)) {
            info_toaster("Values cannot make total weight or grand total exceed 10 digits.");
            return item;
          }

          return {
            ...item,
            unit: nextUnit,
          };
        }
        return {
          ...item,
          [field]: value,
        };
      })
    );
  };

  const handleChargeRowCheck = (rowIdx, checked) => {
    setExtraCharges((prev) =>
      prev.map((item, idx) => (idx === rowIdx ? { ...item, checked } : item))
    );
  };

  const chargesForApi = (extraCharges || [])
    .filter((item) => item.checked)
    .map((item) => ({
      type: "charges",
      code: item.code,
      name: item.name,
      qty: item.qty,
      price: String(item.unit),
      total: item.qty * item.unit,
    }));

  // Calculate total weight
  const calculatedTotalWeight = useMemo(() => {
    return (
      items
        .filter((item) => item.checked)
        .reduce(
          (sum, item) => sum + (Number(item.weight) || 0) * (item.qty || 1),
          0
        ) +
      extraRows
        .filter((item) => item.checked)
        .reduce(
          (sum, item) => sum + (Number(item.weight) || 0) * (item.qty || 1),
          0
        )
    );
  }, [items, extraRows]);

  // Find the shipping charge based on totalWeight
  const shippingChargeObj = shippingChargesData?.data?.data?.find(
    (sc) => calculatedTotalWeight >= sc.weightFrom && calculatedTotalWeight <= sc.weightTo
  );
  let shippingCharge = shippingChargeObj
    ? Number(shippingChargeObj.charges)
    : 0;

  // Partner customer direct invoice: invoice to a customer of a local partner. We fetch shipping from API and display it (same as other invoices).
  const isInvoiceForPartnerCustomer =
    viewMode === "localPartner" &&
    selectedPartnerId &&
    order?.userId &&
    !isSelfOrder;

  // Partner logged in creating invoice for their customer (not self order). Direct partner → shipping 0; Dropship → shipping from API.
  const isPartnerLoggedInCustomerOrder =
    userType === "salesRepresentative" && !isSelfOrder && !!order?.userId;
  const isDirectPartnerLoggedIn = partnerType === "direct-partner";

  // Update shipping charges when total weight changes (auto calculate mode). Partner customer: hit API and use returned shipping.
  useEffect(() => {
    // Partner logged in + Customer Order + Direct Partner → shipping 0.00
    if (isPartnerLoggedInCustomerOrder && isDirectPartnerLoggedIn) {
      setInvoiceFields((prev) => ({ ...prev, shippingCharges: "0.00" }));
      setOrder((prev) => ({ ...prev, shippingCharges: 0 }));
      return;
    }
    // Partner logged in + Customer Order + Dropship Partner → fetch shipping from API
    if (isPartnerLoggedInCustomerOrder && !isDirectPartnerLoggedIn && order?.userId && calculatedTotalWeight > 0) {
      fetchChargesForCustomer(order.userId, calculatedTotalWeight);
      return;
    }
    if (isPartnerLoggedInCustomerOrder && !isDirectPartnerLoggedIn && (!order?.userId || calculatedTotalWeight === 0)) {
      setInvoiceFields((prev) => ({ ...prev, shippingCharges: "" }));
      setOrder((prev) => ({ ...prev, shippingCharges: "" }));
      return;
    }
    // Admin: local partner view, invoice for partner's customer
    if (isInvoiceForPartnerCustomer && order?.userId && calculatedTotalWeight > 0) {
      fetchChargesForCustomer(order.userId, calculatedTotalWeight);
      return;
    }
    if (isInvoiceForPartnerCustomer && (!order?.userId || calculatedTotalWeight === 0)) {
      setInvoiceFields((prev) => ({ ...prev, shippingCharges: "0" }));
      setOrder((prev) => ({ ...prev, shippingCharges: 0 }));
      return;
    }
    if (!manual.show && calculatedTotalWeight > 0 && shippingChargesData?.data?.data) {
      const shippingChargeObj = shippingChargesData.data.data.find(
        (sc) => calculatedTotalWeight >= sc.weightFrom && calculatedTotalWeight <= sc.weightTo
      );
      if (shippingChargeObj) {
        const calculatedCharge = Number(shippingChargeObj.charges);
        setInvoiceFields((prev) => ({
          ...prev,
          shippingCharges: calculatedCharge.toFixed(2),
        }));
      } else {
        setInvoiceFields((prev) => ({
          ...prev,
          shippingCharges: "",
        }));
      }
    }
  }, [
    isInvoiceForPartnerCustomer,
    isPartnerLoggedInCustomerOrder,
    isDirectPartnerLoggedIn,
    calculatedTotalWeight,
    manual.show,
    shippingChargesData,
    order?.userId,
  ]);

  // ========== DRAWER FUNCTIONALITY FUNCTIONS ==========
  
  // Get customer list endpoint (mirror orders/create + DrawerBeans: not-assigned for admin, partner's customers for local partner)
  const getCustomerListEndpoint = (page, limit, search = "") => {
    let base = "";
    if (userType === "admin") {
      if (viewMode === "localPartner" && selectedPartnerId) {
        base = `api/v1/admin/customer-management/customer-list/sale-rep-id/${selectedPartnerId}`;
      } else if (!partnersOrder) {
        base = `api/v1/admin/customer-management/customer-list/not-assigned`;
      } else {
        base = `api/v1/admin/customer-management/customer-list/all`;
      }
    } else if (isEmployee && hasPermission("selected-customer_view")) {
      base = `api/v1/admin/customer-management/customer-list/employee-id/${userID}`;
    } else if (userType === "salesRepresentative") {
      base = `api/v1/admin/customer-management/customer-list/sale-rep-id/${userID}`;
    } else {
      base = `api/v1/admin/customer-management/customer-list/all`;
    }

    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", limit.toString());
    if (search.trim()) {
      params.set("search", search.trim());
    }
    // Employee with customer_create: add cus=all; selected-customer_create only: no param (main entities untouched)
    if (isEmployee && hasPermission("customer_create")) {
      params.set("cus", "all");
    }
    if (base.includes("&orderCreation=yes")) {
      return `${base.split("&")[0]}?${params.toString()}&orderCreation=yes`;
    }
    return `${base}?${params.toString()}`;
  };

  // Fetch charges for customer
  const fetchChargesForCustomer = async (customerId, weight) => {
    if (!customerId || !weight) return;
    try {
      const res = await PostAPI(
        `api/v1/admin/shipping-charges-on-weight/customer/${customerId}`,
        { weight }
      );
      if (res?.data?.status === "success") {
        const payload = res?.data?.data || {};
        const shipping = Number(
          payload?.shippingCharges ?? payload?.charges ?? 0
        );
        setOrder((prev) => ({
          ...prev,
          shippingCharges: shipping,
        }));
      } else {
        throw new Error(res?.data?.message || "Failed to fetch charges.");
      }
    } catch (err) {
      ErrorHandler(err);
    }
  };

  // Handle company/customer selection
  const handleCompanySelect = (companyId) => {
    // Set flag to prevent API calls during selection
    isSelectingRef.current = true;
    
    const selected =
      allCustomers?.find((c) => c?.id === companyId) ||
      fullData?.find((c) => c?.id === companyId);
    
    // Store selected customer in ref to preserve it during searches
    selectedCustomerRef.current = selected;
    
    setOrder((prev) => ({
      ...prev,
      userId: selected?.id,
      addressId: "",
      paymentMethod: selected?.preferredPaymentMethod || "",
    }));
    setEmail(selected?.email || "");

    const addressList = (selected?.addresses ?? []).map((address) => {
      const parts = [
        address.companyaddress,
        address.addressLineOne,
        address.addressLineTwo,
        address.town,
        address.state,
        address.zipCode,
        address.country,
      ].filter((p) => p && p.trim() !== "");
      return { value: address.id, label: parts.join(", ") };
    });
    setAddressOptions(addressList);
    
    // Reset flag after a short delay to allow state updates
    setTimeout(() => {
      isSelectingRef.current = false;
    }, 100);
    // fetchChargesForCustomer is called automatically by useEffect when order.userId changes
  };

  // Handle partner selection for self order
  const handleSrNameSelect = (selectedOption) => {
    if (!selectedOption || !selectedOption.value) {
      setEmail("");
      setAddressOptions([]);
      setOrder((prev) => ({
        ...prev,
        salesRepId: "",
        addressId: "",
      }));
      return;
    }

    const selectedPartner = partners?.find(
      (p) => p?.id === selectedOption?.value
    );

    if (!selectedPartner) {
      setEmail("");
      setAddressOptions([]);
      return;
    }

    setEmail(selectedPartner?.email || "");

    setOrder((prev) => ({
      ...prev,
      salesRepId: selectedPartner?.id,
      userId: "",
      addressId: "",
    }));

    const addresses = selectedPartner?.addresses || [];
    const addressList = addresses
      .filter((address) => address && address.id != null)
      .map((address) => {
        const parts = [
          address.companyaddress,
          address.addressLineOne,
          address.addressLineTwo,
          address.town,
          address.state,
          address.zipCode,
          address.country,
        ].filter((part) => part != null && String(part).trim() !== "");

        return {
          value: address.id,
          label: parts.length > 0 ? parts.join(", ") : `Address ${address.id}`,
        };
      });

    setAddressOptions(addressList);
  };

  // Fetch sales rep's own data for self order
  const fetchSalesRepSelfData = async () => {
    try {
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");
      const res = await axios.get(
        `${BASE_URL}api/v1/admin/sales-rep/${userID}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      if (res?.data?.status === "success") {
        const salesRepData = res?.data?.data?.data || res?.data?.data || {};

        const salesRepEmail =
          salesRepData?.email || localStorage.getItem("email") || "";
        setEmail(salesRepEmail);

        setOrder((prev) => ({
          ...prev,
          salesRepId: salesRepData?.id || userID,
          userId: "",
          addressId: "",
        }));

        const addresses = salesRepData?.addresses || [];
        const addressList = addresses
          .filter((address) => address && address.id != null)
          .map((address) => {
            const parts = [
              address.companyaddress,
              address.addressLineOne,
              address.addressLineTwo,
              address.town,
              address.state,
              address.zipCode,
              address.country,
            ].filter((part) => part != null && String(part).trim() !== "");

            return {
              value: address.id,
              label:
                parts.length > 0 ? parts.join(", ") : `Address ${address.id}`,
            };
          });

        setAddressOptions(addressList);
      }
    } catch (error) {
      console.error(error);
      ErrorHandler(error);
    }
  };

  // Handle self order toggle for sales representatives
  const handleSelfOrderToggle = (checked) => {
    setIsSelfOrder(checked);
    resetSelectedItems();

    if (checked) {
      setOrder((prev) => ({
        ...prev,
        salesRepId: "",
        userId: "",
        addressId: "",
      }));
      setEmail("");
      setAddressOptions([]);
      fetchSalesRepSelfData();
    } else {
      setOrder((prev) => ({
        ...prev,
        salesRepId: "",
      }));
      setEmail("");
      setAddressOptions([]);
      setPartners([]);
      setSrNameOptions([]);
      selectedCustomerRef.current = null;
      fetchCustomerData(1, false, customerSearchQuery);
    }
  };

  // Reset all form fields when user type / customer vs partner / view changes
  const resetSelectedItems = () => {
    setItems([]);
    setExtraRows([]);
    setExtraCharges([]);
    if (typeof window !== "undefined") {
      localStorage.setItem("createOrderData", JSON.stringify([]));
    }
    setInvoiceFields((prev) => ({
      ...prev,
      invoiceNumber: "",
      poNumber: "",
      invoiceDate: getToday(),
      dueDate: getDueDate(),
      terms: "30",
      discountPercentage: 0,
      note: "",
      shippingCharges: "",
    }));
  };

  // Handle partner order toggle (admin only) - invoice for partner (direct)
  const handlePartnerOrder = (e) => {
    setPartnersOrder(e);
    resetSelectedItems();
    setOrder({
      note: "",
      paymentMethod: "",
      poNumber: "",
      addressId: "",
      userId: "",
      salesRepId: "",
      shippingCharges: "",
    });
    setCompanyNameOptions([]);
    setEmail("");
    setAddressOptions([]);
    setEmailOptions([]);
    selectedCustomerRef.current = null;
    if (!e) {
      setCustomerPage(1);
      setAllCustomers([]);
      setCustomerSearchQuery("");
    } else {
      setCustomerPage(1);
      setAllCustomers([]);
      setCustomerSearchQuery("");
    }
  };

  // Local Partner view (same as orders/create): partner's inventory + partner's customers
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
      setSelectedPartnerName(tempSelectedPartner.srName ?? tempSelectedPartner.label);
      setViewMode("localPartner");
      setPartnerModalVisible(false);
      setTempSelectedPartner(null);
      resetSelectedItems();
      setOrder({ note: "", paymentMethod: "", poNumber: "", addressId: "", userId: "", salesRepId: "", shippingCharges: "" });
      setCompanyNameOptions([]);
      setEmail("");
      setAddressOptions([]);
      setCustomerPage(1);
      setAllCustomers([]);
      setCustomerSearchQuery("");
      selectedCustomerRef.current = null;
    } else {
      info_toaster("Please select a partner");
    }
  };

  const handleClearPartner = () => {
    setSelectedPartnerId(null);
    setSelectedPartnerName(null);
    setViewMode("admin");
    setTempSelectedPartner(null);
    resetSelectedItems();
    setOrder({ note: "", paymentMethod: "", poNumber: "", addressId: "", userId: "", salesRepId: "", shippingCharges: "" });
    setCompanyNameOptions([]);
    setEmail("");
    setAddressOptions([]);
    setCustomerPage(1);
    setAllCustomers([]);
    setCustomerSearchQuery("");
    selectedCustomerRef.current = null;
  };

  // Fetch customers with pagination and search
  const fetchCustomerData = async (
    page,
    append = false,
    searchQuery = customerSearchQuery
  ) => {
    if (customerLoading) return;
    if (partnersOrder && viewMode === "admin") return;
    if (viewMode === "localPartner" && !selectedPartnerId) return;

    setCustomerLoading(true);
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("accessToken");
      const endpoint = getCustomerListEndpoint(
        page,
        customerLimit,
        searchQuery
      );

      const res = await axios.get(`${BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          feature: "customer",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res?.data?.status === "success") {
        const customers = res?.data?.data?.data || res?.data?.data || [];
        const totalItems =
          res?.data?.pagination?.totalItems ||
          res?.data?.data?.pagination?.totalItems ||
          customers.length;
        const totalPages =
          res?.data?.pagination?.totalPages ||
          res?.data?.data?.pagination?.totalPages ||
          Math.ceil(totalItems / customerLimit);

        const nameOptions = customers.map((user) => ({
          value: user?.id,
          label: `${user?.companyName} (${user?.name})`,
        }));

        const emails = customers.map((user) => ({
          value: user?.email,
          label: user?.email,
        }));

        if (append) {
          setCompanyNameOptions((prev) => {
            // Remove duplicates
            const existingIds = new Set(prev.map(opt => opt.value));
            const newOptions = nameOptions.filter(opt => !existingIds.has(opt.value));
            return [...prev, ...newOptions];
          });
          setEmailOptions((prev) => {
            const existingEmails = new Set(prev.map(opt => opt.value));
            const newEmails = emails.filter(opt => !existingEmails.has(opt.value));
            return [...prev, ...newEmails];
          });
          setAllCustomers((prev) => {
            const existingIds = new Set(prev.map(c => c.id));
            const newCustomers = customers.filter(c => !existingIds.has(c.id));
            return [...prev, ...newCustomers];
          });
        } else {
          // Always include selected customer in options if it exists and is not in results
          let finalNameOptions = nameOptions;
          let finalCustomers = customers;
          
          const selectedCustomer = selectedCustomerRef.current;
          // Only add selected customer if it's valid and has required fields
          if (selectedCustomer && 
              selectedCustomer.id && 
              selectedCustomer.companyName && 
              selectedCustomer.name &&
              !customers.find(c => c.id === selectedCustomer.id)) {
            finalCustomers = [selectedCustomer, ...customers];
            finalNameOptions = [
              {
                value: selectedCustomer.id,
                label: `${selectedCustomer.companyName} (${selectedCustomer.name})`,
              },
              ...nameOptions
            ];
          }
          
          setCompanyNameOptions(finalNameOptions);
          setEmailOptions(emails);
          setAllCustomers(finalCustomers);
        }

        setFullData(customers);
        setCustomerHasMore(page < totalPages);
        setCustomerPage(page);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setCustomerLoading(false);
    }
  };

  // Handle search input change with debounce
  const handleCustomerSearchChange = (inputValue, actionMeta) => {
    // Prevent API call if we're currently selecting a customer
    if (isSelectingRef.current) {
      return;
    }
    
    // Prevent API call on selection or menu actions - only search when user is actually typing
    if (actionMeta?.action === 'input-blur' || 
        actionMeta?.action === 'menu-close' || 
        actionMeta?.action === 'set-value') {
      return;
    }
    
    // Don't refetch if search query hasn't changed
    if (inputValue === customerSearchQuery) {
      return;
    }

    if (customerSearchTimeoutRef.current) {
      clearTimeout(customerSearchTimeoutRef.current);
    }

    customerSearchTimeoutRef.current = setTimeout(() => {
      setCustomerSearchQuery(inputValue);
      setCustomerPage(1);
      
      // Only clear and refetch if we're doing a new search
      // Don't clear if input is empty and we have a selected customer
      if (inputValue.trim() !== "" || !order?.userId) {
        // Don't clear selected customer from allCustomers - preserve it
        setCompanyNameOptions([]);
        setEmailOptions([]);
        // Only clear customers that aren't the selected one
        if (order?.userId && selectedCustomerRef.current) {
          setAllCustomers([selectedCustomerRef.current]);
        } else {
          setAllCustomers([]);
        }
        fetchCustomerData(1, false, inputValue);
      }
    }, 500);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (customerSearchTimeoutRef.current) {
        clearTimeout(customerSearchTimeoutRef.current);
      }
    };
  }, []);

  // Load more customers on scroll
  const handleMenuScrollToBottom = () => {
    if (!customerLoading && customerHasMore && !partnersOrder) {
      fetchCustomerData(customerPage + 1, true, customerSearchQuery);
    }
  };

  // Alternative scroll handler
  const handleMenuScroll = (event) => {
    if (partnersOrder) return;

    const { target } = event;
    if (!target) return;

    const { scrollTop, scrollHeight, clientHeight } = target;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      if (!customerLoading && customerHasMore) {
        fetchCustomerData(customerPage + 1, true, customerSearchQuery);
      }
    }
  };

  // Fetch direct partner data
  const fetchDirectPartnerData = async (selfOrder = false) => {
    try {
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");
      let selfOrderUser = selfOrder ? `&&salesRepId=${userID}` : "";
      const res = await axios.get(
        `${BASE_URL}api/v1/admin/sales-rep/for-order-creation?partnerType=direct-partner${selfOrderUser}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      if (res?.data?.status === "success") {
        const list = res?.data?.data || [];

        if (isSelfOrder) {
          setPartners(list);
          setSrNameOptions(
            list?.map((p) => ({
              value: p?.id,
              label: p?.srName + ` ( ${p?.territoryName} )`,
            }))
          );
        } else {
          setFullData(list);
          let options = [];
          list?.map((elem) => {
            options.push({
              value: elem?.id,
              label: `${elem?.srName} (${elem?.territoryName})`,
            });
          });
          setCompanyNameOptions(options);
        }
      }
    } catch (error) {
      console.error(error);
      ErrorHandler(error);
    }
  };

  // Fetch data on mount and when toggles change
  useEffect(() => {
    if (partnersOrder && viewMode === "admin") {
      fetchDirectPartnerData();
      setCustomerPage(1);
      setCompanyNameOptions([]);
      setAllCustomers([]);
      setCustomerSearchQuery("");
      selectedCustomerRef.current = null;
    } else if (viewMode === "localPartner" && selectedPartnerId) {
      setCustomerPage(1);
      setAllCustomers([]);
      setCustomerSearchQuery("");
      selectedCustomerRef.current = null;
      fetchCustomerData(1, false, "");
    } else if (!isSelfOrder && !partnersOrder) {
      selectedCustomerRef.current = null;
      fetchCustomerData(1, false, customerSearchQuery);
    }
  }, [partnersOrder, isSelfOrder, viewMode, selectedPartnerId]);

  // Fetch sales rep's own data when self order is toggled
  useEffect(() => {
    if (isSelfOrder && userType === "salesRepresentative") {
      fetchSalesRepSelfData();
    }
  }, [isSelfOrder]);

  // Fetch charges when customer is selected - DISABLED to prevent API call on customer selection
  // useEffect(() => {
  //   if (order?.userId && !partnersOrder && !isSelfOrder) {
  //     fetchChargesForCustomer(order?.userId, totalWeightFromCart);
  //   }
  // }, [order?.userId, totalWeightFromCart, partnersOrder, isSelfOrder]);

  // Validate form before generating invoice
  const validateForm = () => {
    if (!email?.trim()) {
      info_toaster("Email cannot be empty.");
      return false;
    }
    if (!order?.addressId && !isSelfOrder) {
      info_toaster("Address cannot be empty.");
      return false;
    }
    if (!order?.paymentMethod?.trim()) {
      info_toaster("Payment method cannot be empty.");
      return false;
    }
    return true;
  };

  // Calculate total
  const total =
    items
      .filter((item) => item.checked)
      .reduce(
        (sum, item) =>
          sum +
          (item.qty || 1) *
          (item.unit !== undefined
            ? item.unit
            : item.price !== undefined
              ? item.price
              : 0),
        0
      ) +
    extraRows
      .filter((item) => item.checked)
      .reduce((sum, item) => sum + item.qty * item.unit, 0) +
    extraCharges
      .filter((item) => item.checked)
      .reduce((sum, item) => sum + item.qty * item.unit, 0) +
    (manual.show
      ? parseFloat(shippingCharge)
      : parseFloat(invoiceFields?.shippingCharges) || 0);

  // Count checked items
  const checkedCount =
    items.filter((item) => item.checked).length +
    extraRows.filter((item) => item.checked).length +
    extraCharges.filter((item) => item.checked).length;

  // Map items for payload
  const mapItemsForPayload = (items) =>
    items?.map((item) => ({
      categoryId: item?.categoryId,
      createdAt: item?.createdAt,
      deleted: false,
      desc: item?.desc,
      productId: item?.productId || item?.id,
      image: item?.image,
      name: item?.name || item?.product,
      price: item?.price || (item?.unit * item?.qty),
      qty: item?.qty,
      quantity: item?.quantity,
      status: true,
      unit: item?.unit || item?.price,
      updatedAt: item?.updatedAt,
      weight: item?.weight,
      wholesalePrice: item?.wholesalePrice,
    })) || [];

  const handleGenerateInvoice = async () => {
    // Validate form first
    if (!validateForm()) {
      return;
    }

    if (hasExceededMaxIntegerDigits(calculatedTotalWeight)) {
      info_toaster("Total weight cannot exceed 10 digits.");
      return;
    }

    if (hasExceededMaxIntegerDigits(total)) {
      info_toaster("Grand total cannot exceed 10 digits.");
      return;
    }

    if (Number(total) <= 0) {
      info_toaster("Invoice total must be greater than 0.");
      return;
    }

    const hasEmptyExtraChargeName = (extraCharges || [])
      .filter((c) => c.checked)
      .some((c) => !String(c.name || "").trim());

    if (hasEmptyExtraChargeName) {
      info_toaster("Please enter a name for all extra charges.");
      return;
    }

    setLoading(true);

    // Prepare items for API
    const itemsForApi = [
      ...items
        .filter((item) => item.checked)
        .map((item) => ({
          productId: item.productId || item.id,
          product: item.product || item.name,
          productCode: item.productCode || item.code || "",
          qty: item.qty,
          price: item.price || (item.unit * item.qty),
          discount: item.discount || 0,
          wholesalePrice: item.wholesalePrice || 0,
        })),
      ...extraRows
        .filter((item) => item.checked)
        .map((item) => ({
          productId: item.productId,
          product: item.product ?? item.productName ?? item.name,
          productCode: item.productCode ?? item.code,
          qty: item.qty,
          price: String(item.unit * item.qty),
          discount: item.discount || 0,
          wholesalePrice: item.wholesalePrice || 0,
        })),
    ];

    const itemsPrice = Number(total - (parseFloat(invoiceFields?.shippingCharges) || 0));
    const shipping = Number(invoiceFields?.shippingCharges || order?.shippingCharges || 0);
    const totalBill = itemsPrice + shipping;

    const payload = {
      email: [email || ""],
      order: {
        totalBill: totalBill.toFixed(2),
        subTotal: itemsPrice.toFixed(2),
        discountPrice: (0).toFixed(2),
        discountPercentage: Number(invoiceFields.discountPercentage || 0),
        itemsPrice: itemsPrice.toFixed(2),
        vat: 0.0,
        totalWeight: calculatedTotalWeight,
        shippingCharges: shipping.toFixed(2),
        invoiceNumber: invoiceFields.invoiceNumber || "",
        poNumber: invoiceFields.poNumber || order?.poNumber || "",
        termDays: invoiceFields.terms || "",
        dueDate: invoiceFields.dueDate || "",
        note: invoiceFields.note || order?.note || "",
        addressId: order?.addressId,
        ...(viewMode === "localPartner"
          ? { userId: order?.userId }
          : partnersOrder || isSelfOrder
          ? { salesRepId: isSelfOrder ? order?.salesRepId : order?.userId }
          : { userId: order?.userId }),
        paymentMethod: order?.paymentMethod,
        invoiceOnly: true,
        type: "direct-invoice",
        emailInvoiceToCustomer: invoiceFields.emailInvoiceToCustomer,
        invoiceDate: invoiceFields.emailInvoiceToCustomer ? invoiceFields.invoiceDate : null,
      },
      items: mapItemsForPayload(items.filter((item) => item.checked).concat(extraRows.filter((item) => item.checked))),
      typeCharges: chargesForApi,
    };

    try {
      // Three cases (same as orders/create): admin customer, (partner + partner inventory) customer, partner order (direct)
      let endpoint;
      if (userType === "admin") {
        if (viewMode === "localPartner") {
          endpoint = `api/v1/admin/book-new-order`;
        } else if (partnersOrder) {
          endpoint = `api/v1/admin/partner-order/book-new-order`;
        } else {
          endpoint = `api/v1/admin/book-new-order`;
        }
      } else {
        endpoint = isSelfOrder
          ? `api/v1/admin/partner-order/book-new-order`
          : `api/v1/admin/sales-rep/book-new-order/${userID}`;
      }

      const res = await PostAPI(endpoint, payload, "invoices");

      if (res?.data?.status === "success") {
        const orderId = res?.data?.data?.id;
        success_toaster("Invoice generated successfully");
        localStorage.setItem("createOrderData", JSON.stringify([]));
        localStorage.removeItem("invoiceFormData");
        if (orderId) {
          router.push(
            viewMode === "localPartner" || (!partnersOrder && !isSelfOrder)
              ? `/direct-invoices/${orderId}/add-invoice`
              : `/direct-invoices/partner/${orderId}/add-invoice`
          );
        }
      } else {
        throw new Error(res?.data?.message || "Failed to generate invoice.");
      }
    } catch (err) {
      info_toaster(err?.message || "Failed to generate invoice.");
    } finally {
      setLoading(false);
    }
  };

  const useModalProductsForList =
    (partnersOrder || isLocalPartnerCase || (userType === "salesRepresentative" && isSelfOrder)) &&
    salesRepIdForProducts;
  const handleFilter = () => {
    const sourceList = useModalProductsForList
      ? (modalProductList || [])
      : (ProductList?.data?.data || []);
    let list = sourceList.filter((item) =>
      (item?.name || "")
        .toLowerCase()
        .includes((search || "").toLowerCase())
    );
    if (filterId) {
      list = list.filter(
        (item) => String(item?.categoryId) === String(filterId)
      );
    }
    return list;
  };

  useEffect(() => {
    QuickbooksPingCheck();
  }, []);

  // Single page layout - all sections visible
  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed">
        <div className="flex items-center gap-2">
          <p onClick={() => setToggle(!toggle)} className="cursor-pointer md:hidden">
            <CiMenuBurger size={20} />
          </p>
          <h2 className="text-xl font-inter font-semibold">Create Invoice</h2>
        </div>
      </div>

      <div className="space-y-8 pb-6 pt-28 2xl:pt-32 px-6 2xl:px-12">
        {/* ========== VIEW PRODUCTS (Admin only - hidden for admin employee) ========== */}
        {userType === "admin" && !isAdminEmployee && (
          <div className="bg-white rounded-lg border border-borderColor shadow-tableShadow p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <span className="text-sm font-semibold text-gray-700">View Products:</span>
                <div className="flex items-center gap-1 border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
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
                  <div className="w-px h-6 bg-gray-200" />
                  <button
                    type="button"
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
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearPartner();
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handleClearPartner()}
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
        )}

        {/* ========== CONTEXT BANNERS (hidden for admin employee) ========== */}
        {userType === "admin" && !isAdminEmployee && viewMode === "admin" && (
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-sm font-medium text-amber-800">
              You are viewing <strong>Admin inventory</strong>.
            </p>
            <p className="text-sm text-amber-700 mt-1">
              The invoice will be created for admin <strong>Customers</strong> or <strong>Partners</strong>. Select company below, add items, then Generate Invoice.
            </p>
          </div>
        )}
        {userType === "admin" && !isAdminEmployee && viewMode === "localPartner" && selectedPartnerId && (
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
            <p className="text-sm font-medium text-emerald-800">
              You are viewing <strong>{selectedPartnerName}&apos;s inventory</strong> (Local Partner).
            </p>
            <p className="text-sm text-emerald-700 mt-1">
              The invoice will be created for this <strong>partner&apos;s customer</strong>. Select company below, add items, then Generate Invoice.
            </p>
          </div>
        )}

        {/* ========== PARTNER SELECTION MODAL (hidden for admin employee) ========== */}
        {userType === "admin" && !isAdminEmployee && (
          <Dialog
            visible={partnerModalVisible}
            onHide={() => {
              setPartnerModalVisible(false);
              setTempSelectedPartner(null);
            }}
            dismissableMask
            header="Select Local Partner"
            className="font-nunito"
            style={{ width: "90vw", maxWidth: "500px" }}
            contentStyle={{ padding: "1.5rem", maxHeight: "70vh", overflow: "visible" }}
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
                Please select a local partner to view their products and customers:
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
                    menu: (base) => ({ ...base, zIndex: 9999, maxHeight: "300px", overflowY: "auto" }),
                  }}
                  menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                />
              </div>
            </div>
          </Dialog>
        )}

        {/* ========== INVOICE DETAILS CARD ========== */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-theme-black-2">Invoice Details</h2>
          </div>
          
          {/* Toggle for Partners (Admin only, hidden for admin employee) - hide when Local Partner view */}
          {userType === "admin" && !isAdminEmployee && viewMode === "admin" && (
            <div className="flex items-center gap-x-2 justify-end mb-4">
              <label className="text-gray-700 font-medium">
                {partnersOrder ? "Partners" : "Customers"}
              </label>
              <Switch
                onChange={(e) => handlePartnerOrder(e)}
                checked={partnersOrder}
                uncheckedIcon={false}
                checkedIcon={false}
                onColor="#3E342C"
                onHandleColor="#fff"
                className="react-switch"
                boxShadow="none"
              />
            </div>
          )}

          {/* Self Order Toggle for Sales Representatives (hidden for sales rep employee) */}
          {userType === "salesRepresentative" && !isSalesRepEmployee && (
            <div className="flex items-center gap-x-2 justify-end mb-4">
              <label className="text-gray-700 font-medium">Self Order</label>
              <Switch
                onChange={(e) => handleSelfOrderToggle(e)}
                checked={isSelfOrder}
                uncheckedIcon={false}
                checkedIcon={false}
                onColor="#3E342C"
                onHandleColor="#fff"
                className="react-switch"
                boxShadow="none"
              />
            </div>
          )}

          {/* ========== MIDDLE SECTION: FORM FIELDS ========== */}
          <div className="space-y-6 font-sf border-t pt-6 mt-6">
            {/* Form Body */}
            <div className="relative space-y-6 font-sf">
              {/* Company / Partner Selection */}
              {isSelfOrder && userType === "salesRepresentative" ? (
                <div className="flex flex-col gap-y-2">
                  <label className="text-gray-700 font-medium font-satoshi">
                    Name
                  </label>
                  <input
                    type="text"
                    value={localStorage.getItem("userName") || ""}
                    className="w-full bg-white text-black border border-gray-300 rounded px-3 py-3 outline-none cursor-not-allowed font-satoshi"
                    disabled
                    readOnly
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-y-2">
                  <label className="text-gray-700 font-medium font-satoshi">
                    Company Name
                  </label>
                  <Select
                    placeholder="Select Company"
                    className="w-full"
                    styles={drawerSelectStyles}
                    options={companyNameOptions}
                    value={
                      companyNameOptions?.find(
                        (opt) => opt?.value === order?.userId
                      ) || (order?.userId && selectedCustomerRef.current && 
                            selectedCustomerRef.current.id && 
                            selectedCustomerRef.current.companyName && 
                            selectedCustomerRef.current.name ? {
                        value: selectedCustomerRef.current.id,
                        label: `${selectedCustomerRef.current.companyName} (${selectedCustomerRef.current.name})`
                      } : null)
                    }
                    onChange={(e) => {
                      if (e) {
                        handleCompanySelect(e.value);
                      }
                    }}
                    onInputChange={
                      !partnersOrder ? handleCustomerSearchChange : undefined
                    }
                    onMenuScrollToBottom={
                      !partnersOrder ? handleMenuScrollToBottom : undefined
                    }
                    menuListProps={
                      !partnersOrder
                        ? {
                            onScroll: handleMenuScroll,
                          }
                        : undefined
                    }
                    isSearchable={!partnersOrder}
                    filterOption={!partnersOrder ? () => true : undefined}
                    isLoading={!partnersOrder ? customerLoading : false}
                    loadingMessage={
                      !partnersOrder ? () => "Loading customers..." : undefined
                    }
                  />
                </div>
              )}

              {/* Email */}
              <div className="flex flex-col gap-y-2">
                <label className="text-gray-700 font-medium font-satoshi">
                  Email
                </label>
                <input
                  type="text"
                  value={email}
                  placeholder="Email"
                  className="w-full bg-white text-black border border-gray-300 rounded px-3 py-3 outline-none cursor-not-allowed font-satoshi"
                  disabled
                />
              </div>

              {/* Address */}
              <div className="flex flex-col gap-y-2">
                <label className="text-gray-700 font-medium font-satoshi">
                  Address
                </label>
                <Select
                  placeholder="Select Address"
                  className="w-full"
                  styles={drawerSelectStyles}
                  value={
                    addressOptions?.find(
                      (opt) => opt?.value === order?.addressId
                    ) || null
                  }
                  options={addressOptions}
                  onChange={(e) =>
                    setOrder({ ...order, addressId: e?.value || "" })
                  }
                />
              </div>

              {/* Payment Method */}
              <div className="flex flex-col gap-y-2">
                <label className="text-gray-700 font-medium font-satoshi">
                  Payment Method
                </label>
                <Select
                  placeholder="Select Payment Method"
                  className="w-full"
                  styles={drawerSelectStyles}
                  value={
                    order.paymentMethod
                      ? paymentMethodOptions.find(
                          (opt) => opt.value === order.paymentMethod
                        ) || null
                      : null
                  }
                  options={paymentMethodOptions}
                  onChange={(e) => setOrder({ ...order, paymentMethod: e.value })}
                />
              </div>

              {/* NOTE + PO Number */}
              <div>
                <div className="w-full font-sf font-normal text-base text-theme-black-2 flex items-center gap-3 px-5 py-[5px] duration-300 border-2 border-gray-300 hover:border-goldenLight focus-within:border-goldenLight rounded-t">
                  <MdInsertComment size={24} />
                  <div className="relative w-full">
                    <input
                      type="text"
                      id="courier-note"
                      className={`w-full h-full py-5 pt-7 pb-2 focus:outline-none bg-transparent peer ${
                        order?.note ? "placeholder-transparent" : ""
                      }`}
                      value={order?.note}
                      onChange={(e) =>
                        setOrder({ ...order, note: e.target.value })
                      }
                    />
                    <label
                      htmlFor="courier-note"
                      className={`absolute left-0 top-4 placeholder:text-themeLight transition-all ${
                        order?.note
                          ? "top-[5px] text-[13px] peer-focus:text-goldenLight"
                          : "peer-placeholder-shown:top-5 peer-placeholder-shown:text-goldenLight peer-focus:top-[7px] peer-focus:text-[13px] peer-focus:text-goldenLight"
                      }`}
                    >
                      {order?.note
                        ? "Note for the supplier (optional)"
                        : "Add note for the supplier (optional)"}
                    </label>
                  </div>
                </div>

                <div className="w-full font-sf font-normal text-base text-theme-black-2 flex items-center gap-3 px-5 py-[5px] duration-300 border-2 border-gray-300 hover:border-goldenLight focus-within:border-goldenLight rounded-b">
                  <MdOutlineConfirmationNumber size={24} />
                  <div className="relative w-full">
                    <input
                      type="text"
                      id="poNumber"
                      className={`w-full h-full py-5 pt-7 pb-2 focus:outline-none bg-transparent peer ${
                        order?.poNumber ? "placeholder-transparent" : ""
                      }`}
                      value={order?.poNumber}
                      onChange={(e) =>
                        setOrder({ ...order, poNumber: e.target.value })
                      }
                    />
                    <label
                      htmlFor="poNumber"
                      className={`absolute left-0 top-4 placeholder:text-themeLight transition-all ${
                        order?.poNumber
                          ? "top-[5px] text-[13px] peer-focus:text-goldenLight"
                          : "peer-placeholder-shown:top-5 peer-placeholder-shown:text-goldenLight peer-focus:top-[7px] peer-focus:text-[13px] peer-focus:text-goldenLight"
                      }`}
                    >
                      {order?.poNumber
                        ? "Purchase Order Number"
                        : "Add Purchase Order Number (optional)"}
                    </label>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ========== BOTTOM SECTION: ITEMS SELECTION ========== */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-theme-black-2">Items & Invoice Details</h2>
          </div>

          <div className="mb-6">
            <p className="font-semibold text-gray-700">Invoice To</p>
            <p className="text-sm text-gray-500">{email || "Not selected"}</p>
          </div>

          <div className="grid grid-cols-4 2xl:grid-cols-5 gap-5 2xl:gap-10 mb-6">
          <div className="flex flex-col gap-y-2">
            <label className="text-labelColor font-medium font-satoshi">
              Invoice Number
            </label>
            <input
              type="text"
              name="invoiceNumber"
              minLength={3}
              min={3}
              value={invoiceFields.invoiceNumber ?? ""}
              placeholder="INV-000"
              className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
              onChange={(e) =>
                handleInvoiceFieldChange("invoiceNumber", e.target.value)
              }
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <label className="text-labelColor font-medium font-satoshi">
              P.O. Number
            </label>
            <input
              type="text"
              name="poNumber"
              value={invoiceFields.poNumber ?? ""}
              placeholder=""
              className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
              onChange={(e) =>
                handleInvoiceFieldChange("poNumber", e.target.value)
              }
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <label className="text-labelColor font-medium font-satoshi">
              Invoice Date
            </label>
            <input
              type="date"
              name="invoiceDate"
              value={invoiceFields.invoiceDate ?? ""}
              placeholder=""
              className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
              onChange={(e) =>
                handleInvoiceFieldChange("invoiceDate", e.target.value)
              }
            />
          </div>
          <div className="flex flex-col gap-y-2 w-full">
            <label className="text-labelColor font-medium font-satoshi">
              Terms (days)
            </label>
            <Select
              placeholder=""
              options={[
                { label: "immediate", value: "1" },
                { label: "15", value: "15" },
                { label: "21", value: "21" },
                { label: "30", value: "30" },
              ]}
              className="w-full text-black"
              styles={selectStyles2}
              value={
                invoiceFields.terms
                  ? [
                    { label: "immediate", value: "1" },
                    { label: "15", value: "15" },
                    { label: "21", value: "21" },
                    { label: "30", value: "30" },
                  ].find((opt) => opt.value === invoiceFields.terms)
                  : null
              }
              onChange={(option) =>
                handleInvoiceFieldChange("terms", option?.value || "")
              }
            />
          </div>

          <div className="flex flex-col gap-y-2">
            <label className="text-labelColor font-medium font-satoshi">
              Due Date
            </label>
            <input
              type="date"
              name="dueDate"
              value={invoiceFields.dueDate ?? ""}
              placeholder=""
              className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
              onChange={(e) =>
                handleInvoiceFieldChange("dueDate", e.target.value)
              }
            />
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full border border-gray-200 text-sm border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-2 text-center border border-gray-200">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={(e) => handleCheckAll(e.target.checked)}
                  />
                </th>
                <th className="py-2 px-2 text-left border border-gray-200">
                  Code
                </th>
                <th className="py-2 px-2 text-left border border-gray-200">
                  Name
                </th>
                <th className="py-2 px-2 text-center border border-gray-200">
                  Qty.
                </th>
                {(userType === "admin" ||
                  userType === "salesRepresentative") && (
                    <th className="py-2 px-2 text-right border border-gray-200">
                      Unit $
                    </th>
                  )}
                {(userType === "admin" ||
                  userType === "salesRepresentative") && (
                    <th className="py-2 px-2 text-right border border-gray-200">
                      Total $
                    </th>
                  )}
              </tr>
            </thead>
            <tbody>
              {items.map((item, itemIdx) => (
                <tr key={item.id || itemIdx}>
                  <td className="py-2 px-2 border border-gray-200 text-center">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(e) =>
                        handleItemCheck(itemIdx, e.target.checked)
                      }
                    />
                  </td>
                  <td className="py-2 px-2 border border-gray-200">
                    {item.productCode || item.code}
                  </td>
                  <td className="py-2 px-2 font-semibold border border-gray-200">
                    {item.product || item.productName || item.name}
                  </td>
                  <td className="py-2 px-2 text-center border border-gray-200">
                    <input
                      type="number"
                      min={1}
                      className="w-16 border border-gray-200 rounded px-1 py-1 text-center"
                      value={item.qty ?? 1}
                      onKeyDown={(e) =>
                        preventInvalidNumberInputKeys(e, MAX_CREATE_INVOICE_QTY_DIGITS)
                      }
                      onWheel={(e) => e.currentTarget.blur()}
                      onChange={(e) =>
                        handleItemQtyChange(itemIdx, e.target.value)
                      }
                    />
                  </td>
                  {(userType === "admin" ||
                    userType === "salesRepresentative") && (
                      <td className="py-2 px-2 text-right border border-gray-200">
                        {item.unit !== undefined
                          ? item.unit
                          : item.price !== undefined
                            ? item.price
                            : 0}
                      </td>
                    )}
                  {(userType === "admin" ||
                    userType === "salesRepresentative") && (
                      <td className="py-2 px-2 text-right border border-gray-200">
                        $
                        {(
                          (item.qty || 1) *
                          (item.unit !== undefined
                            ? item.unit
                            : item.price !== undefined
                              ? item.price
                              : 0)
                        ).toFixed(2)}
                      </td>
                    )}
                </tr>
              ))}
              {extraRows.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td className="py-2 px-2 border border-gray-200 text-center">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(e) =>
                        handleExtraRowCheck(idx, e.target.checked)
                      }
                    />
                  </td>
                  <td className="py-2 px-2 border border-gray-200">
                    <input
                      disabled
                      type="text"
                      className="w-full border border-gray-200 rounded px-1 py-1"
                      value={item.productCode ?? ""}
                      placeholder="Code"
                    />
                  </td>
                  <td className="py-2 px-2 border border-gray-200">
                    <input
                      type="text"
                      className="w-full border border-gray-200 rounded px-1 py-1"
                      value={item.name ?? ""}
                      disabled
                      placeholder="Name"
                    />
                  </td>
                  <td className="py-2 px-2 text-center border border-gray-200">
                    <input
                      type="number"
                      min={1}
                      className="w-16 border border-gray-200 rounded px-1 py-1 text-center"
                      value={item.qty ?? 1}
                      onKeyDown={(e) =>
                        preventInvalidNumberInputKeys(e, MAX_CREATE_INVOICE_QTY_DIGITS)
                      }
                      onChange={(e) =>
                        handleExtraInputChange(idx, "qty", e.target.value)
                      }
                    />
                  </td>
                  {(userType === "admin" ||
                    userType === "salesRepresentative") && (
                      <td className="py-2 px-2 border border-gray-200 text-right">
                        <input
                          type="number"
                          min={0}
                          disabled
                          step="0.01"
                          className="w-20 border border-gray-200 rounded px-1 py-1 text-right"
                          value={item.unit ?? 0}
                          onKeyDown={preventInvalidNumberInputKeys}
                        />
                      </td>
                    )}
                  {(userType === "admin" ||
                    userType === "salesRepresentative") && (
                      <td className="py-2 px-2 border border-gray-200 text-right">
                        ${(item.qty * item.unit).toFixed(2)}
                      </td>
                    )}
                </tr>
              ))}

              {extraCharges.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td className="py-2 px-2 border border-gray-200 text-center">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(e) =>
                        handleChargeRowCheck(idx, e.target.checked)
                      }
                    />
                  </td>
                  <td className="py-2 px-2 border border-gray-200">
                    <input
                      type="text"
                      className="w-full rounded px-1 py-1 border border-gray-200 bg-gray-50 cursor-default select-text focus:outline-none focus:ring-0 focus:border-gray-200"
                      value={item.code}
                      readOnly
                      placeholder="Code"
                    />
                  </td>
                  <td className="py-2 px-2 border border-gray-200">
                    <input
                      type="text"
                      className="w-full border rounded px-1 py-1"
                      value={item.name}
                      onChange={(e) =>
                        handleChargeInputChange(idx, "name", e.target.value)
                      }
                      placeholder="Name"
                    />
                  </td>
                  <td className="py-2 px-2 text-center border border-gray-200">
                    <input
                      type="number"
                      min={1}
                      className="w-16 border rounded px-1 py-1 text-center"
                      value={item.qty}
                      onKeyDown={(e) =>
                        preventInvalidNumberInputKeys(e, MAX_CREATE_INVOICE_QTY_DIGITS)
                      }
                      onWheel={(e) => e.currentTarget.blur()}
                      onChange={(e) =>
                        handleChargeInputChange(idx, "qty", e.target.value)
                      }
                    />
                  </td>
                  <td className="py-2 px-2 border border-gray-200 text-right">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      className="w-20 border rounded px-1 py-1 text-right"
                      value={item.unit}
                      onKeyDown={(e) =>
                        preventInvalidNumberInputKeys(e, MAX_CREATE_INVOICE_UNIT_DIGITS)
                      }
                      onWheel={(e) => e.currentTarget.blur()}
                      onChange={(e) =>
                        handleChargeInputChange(idx, "unit", e.target.value)
                      }
                      onBlur={(e) =>
                        handleChargeInputChange(
                          idx,
                          "unit",
                          formatToFixedTwo(e.target.value)
                        )
                      }
                    />
                  </td>
                  <td className="py-2 px-2 border border-gray-200 text-right">
                    ${(item.qty * item.unit).toFixed(2)}
                  </td>
                </tr>
              ))}

              <tr>
                <td colSpan={6} className="py-2 px-2 border border-gray-200">
                  <div className="flex items-center gap-2">
                    <button
                      className="border px-2 py-2"
                      onClick={() => setModal(true)}
                    >
                      Add Item
                    </button>

                    <button
                      className="border px-2 py-2"
                      onClick={handleAddChargeRow}
                    >
                      Add Extra Charges
                    </button>
                  </div>
                </td>
              </tr>

              <tr>
                <td colSpan={4} className="border border-gray-200"></td>
                <td className="py-2 px-2 text-right font-bold border border-gray-200">
                  Total weight (lbs)
                </td>
                <td className="py-2 px-2 text-right font-bold border border-gray-200">
                  {parseFloat(calculatedTotalWeight).toFixed(2)}
                </td>
              </tr>

              {(userType === "admin" || userType === "salesRepresentative") && (
                <tr>
                  <td
                    colSpan={4}
                    className="border border-gray-200 w-max py-2 px-2 "
                  >
                    {!(isPartnerLoggedInCustomerOrder && isDirectPartnerLoggedIn) && (
                      <button
                        className="border px-2 py-2"
                        onClick={() =>
                          setManual({ ...manual, show: !manual.show })
                        }
                      >
                        {manual.show ? "Manual Calculate" : "Auto Calculate"}
                      </button>
                    )}
                  </td>
                  <td className="py-2 px-2 text-right font-bold border border-gray-200">
                    Shipping Charges
                  </td>
                  <td className="py-2 px-2 text-right font-bold border border-gray-200">
                    {isPartnerLoggedInCustomerOrder && isDirectPartnerLoggedIn ? (
                      "0.00"
                    ) : !manual?.show ? (
                      <input
                        className="w-20 border border-gray-200 rounded px-1 py-1 text-right disabled:bg-gray-100 disabled:cursor-not-allowed"
                        value={invoiceFields?.shippingCharges ?? ""}
                        type="text"
                        inputMode="decimal"
                        onKeyDown={preventInvalidNumberInputKeys}
                        disabled={isPartnerLoggedInCustomerOrder && isDirectPartnerLoggedIn}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (isValidTwoDecimalInput(value)) {
                            setInvoiceFields((prev) => ({
                              ...prev,
                              shippingCharges: value,
                            }));
                          }
                        }}
                        onBlur={(e) => {
                          const value = e.target.value.trim();
                          setInvoiceFields((prev) => ({
                            ...prev,
                            shippingCharges: formatToFixedTwo(value),
                          }));
                        }}
                      />
                    ) : shippingCharge ? (
                      "$" + parseFloat(shippingCharge)?.toFixed(2)
                    ) : (
                      "Not dealing"
                    )}
                  </td>
                </tr>
              )}
              {(userType === "admin" || userType === "salesRepresentative") && (
                <tr>
                  <td colSpan={4} className="border border-gray-200"></td>
                  <td className="py-2 px-2 text-right font-bold border border-gray-200">
                    Total USD ({checkedCount} items)
                  </td>
                  <td className="py-2 px-2 text-right font-bold border border-gray-200">
                    ${parseFloat(total)?.toFixed(2)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="w-full space-y-5">
          <div className="space-y-2">
            <p>Comments</p>
            <textarea
              className="w-full h-48 border resize-none border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
              value={invoiceFields.note ?? ""}
              onChange={(e) => handleInvoiceFieldChange("note", e.target.value)}
            ></textarea>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="size-5"
              checked={invoiceFields.emailInvoiceToCustomer}
              onChange={(e) =>
                handleInvoiceFieldChange(
                  "emailInvoiceToCustomer",
                  e.target.checked
                )
              }
            />
            <p>Email the invoice to the customer?</p>
          </div>

          <div className="pt-10 border-t mt-6">
            <button
              disabled={loading}
              className="rounded-lg font-inter font-medium text-white px-6 py-3 bg-theme hover:bg-theme/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleGenerateInvoice}
            >
              {loading ? "Generating..." : "Generate Invoice"}
            </button>
          </div>
        </div>
      </div>

      {/* Modal - same UI as orders/detail/[orderID]/add-invoice */}
      <Dialog
        visible={modal}
        style={{ width: "50vw", maxWidth: "700px" }}
        breakpoints={{ "1024px": "70vw", "768px": "85vw", "640px": "95vw" }}
        className="font-nunito"
        dismissableMask={true}
        onHide={() => setModal(false)}
        header={
          <div className="font-nunito font-bold text-2xl text-center">
            Add Items to Order
          </div>
        }
      >
        {useModalProductsForList ? (
          modalProductsLoading ? (
            <MiniLoader />
          ) : (
            <div className="flex flex-col">
              <div className="sticky top-0 space-y-2 bg-white pb-3 z-10">
                <div className="w-full h-14 rounded-md border relative">
                  <div className="absolute top-1/2 -translate-y-1/2 left-2">
                    <IoIosSearch size={25} color="gray" />
                  </div>
                  <input
                    className="w-full h-full outline-none bg-transparent pl-10 pr-4"
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search Product..."
                  />
                </div>
                <div className="w-full">
                  <Select
                    placeholder="Select Category"
                    options={categoryList}
                    className="w-full text-black"
                    styles={selectStyles2}
                    value={categoryList.find((c) => c.value === filterId)}
                    onChange={(e) => setFilterId(e?.value ?? "")}
                  />
                </div>
              </div>
              {handleFilter()?.length === 0 ? (
                <p className="text-gray-500 py-4 text-center">
                  No products available
                </p>
              ) : (
                <div className="overflow-y-auto max-h-96">
                  {handleFilter()?.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      onClick={() => handleAddExtra(item)}
                      className="text-sm cursor-pointer border-b flex items-center justify-between hover:bg-gray-100 px-3 py-3 hover:shadow-sm transition-all group"
                    >
                      <div className="flex-1 space-y-1">
                        <p className="font-semibold text-gray-800 group-hover:text-theme">
                          {item?.name}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          {item?.sku && (
                            <span className="bg-gray-100 px-2 py-0.5 rounded">
                              SKU: {item?.sku}
                            </span>
                          )}
                          {(item?.productCode || item?.code) && (
                            <span className="bg-gray-100 px-2 py-0.5 rounded">
                              Code: {item?.productCode || item?.code}
                            </span>
                          )}
                          {item?.weight != null && (
                            <span className="text-gray-400">
                              {typeof item.weight === "number" ? item.weight.toFixed(2) : item.weight} {item?.unit || "lbs"}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 ml-4">
                        {(item?.price != null || item?.price === 0) && (
                          <span className="font-bold text-lg text-theme">
                            ${parseFloat(item?.price ?? 0).toFixed(2)}
                          </span>
                        )}
                        {(item?.wholesalePrice ?? item?.wholesale) != null && (
                          <span className="text-xs text-gray-500">
                            Wholesale: ${parseFloat(item?.wholesalePrice ?? item?.wholesale ?? 0).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        ) : ProductList?.length === 0 ? (
          <MiniLoader />
        ) : (
          <div className="flex flex-col">
            <div className="sticky top-0 space-y-2 bg-white pb-3 z-10">
              <div className="w-full h-14 rounded-md border relative">
                <div className="absolute top-1/2 -translate-y-1/2 left-2">
                  <IoIosSearch size={25} color="gray" />
                </div>
                <input
                  className="w-full h-full outline-none bg-transparent pl-10 pr-4"
                  type="text"
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search Product..."
                />
              </div>
              <div className="w-full">
                <Select
                  placeholder="Select Category"
                  options={categoryList}
                  className="w-full text-black"
                  styles={selectStyles2}
                  onChange={(e) => setFilterId(e?.value)}
                />
              </div>
            </div>

            <div className="overflow-y-auto max-h-96">
              {handleFilter()?.map((item, idx) => (
                <div
                  key={item.id || idx}
                  onClick={() => handleAddExtra(item)}
                  className="text-sm cursor-pointer border-b flex items-center justify-between hover:bg-gray-100 px-3 py-3 hover:shadow-sm transition-all group"
                >
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold text-gray-800 group-hover:text-theme">
                      {item?.name}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {item?.sku && (
                        <span className="bg-gray-100 px-2 py-0.5 rounded">
                          SKU: {item?.sku}
                        </span>
                      )}
                      {(item?.productCode || item?.code) && (
                        <span className="bg-gray-100 px-2 py-0.5 rounded">
                          Code: {item?.productCode || item?.code}
                        </span>
                      )}
                      {item?.weight != null && (
                        <span className="text-gray-400">
                          {typeof item.weight === "number" ? item.weight.toFixed(2) : item.weight} {item?.unit || "lbs"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-4">
                    {(item?.price != null || item?.price === 0) && (
                      <span className="font-bold text-lg text-theme">
                        ${parseFloat(item?.price ?? 0).toFixed(2)}
                      </span>
                    )}
                    {(item?.wholesalePrice ?? item?.wholesale) != null && (
                      <span className="text-xs text-gray-500">
                        Wholesale: ${parseFloat(item?.wholesalePrice ?? item?.wholesale ?? 0).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Dialog>
      </div>
    </div>
  );
}

