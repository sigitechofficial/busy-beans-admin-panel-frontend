"use client";
import MiniLoader from "@/components/ui/MiniLoader";
import GetAPI from "@/utilities/GetAPI";
import { PatchAPI } from "@/utilities/PatchAPI";
import { selectStyles2 } from "@/utilities/SelectStyle";
import { success_toaster } from "@/utilities/Toaster";
import { useParams } from "next/navigation";
import { Dialog } from "primereact/dialog";
import React, { useEffect, useState } from "react";
import { IoIosSearch } from "react-icons/io";
import { IoCardSharp, IoSearch } from "react-icons/io5";
import Select from "react-select";

export default function AddInvoice() {
  const [filterId, setFilterId] = useState("");
  const { orderID } = useParams();
  const { data, reFetch } = GetAPI(`api/v1/admin/order-details/${orderID}`);
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
    comments: "",
    otherPayment: "",
    paymentOption: false,
    paymentOption2: false,
  });

  // Items state (for main items)
  const [items, setItems] = useState([]);

  // Extra rows state (for added delivery/extra charges)
  const [extraRows, setExtraRows] = useState([]);
  console.log("🚀 ~ AddInvoice ~ extraRows:", extraRows);
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
        // You can set invoiceDate, dueDate, terms, etc. from API if available
      }));
      setItems(
        (data?.data?.order?.items || []).map((item) => ({
          ...item,
          checked: true,
          qty: item.qty || 1,
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
    console.log("🚀 ~ handleAddExtra ~ prod:", prod);
    setExtraRows((prev) => [
      ...prev,
      {
        id: `extra-${Date.now()}`,
        // orderId:produ
        productId: prod?.id,
        code: "",
        name: prod?.name,
        qty: prod?.qty || 1,
        unit: prod?.price,
        checked: true,
      },
    ]);

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
      .reduce((sum, item) => sum + item.qty * item.unit, 0);

  // Count checked items
  const checkedCount =
    items.filter((item) => item.checked).length +
    extraRows.filter((item) => item.checked).length;

  // Handle Create Invoice button
  //   const handleCreateInvoice = async () => {
  //     // Compose payload
  //     const payload = {
  //       invoiceNumber: invoiceFields.invoiceNumber,
  //       poNumber: invoiceFields.poNumber,
  //       invoiceDate: invoiceFields.invoiceDate,
  //       proforma: invoiceFields.proforma,
  //       terms: invoiceFields.terms,
  //       dueDate: invoiceFields.dueDate,
  //       comments: invoiceFields.comments,
  //       otherPayment: invoiceFields.otherPayment,
  //       paymentOption: invoiceFields.paymentOption,
  //       paymentOption2: invoiceFields.paymentOption2,
  //       items: [
  //         ...items
  //           .filter((item) => item.checked)
  //           .map((item) => ({
  //             id: item.id,
  //             code: item.productCode || item.code,
  //             name: item.product || item.name,
  //             qty: item.qty,
  //             unit: item.unit !== undefined ? item.unit : item.price,
  //           })),
  //         ...extraRows
  //           .filter((item) => item.checked)
  //           .map((item) => ({
  //             id: item.id,
  //             code: item.code,
  //             name: item.name,
  //             qty: item.qty,
  //             unit: item.unit,
  //           })),
  //       ],
  //     };

  //     // TODO: Replace with your API call
  //     // await YourAPI(payload);
  //     console.log("Invoice Payload:", payload);
  //     // Optionally, call reFetch() or show a success message
  //   };

  const handleCreateInvoice = async () => {
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
      note: invoiceFields.comments,
      otherPayment: invoiceFields.otherPayment,
      attemptImmediatePayment: invoiceFields.paymentOption,
      emailInvoiceToCustomer: invoiceFields.paymentOption2,
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
      success_toaster("success");
      reFetch();
    } else {
      info_toaster("something went wrong");
    }
  };

  return (
    <div>
      <div className="w-full sm:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[94px] border-b px-6 2xl:px-12 fixed">
        <h2 className="text-xl lg:text-2xl font-inter font-semibold">
          Order / {orderID} / New Invoice
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
          <div className="flex flex-col gap-y-2 items-start 2xl:col-span-2">
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
          </div>
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
                      {(item.qty || 1) *
                        (item.unit !== undefined
                          ? item.unit
                          : item.price !== undefined
                          ? item.price
                          : 0)}
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
                      type="text"
                      className="w-full border border-gray-200 rounded px-1 py-1"
                      value={item.code}
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
                      ${item.qty * item.unit}
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
              {(userType === "admin" || userType === "salesRepresentative") && (
                <tr>
                  <td colSpan={4} className="border border-gray-200"></td>
                  <td className="py-2 px-2 text-right font-bold border border-gray-200">
                    Total USD ({checkedCount} items)
                  </td>
                  <td className="py-2 px-2 text-right font-bold border border-gray-200">
                    ${total}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="text-sm text-gray-500">
          All uninvoiced items on the order are added to this invoice by
          default. To invoice part of the order uncheck items that are not
          required or edit the quantities to be invoiced.
        </p>

        <div className="w-full space-y-5">
          <div className="space-y-2">
            <p>Comments</p>
            <textarea
              className="w-full h-48 border resize-none border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
              value={invoiceFields.comments}
              onChange={(e) =>
                handleInvoiceFieldChange("comments", e.target.value)
              }
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
} // <-- This closing brace was missing
