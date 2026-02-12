"use client";
// import { Drawer, Portal, CloseButton } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { RiSubtractFill } from "react-icons/ri";
import { BiPlus, BiTrash } from "react-icons/bi";
import axios from "axios";
import { BASE_URL } from "@/utilities/URL";
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { PostAPI } from "@/utilities/PostAPI";
import ErrorHandler from "@/utilities/ErrorHandler";
import {
  error_toaster,
  info_toaster,
  success_toaster,
} from "@/utilities/Toaster";
import GetAPI from "@/utilities/GetAPI";
import Select from "react-select";
import { drawerSelectStyles, selectStyles2 } from "@/utilities/SelectStyle";
import { RxCross2 } from "react-icons/rx";
import MiniLoader from "./MiniLoader";
import { MdInsertComment, MdOutlineConfirmationNumber } from "react-icons/md";
import { ORDERS_CREATE_DRAWER } from "../../app/(orderManagement)/orders/orders.testids";
import { hasPermission } from "@/utilities/Permission";
import Switch from "react-switch";

const DrawerBeans = ({
  drawerOpen: open,
  setDrawerOpen: setOpen,
  setQuotationData,
  quotationData,
  type,
  selectedPartnerId: propSelectedPartnerId,
  onPartnerChange,
}) => {
  if (typeof window !== "undefined") {
    var userID = localStorage.getItem("userID");
    var userType = localStorage.getItem("userType");
    var partnerType = localStorage.getItem("partnerType");
    var isEmployee = localStorage.getItem("isEmployee") === "true";
  }
  const [companyNameOptions, setCompanyNameOptions] = useState([]);
  const [emailOptions, setEmailOptions] = useState([]);

  // ✅ Pagination state for customers
  const [customerPage, setCustomerPage] = useState(1);
  const [customerLimit] = useState(30);
  const [customerHasMore, setCustomerHasMore] = useState(true);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [allCustomers, setAllCustomers] = useState([]); // Store all fetched customers
  const [customerSearchQuery, setCustomerSearchQuery] = useState(""); // Search query for customers
  const paymentMethodOptions = [
    // { label: "COD", value: "cod" },
    { label: "Bank Check", value: "bank check" },
    { label: "Card", value: "card" },
  ];
  const orderFrequencyOptions = [
    { label: "Once", value: "just-onces" },
    { label: "Weekly", value: "weekly" },
    { label: "Every Two Weeks", value: "every-two-weeks" },
    { label: "Every Four Weeks", value: "every-four-weeks" },
  ];
  const [addressOptions, setAddressOptions] = useState([]);

  const [counter, setCounter] = useState(null);
  const [render, setRender] = useState(false);
  const [email, setEmail] = useState("");
  const [emailType, setEmailType] = useState(true);
  const [loader, setLoader] = useState(false);

  // ✅ NEW: direct partner state
  const [isDirectPartner, setIsDirectPartner] = useState(false);
  const [isSelfOrder, setIsSelfOrder] = useState(false);
  const [partners, setPartners] = useState([]);
  const [srNameOptions, setSrNameOptions] = useState([]);
  const [showPartnerChangeWarning, setShowPartnerChangeWarning] = useState(false);
  const [pendingToggleChange, setPendingToggleChange] = useState(null);
  const [fetchingPartnerPrices, setFetchingPartnerPrices] = useState(false);

  const [order, setOrder] = useState({
    note: "",
    paymentMethod: "",
    poNumber: "",
    orderFrequency: "",
    addressId: "",
    userId: "",
    salesRepId: "",
    shippingCharges: "",
    // discountPercentage: "",
    categoryDiscounts: [],
  });

  if (typeof window !== "undefined") {
    var cartItems =
      type === "createOrder"
        ? JSON.parse(localStorage.getItem("createOrderData")) || []
        : JSON.parse(localStorage.getItem("quotationData")) || [];
  }

  const totalPrice = cartItems?.reduce((a, b) => {
    return (
      Number(a) +
      (isDirectPartner || isSelfOrder
        ? parseFloat(b?.wholesalePrice)
        : parseFloat(b?.price)) *
        Number(b?.qty)
    );
  }, 0);

  const totalWeight = cartItems?.reduce((a, b) => {
    return Number(a) + Number(b?.weight) * Number(b?.qty);
  }, 0);

  const getCustomerListEndpoint = (page, limit, search = "") => {
    let base = "";
    
    // For admin in createOrder mode - check if partner is selected from create order page
    if (userType === "admin" && type === "createOrder") {
      // If partner is selected from create order page, use partner's customers
      if (propSelectedPartnerId) {
        base = `api/v1/admin/customer-management/customer-list/sale-rep-id/${propSelectedPartnerId}`;
      } 
      // If no partner selected, use not-assigned customers
      else {
        base = `api/v1/admin/customer-management/customer-list/not-assigned`;
      }
    }
    // For employees with selected-customer permission
    else if (isEmployee && hasPermission("selected-customer_view")) {
      base = `api/v1/admin/customer-management/customer-list/employee-id/${userID}`;
    }
    // For admin (default - all customers)
    else if (userType === "admin") {
      base = `api/v1/admin/customer-management/customer-list/all`;
    }
    // For sales representatives
    else if (userType === "salesRepresentative") {
      base = `api/v1/admin/customer-management/customer-list/sale-rep-id/${userID}`;
    }
    // Default fallback
    else {
      base = `api/v1/admin/customer-management/customer-list/all`;
    }
    
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", limit.toString());
    if (search.trim()) {
      params.set("search", search.trim());
    }
    return `${base}?${params.toString()}`;
  };

  // Fetch customers with pagination and search
  const fetchCustomers = async (
    page,
    append = false,
    searchQuery = customerSearchQuery
  ) => {
    if (customerLoading) return;

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

        // Ensure customers is an array
        if (!Array.isArray(customers)) {
          console.error("Customers data is not an array:", customers);
          setCustomerLoading(false);
          return;
        }

        const newOptions = customers.map((user) => ({
          value: user?.id,
          label: `${user?.companyName || ""} ( ${user?.name || ""} )`.trim(),
        }));

        // Create email options from customers
        const newEmailOptions = customers
          .filter((user) => user?.email && user?.email.trim() !== "") // Only include customers with valid email
          .map((user) => ({
            value: user?.email,
            label: user?.email,
          }));

        if (append) {
          setCompanyNameOptions((prev) => [...prev, ...newOptions]);
          setEmailOptions((prev) => {
            // Avoid duplicate emails
            const existingEmails = new Set(prev.map((opt) => opt.value));
            const uniqueNewEmails = newEmailOptions.filter(
              (opt) => !existingEmails.has(opt.value)
            );
            return [...prev, ...uniqueNewEmails];
          });
          setAllCustomers((prev) => [...prev, ...customers]);
        } else {
          setCompanyNameOptions(newOptions);
          setEmailOptions(newEmailOptions);
          setAllCustomers(customers);
        }

        setCustomerHasMore(page < totalPages);
        setCustomerPage(page);
      } else {
        console.error("Failed to fetch customers:", res?.data);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setCustomerLoading(false);
    }
  };

  // Search timeout ref for debouncing
  const customerSearchTimeoutRef = useRef(null);

  // Handle search input change with debounce
  const handleCustomerSearchChange = (inputValue) => {
    // Clear previous timeout
    if (customerSearchTimeoutRef.current) {
      clearTimeout(customerSearchTimeoutRef.current);
    }

    // Reset to page 1 and fetch with new search query after debounce
    customerSearchTimeoutRef.current = setTimeout(() => {
      setCustomerSearchQuery(inputValue);
      setCustomerPage(1);
      setCompanyNameOptions([]);
      setEmailOptions([]);
      setAllCustomers([]);
      fetchCustomers(1, false, inputValue);
    }, 500); // 500ms debounce
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (customerSearchTimeoutRef.current) {
        clearTimeout(customerSearchTimeoutRef.current);
      }
    };
  }, []);

  // Load initial customers
  useEffect(() => {
    // For Send Quotation: fetch customers when drawer opens (unless direct partner toggle is on)
    // For Create Order: fetch customers based on partner selection from create order page
    if (type !== "createOrder") {
      // Send Quotation - fetch customers unless direct partner mode is enabled
      if (!isDirectPartner && open) {
        fetchCustomers(1, false, customerSearchQuery);
      }
    } else {
      // Create Order - fetch customers based on propSelectedPartnerId
      // URL will automatically switch based on propSelectedPartnerId in getCustomerListEndpoint
      if (open && !isSelfOrder) {
        fetchCustomers(1, false, customerSearchQuery);
      }
    }
  }, [isDirectPartner, isSelfOrder, type, open, propSelectedPartnerId]);

  // Load more customers on scroll
  const handleMenuScrollToBottom = () => {
    if (!customerLoading && customerHasMore) {
      fetchCustomers(customerPage + 1, true, customerSearchQuery);
    }
  };

  // Alternative scroll handler for menuListProps
  const handleMenuScroll = (event) => {
    const { target } = event;
    if (!target) return;

    const { scrollTop, scrollHeight, clientHeight } = target;
    // Check if scrolled near bottom (within 50px)
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      if (!customerLoading && customerHasMore) {
        fetchCustomers(customerPage + 1, true, customerSearchQuery);
      }
    }
  };

  // ✅ UPDATED: use GetAPI (not axios) to fetch direct partners
  const fetchDirectPartnerData = async (selfOrder) => {
    let selfOrderUser = selfOrder ? `&&salesRepId=${userID}` : "";
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("accessToken");
      const res = await axios.get(
        `${BASE_URL}api/v1/admin/sales-rep/for-order-creation?partnerType=direct-partner${selfOrderUser}`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      if (res?.data?.status === "success") {
        const list = res?.data?.data || [];
        setPartners(list);
        setSrNameOptions(
          list?.map((p) => ({
            value: p?.id,
            label: p?.srName + ` ( ${p?.territoryName} )`,
          }))
        );
      } else {
        throw new Error(
          res?.data?.message || "Failed to fetch direct partner data."
        );
      }
    } catch (error) {
      ErrorHandler(error);
    }
  };

  // ✅ UPDATED: Switch gives boolean `checked`
  const handleDirectPartnerToggle = (checked) => {
    // If admin is trying to toggle when partner is selected from create order page, show warning
    if (propSelectedPartnerId && type === "createOrder" && userType === "admin") {
      setPendingToggleChange(checked);
      setShowPartnerChangeWarning(true);
      return;
    }
    setIsDirectPartner(checked);

    if (checked) {
      setOrder((prev) => ({
        ...prev,
        salesRepId: "",
        userId: "",
        addressId: "",
      }));
      setEmail("");
      setAddressOptions([]);

      fetchDirectPartnerData();
    } else {
      setFetchingPartnerPrices(false);
      setOrder((prev) => ({
        ...prev,
        salesRepId: "",
      }));
      setEmail("");
    }
  };

  // Handle toggle change confirmation
  const handleConfirmToggleChange = () => {
    if (pendingToggleChange !== null) {
      // Clear cart and reset
      if (onPartnerChange) {
        onPartnerChange();
      }
      setOpen(false);
      // Reset drawer state
      setIsDirectPartner(false);
      setFetchingPartnerPrices(false);
      setOrder({
        note: "",
        paymentMethod: "",
        poNumber: "",
        orderFrequency: "",
        addressId: "",
        userId: "",
        salesRepId: "",
        shippingCharges: "",
        categoryDiscounts: [],
      });
      setEmail("");
      setAddressOptions([]);
      // Clear cart from localStorage
      if (type === "createOrder") {
        localStorage.setItem("createOrderData", JSON.stringify([]));
      } else {
        localStorage.setItem("quotationData", JSON.stringify([]));
      }
    }
    setShowPartnerChangeWarning(false);
    setPendingToggleChange(null);
  };

  // Handle toggle change cancellation
  const handleCancelToggleChange = () => {
    setShowPartnerChangeWarning(false);
    setPendingToggleChange(null);
  };

  const selfOrderSwitch = (checked) => {
    setIsSelfOrder(checked);
    if (checked) {
      if (email !== "" && totalWeight > 0) {
        fetchChargesForCustomer(userID, totalWeight, false, true);
      }
      let selfemail = localStorage.getItem("email");
      setEmail(selfemail);
      fetchDirectPartnerData(true);
    } else {
      setEmail("");
      // selectedEmail("");
      setAddressOptions([]);
    }
  };

  useEffect(() => {
    if (partners && isSelfOrder) {
      const addresses = partners?.[0]?.addresses ?? [];
      let list = addresses.map((add) => ({
        value: add?.id,
        label: [
          add?.companyaddress,
          add?.addressLineOne,
          add?.addressLineTwo,
          add?.town,
          add?.state,
          add?.zipCode,
          add?.country,
        ]?.filter((part) => part && part?.trim() !== ""),
      }));

      setAddressOptions(list);
      if (addresses.length > 0) {
        setOrder((prev) => ({
          ...prev,
          addressId: prev.addressId || addresses[0]?.id,
        }));
      }
    }
  }, [partners, isSelfOrder]);

  const handleSrNameSelect = async (selectedOption) => {
    const selectedPartner = partners?.find(
      (p) => p?.id === selectedOption?.value
    );

    setEmail(selectedPartner?.email || "");

    setOrder((prev) => ({
      ...prev,
      salesRepId: selectedPartner?.id,
      userId: "",
      addressId: "",
    }));

    const addressList = (selectedPartner?.addresses ?? []).map((address) => {
      const parts = [
        address.companyaddress,
        address.addressLineOne,
        address.addressLineTwo,
        address.town,
        address.state,
        address.zipCode,
        address.country,
      ].filter((part) => part && part.trim() !== "");
      return {
        value: address.id,
        label: parts.length > 0 ? parts.join(", ") : "",
      };
    });

    setAddressOptions([...addressList]);

    // Fetch shipping charges when partner is selected (partner self-order): hit API and set shipping field
    if (
      type === "createOrder" &&
      selectedPartner?.id &&
      userType === "admin" &&
      (isDirectPartner || isSelfOrder)
    ) {
      const cart =
        typeof window !== "undefined"
          ? JSON.parse(localStorage.getItem("createOrderData") || "[]")
          : [];
      const weight = cart.reduce(
        (a, b) => Number(a) + Number(b?.weight || 0) * Number(b?.qty || 0),
        0
      );
      if (weight > 0) {
        fetchChargesForCustomer(selectedPartner.id, weight, false, true);
      }
    }

    // Call API to get partner's product prices for selected products in cart
    // When admin (with cart items) selects a partner in the drawer
    if (selectedPartner?.id && cartItems?.length > 0 && userType === "admin") {
      setFetchingPartnerPrices(true);
      try {
        const productIds = cartItems.map((item) => item.id);
        const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
        
        const response = await axios.post(
          `${BASE_URL}api/v1/admin/sales-rep-products-for-order-creation/${selectedPartner.id}`,
          { productIds },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response?.data?.status === "success") {
          // Update cart items with partner-specific wholesalePrice if returned
          const partnerProducts = response?.data?.data?.products || [];
          
          if (partnerProducts.length > 0) {
            const updatedCart = cartItems.map((item) => {
              const partnerProduct = partnerProducts.find((p) => p.id === item.id);
              if (partnerProduct && partnerProduct.wholesalePrice) {
                return {
                  ...item,
                  wholesalePrice: partnerProduct.wholesalePrice,
                };
              }
              return item;
            });
            
            setQuotationData(updatedCart);
            if (type === "createOrder") {
              localStorage.setItem("createOrderData", JSON.stringify(updatedCart));
            } else {
              localStorage.setItem("quotationData", JSON.stringify(updatedCart));
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch partner product prices:", error);
        // Don't show error to user, just continue with default prices
      } finally {
        setFetchingPartnerPrices(false);
      }
    }
  };

  const handleCounterClick = (index) => {
    setCounter(index);
  };

  const handleItemClick = (actionType, id) => {
    if (actionType === "plus") {
      let updatedCart = cartItems.map((item) => {
        if (Number(item.id) === id) {
          return { ...item, qty: item.qty + 1 };
        }
        return item;
      });
      type === "createOrder"
        ? localStorage.setItem("createOrderData", JSON.stringify(updatedCart))
        : localStorage.setItem("quotationData", JSON.stringify(updatedCart));
      setQuotationData(updatedCart);
      setRender(!render);
    } else if (actionType === "minus") {
      let updatedCart = cartItems.map((item) => {
        if (Number(item.id) === id && item.qty > 1) {
          return { ...item, qty: item.qty - 1 };
        }
        return item;
      });
      type === "createOrder"
        ? localStorage.setItem("createOrderData", JSON.stringify(updatedCart))
        : localStorage.setItem("quotationData", JSON.stringify(updatedCart));
      setQuotationData(updatedCart);
      setRender(!render);
    } else if (actionType === "delete") {
      let updatedCart = cartItems.filter((item) => Number(item.id) !== id);
      type === "createOrder"
        ? localStorage.setItem("createOrderData", JSON.stringify(updatedCart))
        : localStorage.setItem("quotationData", JSON.stringify(updatedCart));
      setQuotationData(updatedCart);
      setRender(!render);
    }
  };

  const handleCreateOrderData = (createOrderData) => {
    const updatedCart = [];
    createOrderData?.map((item) =>
      updatedCart.push({
        categoryId: item?.categoryId,
        createdAt: item?.createdAt,
        deleted: false,
        desc: item?.desc,
        productId: item?.id,
        image: item?.image,
        name: item?.name,
        price: isSelfOrder ? item?.wholesalePrice : item?.price,
        qty: item?.qty,
        quantity: item?.quantity,
        status: true,
        unit: item?.unit,
        updatedAt: item?.updatedAt,
        weight: item?.weight,
        wholesalePrice: item?.wholesalePrice,
      })
    );
    return updatedCart;
  };

  const handleSendQuotation = async () => {
    const dp = parseFloat(order?.discountPercentage || 0);
    const discountAmt = (parseFloat(totalPrice || 0) * dp) / 100;
    const subTotalAfterDiscount =
      dp > 0
        ? parseFloat(totalPrice || 0) - discountAmt
        : parseFloat(totalPrice || 0);
    const totalBillCalc =
      subTotalAfterDiscount + parseFloat(order?.shippingCharges || 0);

    if (type === "createOrder") {
      const createOrderData = JSON.parse(
        localStorage.getItem("createOrderData")
      );
      if (createOrderData?.length === 0) {
        info_toaster("No Product is selected");
      } else if (!email?.trim()) {
        info_toaster("Email cannot be empty");
      } else if (isDirectPartner && !order?.salesRepId) {
        info_toaster("Please select a partner");
      } else if (!isDirectPartner && !isSelfOrder && !order?.addressId) {
        info_toaster("Address cannot be empty");
      } else if (!order?.paymentMethod) {
        info_toaster("select payment method");
      } else if (!order?.orderFrequency) {
        info_toaster("Selectorder frequency");
      } else {
        setLoader(true);
        try {
          const payloadOrder = {
            totalBill: totalBillCalc.toFixed(2),
            subTotal: subTotalAfterDiscount.toFixed(2),
            discountPrice: discountAmt.toFixed(2),
            discountPercentage: dp,
            itemsPrice: parseFloat(totalPrice || 0).toFixed(2),
            vat: 0.0,
            totalWeight: totalWeight,
            note: order?.note,
            paymentMethod: order?.paymentMethod,
            poNumber: order?.poNumber,
            frequency: order?.orderFrequency,
            shippingCharges: parseFloat(order?.shippingCharges || 0).toFixed(2),
            ...(isDirectPartner || isSelfOrder
              ? {
                  salesRepId: order?.salesRepId || userID,
                  addressId: order?.addressId,
                } // direct-partner
              : { userId: order?.userId, addressId: order?.addressId }), // normal customer
          };

          const endpoint =
            isDirectPartner || isSelfOrder
              ? `api/v1/admin/partner-order/book-new-order`
              : userType === "admin"
              ? `api/v1/admin/book-new-order`
              : `api/v1/admin/sales-rep/book-new-order/${userID}`;

          const res = await PostAPI(
            endpoint,
            {
              order: payloadOrder,
              items: handleCreateOrderData(createOrderData),
            },
            "orders"
          );

          if (res?.data?.status === "success") {
            success_toaster("order Created successfully");
            setLoader(false);
            localStorage.setItem("createOrderData", JSON.stringify([]));
            setQuotationData([]);
            setOrder({ ...order, note: "" });
            setOpen(false);
          } else {
            throw new Error(
              res?.data?.message || "An unexpected error occurred."
            );
          }
        } catch (error) {
          ErrorHandler(error);
          setLoader(false);
        }
      }
    } else {
      // Send Quotation flow
      if (cartItems.length === 0) {
        info_toaster("Product cannot be empty");
      } else if (!email?.trim()) {
        info_toaster("Email cannot be empty");
      } else if (isDirectPartner && !order?.salesRepId) {
        info_toaster("Please select a partner");
      } else if (!isDirectPartner && !order?.addressId && partnerType !== "direct-partner") {
        // For local partners, address is auto-selected in handleEmail, so skip validation
        info_toaster("Address cannot be empty");
      } else {
        setLoader(true);
        try {
          const dp = Number(order?.discountPercentage || 0);
          const discountAmt = (Number(totalPrice || 0) * dp) / 100;
          const subTotalAfterDiscount =
            dp > 0
              ? Number(totalPrice || 0) - discountAmt
              : Number(totalPrice || 0);
          const totalBillCalc =
            subTotalAfterDiscount + Number(order?.shippingCharges || 0);

          // Build order payload - include partner/address info if direct partner
          const orderPayload = {
            totalBill: totalBillCalc.toFixed(2),
            subTotal: subTotalAfterDiscount.toFixed(2),
            discountPrice: discountAmt.toFixed(2),
            discountPercentage: dp,
            itemsPrice: Number(totalPrice || 0).toFixed(2),
            vat: 0.0,
            totalWeight: totalWeight,
            shippingCharges: Number(order?.shippingCharges || 0).toFixed(2),
            note: order?.note || "",
            poNumber: order?.poNumber || "",
            ...(isDirectPartner || isSelfOrder
              ? {
                  salesRepId: order?.salesRepId || userID,
                  addressId: order?.addressId,
                }
              : {
                  userId: order?.userId,
                  addressId: order?.addressId,
                }),
          };

          const res = await PostAPI(
            `api/v1/admin/send-quotation/sales-rep/${userID}`,
            {
              email: [email],
              order: orderPayload,
              items: cartItems,
            }
          );

          if (res?.data?.status === "success") {
            setOpen(false);
            success_toaster("Quotation send Successfully");
            type === "createOrder"
              ? localStorage.setItem("createOrderData", JSON.stringify([]))
              : localStorage.setItem("quotationData", JSON.stringify([]));
            setQuotationData([]);
            setEmail("");
            setEmailType(true);
            setOrder({
              note: "",
              poNumber: "",
              discountPercentage: "",
              shippingCharges: "",
              paymentMethod: "",
              orderFrequency: "",
              userId: "",
              salesRepId: "",
              addressId: "",
            });
            setAddressOptions([]);
          } else {
            throw new Error(
              res?.data?.message || "An unexpected error occurred."
            );
          }
        } catch (error) {
          ErrorHandler(error);
        } finally {
          setLoader(false);
        }
      }
    }
  };

  const handleEmail = (email) => {
    // For direct partner toggle mode, don't allow email selection
    if (isDirectPartner) return;

    setEmail(email);
    const selectedEmail = allCustomers.find(
      (customer) => customer?.email === email
    );

    if (!selectedEmail) return;

    const addresses = selectedEmail?.addresses ?? [];
    const addressList = addresses.map((address) => {
      const parts = [
        address.companyaddress,
        address.addressLineOne,
        address.addressLineTwo,
        address.town,
        address.state,
        address.zipCode,
        address.country,
      ].filter((part) => part && part.trim() !== "");
      return {
        value: address.id,
        label: parts.length > 0 ? parts.join(", ") : "",
      };
    });

    setAddressOptions([...addressList]);

    // For local partners (partnerType === "direct-partner"), automatically select first address
    const isLocalPartner = partnerType === "direct-partner";
    const firstAddressId = addresses.length > 0 ? addresses[0]?.id : null;

    setOrder((prev) => ({
      ...prev,
      userId: selectedEmail?.id,
      // Auto-select first address for local partners when sending quotation
      addressId: isLocalPartner && type !== "createOrder" && firstAddressId 
        ? firstAddressId 
        : prev.addressId,
    }));
  };

  // Shipping API: POST api/v1/admin/shipping-charges-on-weight/customer/{customerId} with { weight, userType? }. Returns shipping + discounts. For partner order pass userType: "local-partner".
  const fetchChargesForCustomer = async (customerId, weight, forceShippingZero = false, isPartnerOrder = false) => {
    if (!customerId || !weight) return;

    const body = { weight, ...(isPartnerOrder ? { userType: "local-partner" } : {}) };

    try {
      const res = await PostAPI(
        `api/v1/admin/shipping-charges-on-weight/customer/${customerId}`,
        body
      );

      if (res?.data?.status === "success") {
        const payload = res?.data?.data || {};

        const shipping = forceShippingZero
          ? 0
          : parseFloat(payload?.shippingCharges ?? payload?.charges ?? 0);
        const rawDiscountPct = payload?.discountPercentage;
        const discountPct =
          rawDiscountPct == null ? "" : parseFloat(rawDiscountPct);
        const categoryDiscounts = payload?.discountPercentage || [];

        setOrder((prev) => ({
          ...prev,
          shippingCharges: shipping,
          categoryDiscounts,
        }));
      } else {
        throw new Error(res?.data?.message || "Failed to fetch charges.");
      }
    } catch (err) {
      ErrorHandler(err);
    }
  };

  const handleCompanyName = (id) => {
    const selectedEmail = allCustomers.find((customer) => customer?.id === id);

    if (!selectedEmail) {
      console.error("Customer not found:", id);
      return;
    }

    setOrder((prev) => ({
      ...prev,
      userId: selectedEmail?.id,
      salesRepId: "",
      addressId: "",
      paymentMethod: selectedEmail?.preferredPaymentMethod || "",
    }));
    setEmail(selectedEmail?.email);

    const addressList = (selectedEmail?.addresses ?? []).map((address) => {
      const parts = [
        address.companyaddress,
        address.addressLineOne,
        address.addressLineTwo,
        address.town,
        address.state,
        address.zipCode,
        address.country,
      ].filter((part) => part && part.trim() !== "");
      return {
        value: address.id,
        label: parts.length > 0 ? parts.join(", ") : "",
      };
    });
    setAddressOptions([...addressList]);

    // Direct partner's customer: still hit API for discounts, but force shipping to 0. Others: fetch normally.
    const isPartnerCustomer =
      type === "createOrder" &&
      (propSelectedPartnerId || isDirectPartner) &&
      !isSelfOrder;
    fetchChargesForCustomer(
      selectedEmail?.id,
      totalWeight,
      isPartnerCustomer
    );
  };

  // useEffect(() => {
  //   const fetchCharges = async () => {
  //     try {
  //       const res = await PostAPI("api/v1/admin/shipping-charges-on-weight", {
  //         weight: totalWeight,
  //       });
  //       if (res?.data?.status === "success") {
  //         success_toaster("Shipping Charges Added Successfully");
  //         setOrder({ ...order, shippingCharges: res?.data?.data?.charges });
  //       } else {
  //         throw new Error(
  //           res?.data?.message || "An unexpected error occurred."
  //         );
  //       }
  //     } catch (error) {
  //       ErrorHandler(error);
  //     }
  //   };
  //   // if (type === "createOrder" && open) {
  //   //   fetchCharges();
  //   // }
  //   if (open) {
  //     fetchCharges();
  //   }
  // }, [open, quotationData]);

  // Only one case has NO shipping: direct partner's customer (order for a customer of the partner). All other cases: fetch shipping.
  const isOrderForPartnerCustomer =
    type === "createOrder" &&
    (propSelectedPartnerId || isDirectPartner) &&
    !!order?.userId &&
    !isSelfOrder;

  const customerIdForShipping = (() => {
    if (isOrderForPartnerCustomer) return null;
    if (type === "createOrder" && (isDirectPartner || isSelfOrder)) {
      return order?.salesRepId || propSelectedPartnerId || null;
    }
    if (isSelfOrder) return userID || null;
    return order?.userId || null;
  })();

  useEffect(() => {
    if (!open) return;
    if (isOrderForPartnerCustomer && order?.userId && totalWeight > 0) {
      fetchChargesForCustomer(order.userId, totalWeight, true);
      return;
    }
    if (isOrderForPartnerCustomer) {
      setOrder((prev) => ({ ...prev, shippingCharges: 0 }));
      return;
    }
    if (customerIdForShipping && totalWeight > 0) {
      const isPartnerOrder =
        type === "createOrder" && (isDirectPartner || isSelfOrder);
      fetchChargesForCustomer(
        customerIdForShipping,
        totalWeight,
        false,
        isPartnerOrder
      );
    } else if (customerIdForShipping && totalWeight === 0) {
      setOrder((prev) => ({ ...prev, shippingCharges: 0 }));
    } else if (!isSelfOrder && email && !order?.userId) {
      handleEmail(email);
    }
  }, [
    open,
    isOrderForPartnerCustomer,
    customerIdForShipping,
    totalWeight,
    email,
    order?.userId,
  ]);

  const calculateDiscounts = () => {
    let subtotal = 0;
    let totalDiscount = 0;

    cartItems?.forEach((item) => {
      const categoryDiscount = order?.categoryDiscounts?.find(
        (d) => Number(d.categoryId) === Number(item.categoryId)
      );

      const discountPct = categoryDiscount
        ? parseFloat(categoryDiscount.percentage)
        : 0;
      const itemPrice =
        isDirectPartner || isSelfOrder
          ? parseFloat(item.wholesalePrice)
          : parseFloat(item.price);

      const itemSubtotal = itemPrice * Number(item.qty);
      const itemDiscount = (itemSubtotal * discountPct) / 100;

      subtotal += itemSubtotal;
      totalDiscount += itemDiscount;
    });

    return { subtotal, totalDiscount };
  };

  const { subtotal, totalDiscount } = calculateDiscounts();

  const finalTotal =
    subtotal - totalDiscount + parseFloat(order?.shippingCharges || 0);

  // const discountPercentage = Number(order?.discountPercentage ?? 0);
  // const discountAmount = (Number(totalPrice || 0) * discountPercentage) / 100;

  // const finalTotal =
  //   discountPercentage > 0
  //     ? (Number(totalPrice || 0) - discountAmount) + Number(order?.shippingCharges || 0)
  //     : Number(totalPrice || 0) + Number(order?.shippingCharges || 0);

  const totalWholesale = cartItems?.reduce((a, b) => {
    return Number(a) + Number(b?.wholesalePrice || 0) * Number(b?.qty || 0);
  }, 0);

  const priceGap = Math.max(
    0,
    Number(totalPrice || 0) - Number(totalWholesale || 0)
  );
  const maxDiscountPct =
    Number(totalPrice || 0) > 0 ? (priceGap / Number(totalPrice)) * 100 : 0;

  const selectedCustomer = allCustomers.find((c) => c?.id === order?.userId);
  const bypassDiscountCap = !!selectedCustomer?.salesRepName;

  return (
    <div className="card relative">
      {/* Partner Toggle Warning Dialog */}
      <Dialog
        visible={showPartnerChangeWarning}
        onHide={handleCancelToggleChange}
        dismissableMask={false}
        header={
          <div className="text-center w-full pr-8">
            <h3 className="text-lg font-semibold text-gray-800">Change Partner Mode?</h3>
            <p className="text-sm text-gray-500 mt-1">This will affect your current order</p>
          </div>
        }
        className="font-nunito rounded-2xl overflow-hidden shadow-xl"
        style={{ width: "90vw", maxWidth: "420px" }}
        contentStyle={{ padding: "1.5rem 1.5rem 1.25rem" }}
        footer={
          <div className="flex justify-end gap-3 pt-2 pb-1 px-1">
            <button
              type="button"
              onClick={handleCancelToggleChange}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmToggleChange}
              className="px-5 py-2.5 text-sm font-medium text-white bg-theme rounded-lg hover:opacity-90 transition-colors"
            >
              Continue
            </button>
          </div>
        }
      >
        <p className="text-gray-700 leading-relaxed">
          Changing the partner mode will clear your cart and reset all fields. The drawer will close. Do you want to continue?
        </p>
      </Dialog>

      <Sidebar
        visible={open}
        position="right"
        onHide={() => setOpen(false)}
        className="rounded-tl-xl rounded-bl-xl bg-theme text-white w-[512px]"
        data-testid={
          type === "createOrder" ? ORDERS_CREATE_DRAWER.modal : undefined
        }
      >
        <div className="px-4 space-y-6">
          <div>
            <div className="flex justify-between items-center">
              <h2
                className="text-[32px] font-black font-nunito text-theme-black-2"
                data-testid={
                  type === "createOrder"
                    ? ORDERS_CREATE_DRAWER.title
                    : undefined
                }
              >
                {type === "createOrder" ? "Create Order" : "Send Quotation"}
              </h2>
            </div>
          </div>
          {loader ? (
            <MiniLoader />
          ) : (
            <div className="relative space-y-6 font-sf pb-20 bg-theme text-white">
              {type === "createOrder" ? (
                <div className="space-y-4">
                  {/* Switch for Direct Partner */}
                  {userType === "admin" && (
                    <div className="flex items-center gap-x-2 justify-end">
                      <label className="text-white font-medium">
                        Local Partners
                      </label>
                      <Switch
                        onChange={handleDirectPartnerToggle}
                        checked={isDirectPartner}
                        uncheckedIcon={false}
                        checkedIcon={false}
                        onColor="#3E342C"
                        onHandleColor="#fff"
                        className="react-switch"
                        boxShadow="none"
                        data-testid={ORDERS_CREATE_DRAWER.directPartnerSwitch}
                      />
                    </div>
                  )}

                  {["direct-partner", "dropship-partner"].includes(
                    partnerType
                  ) && (
                    <div className="flex items-center gap-x-2 justify-end">
                      <label className="text-white font-medium">
                        Self Order
                      </label>
                      <Switch
                        onChange={(e) => selfOrderSwitch(e)}
                        checked={isSelfOrder}
                        uncheckedIcon={false}
                        checkedIcon={false}
                        onColor="#3E342C"
                        onHandleColor="#fff"
                        className="react-switch"
                        boxShadow="none"
                        data-testid={ORDERS_CREATE_DRAWER.selfOrderSwitch}
                      />
                    </div>
                  )}

                  {/* Company flow */}
                  {!isDirectPartner && !isSelfOrder && (
                    <div className="flex flex-col gap-y-2">
                      <label className="text-white font-medium font-satoshi">
                        Company Name
                      </label>
                      <div className="flex items-center gap-x-2 min-h-full">
                        <Select
                          placeholder="Select Company"
                          className="w-full"
                          styles={drawerSelectStyles}
                          options={companyNameOptions}
                          onChange={(e) => {
                            handleCompanyName(e.value);
                          }}
                          onInputChange={handleCustomerSearchChange}
                          onMenuScrollToBottom={handleMenuScrollToBottom}
                          menuListProps={{
                            onScroll: handleMenuScroll,
                          }}
                          isSearchable={true}
                          filterOption={() => true} // Disable client-side filtering, use server-side search
                          isLoading={customerLoading}
                          loadingMessage={() => "Loading customers..."}
                          data-testid={ORDERS_CREATE_DRAWER.companySelect}
                        />
                      </div>
                    </div>
                  )}

                  {/* Direct Partner flow */}
                  {isDirectPartner && (
                    <>
                      <div className="flex flex-col gap-y-2">
                        <label className="text-white font-medium font-satoshi">
                          Select Partner
                        </label>
                        <div className="flex items-center gap-x-2 min-h-full">
                          <Select
                            placeholder="Select Local Partner"
                            className="w-full"
                            styles={drawerSelectStyles}
                            options={srNameOptions}
                            onChange={handleSrNameSelect}
                            data-testid={ORDERS_CREATE_DRAWER.srNameSelect}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-y-2">
                        <label className="text-white font-medium font-satoshi">
                          Email
                        </label>
                        <input
                          type="text"
                          value={email}
                          name="email"
                          id="email"
                          placeholder="Email"
                          className="w-full bg-white text-black rounded px-3 py-3 outline-none cursor-not-allowed font-satoshi placeholder-theme focus:ring-0 focus:border-theme"
                          disabled
                          data-testid={ORDERS_CREATE_DRAWER.emailInput}
                        />
                      </div>
                      <div className="flex items-center gap-x-2 min-h-full">
                        <Select
                          placeholder="Select Address"
                          className="w-full"
                          styles={drawerSelectStyles}
                          options={addressOptions}
                          onChange={(e) => {
                            setOrder({ ...order, addressId: e?.value || "" });
                          }}
                          data-testid={ORDERS_CREATE_DRAWER.addressSelect}
                        />
                      </div>
                    </>
                  )}

                  {/* Email display for company flow */}
                  {!isDirectPartner && (
                    <div className="flex flex-col gap-y-2">
                      {/* <label className="text-white font-medium font-satoshi">Email</label> */}
                      <div className="flex items-center gap-x-2 min-h-full">
                        <input
                          type="text"
                          value={email}
                          name=""
                          id=""
                          placeholder="Email"
                          className="w-full bg-white text-black rounded px-3 py-3 outline-none cursor-not-allowed font-satoshi placeholder-theme focus:ring-0 focus:border-theme"
                          disabled
                          data-testid={ORDERS_CREATE_DRAWER.emailInput}
                        />
                      </div>
                    </div>
                  )}

                  {/* Address is hidden in direct partner flow */}
                  {!isDirectPartner && (
                    <div className="flex items-center gap-x-2 min-h-full">
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
                        onChange={(e) => {
                          setOrder({ ...order, addressId: e?.value || "" });
                        }}
                        data-testid={ORDERS_CREATE_DRAWER.addressSelect}
                      />
                    </div>
                  )}

                  <div>
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
                      onChange={(e) => {
                        setOrder({ ...order, paymentMethod: e.value });
                      }}
                      data-testid={ORDERS_CREATE_DRAWER.paymentMethodSelect}
                    />
                  </div>
                  <div>
                    <Select
                      placeholder="Select Order Frequency"
                      className="w-full"
                      styles={drawerSelectStyles}
                      options={orderFrequencyOptions}
                      onChange={(e) => {
                        setOrder({ ...order, orderFrequency: e.value });
                      }}
                      data-testid={ORDERS_CREATE_DRAWER.frequencySelect}
                    />
                  </div>
                  {/* <div className="flex flex-col gap-y-2">
                      <label className="text-white font-medium font-satoshi">
                        Discount (%)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={0.1}
                        value={
                          order?.discountPercentage === "" || order?.discountPercentage == null
                            ? ""
                            : order.discountPercentage
                        }
                        onChange={(e) => {
                          const raw = e.target.value;

                          if (raw === "") {
                            setOrder((prev) => ({ ...prev, discountPercentage: "" }));
                            return;
                          }

                          const v = Number(raw);
                          if (!Number.isFinite(v)) return;

                          let next = Math.max(0, Math.min(100, v));

                          if (!bypassDiscountCap) {
                            const absDiscount = (Number(totalPrice || 0) * next) / 100;
                            if (absDiscount > priceGap) {
                              next = Number(((priceGap / Number(totalPrice || 0)) * 100).toFixed(2));
                              info_toaster(
                                `Discount exceeds margin. Max allowed is ${next}% ($${priceGap.toFixed(2)}).`
                              );
                            }
                          }
                          setOrder((prev) => ({ ...prev, discountPercentage: next }));
                        }}
                        onWheel={(e) => e.target.blur()}
                        placeholder={bypassDiscountCap ? "Enter discount" : `Max ${maxDiscountPct.toFixed(2)}%`}
                        className="w-full bg-white text-black rounded px-3 py-3 outline-none font-satoshi placeholder-theme focus:ring-0 focus:border-theme"
                      />
                    </div> */}

                  <div>
                    <div className="w-full font-sf font-normal text-base text-theme-black-2 flex items-center gap-3 px-5 py-[5px] duration-300 border-2 border-white hover:border-goldenLight focus-within:border-goldenLight rounded-t">
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
                          data-testid={ORDERS_CREATE_DRAWER.noteInput}
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
                    <div className="w-full font-sf font-normal text-base text-theme-black-2 flex items-center gap-3 px-5 py-[5px] duration-300 border-2 border-white hover:border-goldenLight focus-within:border-goldenLight rounded-b">
                      <MdOutlineConfirmationNumber size={24} />
                      <div className="relative w-full">
                        <input
                          type="text"
                          id="poNumber"
                          className={`w-full h-full py-5 pt-7 pb-2 focus:outline-none bg-transparent peer ${
                            order?.note ? "placeholder-transparent" : ""
                          }`}
                          value={order?.poNumber}
                          onChange={(e) =>
                            setOrder({ ...order, poNumber: e.target.value })
                          }
                          data-testid={ORDERS_CREATE_DRAWER.poNumberInput}
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
              ) : (
                <div className="flex flex-col gap-y-2">
                  <label className="text-white font-medium font-satoshi">
                    Email
                  </label>
                  <div className="flex items-center gap-x-2 min-h-full">
                    {emailType ? (
                      <Select
                        placeholder="Select email"
                        className="w-full"
                        styles={drawerSelectStyles}
                        options={emailOptions}
                        onChange={(e) => {
                          handleEmail(e.value);
                        }}
                        onInputChange={handleCustomerSearchChange}
                        onMenuScrollToBottom={handleMenuScrollToBottom}
                        menuListProps={{
                          onScroll: handleMenuScroll,
                        }}
                        isSearchable={true}
                        filterOption={() => true} // Disable client-side filtering, use server-side search
                        isLoading={customerLoading}
                        loadingMessage={() => "Loading emails..."}
                      />
                    ) : (
                      <input
                        type="email"
                        name="email"
                        autoComplete="off"
                        value={email}
                        placeholder="Enter Email"
                        className="border w-full border-themeLight text-themeLight placeholder:text-themeLight rounded-[4px] outline-none px-2.5 py-3"
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setEmail("");
                        setEmailType(!emailType);
                      }}
                      className={`${
                        emailType ? "w-40" : "w-auto"
                      } h-12 bg-white text-black px-[7px] rounded-md`}
                    >
                      {emailType ? "Custom Email" : <RxCross2 size={32} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Only show Order Details if customer or partner is selected */}
              {(order?.userId || order?.salesRepId || isSelfOrder) && (
                <>
                  <p className="font-medium text-base">Order Details</p>

                  <div className="" data-testid={ORDERS_CREATE_DRAWER.itemsList}>
                    {fetchingPartnerPrices ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <MiniLoader />
                        <p className="text-white text-sm mt-3">Fetching partner prices...</p>
                      </div>
                    ) : cartItems?.length > 0 ? (
                      <div>
                        <div className="h-3/5 overflow-y-auto">
                          {cartItems?.map((cartI, index) => (
                            <div
                              key={index}
                              className="font-sf relative flex sm:flex-row items-start rounded-2xl h-full mb-3"
                            >
                              <div className="flex justify-center items-center sm:w-[260px] w-[200px] sm:h-[72px] h-[72px] rounded-lg bg-gray-100 p-2">
                                <Image
                                  src={cartI?.image ? `${BASE_URL}${cartI?.image}` : "/images/logocoffee.png"}
                                  alt={cartI?.name || "product"}
                                  width={100}
                                  height={72}
                                  className="w-full h-full rounded-md object-contain"
                                  onError={(e) => {
                                    e.target.src = "/images/logocoffee.png";
                                  }}
                                  unoptimized
                                />
                              </div>
                          <div className="px-5 w-full font-sf">
                            <h3 className="capitalize font-semibold text-base break-words">
                              {cartI?.name}
                            </h3>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-x-3">
                                <span className="font-semibold text-sm text-white mt-1">
                                  {"$ "}
                                  {parseFloat(
                                    isDirectPartner || isSelfOrder
                                      ? cartI?.wholesalePrice
                                      : cartI?.price
                                  )}{" "}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="cursor-pointer mt-2 mr-1 rounded-full flex items-center justify-around text-white p-1 relative bg-black right-0">
                            {counter === index ? (
                              <div className="flex">
                                <button
                                  onClick={() => {
                                    handleItemClick("minus", cartI?.id);
                                  }}
                                  className="w-8 h-8 flex justify-center items-center rounded-full hover:bg-white hover:text-black duration-300"
                                  data-testid={ORDERS_CREATE_DRAWER.itemMinusBtn(
                                    cartI?.id
                                  )}
                                >
                                  <RiSubtractFill />
                                </button>
                                <span className="text-lg font-sf w-7 text-center">
                                  {cartI?.qty}
                                </span>
                                <button
                                  onClick={() => {
                                    handleItemClick("plus", cartI?.id);
                                  }}
                                  className="w-8 h-8 flex justify-center items-center rounded-full hover:bg-white hover:text-black duration-300"
                                  data-testid={ORDERS_CREATE_DRAWER.itemQtyBadge(
                                    cartI?.id
                                  )}
                                >
                                  <BiPlus />
                                </button>
                                <button
                                  onClick={() => {
                                    handleItemClick("delete", cartI?.id);
                                  }}
                                  className="w-8 h-8 flex justify-center items-center rounded-full hover:bg-red-600 hover:text-white duration-300"
                                  data-testid={ORDERS_CREATE_DRAWER.itemDeleteBtn(
                                    cartI?.id
                                  )}
                                >
                                  <BiTrash />
                                </button>
                              </div>
                            ) : (
                              <span
                                onClick={() => handleCounterClick(index)}
                                className="text-lg font-sf w-7 text-center"
                                data-testid={ORDERS_CREATE_DRAWER.itemQtyBadge(
                                  cartI?.id
                                )}
                              >
                                {cartI?.qty}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-x-2">
                        <h5 className="text-base text-white">Subtotal</h5>
                        <h6 data-testid={ORDERS_CREATE_DRAWER.subtotalValue}>
                          $
                          {isDirectPartner || isSelfOrder
                            ? totalWholesale.toFixed(2)
                            : totalPrice.toFixed(2)}
                        </h6>
                      </div>

                      {/* {discountPercentage > 0 && (
                        <div className="flex items-center justify-between gap-x-2">
                          <h5 className="text-base text-white">
                            Discount ({discountPercentage}%)
                          </h5>
                          <h6>- $ {discountAmount.toFixed(2)}</h6>
                        </div>
                      )} */}
                      {order?.categoryDiscounts?.length > 0 &&
                        cartItems?.map((item, index) => {
                          const catDiscount = order?.categoryDiscounts?.find(
                            (d) =>
                              Number(d.categoryId) === Number(item.categoryId)
                          );
                          if (!catDiscount) return null;

                          const pct = parseFloat(catDiscount.percentage);
                          const itemSubtotal =
                            parseFloat(item.price) * Number(item.qty);
                          const itemDiscount = (itemSubtotal * pct) / 100;

                          return (
                            <div
                              key={index}
                              className="flex justify-between text-sm text-gray-300"
                              data-testid={ORDERS_CREATE_DRAWER.discountLine(
                                item.categoryId
                              )}
                            >
                              <span>
                                {item.name} ({pct}%)
                              </span>
                              <span>- $ {itemDiscount.toFixed(2)}</span>
                            </div>
                          );
                        })}

                      <div className="flex items-center justify-between gap-x-2">
                        <h5 className="text-base text-white">
                          Shipping Charges
                        </h5>
                        <h6 data-testid={ORDERS_CREATE_DRAWER.shippingValue}>
                          $ {parseFloat(order?.shippingCharges || 0).toFixed(2)}
                        </h6>
                        {/* <h6>$ {order?.shippingCharges}</h6> */}
                      </div>
                    </div>
                  </div>
                    ) : (
                      <p className="text-center text-red-500 ">
                        No Item is Selected !
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          <div
            className={`absolute bottom-0 left-0 py-5 flex justify-center w-full px-4 sm:px-0 sm:left-[30px] sm:w-[452px] ${
              loader ? "opacity-60" : "bg-theme"
            }`}
          >
            <button
              disabled={loader}
              className="bg-themeLight font-bold text-white rounded-[4px] px-5 min-h-14 w-full flex items-center justify-between"
              onClick={handleSendQuotation}
              data-testid={ORDERS_CREATE_DRAWER.submitBtn}
            >
              <div className="flex space-x-4 items-center">
                <div className="bg-white text-black text-sm py-[1px] px-[7px] rounded-full">
                  {String(cartItems?.length).padStart(2)}
                </div>
                <p>
                  {type === "createOrder" ? "Create Order" : "Send Quotation"}
                </p>
              </div>
              {/* ${" "}
              {(
                Number(totalPrice) + Number(order?.shippingCharges ?? 0)
              )?.toFixed(2)} */}
              $ {finalTotal.toFixed(2)}
            </button>
          </div>
        </div>
      </Sidebar>
    </div>
    // <Drawer.Root
    //   placement={"end"}
    //   size="md"
    //   open={open}
    //   onOpenChange={(e) => setOpen(e.open)}
    // >
    //   <Portal>
    //     <Drawer.Backdrop />
    //     <Drawer.Positioner>
    //       <Drawer.Content className="rounded-tl-xl rounded-bl-xl bg-theme text-white">
    //         <Drawer.Header
    //           className="rounded-tl-xl"
    //           p={0}
    //           boxShadow={
    //             drawerScroll > 100 ? "0px 4px 10px rgba(0, 0, 0, 0.1)" : "none"
    //           }
    //           transition="all 0.3s ease"
    //           position="absolute"
    //           top={drawerScroll > 100 ? "0" : "-60px"}
    //           left="0"
    //           right="0"
    //           backgroundColor="#3e342c"
    //           zIndex={10}
    //           opacity={drawerScroll > 100 ? 1 : 0}
    //           visibility={drawerScroll > 100 ? "visible" : "hidden"}
    //           height="70px"
    //           display="flex"
    //           alignItems="center"
    //           justifyContent="center"
    //         >
    //           {/* <Drawer.Title>Drawer Title</Drawer.Title> */}

    //           <p className="font-medium text-base">
    //             {false ? "Substitution" : "Your Order"}
    //           </p>
    //         </Drawer.Header>
    //         <Drawer.Body
    //           ref={drawerBodyRef}
    //           className="w-full !pb-0  custom-scrollbar"
    //           px={0}
    //           onScroll={handleDrawerScroll}
    //         >
    //           <div className="space-y-6 font-sf px-4 mb-28 bg-theme text-white">
    //             <div>
    //               <div className="flex justify-between items-center mb-10 mt-20 ">
    //                 <h2 className="text-[32px] font-black font-nunito text-theme-black-2">
    //                   Your Quotation
    //                 </h2>
    //                 <button
    //                   onClick={() => setOpen(false)}
    //                   className="absolute right-5 top-4 z-10 rounded-full bg-themeLight text-white w-10 h-10 text-xl flex justify-center items-center"
    //                 >
    //                   <IoMdClose className="text-2xl" />
    //                 </button>
    //               </div>

    //               <div className="flex justify-between my-3">
    //                 <h2 className="font-omnes  text-xl font-semibold ">
    //                   Order items
    //                 </h2>
    //               </div>

    //               <div className="">
    //                 <div className="h-3/5 overflow-y-auto">
    //                   {cartItems?.map((cartI, index) => (
    //                     <div
    //                       key={index}
    //                       className="font-sf relative flex sm:flex-row items-start rounded-2xl h-full mb-3"
    //                     >
    //                       <div className="flex justify-center sm:w-[150px] w-[72px] sm:h-[72px] h-[72px] rounded-2xl">
    //                         <img
    //                           src={BASE_URL + cartI?.image}
    //                           alt="cutlery"
    //                           className="w-full h-full rounded-md object-cover"
    //                         />
    //                       </div>
    //                       <div className="px-5 w-full font-sf">
    //                         <h3 className="capitalize font-semibold text-base">
    //                           {cartI?.name}
    //                         </h3>
    //                         <div className="capitalize text-sm font-light text-white">
    //                           <ul>
    //                             {cartI?.addOnsCat &&
    //                             cartI?.addOnsCat?.length > 0
    //                               ? cartI?.addOnsCat
    //                                   ?.filter(
    //                                     (ele) =>
    //                                       ele?.id ===
    //                                       cartI?.addOns?.find(
    //                                         (fil) =>
    //                                           fil?.collectionId === ele?.id
    //                                       )?.collectionId
    //                                   )
    //                                   ?.map((cat, key) => (
    //                                     <li key={key}>
    //                                       <span>{cat?.name}: </span>
    //                                       <br />
    //                                       {cartI?.addOns
    //                                         ?.filter(
    //                                           (fil) =>
    //                                             fil?.collectionId === cat?.id
    //                                         )
    //                                         ?.map((add, addKey) => (
    //                                           <div
    //                                             key={addKey}
    //                                             className="ml-2 mt-1"
    //                                           >
    //                                             {`${add?.qty}x ${add?.name} ${
    //                                               add?.total > 0
    //                                                 ? `(${add?.total}.00)`
    //                                                 : ""
    //                                             }`}
    //                                           </div>
    //                                         ))}
    //                                     </li>
    //                                   ))
    //                               : cartI?.addOns?.map((add, addKey) => (
    //                                   <li key={addKey}>
    //                                     <div className="ml-2 mt-1">
    //                                       {`${add?.qty}x ${add?.name} ${
    //                                         add?.total > 0
    //                                           ? `(${add?.total}.00)`
    //                                           : ""
    //                                       }`}
    //                                     </div>
    //                                   </li>
    //                                 ))}
    //                           </ul>
    //                         </div>
    //                         <div className="flex items-center justify-between">
    //                           <div className="flex items-center gap-x-3">
    //                             <span className="font-semibold text-sm text-white mt-1">
    //                               {parseFloat(
    //                                 Number(cartI?.price) * cartI?.qty
    //                               )}{" "}
    //                               {activeResData?.currencyUnit || "$"}
    //                             </span>
    //                           </div>
    //                         </div>
    //                       </div>
    //                       <div className="cursor-pointer mt-2 mr-1 rounded-full flex items-center justify-around text-white p-1 absolute bg-black right-0">
    //                         {counter === index ? (
    //                           <>
    //                             <button
    //                               onClick={() => {
    //                                 handleItemClick("minus", cartI?.productId);
    //                               }}
    //                               className="w-8 h-8 flex justify-center items-center rounded-full hover:bg-white hover:text-black duration-300"
    //                             >
    //                               <RiSubtractFill />
    //                             </button>

    //                             <span className="text-lg font-sf w-7 text-center">
    //                               {cartI?.qty}
    //                             </span>

    //                             <button
    //                               onClick={() => {
    //                                 handleItemClick("plus", cartI?.productId);
    //                               }}
    //                               className="w-8 h-8 flex justify-center items-center rounded-full hover:bg-white hover:text-black duration-300"
    //                             >
    //                               <BiPlus />
    //                             </button>

    //                             <button
    //                               onClick={() => {
    //                                 handleItemClick("delete", cartI?.productId);
    //                               }}
    //                               className="w-8 h-8 flex justify-center items-center rounded-full hover:bg-red-600 hover:text-white duration-300"
    //                             >
    //                               <BiTrash />
    //                             </button>
    //                           </>
    //                         ) : (
    //                           <span
    //                             onClick={() => handleCounterClick(index)}
    //                             className="text-lg font-sf w-7 text-center"
    //                           >
    //                             {cartI?.qty}
    //                           </span>
    //                         )}
    //                       </div>
    //                     </div>
    //                   ))}
    //                 </div>
    //               </div>
    //             </div>
    //           </div>
    //         </Drawer.Body>
    //         <Drawer.Footer px={0} py={2}>
    //           <>
    //             {cartItems?.length > 0 ? (
    //               <div
    //                 className="w-full text-center mt-4 px-4"
    //                 onClick={() => {
    //                   router.push("/checkout");
    //                   setOpen(false);
    //                 }}
    //               >
    //                 <button
    //                   className="bg-themeLight font-bold text-white rounded-full px-5 min-h-14 w-full flex items-center justify-between"
    //                   // onClick={handleCartPage}
    //                 >
    //                   <div className="flex space-x-4 items-center">
    //                     <div className="bg-white text-black text-sm  py-[1px] px-[7px] rounded-full">
    //                       {String(cartItems?.length).padStart(2)}
    //                     </div>
    //                     <p> Go to checkout </p>
    //                   </div>
    //                   ${totalPrice.toFixed(2)} {activeResData?.currencyUnit}
    //                 </button>
    //               </div>
    //             ) : (
    //               <div className="w-full text-center mt-4 mx-4">
    //                 <button className="bg-black  font-bold text-white rounded-full px-5 min-h-14 w-full    `` ">
    //                   Send Quotation
    //                 </button>
    //               </div>
    //             )}
    //           </>
    //         </Drawer.Footer>
    //         <Drawer.CloseTrigger asChild>
    //           {/* Keep the Chakra CloseButton for consistent styling */}
    //           <CloseButton size="sm" />
    //         </Drawer.CloseTrigger>
    //       </Drawer.Content>
    //     </Drawer.Positioner>
    //   </Portal>
    // </Drawer.Root>
  );
};

export default DrawerBeans;
