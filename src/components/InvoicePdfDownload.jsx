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

  const handleQtyChange = (index, value) => {
    const updated = [...data];
    updated[index] = { ...updated[index], qty: value };
    setData(updated);
  };

  const handleUpdate = async () => {
    const itemsForApi = data?.map((item) => ({
      id: item?.id,
      productId: item?.productId,
      qty: item?.qty,
    }));

    let res = await PatchAPI(
      `api/v1/admin/order-management/update-order/${invoiceData?.id}`,
      { items: itemsForApi }
    );
    console.log(res, "resresres");
    if (res?.status === "1") {
      success_toaster(res?.message);
      reFetch();
    } else {
      info_toaster(res?.message);
    }
  };

  useEffect(() => {
    setData(invoiceData?.items);
  }, [invoiceData]);

  return (
    <div className="w-full max-w-[800px] mx-auto">
      <div className="flex items-center gap-5">
        <button
          onClick={handleDownload}
          className="mb-4 px-4 py-2 bg-black text-white rounded"
        >
          Download Invoice
        </button>
        <button
          onClick={handleUpdate}
          className="mb-4 px-4 py-2 bg-themeLight text-white rounded"
        >
          Update Invoice
        </button>
      </div>

      <div ref={invoiceRef} className="w-full">
        <div className="w-full mx-auto bg-white border rounded-lg shadow-lg p-8 font-inter">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-6">
            <h1 className="text-3xl font-semibold">Invoice</h1>
            <img
              src="https://static.wixstatic.com/media/41bb17_6b71dd75eefb4e7cbc85b9b5115889d3~mv2.png/v1/fill/w_193,h_90,al_c,lg_1,q_85,enc_avif,quality_auto/41bb17_6b71dd75eefb4e7cbc85b9b5115889d3~mv2.png"
              alt="Busy Bean Coffee"
              crossOrigin="anonymous"
              className="h-16"
            />
          </div>

          {/* Invoice Info */}
          <div className="grid grid-cols-1 gap-8 mb-6">
            <div className="w-full [&>div>h6]:w-36 space-y-1">
              <div className="flex items-center text-sm font-semibold">
                <h6>Invoice number:</h6>
                <p>INV-00{invoiceData?.id}</p>
              </div>
              <div className="flex items-center text-sm font-semibold">
                <h6>Date of issue:</h6>
                <p>{dayjs(invoiceData?.on).format("DD/MM/YYYY")}</p>
              </div>
              {/* <div className="flex items-center text-sm font-semibold">
                <h6>Date due:</h6>
                <p>--</p>
              </div> */}
              <div className="flex items-center text-sm font-semibold">
                <h6>PO Number:</h6>
                <p>{invoiceData?.poNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 text-sm">
              <div>
                <div className="font-bold">{invoiceData?.salesRepName}</div>
                <div>{invoiceData?.address?.companyaddress}</div>

                <div>{invoiceData?.address?.addressLineOne}</div>
                <div>{invoiceData?.address?.addressLineTwo}</div>
                <div>
                  {invoiceData?.address?.town +
                    "," +
                    invoiceData?.address?.zipCode +
                    "," +
                    invoiceData?.address?.country}
                </div>
                <div>--</div>
              </div>
              <div>
                <div className="font-bold">Bill to</div>
                <div>{invoiceData?.user?.name}</div>
                <div>{invoiceData?.user?.companyName}</div>
                <div>{invoiceData?.user?.billingAddress}</div>
                <div>
                  {invoiceData?.user?.countryCode +
                    " " +
                    invoiceData?.user?.phoneNumber}
                </div>
                <div>{invoiceData?.user?.email}</div>
              </div>
            </div>
          </div>

          {/* Amount Due */}
          <div className="text-xl font-semibold">
            ${invoiceData?.totalBill} due amount
          </div>
          <a
            href="#"
            className="text-blue-600 underline mb-6 inline-block hover:text-blue-800"
          >
            Pay online
          </a>

          {/* Table */}
          <div className="mt-4">
            <div className="w-full text-sm">
              <div className="border-b-2 grid grid-cols-4">
                <p className="text-left py-2 px-2 font-semibold">Description</p>
                <p className="text-right py-2 px-2 font-semibold">Qty</p>
                <p className="text-right py-2 px-2 font-semibold">Unit price</p>
                <p className="text-right py-2 px-2 font-semibold">Amount</p>
              </div>

              <div>
                {data &&
                  data?.map((prod, index) => {
                    return (
                      <div className="border-b last:border-0 grid grid-cols-4">
                        <td className="py-2 px-2">{prod?.product}</td>
                        <td className="py-2 px-2 text-right">
                          {" "}
                          {isPrint ? (
                            <div className="text-right">{prod?.qty}</div>
                          ) : (
                            <input
                              className="w-12 text-right border-none outline-none bg-transparent"
                              type="text"
                              value={prod?.qty}
                              onChange={(e) =>
                                handleQtyChange(index, e.target.value)
                              }
                            />
                          )}
                        </td>
                        <td className="py-2 px-2 text-right">${prod?.price}</td>
                        <td className="py-2 px-2 text-right">${prod?.price}</td>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Totals */}
          <div className="flex flex-col items-end mt-4">
            <div className="w-full max-w-xs">
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-700">VAT</span>
                <span>${parseFloat(invoiceData?.vat)?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-700">Subtotal</span>
                <span>${parseFloat(invoiceData?.subTotal)?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-700 capitalize">
                  shipping Charges
                </span>
                <span>
                  ${parseFloat(invoiceData?.shippingCharges)?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-700">Total</span>
                <span>${parseFloat(invoiceData?.totalBill)?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 font-bold text-lg">
                <span>Amount due</span>
                <span>${parseFloat(invoiceData?.totalBill)?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
