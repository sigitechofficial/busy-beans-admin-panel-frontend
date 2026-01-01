"use client";

import { useEffect, useState, useRef } from "react";
import { Sidebar } from "primereact/sidebar";
import Select from "react-select";
import { useRouter } from "next/navigation";
import { MdInsertComment, MdOutlineConfirmationNumber } from "react-icons/md";
import {
  error_toaster,
  info_toaster,
  success_toaster,
} from "@/utilities/Toaster";
import GetAPI from "@/utilities/GetAPI";
import { PostAPI } from "@/utilities/PostAPI";
import ErrorHandler from "@/utilities/ErrorHandler";
import { drawerSelectStyles } from "@/utilities/SelectStyle";
import { hasPermission } from "@/utilities/Permission";
import Switch from "react-switch";
import axios from "axios";
import { BASE_URL } from "@/utilities/URL";

const DrawerBeansGenerateInvoice = ({
  drawerOpen: open,
  setDrawerOpen: setOpen,
  invoiceData,
  setInvoiceData,
}) => {
  const router = useRouter();

  let userID, userType, isEmployee;
  if (typeof window !== "undefined") {
    userID = localStorage.getItem("userID");
    userType = localStorage.getItem("userType");
    isEmployee = localStorage.getItem("isEmployee") === "true";
  }
  const [companyNameOptions, setCompanyNameOptions] = useState([]);
  const [fullData, setFullData] = useState("");

  const [emailOptions, setEmailOptions] = useState([]);
  
  // Pagination state for customers
  const [customerPage, setCustomerPage] = useState(1);
  const [customerLimit] = useState(30);
  const [customerHasMore, setCustomerHasMore] = useState(true);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [allCustomers, setAllCustomers] = useState([]); // Store all fetched customers
  const [customerSearchQuery, setCustomerSearchQuery] = useState(""); // Search query for customers

  const paymentMethodOptions = [
    { label: "Bank Check", value: "bank check" },
    { label: "Card", value: "card" },
  ];

  const [addressOptions, setAddressOptions] = useState([]);
  const [email, setEmail] = useState("");
  const [loader, setLoader] = useState(false);
  const [partnersOrder, setPartnersOrder] = useState(false);

  // Drawer form state
  const [order, setOrder] = useState({
    note: "",
    paymentMethod: "",
    poNumber: "",
    addressId: "",
    userId: "",
    shippingCharges: "",
    // categoryDiscounts: [],
  });

  // ======= cart items =======
  let cartItems = [];
  if (typeof window !== "undefined") {
    cartItems = JSON.parse(localStorage.getItem("createOrderData")) || [];
  }

  const totalPrice = cartItems?.reduce(
    (a, b) => Number(a) + Number(b?.price) * Number(b?.qty),
    0
  );
  const totalWeight = cartItems?.reduce(
    (a, b) => Number(a) + Number(b?.weight || 0) * Number(b?.qty || 0),
    0
  );

  // ======= customers list =======
  const getCustomerListEndpoint = (page, limit, search = "") => {
    const base = isEmployee && hasPermission("selected-customer_view")
      ? `api/v1/admin/customer-management/customer-list/employee-id/${userID}`
      : userType === "admin"
        ? `api/v1/admin/customer-management/customer-list/all`
        : userType === "salesRepresentative"
          ? `api/v1/admin/customer-management/customer-list/sale-rep-id/${userID}&orderCreation=yes`
          : `api/v1/admin/customer-management/customer-list/all`;
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", limit.toString());
    if (search.trim()) {
      params.set("search", search.trim());
    }
    // Handle the salesRep endpoint which already has query params
    if (base.includes("&orderCreation=yes")) {
      return `${base.split("&")[0]}?${params.toString()}&orderCreation=yes`;
    }
    return `${base}?${params.toString()}`;
  };

  // ======= helpers =======
  const mapItemsForPayload = (items) =>
    items?.map((item) => ({
      categoryId: item?.categoryId,
      createdAt: item?.createdAt,
      deleted: false,
      desc: item?.desc,
      productId: item?.id,
      image: item?.image,
      name: item?.name,
      price: item?.price,
      qty: item?.qty,
      quantity: item?.quantity,
      status: true,
      unit: item?.unit,
      updatedAt: item?.updatedAt,
      weight: item?.weight,
      wholesalePrice: item?.wholesalePrice,
    })) || [];

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

  const handleCompanySelect = (companyId) => {
    const selected = allCustomers?.find((c) => c?.id === companyId) || fullData?.find((c) => c?.id === companyId);
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
    fetchChargesForCustomer(selected?.id, totalWeight);
  };

  const handlePartnerOrder = (e) => {
    setPartnersOrder(e);
    setOrder({})
    setCompanyNameOptions([]);
    setEmail([]);
    setAddressOptions([]);
    // Reset customer pagination state
    if (!e) {
      setCustomerPage(1);
      setAllCustomers([]);
      setCustomerSearchQuery("");
    }
  };

  // ✅ Fetch customers with pagination and search
  const fetchCustomerData = async (page, append = false, searchQuery = customerSearchQuery) => {
    if (customerLoading) return;
    
    setCustomerLoading(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      const endpoint = getCustomerListEndpoint(page, customerLimit, searchQuery);
      
      const res = await axios.get(`${BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          feature: "customer",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res?.data?.status === "success") {
        const customers = res?.data?.data?.data || res?.data?.data || [];
        const totalItems = res?.data?.pagination?.totalItems || res?.data?.data?.pagination?.totalItems || customers.length;
        const totalPages = res?.data?.pagination?.totalPages || res?.data?.data?.pagination?.totalPages || Math.ceil(totalItems / customerLimit);
        
        const nameOptions = customers.map((user) => ({
          value: user?.id,
          label: `${user?.companyName} (${user?.name})`,
        }));
        
        const emails = customers.map((user) => ({
          value: user?.email,
          label: user?.email,
        }));

        if (append) {
          setCompanyNameOptions((prev) => [...prev, ...nameOptions]);
          setEmailOptions((prev) => [...prev, ...emails]);
          setAllCustomers((prev) => [...prev, ...customers]);
        } else {
          setCompanyNameOptions(nameOptions);
          setEmailOptions(emails);
          setAllCustomers(customers);
        }
        
        // Keep fullData for backward compatibility (handleCompanySelect uses it)
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
      fetchCustomerData(1, false, inputValue);
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

  // Load more customers on scroll
  const handleMenuScrollToBottom = () => {
    if (!customerLoading && customerHasMore && !partnersOrder) {
      fetchCustomerData(customerPage + 1, true, customerSearchQuery);
    }
  };

  // Alternative scroll handler for menuListProps
  const handleMenuScroll = (event) => {
    if (partnersOrder) return; // Don't handle scroll for partners
    
    const { target } = event;
    if (!target) return;
    
    const { scrollTop, scrollHeight, clientHeight } = target;
    // Check if scrolled near bottom (within 50px)
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      if (!customerLoading && customerHasMore) {
        fetchCustomerData(customerPage + 1, true, customerSearchQuery);
      }
    }
  };

  const fetchDirectPartnerData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(
        `${BASE_URL}api/v1/admin/sales-rep/for-order-creation?partnerType=direct-partner`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      if (res?.data?.status === "success") {
        setFullData(res?.data?.data);
        const list = res?.data?.data || [];
        let options = [];
        let emails = [];
        list?.map((elem) => {
          options.push({
            value: elem?.id,
            label: `${elem?.srName} (${elem?.territoryName})`,
          });
          // emails.push({value:"",label:""})
        });

        setCompanyNameOptions(options);
        // setEmailOptions(emails);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (partnersOrder) {
      fetchDirectPartnerData();
      // Reset customer pagination when switching to partners
      setCustomerPage(1);
      setCompanyNameOptions([]);
      setAllCustomers([]);
      setCustomerSearchQuery("");
    } else {
      fetchCustomerData(1, false, customerSearchQuery);
    }
  }, [partnersOrder]);

  console.log(
    order?.userId,
    totalWeight,
    "order?.userId, totalWeightorder?.userId, totalWeight"
  );
  useEffect(() => {
    if (open && order?.userId) {
      fetchChargesForCustomer(order?.userId, totalWeight);
    }
  }, [open, order?.userId, totalWeight]);

  const handleGenerate = async () => {
    // if (cartItems.length === 0) {
    //   info_toaster("No products selected.");
    //   return;
    // }
    if (!email?.trim()) {
      info_toaster("Email cannot be empty.");
      return;
    }
    if (!order?.addressId) {
      info_toaster("Address cannot be empty.");
      return;
    }
    if (!order?.paymentMethod) {
      info_toaster("Select payment method.");
      return;
    }

    const itemsPrice = Number(totalPrice || 0);
    const shipping = Number(order?.shippingCharges || 0);
    const totalBill = itemsPrice + shipping;

    const payload = {
      email: [email],
      order: {
        totalBill: totalBill.toFixed(2),
        subTotal: itemsPrice.toFixed(2),
        discountPrice: (0).toFixed(2),
        discountPercentage: 0,
        itemsPrice: itemsPrice.toFixed(2),
        vat: 0.0,
        totalWeight,
        shippingCharges: shipping.toFixed(2),
        note: order?.note,
        poNumber: order?.poNumber,
        addressId: order?.addressId,
        ...(partnersOrder ? { salesRepId: order?.userId } : { userId: order?.userId }),
        paymentMethod: order?.paymentMethod,
        invoiceOnly: true,
        type: "direct-invoice"
      },
      items: mapItemsForPayload(cartItems),
    };

    setLoader(true);
    try {
      const res = await PostAPI(
        userType === "admin"
          ? partnersOrder ? `api/v1/admin/partner-order/book-new-order` : `api/v1/admin/book-new-order`
          : `api/v1/admin/sales-rep/book-new-order/${userID}`,
        payload,
        "invoices"
      );

      if (res?.data?.status === "success") {
        const orderId = res?.data?.data?.id;
        // success_toaster("Invoice generated successfully");
        localStorage.setItem("createOrderData", JSON.stringify([]));
        setInvoiceData?.([]);
        setOpen(false);
        if (orderId) {
          // router.push(`/orders/detail/${orderId}/add-invoice`);
          router.push( partnersOrder ? `/direct-invoices/partner/${orderId}/add-invoice` : `/direct-invoices/${orderId}/add-invoice`);
        }
      } else {
        throw new Error(res?.data?.message || "Failed to generate invoice.");
      }
    } catch (err) {
      ErrorHandler(err);
    } finally {
      setLoader(false);
    }
  };

  // ======= UI =======
  return (
    <div className="card relative">
      <Sidebar
        visible={open}
        position="right"
        onHide={() => setOpen(false)}
        className="rounded-tl-xl rounded-bl-xl bg-theme text-white w-[512px]"
      >
        <div className="px-4 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-[32px] font-black font-nunito text-theme-black-2">
              Generate Invoice
            </h2>
          </div>

          <div className="flex items-center gap-x-2 justify-end">
            <label className="text-white font-medium">
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
            // data-testid={ORDERS_CREATE_DRAWER.selfOrderSwitch}
            />
          </div>

          {/* Body */}
          <div className="relative space-y-6 font-sf pb-20 bg-theme text-white">
            {/* Company */}
            <div className="flex flex-col gap-y-2">
              <label className="text-white font-medium font-satoshi">
                Company Name
              </label>
              <Select
                placeholder="Select Company"
                className="w-full"
                styles={drawerSelectStyles}
                options={companyNameOptions}
                onChange={(e) => handleCompanySelect(e.value)}
                onInputChange={!partnersOrder ? handleCustomerSearchChange : undefined}
                onMenuScrollToBottom={!partnersOrder ? handleMenuScrollToBottom : undefined}
                menuListProps={!partnersOrder ? {
                  onScroll: handleMenuScroll,
                } : undefined}
                isSearchable={!partnersOrder}
                filterOption={!partnersOrder ? () => true : undefined} // Disable client-side filtering, use server-side search
                isLoading={!partnersOrder ? customerLoading : false}
                loadingMessage={!partnersOrder ? () => "Loading customers..." : undefined}
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-y-2">
              <div className="flex items-center gap-x-2 min-h-full">
                <input
                  type="text"
                  value={email}
                  placeholder="Email"
                  className="w-full bg-white text-black rounded px-3 py-3 outline-none cursor-not-allowed font-satoshi placeholder-theme focus:ring-0 focus:border-theme"
                  disabled
                />
              </div>
            </div>

            {/* Address */}
            <div className="flex items-center gap-x-2 min-h-full">
              <Select
                placeholder="Select Address"
                className="w-full"
                styles={drawerSelectStyles}
                value={
                  addressOptions?.find((opt) => opt?.value === order?.addressId) ||
                  null
                }
                options={addressOptions}
                onChange={(e) =>
                  setOrder({ ...order, addressId: e?.value || "" })
                }
              />
            </div>

            {/* Payment Method */}
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
                onChange={(e) => setOrder({ ...order, paymentMethod: e.value })}
              />
            </div>

            {/* NOTE + PO Number */}
            <div>
              <div className="w-full font-sf font-normal text-base text-theme-black-2 flex items-center gap-3 px-5 py-[5px] duration-300 border-2 border-white hover:border-goldenLight focus-within:border-goldenLight rounded-t">
                <MdInsertComment size={24} />
                <div className="relative w-full">
                  <input
                    type="text"
                    id="courier-note"
                    className={`w-full h-full py-5 pt-7 pb-2 focus:outline-none bg-transparent peer ${order?.note ? "placeholder-transparent" : ""
                      }`}
                    value={order?.note}
                    onChange={(e) =>
                      setOrder({ ...order, note: e.target.value })
                    }
                  />
                  <label
                    htmlFor="courier-note"
                    className={`absolute left-0 top-4 placeholder:text-themeLight transition-all ${order?.note
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
                    className={`w-full h-full py-5 pt-7 pb-2 focus:outline-none bg-transparent peer ${order?.poNumber ? "placeholder-transparent" : ""
                      }`}
                    value={order?.poNumber}
                    onChange={(e) =>
                      setOrder({ ...order, poNumber: e.target.value })
                    }
                  />
                  <label
                    htmlFor="poNumber"
                    className={`absolute left-0 top-4 placeholder:text-themeLight transition-all ${order?.poNumber
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

          {/* Footer */}
          <div
            className={`absolute bottom-0 left-0 py-5 flex justify-center w-full px-4 sm:px-0 sm:left-[30px] sm:w-[452px] ${loader ? "opacity-60" : "bg-theme"
              }`}
          >
            <button
              disabled={loader}
              onClick={handleGenerate}
              className="bg-themeLight font-bold text-white rounded-[4px] px-5 min-h-14 w-full flex items-center justify-between"
            >
              <div className="flex space-x-4 items-center">
                <div className="bg-white text-black text-sm py-[1px] px-[7px] rounded-full">
                  {String(cartItems?.length).padStart(2)}
                </div>
                <p>Next</p>
              </div>
              ${" "}
              {(
                Number(totalPrice || 0) + Number(order?.shippingCharges || 0)
              ).toFixed(2)}
            </button>
          </div>
        </div>
      </Sidebar>
    </div>
  );
};

export default DrawerBeansGenerateInvoice;
