"use client";

import BackButton from "@/components/ui/BackButton";
import Loader from "@/components/ui/Loader";
import MiniLoader from "@/components/ui/MiniLoader";
import { useDataContext } from "@/utilities/DataContext";
import GetAPI from "@/utilities/GetAPI";
import { PostAPI } from "@/utilities/PostAPI";
import { selectStyles2 } from "@/utilities/SelectStyle";
import { success_toaster, info_toaster } from "@/utilities/Toaster";
import { useRouter } from "next/navigation";
import { Dialog } from "primereact/dialog";
import React, { useEffect, useState, useMemo } from "react";
import { CiMenuBurger } from "react-icons/ci";
import { IoIosSearch } from "react-icons/io";
import Select from "react-select";
import { QuickbooksPingCheck } from "@/utilities/constants";

export default function AddItems() {
  const router = useRouter();
  const [filterId, setFilterId] = useState("");
  const [loading, setLoading] = useState(false);
  const [manual, setManual] = useState({
    shippingCharge: "",
    show: false,
  });
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState("");

  // Get form data from localStorage
  const [formData, setFormData] = useState(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("invoiceFormData");
      if (stored) {
        const parsed = JSON.parse(stored);
        setFormData(parsed);
      } else {
        // If no form data, redirect back
        router.push("/create-invoice");
      }
    }
  }, [router]);

  const userID = formData?.userID;
  const userType = formData?.userType;
  const email = formData?.email;
  const order = formData?.order || {};
  const partnersOrder = formData?.partnersOrder || false;
  const isSelfOrder = formData?.isSelfOrder || false;
  const cartItems = formData?.cartItems || [];
  const totalPrice = formData?.totalPrice || 0;
  const totalWeight = formData?.totalWeight || 0;
  const shippingCharges = formData?.shippingCharges || "";

  const { data: shippingChargesData } = GetAPI(
    "api/v1/admin/shipping-charges-list",
    "charges"
  );
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
  const { data: ProductList, reFetch: ProductRefetch } = GetAPI(url);

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
    emailInvoiceToCustomer: false,
    invoicePdf: "",
    shippingCharges: shippingCharges || "",
  });
  const [initialShippingCharges, setInitialShippingCharges] = useState(shippingCharges || "");

  // Items state - initialize from cartItems
  const [items, setItems] = useState([]);
  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      setItems(
        cartItems.map((item) => ({
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
  }, [cartItems]);

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

  // Add delivery/extra charges row
  const handleAddExtra = (prod) => {
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
      const existingIdx = prev.findIndex((item) => item.productId == prod?.id);
      if (existingIdx !== -1) {
        return prev.map((item, idx) =>
          idx === existingIdx ? { ...item, qty: +item.qty + 1 } : item
        );
      }
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

  // Update shipping charges when total weight changes (auto calculate mode)
  useEffect(() => {
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
        // If no matching charge found, clear it
        setInvoiceFields((prev) => ({
          ...prev,
          shippingCharges: "",
        }));
      }
    }
  }, [calculatedTotalWeight, manual.show, shippingChargesData]);

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
    const shipping = Number(invoiceFields?.shippingCharges || shippingCharges || 0);
    const totalBill = itemsPrice + shipping;

    const payload = {
      email: [email],
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
        ...(partnersOrder || isSelfOrder
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
      // Determine endpoint based on user type and order type
      let endpoint;
      if (userType === "admin") {
        endpoint = partnersOrder 
          ? `api/v1/admin/partner-order/book-new-order` 
          : `api/v1/admin/book-new-order`;
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
            partnersOrder || isSelfOrder
              ? `/direct-invoices/partner/${orderId}/add-invoice`
              : `/direct-invoices/${orderId}/add-invoice`
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

  const handleFilter = () => {
    const filteredData = ProductList?.data?.data?.filter((item) =>
      item?.name?.toLowerCase().includes(search.toLowerCase() || "")
    );
    return filteredData;
  };

  const { toggle, setToggle } = useDataContext();

  useEffect(() => {
    QuickbooksPingCheck();
  }, []);




  return !formData ? <Loader />: (
    <div>
      <div
        className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed"
      >
        <div className="text-xl font-inter font-semibold flex items-center gap-x-1">
          <p
            onClick={() => setToggle(!toggle)}
            className="cursor-pointer md:hidden"
          >
            <CiMenuBurger size={20} />
          </p>
          <p
            className="hover:text-blue-500 cursor-pointer"
            onClick={() => router.push("/create-invoice")}
          >
            Create Invoice
          </p>{" "}
          / Add Items
        </div>
      </div>

      <div className="space-y-8 pb-6 pt-28 2xl:pt-32 px-6 2xl:px-12">
        <div>
          <p className="font-semibold">Invoice To</p>
          <p className="text-sm text-gray-500">{email}</p>
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
                      onWheel={(e) => e.currentTarget.blur()}
                      onChange={(e) =>
                        handleChargeInputChange(idx, "unit", e.target.value)
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
                    <button
                      className="border px-2 py-2"
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
                        value={invoiceFields?.shippingCharges ? parseFloat(invoiceFields.shippingCharges).toFixed(2) : ""}
                        type="text"
                        onChange={(e) => {
                          const value = e.target.value;
                          // Allow empty, numbers, and one decimal point
                          if (value === "" || /^\d*\.?\d*$/.test(value)) {
                            setInvoiceFields((prev) => ({
                              ...prev,
                              shippingCharges: value,
                            }));
                          }
                        }}
                        onBlur={(e) => {
                          // Format to 2 decimal places on blur
                          const value = e.target.value;
                          if (value && !isNaN(value)) {
                            setInvoiceFields((prev) => ({
                              ...prev,
                              shippingCharges: parseFloat(value).toFixed(2),
                            }));
                          }
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

          <div className="pt-10">
            <button
              disabled={loading}
              className="rounded-lg font-inter font-medium text-white px-2 sm:px-3 py-2.5 sm:py-4 bg-theme"
              onClick={handleGenerateInvoice}
            >
              {loading ? "Generating..." : "Generate Invoice"}
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Dialog
        visible={modal}
        style={{ width: "40vw" }}
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
          <div className="flex flex-col">
            <div className="sticky top-0 space-y-2 bg-white pb-2">
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

            {handleFilter()?.map((item, idx) => {
              return (
                <div
                  key={item.id || idx}
                  onClick={() => handleAddExtra(item)}
                  className="text-sm text-start text-gray-500 cursor-pointer h-12 border-b flex items-center hover:bg-gray-100 px-2 hover:text-black hover:font-semibold"
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

