"use client";
import BackButton from "@/components/ui/BackButton";
import Loader from "@/components/ui/Loader";
import MiniLoader from "@/components/ui/MiniLoader";
import { useDataContext } from "@/utilities/DataContext";
import GetAPI from "@/utilities/GetAPI";
import { PatchAPI } from "@/utilities/PatchAPI";
import { selectStyles2 } from "@/utilities/SelectStyle";
import { success_toaster, info_toaster } from "@/utilities/Toaster";
import { useParams, useRouter } from "next/navigation";
import { stringify } from "postcss";
import { Dialog } from "primereact/dialog";
import React, { useEffect, useState } from "react";
import { CiMenuBurger } from "react-icons/ci";
import { IoIosSearch } from "react-icons/io";
import { IoCardSharp, IoSearch } from "react-icons/io5";
import Select from "react-select";
import { ORDER_ADD_INVOICE } from "../../../orders.testids";

export default function AddInvoice() {
  const router = useRouter();
  const [filterId, setFilterId] = useState("");
  const [loading, setLoading] = useState(false);
  const [manual, setManual] = useState({
    shippingCharge: "",
    show: false,
  });
  const { orderID } = useParams();
  const { data, reFetch, isLoading } = GetAPI(`api/v1/admin/order-details/${orderID}`);
  const userId = data?.data?.order?.user?.id ?? null;
  const [cardsUrl, setCardsUrl] = useState(null);
  useEffect(() => {
    if (userId) setCardsUrl(`api/v1/admin/customer-management/payment-cards/${userId}`);
  }, [userId]);
  const { data: paymentCardsRes, loading: cardsLoading } = GetAPI(cardsUrl);
  const { data: shippingCharges } = GetAPI(
    "api/v1/admin/shipping-charges-list", 'charges'
  );
  const { data: category } = GetAPI(`api/v1/admin/category`);
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState("");
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
  const savedCards =
  paymentCardsRes?.data?.data?.cards ??
  paymentCardsRes?.data?.cards ??
  paymentCardsRes?.cards ??
  [];

  const [selectedCardId, setSelectedCardId] = useState(null);
  useEffect(() => {
    if (savedCards.length && !selectedCardId) {
      setSelectedCardId(savedCards[0].id);
    }
  }, [savedCards, selectedCardId]);

  const getToday = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  let userType = "admin";

  // States for invoice fields
  const [invoiceFields, setInvoiceFields] = useState({
    invoiceNumber: "",
    poNumber: "",
    invoiceDate: getToday(),
    proforma: false,
    terms: "30",
    dueDate: "",
    discountPercentage: 0,
    note: "",
    otherPayment: "",
    paymentOption: false,
    emailInvoiceToCustomer: false,
    // invoiceDate: "",
    invoicePdf: "",
    shippingCharges: "",
  });
  const [initialShippingCharges, setInitialShippingCharges] = useState("");
  // Items state (for main items)
  const [items, setItems] = useState([]);

  // Extra rows state (for added delivery/extra charges)
  const [extraRows, setExtraRows] = useState([]);

  // Utility to get date 30 days from today in yyyy-mm-dd format
  const getDueDate = () => {
    const due = new Date();
    due.setDate(due.getDate() + 30);
    return due.toISOString().split("T")[0];
  };

  const handleFilter = () => {
    const filteredData = ProductList?.data?.data?.filter((item) =>
      item?.name?.toLowerCase().includes(search.toLowerCase() || "")
    );

    return filteredData;
  };

  // On API data load, set invoice fields and items
  useEffect(() => {
    if (data?.data?.order) {
      const sc = (data.data.order.shippingCharges ?? "").toString();
      setInvoiceFields((prev) => ({
        ...prev,
        invoiceNumber: data?.data?.order?.invoiceNumber || "",
        poNumber: data?.data?.order?.poNumber || "",
        invoiceDate: prev?.invoiceDate || getToday(),
        dueDate: prev?.dueDate || getDueDate(),
        note: data?.data?.order?.note,
        // shippingCharges: data?.data?.order?.shippingCharges,
        invoiceDate: data?.data?.order?.invoiceDate,
        invoicePdf: data?.data?.order?.invoicePdf,
        discountPercentage: Number(data?.data?.order?.discountPercentage ?? 0),
        shippingCharges: sc,
        // You can set invoiceDate, dueDate, terms, etc. from API if available
      }));
      setInitialShippingCharges(sc); 
      setItems(
        (data?.data?.order?.items || [])
        .filter((item) => item.type === "product")
        .map((item) => ({
          ...item,
          checked: true,
          qty: item.qty || 1,
          weight: item?.singleUnitWeight,
          unit: item?.price / item?.qty,
        }))
      );
      const chargesFromItems = (data?.data?.order?.items || [])
        .filter((item) => item.type === "charges")
        .map((ch) => ({
          ...ch,
          type: "charges",
          code: ch.productCode || ch.code || "",
          name: ch.product || ch.productName || ch.name || "",
          qty: ch.qty,
          unit: parseFloat(((ch?.price || 0) / (ch?.qty || 1)).toFixed(2)),
          checked: true,
        }));

      const chargesFromTypeCharges = (data?.data?.order?.typeCharges || [])
        .map((ch) => ({
          ...ch,
          type: "charges",
          code: ch.code || "",
          name: ch.name || "",
          qty: ch.qty || 1,
          unit: Number(ch.price) || 0,
          checked: true,
        }));

      setExtraCharges([...chargesFromItems, ...chargesFromTypeCharges]);
    }
  }, [data]);

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
    let clean = String(rawValue).replace(/\D/g, ""); 
    if (clean === "") return "";
    if (clean === "0") return 1;
    return parseInt(clean, 10);
  };

  // Item qty handler
  const handleItemQtyChange = (itemIdx, value) => {
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === itemIdx ? { ...item, qty: normalizeQty(value) } : item
      )
    );
  };

  // Extra row checkbox handler
  const handleExtraRowCheck = (rowIdx, checked) => {
    setExtraRows((prev) =>
      prev.map((item, idx) => (idx === rowIdx ? { ...item, checked } : item))
    );
  };

  // Add delivery/extra charges row (no category)
  const handleAddExtra = (prod) => {
    // First, check in items
    const itemIdx = items.findIndex((item) => item.productId == prod?.id);
    if (itemIdx !== -1) {
      setItems((prev) =>
        prev.map((item, idx) =>
          idx === itemIdx ? { ...item, qty: +item.qty + 1 } : item
        )
      );
      setModal(false);
      return;
    }

    setExtraRows((prev) => {
      // Check if item already exists by productId (or use productCode if that's unique)
      const existingIdx = prev.findIndex((item) => item.productId == prod?.id);
      if (existingIdx !== -1) {
        // If exists, increment qty
        return prev.map((item, idx) =>
          idx === existingIdx ? { ...item, qty: +item.qty + 1 } : item
        );
      }
      // If not exists, add new
      return [
        ...prev,
        {
          id: `extra-${Date.now()}`,
          productId: prod?.id,
          code: "",
          name: prod?.name,
          qty: prod?.qty || 1,
          unit: prod?.price,
          checked: true,
          weight: prod?.weight,
          productCode: prod?.productCode,
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
          return { ...item, qty: normalizeQty(value) };
        }
        return {
          ...item,
          [field]: field === "unit" ? parseFloat(value) || 0 : value,
        };
      })
    );
  };

  const handleInvoiceFieldChange = (field, value) => {
    if (field === "emailInvoiceToCustomer" && value) {
      setInvoiceFields((prev) => ({
        ...prev,
        [field]: value,
        invoiceDate: prev.invoiceDate || getToday(), 
      }));
    } else {
      setInvoiceFields((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // Extra Charge Rows
  const [extraCharges, setExtraCharges] = useState([]);

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
          return { ...item, qty: normalizeQty(value) };
        }
        return {
          ...item,
          [field]: field === "unit" ? parseFloat(value) || 0 : value,
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

  //calculate total weight and shipping charges here
  const totalWeight =
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
      );

  // Find the shipping charge based on totalWeight
  const shippingChargeObj = shippingCharges?.data?.data?.find(
    (sc) => totalWeight >= sc.weightFrom && totalWeight <= sc.weightTo
  );
  let shippingCharge = shippingChargeObj
    ? Number(shippingChargeObj.charges)
    : 0;

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

  const handleCreateInvoice = async () => {
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
          //   id: item.id,
          orderId: item.orderId,
          productId: item.productId,
          product: item.product,
          productCode: item.productCode,
          qty: item.qty,
          price: item.price,
          discount: item.discount,
          wholesalePrice: item.wholesalePrice,
        })),
      ...extraRows
        .filter((item) => item.checked)
        .map((item) => ({
          //   id: item.id,
          orderId: item.orderId,
          productId: item.productId,
          product: item.product ?? item.productName ?? item.name,      
          productCode: item.productCode ?? item.code, 
          qty: item.qty,
          price: String(item.unit),
          discount: item.discount,
          wholesalePrice: item.wholesalePrice,
        })),
    ];
    const paymentCardId = invoiceFields.paymentOption ? selectedCardId : null;
    const norm = v => (v ?? "").toString().trim();
    const includeShipping = manual.show === false && norm(invoiceFields.shippingCharges) !== norm(initialShippingCharges);
    // Prepare order object
    const orderObj = {
      invoiceNumber: invoiceFields.invoiceNumber,
      poNumber: invoiceFields.poNumber,
      // invoiceDate: invoiceFields.invoiceDate,
      proforma: invoiceFields.proforma,
      termDays: invoiceFields.terms,
      dueDate: invoiceFields.dueDate,
      note: invoiceFields.note,
      otherPayment: invoiceFields.otherPayment,
      attemptImmediatePayment: invoiceFields.paymentOption,
      emailInvoiceToCustomer: invoiceFields.emailInvoiceToCustomer,
      invoiceDate: invoiceFields.emailInvoiceToCustomer ? invoiceFields.invoiceDate : null, 
      reminder: invoiceFields?.invoicePdf ? true : false,
      // invoiceDate: invoiceFields?.invoiceDate ? undefined : Date.now(),
      // invoiceReminder: invoiceFields?.invoiceDate ? Date.now() : undefined,
      discountPercentage: Number(invoiceFields.discountPercentage || 0),
      ...(includeShipping ? { shippingCharges: invoiceFields.shippingCharges } : {}),
      paymentCardId: paymentCardId,
    };
    if (data?.data?.order?.invoiceDate) {
      orderObj.invoiceReminder = Date.now();
    }
    // API call
    let res = await PatchAPI(
      `api/v1/admin/order-management/update-order/${orderID}`,
      {
        items: itemsForApi,
        order: orderObj,
        typeCharges: chargesForApi,
      }
    );

    if (res?.data?.status === "success") {
      setLoading(false);
      setExtraRows([]);
      success_toaster("success");
      reFetch();
      router.push(`/orders/detail/${orderID}`);
    } else {
      info_toaster("something went wrong");
      setLoading(false);
    }
  };
  const { toggle, setToggle } = useDataContext();

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div data-testid={ORDER_ADD_INVOICE.root}>
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed"
       data-testid={ORDER_ADD_INVOICE.headerBar}>
        <div className="text-xl font-inter font-semibold flex items-center gap-x-1">
          <p
            onClick={() => setToggle(!toggle)}
            className="cursor-pointer md:hidden"
          >
            <CiMenuBurger size={20} />
          </p>
          <p
            className="hover:text-blue-500 cursor-pointer"
            onClick={() => router.push("/orders")}
            data-testid={ORDER_ADD_INVOICE.breadcrumbOrdersLink}
          >
            Order
          </p>{" "}
          /{" "}
          <p
            className="hover:text-blue-500 cursor-pointer"
            onClick={() => window.history.back()}
            data-testid={ORDER_ADD_INVOICE.breadcrumbOrderIdLink(orderID)}
          >
            {orderID}
          </p>{" "}
          / {data?.data?.order?.invoiceDate ? "Update Invoice" : "New Invoice"}
        </div>
      </div>

      <div className="space-y-8 pb-6 pt-28 2xl:pt-32 px-6 2xl:px-12">
        <div>
          <p className="font-semibold">Invoice To</p>
          <p className="text-sm text-gray-500">
            {/* {data?.data?.order?.user?.billingAddresses?.[0]} */}

            {data?.data?.order?.user?.billingAddresses?.[0]?.companyaddress && (
              <>
                {data?.data?.order?.user?.billingAddresses?.[0]?.companyaddress}
                ,{" "}
              </>
            )}
            {data?.data?.order?.user?.billingAddresses?.[0]?.addressLineOne}
            {data?.data?.order?.user?.billingAddresses?.[0]?.addressLineTwo && (
              <>
                ,{" "}
                {data?.data?.order?.user?.billingAddresses?.[0]?.addressLineTwo}
              </>
            )}
            {data?.data?.order?.user?.billingAddresses?.[0]?.town && (
              <>, {data?.data?.order?.user?.billingAddresses?.[0]?.town}</>
            )}
            {data?.data?.order?.user?.billingAddresses?.[0]?.state && (
              <>, {data?.data?.order?.user?.billingAddresses?.[0]?.state}</>
            )}
            {data?.data?.order?.user?.billingAddresses?.[0]?.zipCode && (
              <>, {data?.data?.order?.user?.billingAddresses?.[0]?.zipCode}</>
            )}
            {data?.data?.order?.user?.billingAddresses?.[0]?.country && (
              <>, {data?.data?.order?.user?.billingAddresses?.[0]?.country}</>
            )}
          </p>
        </div>

        <div className="grid grid-cols-4 2xl:grid-cols-5 gap-5 2xl:gap-10">
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
              data-testid={ORDER_ADD_INVOICE.invoiceNumberInput}
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
              data-testid={ORDER_ADD_INVOICE.poNumberInput}
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
              data-testid={ORDER_ADD_INVOICE.invoiceDateInput}
            />
          </div>
          {/* <div className="flex flex-col gap-y-2 items-start 2xl:col-span-2">
            <label className="text-labelColor font-medium font-satoshi">
              Proforma
            </label>
            <input
              type="checkbox"
              name="Proforma"
              checked={invoiceFields.proforma}
              className="size-12"
              onChange={(e) =>
                handleInvoiceFieldChange("proforma", e.target.checked)
              }
            />
          </div> */}
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
              inputId={ORDER_ADD_INVOICE.termsSelect}
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
              data-testid={ORDER_ADD_INVOICE.dueDateInput}
            />
          </div>

            {/* <div className="flex flex-col gap-y-2">
              <label className="text-labelColor font-medium font-satoshi">Discount (%)</label>
              <input
                type="number"
                value={invoiceFields.discountPercentage}
                min={0}
                max={100}
                step={0.1}
                onChange={(e) => handleInvoiceFieldChange("discountPercentage", e.target.value)}
                placeholder="Enter discount"
                required
                onWheel={(e) => e.currentTarget.blur()}
                className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                data-testid={ORDER_ADD_INVOICE.discountPercentageInput ?? 0}
              />
            </div> */}

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
                    data-testid={ORDER_ADD_INVOICE.checkAllInput}
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
                <tr key={item.id} data-testid={ORDER_ADD_INVOICE.itemRow(item.id)}>
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
                      onWheel={(e) => e.currentTarget.blur()}
                      onChange={(e) =>
                        handleItemQtyChange(itemIdx, e.target.value)
                      }
                      data-testid={ORDER_ADD_INVOICE.itemQtyInput(item.id)}
                    />
                  </td>
                  {(userType === "admin" ||
                    userType === "salesRepresentative") && (
                    <td className="py-2 px-2 text-right border border-gray-200">
                      {/* $ */}
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
                <tr key={item.id} data-testid={ORDER_ADD_INVOICE.extraRow(item.id)}>
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
                      onChange={(e) =>
                        handleExtraInputChange(idx, "code", e.target.value)
                      }
                      placeholder="Code"
                    />
                  </td>
                  <td className="py-2 px-2 border border-gray-200">
                    <input
                      type="text"
                      className="w-full border border-gray-200 rounded px-1 py-1"
                      value={item.name ?? ""}
                      disabled
                      onChange={(e) =>
                        handleExtraInputChange(idx, "name", e.target.value)
                      }
                      placeholder="Name"
                    />
                  </td>
                  <td className="py-2 px-2 border border-gray-200 text-center">
                    <input
                      type="number"
                      min={1}
                      className="w-16 border border-gray-200 rounded px-1 py-1 text-center"
                      value={item.qty ?? 1}
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
                        onChange={(e) =>
                          handleExtraInputChange(idx, "unit", e.target.value)
                        }
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
                  <tr key={item.id} data-testid={ORDER_ADD_INVOICE.extraChargeRow(item.id)}>
                    <td className="py-2 px-2 border border-gray-200 text-center">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={(e) => handleChargeRowCheck(idx, e.target.checked)}
                      />
                    </td>
                    <td className="py-2 px-2 border border-gray-200">
                      <input
                        type="text"
                        className="w-full rounded px-1 py-1 border border-gray-200 bg-gray-50 cursor-default select-text focus:outline-none focus:ring-0 focus:border-gray-200"
                        value={item.code}
                        readOnly
                        onChange={(e) => handleChargeInputChange(idx, "code", e.target.value)}
                        placeholder="Code"
                      />
                    </td>
                    <td className="py-2 px-2 border border-gray-200">
                      <input
                        type="text"
                        className="w-full border rounded px-1 py-1"
                        value={item.name}
                        onChange={(e) => handleChargeInputChange(idx, "name", e.target.value)}
                        placeholder="Name"
                      />
                    </td>
                    <td className="py-2 px-2 text-center border border-gray-200">
                      <input
                        type="number"
                        min={1}
                        className="w-16 border rounded px-1 py-1 text-center"
                        value={item.qty}
                        onWheel={(e) => e.currentTarget.blur()}
                        onChange={(e) => handleChargeInputChange(idx, "qty", e.target.value)}
                      />
                    </td>
                    <td className="py-2 px-2 border border-gray-200 text-right">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        className="w-20 border rounded px-1 py-1 text-right"
                        value={item.unit}
                        onWheel={(e) => e.currentTarget.blur()}
                        onChange={(e) => handleChargeInputChange(idx, "unit", e.target.value)}
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
                    // onClick={handleAddExtra}
                    onClick={() => setModal(true)}
                    data-testid={ORDER_ADD_INVOICE.addItemBtn}
                  >
                    Add Item
                  </button>

                    <button
                      className="border px-2 py-2"
                      onClick={handleAddChargeRow}
                      data-testid={ORDER_ADD_INVOICE.addExtraChargesBtn}
                    >
                      Add Extra Charges
                    </button>
                  </div>
                </td>
              </tr>
              
              <tr data-testid={ORDER_ADD_INVOICE.totalWeightRow}>
                <td colSpan={4} className="border border-gray-200"></td>
                <td className="py-2 px-2 text-right font-bold border border-gray-200">
                  Total weight (lbs)
                </td>
                <td className="py-2 px-2 text-right font-bold border border-gray-200">
                  {parseFloat(totalWeight).toFixed(2)}
                </td>
              </tr>

              {(userType === "admin" || userType === "salesRepresentative") && (
                <tr>
                  <td
                    colSpan={4}
                    className="border border-gray-200 w-max py-2 px-2 "
                  >
                    {" "}
                    <button
                      className="border px-2 py-2"
                      // onClick={handleAddExtra}
                      onClick={() =>
                        setManual({ ...manual, show: !manual.show })
                      }
                    >
                      {manual.show ? "Manual Calculate" : "Auto Calculate"}
                    </button>
                  </td>
                  <td className="py-2 px-2 text-right font-bold border border-gray-200">
                    Shipping Charges
                  </td>
                  <td className="py-2 px-2 text-right font-bold border border-gray-200">
                    {!manual?.show ? (
                      <input
                        className="w-20 border border-gray-200 rounded px-1 py-1 text-right"
                        value={invoiceFields?.shippingCharges ?? ""}
                        type="text"
                          onChange={e =>
                            setInvoiceFields(prev => ({ ...prev, shippingCharges: e.target.value }))
                          }
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

        {/* <p className="text-sm text-gray-500">
          All uninvoiced items on the order are added to this invoice by
          default. To invoice part of the order uncheck items that are not
          required or edit the quantities to be invoiced.
        </p> */}

        <div className="w-full space-y-5">
          <div className="space-y-2">
            <p>Comments</p>
            <textarea
              className="w-full h-48 border resize-none border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
              value={invoiceFields.note ?? ""}
              onChange={(e) => handleInvoiceFieldChange("note", e.target.value)}
              data-testid={ORDER_ADD_INVOICE.commentsTextarea}
            ></textarea>
          </div>

          {/* <div className="space-y-2">
            <p>Payment Options</p>
            <div className="flex items-center gap-2">
              <IoCardSharp size={25} />
              <p>Credit/Debit Card with Stripe</p>
            </div>
            <div className="flex items-center gap-2 ml-5">
              <input
                type="checkbox"
                className="size-5"
                checked={invoiceFields.paymentOption}
                onChange={(e) =>
                  handleInvoiceFieldChange("paymentOption", e.target.checked)
                }
              />
              <p>Attempt immediate payment with Mastercard ****9119</p>
            </div>
          </div> */}

          <div className="space-y-2">
              <p>Payment Options</p>
              <div className="flex items-center gap-2">
                <IoCardSharp size={25} />
                <p>Credit/Debit Card with Stripe</p>
              </div>

              {userId && (
                <div className="ml-5 mt-2 space-y-2">
                  {cardsLoading && <p className="text-sm text-gray-500">Loading saved cards…</p>}

                  {!cardsLoading && savedCards.length > 0 && savedCards.map((c) => (
                    <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="saved-card"
                        className="size-4"
                        value={c.id}
                        checked={selectedCardId === c.id}
                        onChange={() => setSelectedCardId(c.id)}
                        data-testid={ORDER_ADD_INVOICE.savedCardRadio(c.id)}
                      />
                      <span className="text-sm">
                        {c.brand?.toUpperCase()} •••• {c.last4} (exp {String(c.expMonth).padStart(2, '0')}/{String(c.expYear).slice(-2)})
                        {c.name ? ` — ${c.name}` : ""}
                      </span>
                    </label>
                  ))}

                  {!cardsLoading && savedCards.length === 0 && (
                    <p className="text-sm text-gray-500">No saved cards for this customer.</p>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 ml-5 mt-2">
                <input
                  type="checkbox"
                  className="size-5"
                  disabled={!selectedCardId}
                  checked={invoiceFields.paymentOption}
                  onChange={(e) => handleInvoiceFieldChange("paymentOption", e.target.checked)}
                  title={!selectedCardId ? "Select a saved card first" : ""}
                  data-testid={ORDER_ADD_INVOICE.immediatePaymentCheckbox}
                />
                <p className="text-sm">
                  Attempt immediate payment
                  {selectedCardId && (
                    <>
                      {" "}with{" "}
                      <strong>
                        {savedCards.find((c) => c.id === selectedCardId)?.brand} •••• {savedCards.find((c) => c.id === selectedCardId)?.last4}
                      </strong>
                    </>
                  )}
                </p>
              </div>
            </div>
            

          <div className="space-y-2">
            <p>Other Payment Options</p>
            <textarea
              className="w-full h-48 border resize-none border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
              value={invoiceFields.otherPayment ?? ""}
              onChange={(e) =>
                handleInvoiceFieldChange("otherPayment", e.target.value)
              }
              data-testid={ORDER_ADD_INVOICE.otherPaymentTextarea}
            ></textarea>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="size-5"
              checked={invoiceFields.emailInvoiceToCustomer}
              onChange={(e) =>
                handleInvoiceFieldChange("emailInvoiceToCustomer", e.target.checked)
              }
              data-testid={ORDER_ADD_INVOICE.emailInvoiceCheckbox}
            />
            <p>Email the invoice to the customer?</p>
          </div>

          <div className="pt-10">
            <button
              disabled={loading}
              className="rounded-lg font-inter font-medium text-white px-2 sm:px-3 py-2.5 sm:py-4 bg-theme"
              onClick={handleCreateInvoice}
              data-testid={ORDER_ADD_INVOICE.submitBtn}
            >
              {data?.data?.order?.invoiceDate
                ? "Update Invoice"
                : "Create Invoice"}
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Dialog
        visible={modal}
        data-testid={ORDER_ADD_INVOICE.modal.root}
        style={{ width: "40vw" }}
        // breakpoints={{ "1496px": "40vw", "1024px": "70vw", "641px": "80vw" }}
        className="font-nunito"
        dismissableMask={true}
        onHide={() => setModal(false)}
        header={
          <div className="font-nunito font-bold text-2xl text-center">
            Add Items to Order
          </div>
        }
      >
        {ProductList?.length === 0 ? (
          <MiniLoader />
        ) : (
          <div
            // onSubmit={handleStock}
            className="flex flex-col"
          >
            <div className="sticky top-0 space-y-2 bg-white pb-2">
              <div className="w-full h-14 rounded-md border relative">
                <div className="absolute top-1/2 -translate-y-1/2 left-2">
                  <IoIosSearch size={25} color="gray" />
                </div>
                <input
                  className="w-full h-full outline-none bg-transparent pl-10 pr-4"
                  type="text"
                  name=""
                  id=""
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search Product..."
                  data-testid={ORDER_ADD_INVOICE.modal.searchInput}
                />
              </div>
              <div className="w-full">
                <Select
                  placeholder="Select Category"
                  options={categoryList}
                  className="w-full text-black"
                  styles={selectStyles2}
                  // value={ }
                  onChange={(e) => setFilterId(e?.value)}
                  inputId={ORDER_ADD_INVOICE.modal.categorySelect}
                />
              </div>
            </div>

            {handleFilter()?.map((item, idx) => {
              return (
                <div
                  key={item.id || idx}
                  onClick={() => handleAddExtra(item)}
                  className="text-sm text-start text-gray-500 cursor-pointer h-12 border-b flex items-center hover:bg-gray-100 px-2 hover:text-black hover:font-semibold"
                  data-testid={ORDER_ADD_INVOICE.modal.productRow(item.id)}
                >
                  <p>{item?.name}</p>
                </div>
              );
            })}
          </div>
        )}
      </Dialog>
    </div>
  );
}
