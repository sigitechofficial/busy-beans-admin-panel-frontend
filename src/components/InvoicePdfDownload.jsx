"use client";

import { useRef, useState } from "react";
import html2pdf from "html2pdf.js";

export default function InvoicePDFDownload({ invoiceData }) {
  const invoiceRef = useRef(null);

  const [data, setData] = useState("");
  const handleDownload = () => {
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
  };

  return (
    <div className="w-full max-w-[800px] mx-auto">
      <div className="flex items-center gap-5">
        <button
          onClick={handleDownload}
          className="mb-4 px-4 py-2 bg-black text-white rounded"
        >
          Download Invoice
        </button>
        <button className="mb-4 px-4 py-2 bg-themeLight text-white rounded">
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
                <p>VSQDHYUL-0001</p>
              </div>
              <div className="flex items-center text-sm font-semibold">
                <h6>Date of issue:</h6>
                <p>July 7, 2025</p>
              </div>
              <div className="flex items-center text-sm font-semibold">
                <h6>Date due:</h6>
                <p>September 5, 2025</p>
              </div>
              <div className="flex items-center text-sm font-semibold">
                <h6>PO Number:</h6>
                <p>yess to chai</p>
              </div>
            </div>

            <div className="flex gap-20 text-sm">
              <div>
                <div className="font-bold">
                  {invoiceData?.address?.companyaddress}
                </div>

                <div>{invoiceData?.address?.addressLineOne}</div>
                <div>{invoiceData?.address?.addressLineTwo}</div>
                <div>
                  {invoiceData?.address?.town +
                    "," +
                    invoiceData?.address?.zipCode +
                    "," +
                    invoiceData?.address?.country}
                </div>
                <div>+1 833-843-2326</div>
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
            $69.04 USD due September 5, 2025
          </div>
          <a
            href="#"
            className="text-blue-600 underline mb-6 inline-block hover:text-blue-800"
          >
            Pay online
          </a>

          {/* Table */}
          <div className="mt-4">
            <table className="w-full border-t border-b border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left py-2 px-2 font-semibold">
                    Description
                  </th>
                  <th className="text-right py-2 px-2 font-semibold">Qty</th>
                  <th className="text-right py-2 px-2 font-semibold">
                    Unit price
                  </th>
                  <th className="text-right py-2 px-2 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData?.items?.map((prod) => {
                  return (
                    <tr className="border-t">
                      <td className="py-2 px-2">{prod?.product}</td>
                      <td className="py-2 px-2 text-right">
                        {" "}
                        <input
                          className="border-none outline-none w-6"
                          type="text"
                          value={data ? data : prod?.qty}
                          onChange={(e) => setData(e.target.value)}
                        />
                      </td>
                      <td className="py-2 px-2 text-right">${prod?.price}</td>
                      <td className="py-2 px-2 text-right">${prod?.price}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex flex-col items-end mt-4">
            <div className="w-full max-w-xs">
              <div className="flex justify-between py-1">
                <span className="text-gray-700">Subtotal</span>
                <span>${invoiceData?.subTotal}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-700">Total</span>
                <span>${invoiceData?.totalBill}</span>
              </div>
              <div className="flex justify-between py-1 font-bold text-lg">
                <span>Amount due</span>
                <span>${invoiceData?.totalBill}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
