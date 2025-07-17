"use client";

import { useEffect, useRef, useState } from "react";
import html2pdf from "html2pdf.js";
import dayjs from "dayjs";
import { PostAPI } from "@/utilities/PostAPI";
import { info_toaster, success_toaster } from "@/utilities/Toaster";
import { PatchAPI } from "@/utilities/PatchAPI";

export default function InvoicePDFDownload({ invoiceData, reFetch }) {
  const invoiceRef = useRef(null);

  const [data, setData] = useState("");
  const [pdfData, setPdfData] = useState({
    invNumber: "",
    poNumber: "",
  });
  const [isPrint, setIsPrint] = useState(false);

  const handleDownload = () => {
    setIsPrint(true);
    const element = invoiceRef.current;
    if (!element) return;

    html2pdf()
      .set({
        margin: 0.5,
        filename: "invoice.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      })
      .from(element)
      .save();
    setTimeout(() => {
      setIsPrint(false);
    }, 3000);
  };

  const handleChange = (index, value, type) => {
    switch (type) {
      case "invNumber":
        setPdfData({ ...pdfData, invNumber: value });
        break;
      case "poNumber":
        setPdfData({ ...pdfData, poNumber: value });
        break;
      default:
        const updated = [...data];
        updated[index] = { ...updated[index], qty: value };
        setData(updated);
    }
  };

  const handleUpdate = async () => {
    const itemsForApi = data?.map((item) => ({
      id: item?.id,
      productId: item?.productId,
      qty: item?.qty,
    }));

    let res = await PatchAPI(
      `api/v1/admin/order-management/update-order/${invoiceData?.id}`,
      {
        items: itemsForApi,
        order: {
          id: pdfData?.invNumber,
          poNumber: pdfData?.poNumber,
        },
      }
    );

    if (res?.data?.status === "success") {
      success_toaster("success");
      reFetch();
    } else {
      info_toaster("something went wrong");
    }
  };

  useEffect(() => {
    if (invoiceData?.items) {
      const enrichedItems = invoiceData.items.map((item) => ({
        ...item,
        unitPrice: item.qty ? item.price / item.qty : 0, // avoid NaN
      }));
      setData(enrichedItems);
    }
    setPdfData({
      invNumber: invoiceData?.id,
      poNumber: invoiceData?.poNumber,
    });
  }, [invoiceData]);

  return (
    <div className="w-full max-w-[800px] mx-auto pt-32">
      <div ref={invoiceRef} className="w-full">
        <div className="w-full mx-auto bg-white pt-8 pb-14 font-satoshi">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-6">
            <h1 className="text-3xl font-semibold uppercase">Invoice</h1>
            <img
              src="/images/logocoffee.png"
              alt="Busy Bean Coffee"
              crossOrigin="anonymous"
              className="h-16"
            />
          </div>

          {/* Invoice Info */}
          <div className="grid grid-cols-1 gap-8 mb-6">
            <div className="">
              <div className="flex items-center text-sm font-semibold">
                <div className="w-36">Invoice number:</div>

                {isPrint ? (
                  <div>INV-00{pdfData?.invNumber}</div>
                ) : (
                  <div className="flex items-center">
                    INV-00
                    <input
                      className="text-start outline-none bg-transparent rounded  font-semibold"
                      type="text"
                      value={pdfData?.invNumber}
                      onChange={(e) =>
                        handleChange(0, e.target.value, "invNumber")
                      }
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center text-sm font-semibold">
                <div className="w-36">Date of issue:</div>
                <div>{dayjs(invoiceData?.on).format("DD/MM/YYYY")}</div>
              </div>
              <div className="flex items-center text-sm font-semibold">
                <div className="w-36">PO Number:</div>
                {isPrint ? (
                  <div>{pdfData?.poNumber}</div>
                ) : (
                  <input
                    className="text-start outline-none bg-transparent rounded  font-semibold"
                    type="text"
                    value={pdfData?.poNumber}
                    onChange={(e) =>
                      handleChange(0, e.target.value, "poNumber")
                    }
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 text-sm gap-4">
              {/* Sales Rep Section */}
              {invoiceData?.salesRep ? (
                <div>
                  <div className="font-bold">From</div>
                  {/* <div>{invoiceData?.salesRepName}</div> */}
                  <div>{invoiceData?.salesRep?.territoryName}</div>
                  <div>{invoiceData?.salesRep?.address}</div>
                  <div>
                    {invoiceData?.salesRep?.city},{" "}
                    {invoiceData?.salesRep?.state}{" "}
                    {invoiceData?.salesRep?.zipCode}
                  </div>
                  <div>{invoiceData?.salesRep?.country}</div>
                  <div>
                    {invoiceData?.salesRep?.countryCode}{" "}
                    {invoiceData?.salesRep?.phoneNumber}
                  </div>
                  <div>{invoiceData?.salesRep?.email}</div>
                </div>
              ) : (
                <div>
                  <div className="font-bold">From</div>
                  <div className="uppercase">Busy Bean Coffee Inc.</div>
                  <div className="uppercase">1141 CAINHOY RD 350</div>
                  <div className="uppercase">WAREHOUSE 1</div>
                  <div className="uppercase">CHARLESTON SC 29492, USA</div>
                  <div className="uppercase">+1 833-843-2326</div>
                  <div>info@busybeancoffee.com</div>
                </div>
              )}

              {/* Bill To Section */}
              <div className="uppercase">
                <div className="font-bold capitalize">Bill to</div>

                {/* Company address or name */}
                {invoiceData?.user?.billingAddresses?.[0]?.companyaddress && (
                  <div>
                    {invoiceData.user.billingAddresses[0].companyaddress}
                  </div>
                )}

                {/* Company name if available */}
                {invoiceData?.user?.companyName && (
                  <div>{invoiceData.user.companyName}</div>
                )}

                {/* Address lines */}
                {invoiceData?.user?.billingAddresses?.[0]?.addressLineOne && (
                  <div>
                    {invoiceData.user.billingAddresses[0].addressLineOne +
                      ", " +
                      invoiceData?.user?.billingAddresses?.[0]?.addressLineTwo}
                  </div>
                )}
                {/* {invoiceData?.user?.billingAddresses?.[0]?.addressLineTwo && (
                  <div>
                    {invoiceData.user.billingAddresses[0].addressLineTwo}
                  </div>
                )} */}

                {/* Town, State, Zip */}
                {(invoiceData?.user?.billingAddresses?.[0]?.town ||
                  invoiceData?.user?.billingAddresses?.[0]?.state ||
                  invoiceData?.user?.billingAddresses?.[0]?.zipCode) && (
                  <div>
                    {[
                      invoiceData.user.billingAddresses[0].town,
                      invoiceData.user.billingAddresses[0].state,
                      invoiceData.user.billingAddresses[0].zipCode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </div>
                )}

                {/* Country */}
                {invoiceData?.user?.billingAddresses?.[0]?.country && (
                  <div>{invoiceData.user.billingAddresses[0].country}</div>
                )}

                {/* Phone */}
                {(invoiceData?.user?.countryCode ||
                  invoiceData?.user?.phoneNumber) && (
                  <div>
                    {[
                      invoiceData.user.countryCode,
                      invoiceData.user.phoneNumber,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  </div>
                )}

                {/* Email */}
                {invoiceData?.user?.email && (
                  <div className="lowercase">{invoiceData.user.email}</div>
                )}
              </div>
            </div>
          </div>

          {/* Amount Due */}
          <div className="text-xl font-semibold mt-10">
            ${invoiceData?.totalBill} due amount
          </div>
          <a
            href="#"
            className="text-blue-600 font-semibold underline mb-10 inline-block hover:text-blue-800"
          >
            Pay online
          </a>

          {/* Table */}
          <div className="mt-4">
            <div className="w-full text-sm">
              <div className="border-b-2 grid grid-cols-6">
                <p className=" py-2 px-2 font-semibold">Code</p>
                <p className="text-left py-2 px-2 font-semibold col-span-2">
                  Item
                </p>
                <p className="text-right py-2 px-2 font-semibold">Quantity</p>
                <p className="text-right py-2 px-2 font-semibold">Unit price</p>
                <p className="text-right py-2 px-2 font-semibold">Amount</p>
              </div>

              <div>
                {data &&
                  data?.map((prod, index) => {
                    return (
                      <div className="border-b last:border-0 grid grid-cols-6 h-8 items-center">
                        <div className="px-2 text-left">
                          {prod?.productCode}
                        </div>
                        <div className=" px-2 font-semibold col-span-2">
                          {prod?.product}
                        </div>
                        <div className=" px-2 text-right">
                          {" "}
                          {isPrint ? (
                            <div className="text-center font-semibold">
                              {prod?.qty}
                            </div>
                          ) : (
                            <input
                              className="w-12 text-center outline-none bg-transparent border rounded  font-semibold"
                              type="text"
                              value={prod?.qty}
                              onChange={(e) =>
                                handleChange(index, e.target.value)
                              }
                            />
                          )}
                        </div>
                        <div className=" px-2 text-right">
                          ${prod?.unitPrice}
                        </div>
                        <div className=" px-2 text-right">${prod?.price}</div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Totals */}

          <div className="w-full max-w-xs ml-auto mt-5 text-sm">
            {/* <div className="flex justify-between items-center py-1">
              <span className="text-gray-700">VAT</span>
              <span>${parseFloat(invoiceData?.vat)?.toFixed(2)}</span>
            </div> */}

            <div className="flex justify-between items-center py-1">
              <span className="text-gray-700">Subtotal</span>
              <span>${parseFloat(invoiceData?.subTotal)?.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-gray-700 capitalize">shipping Charges</span>
              <span>
                ${parseFloat(invoiceData?.shippingCharges)?.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-gray-700">Total</span>
              <span>${parseFloat(invoiceData?.totalBill)?.toFixed(2)}</span>
            </div>

            {/* <div className="flex justify-between py-1 font-bold text-lg">
              <span>Amount due</span>
              <span>${parseFloat(invoiceData?.totalBill)?.toFixed(2)}</span>
            </div> */}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end mt-8 gap-5">
        <button
          onClick={handleDownload}
          className="mb-4 px-4 py-2 bg-black text-white rounded"
        >
          Download Invoice
        </button>
        <button
          onClick={handleUpdate}
          className="mb-4 px-4 py-2 bg-theme text-white rounded"
        >
          Update Invoice
        </button>
      </div>
    </div>
  );
}
