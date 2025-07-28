"use client";
import BackButton from "@/components/ui/BackButton";
import Loader from "@/components/ui/Loader";
import MiniLoader from "@/components/ui/MiniLoader";
import GetAPI from "@/utilities/GetAPI";
import { PatchAPI } from "@/utilities/PatchAPI";
import { selectStyles2 } from "@/utilities/SelectStyle";
import { success_toaster } from "@/utilities/Toaster";
import { useParams, useRouter } from "next/navigation";
import { stringify } from "postcss";
import { Dialog } from "primereact/dialog";
import React, { useEffect, useState } from "react";
import { IoIosSearch } from "react-icons/io";
import { IoCardSharp, IoSearch } from "react-icons/io5";
import Select from "react-select";

export default function AddInvoice() {
  const router = useRouter();
  const [filterId, setFilterId] = useState("");
  const [loading, setLoading] = useState(false);
  const [manual, setManual] = useState({
    shippingCharge: "",
    show: false,
  });
  const { orderID } = useParams();
  const { data, reFetch } = GetAPI(`api/v1/admin/order-details/${orderID}`);
  const { data: shippingCharges } = GetAPI(
    "api/v1/admin/shipping-charges-list"
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

  let userType = "admin";

  // States for invoice fields
  const [invoiceFields, setInvoiceFields] = useState({
    invoiceNumber: "",
    poNumber: "",
    invoiceDate: "",
    proforma: false,
    terms: "30",
    dueDate: "",
    note: "",
    otherPayment: "",
    paymentOption: false,
    paymentOption2: false,
  });

  // Items state (for main items)
  const [items, setItems] = useState([]);

  // Extra rows state (for added delivery/extra charges)
  const [extraRows, setExtraRows] = useState([]);

  const getToday = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

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
      setInvoiceFields((prev) => ({
        ...prev,
        invoiceNumber: data?.data?.order?.id || "",
        poNumber: data?.data?.order?.poNumber || "",
        invoiceDate: prev?.invoiceDate || getToday(),
        dueDate: prev?.dueDate || getDueDate(),
        note: data?.data?.order?.note,
        shippingCharges: data?.data?.order?.shippingCharges,
        // You can set invoiceDate, dueDate, terms, etc. from API if available
      }));
      setItems(
        (data?.data?.order?.items || []).map((item) => ({
          ...item,
          checked: true,
          qty: item.qty || 1,
          weight: item?.singleUnitWeight,
          unit: item?.price / item?.qty,
        }))
      );
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

  // Item qty handler
  const handleItemQtyChange = (itemIdx, value) => {
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === itemIdx ? { ...item, qty: Number(value) } : item
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
      prev.map((item, idx) =>
        idx === rowIdx
          ? {
              ...item,
              [field]:
                field === "qty" || field === "unit" ? Number(value) : value,
            }
          : item
      )
    );
  };

  // Invoice fields change handler
  const handleInvoiceFieldChange = (field, value) => {
    setInvoiceFields((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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
    (manual.show
      ? parseFloat(shippingCharge)
      : parseFloat(invoiceFields?.shippingCharges) || 0);

  // Count checked items
  const checkedCount =
    items.filter((item) => item.checked).length +
    extraRows.filter((item) => item.checked).length;

  const handleCreateInvoice = async () => {
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
          product: item.name,
          productCode: item.code,
          qty: item.qty,
          price: String(item.unit),
          discount: item.discount,
          wholesalePrice: item.wholesalePrice,
        })),
    ];

    // Prepare order object
    const orderObj = {
      invoiceNumber: invoiceFields.invoiceNumber,
      poNumber: invoiceFields.poNumber,
      invoiceDate: invoiceFields.invoiceDate,
      proforma: invoiceFields.proforma,
      terms: invoiceFields.terms,
      dueDate: invoiceFields.dueDate,
      note: invoiceFields.note,
      otherPayment: invoiceFields.otherPayment,
      attemptImmediatePayment: invoiceFields.paymentOption,
      emailInvoiceToCustomer: invoiceFields.paymentOption2,
      // shippingCharges: manual?.shippingCharge,
      ...(manual?.show === false && {
        shippingCharges: invoiceFields.shippingCharges,
      }),
    };

    // API call
    let res = await PatchAPI(
      `api/v1/admin/order-management/update-order/${orderID}`,
      {
        items: itemsForApi,
        order: orderObj,
      }
    );

    if (res?.data?.status === "success") {
      setLoading(false);
      setExtraRows([]);
      success_toaster("success");
      reFetch();
    } else {
      info_toaster("something went wrong");
      setLoading(false);
    }
  };

  return data?.length === 0 ? (
    <Loader />
  ) : (
    <div>
      <div className="w-full sm:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[94px] border-b px-6 2xl:px-12 fixed">
        <h2 className="text-xl lg:text-2xl font-inter font-semibold flex items-center gap-x-1">
          <div className="text-base">
            <BackButton />
          </div>
          <span
            className="hover:text-blue-500 cursor-pointer"
            onClick={() => router.push("/orders")}
          >
            Order
          </span>{" "}
          / {orderID} / New Invoice
        </h2>
      </div>

      <div className="space-y-8 pb-6 pt-32 px-6 2xl:px-12">
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
              value={invoiceFields.invoiceNumber}
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
              value={invoiceFields.poNumber}
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
              value={invoiceFields.invoiceDate}
              placeholder=""
              className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
              onChange={(e) =>
                handleInvoiceFieldChange("invoiceDate", e.target.value)
              }
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
                { label: "immediate", value: "immediate payment" },
                { label: "15", value: "15" },
                { label: "21", value: "21" },
                { label: "30", value: "30" },
              ]}
              className="w-full text-black"
              styles={selectStyles2}
              value={
                invoiceFields.terms
                  ? [
                      { label: "immediate", value: "immediate payment" },
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
              value={invoiceFields.dueDate}
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
                <tr key={item.id}>
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
                    {item.product || item.name}
                  </td>
                  <td className="py-2 px-2 text-center border border-gray-200">
                    <input
                      type="number"
                      min={1}
                      className="w-16 border border-gray-200 rounded px-1 py-1 text-center"
                      value={item.qty}
                      onChange={(e) =>
                        handleItemQtyChange(itemIdx, e.target.value)
                      }
                    />
                  </td>
                  {(userType === "admin" ||
                    userType === "salesRepresentative") && (
                    <td className="py-2 px-2 text-right border border-gray-200">
                      $
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
                <tr key={item.id}>
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
                      value={item.productCode}
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
                      value={item.name}
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
                      value={item.qty}
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
                        step="0.01"
                        className="w-20 border border-gray-200 rounded px-1 py-1 text-right"
                        value={item.unit}
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
              <tr>
                <td colSpan={6} className="py-2 px-2 border border-gray-200">
                  <button
                    className="border px-2 py-2"
                    // onClick={handleAddExtra}
                    onClick={() => setModal(true)}
                  >
                    Add Item
                  </button>
                </td>
              </tr>

              <tr>
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
                        value={invoiceFields?.shippingCharges}
                        type="text"
                        onChange={(e) =>
                          setInvoiceFields({
                            ...invoiceFields,
                            shippingCharges: e.target.value,
                          })
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
              value={invoiceFields.note}
              onChange={(e) => handleInvoiceFieldChange("note", e.target.value)}
            ></textarea>
          </div>

          <div className="space-y-2">
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
          </div>

          <div className="space-y-2">
            <p>Other Payment Options</p>
            <textarea
              className="w-full h-48 border resize-none border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
              value={invoiceFields.otherPayment}
              onChange={(e) =>
                handleInvoiceFieldChange("otherPayment", e.target.value)
              }
            ></textarea>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="size-5"
              checked={invoiceFields.paymentOption2}
              onChange={(e) =>
                handleInvoiceFieldChange("paymentOption2", e.target.checked)
              }
            />
            <p>Email the invoice to the customer?</p>
          </div>

          <div className="pt-10">
            <button
              disabled={loading}
              className="rounded-lg font-inter font-medium text-white px-2 sm:px-3 py-2.5 sm:py-4 bg-theme"
              onClick={handleCreateInvoice}
            >
              Create Invoice
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Dialog
        visible={modal}
        style={{ width: "40vw" }}
        // breakpoints={{ "1496px": "40vw", "1024px": "70vw", "641px": "80vw" }}
        className="font-nunito"
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
