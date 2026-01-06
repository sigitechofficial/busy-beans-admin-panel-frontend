"use client";

import { useEffect, useRef, useState } from "react";
import html2pdf from "html2pdf.js";
import dayjs from "dayjs";
import { PostAPI } from "@/utilities/PostAPI";
import { info_toaster, success_toaster } from "@/utilities/Toaster";
import { PatchAPI } from "@/utilities/PatchAPI";
import { hasPermission } from "@/utilities/Permission";

export default function InvoicePDFDownload({ invoiceData, reFetch, adminAddress }) {
  const invoiceRef = useRef(null);

  const [data, setData] = useState("");
  const [pdfData, setPdfData] = useState({
    invNumber: "",
    poNumber: "",
  });
  const [isPrint, setIsPrint] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);

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

  const handleCopyLink = () => {
    const link = `https://www.busybeancoffee.com/paymentCheck?orderId=${invoiceData?.id}`;
    navigator.clipboard.writeText(link)
      .then(() => {
        setIsLinkCopied(true);
        // info_toaster("Payment link copied to clipboard!"); 
        setTimeout(() => {
          setIsLinkCopied(false);
        }, 2000);
      })
      .catch(() => {
        info_toaster("Failed to copy the link.");
      });
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
        // order: {
        //   invoiceNumber: pdfData?.invNumber,
        //   poNumber: pdfData?.poNumber,
        // },
      }
    );

    if (res?.data?.status === "success") {
      success_toaster("success");
      reFetch();
    } else {
      info_toaster("something went wrong");
    }
  };

  const handleDueDate = (date) => {
    const due = dayjs(date).add(30, "day");
    return due.format("MM/DD/YYYY");
  };

  useEffect(() => {
    if (invoiceData?.items || invoiceData?.partnerOrderItems) {
      const enrichedItems = (invoiceData?.items || invoiceData?.partnerOrderItems)?.map((item) => ({
        ...item,
        unitPrice: item.qty ? item.price / item.qty : 0, // avoid NaN
      }));
      setData(enrichedItems);
    }
    setPdfData({
      invNumber: invoiceData?.invoiceNumber,
      poNumber: invoiceData?.poNumber,
    });
  }, [invoiceData]);

  const bill = invoiceData?.user || {};
  const billAddr = bill?.billingAddresses?.[0] || {};
  const phoneText = [bill?.countryCode || "+1", bill?.phoneNumber]
    .filter(Boolean)
    .join(" ");
  const invoiceEmail = bill?.emailToSendInvoices || bill?.email || "";
  const isCustomer = invoiceData?.user || false;
  const isPartnerSelfOrder = (invoiceData?.salesRep && !invoiceData?.user) || false;
  
  // For partner self orders, get sales rep billing address
  const salesRepBillAddr = invoiceData?.salesRep?.billingAddresses?.[0] || {};
  const salesRepPhoneText = [invoiceData?.salesRep?.countryCode || "+1", invoiceData?.salesRep?.phoneNumber]
    .filter(Boolean)
    .join(" ");
  const salesRepEmail = invoiceData?.salesRep?.email || "";

  return (
    <div className="w-full max-w-[800px] mx-auto px-6 pt-28 2xl:pt-32 min-w-[700px] overflow-auto">
      <div ref={invoiceRef} className="w-full">
        <div className="w-full mx-auto bg-white pt-8 pb-14 font-satoshi">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-6">
            <div className="flex items-center gap-x-10">
              <h1 className="text-3xl font-semibold uppercase">Invoice</h1>
              {invoiceData?.invoicePaidDate && <img className="w-36" src="/images/paidtag.png" alt="invoice paid logo" />}
            </div>
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
                  <div>{pdfData?.invNumber}</div>
                ) : (
                  <div className="flex items-center">
                    <input
                      className="text-start outline-none bg-transparent rounded  font-semibold"
                      type="text"
                      value={pdfData?.invNumber ?? ""}
                      onChange={(e) =>
                        handleChange(0, e.target.value, "invNumber")
                      }
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center text-sm font-semibold">
                <div className="w-36">Date of issue:</div>
                <div>{invoiceData?.invoiceDate ? dayjs(invoiceData?.invoiceDate).format("MM/DD/YYYY") : "Not issued yet"}</div>
              </div>
              <div className="flex items-center text-sm font-semibold">
                <div className="w-36">Due Date:</div>
                <div>{invoiceData?.invoiceDate ? handleDueDate(invoiceData?.invoiceDate) : "Not issued yet"}</div>
              </div>
              <div className="flex items-center text-sm font-semibold">
                <div className="w-36">PO Number:</div>
                <div>{pdfData?.poNumber ?? ""}</div>
                {/* {isPrint ? (
                  <div>{pdfData?.poNumber}</div>
                ) : (
                  <input
                    className="overflow-x-visible text-start outline-none bg-transparent rounded  font-semibold"
                    type="text"
                    value={pdfData?.poNumber}
                    onChange={(e) =>
                      handleChange(0, e.target.value, "poNumber")
                    }
                  />
                )} */}
              </div>
            </div>

            <div className="grid grid-cols-2 text-sm gap-4">
              {/* Remit To Section (always) */}
              <div>
                <div className="font-bold">Remit To</div>
                {isPartnerSelfOrder ? (
                  // For partner self orders, show admin address
                  <>
                    <div className="uppercase">Busy Bean Coffee Inc.</div>
                    <div className="uppercase">{adminAddress?.salesRepName}</div>
                    {adminAddress?.territoryName && (
                      <div className="uppercase">{adminAddress?.territoryName}</div>
                    )}
                    {adminAddress?.address && (
                      <div className="uppercase">{adminAddress?.address}</div>
                    )}
                    {(adminAddress?.city + ", " + adminAddress?.state + ", " + adminAddress?.zipCode) && (
                      <div className="uppercase">
                        {adminAddress?.city + ", " + adminAddress?.state + " " + adminAddress?.zipCode}
                      </div>
                    )}
                    {adminAddress?.country && (
                      <div className="uppercase">{adminAddress?.country}</div>
                    )}
                    {(adminAddress?.countryCode || adminAddress?.phoneNumber) && (
                      <div>
                        {[adminAddress?.countryCode, adminAddress?.phoneNumber]
                          .filter(Boolean)
                          .join(" ")}
                      </div>
                    )}
                    {adminAddress?.supportEmail && <div>{adminAddress?.supportEmail}</div>}
                  </>
                ) : invoiceData?.salesRep ? (
                  // For regular sales rep orders, show sales rep address
                  <>
                    {/* <div className="uppercase">{invoiceData?.salesRepName}</div> */}
                    {invoiceData?.salesRep?.territoryName && (
                      <div className="uppercase">{invoiceData?.salesRep?.territoryName}</div>
                    )}
                    {invoiceData?.salesRep?.address && (
                      <div className="uppercase">{invoiceData?.salesRep?.address}</div>
                    )}
                    {(invoiceData?.salesRep?.city ||
                      invoiceData?.salesRep?.state ||
                      invoiceData?.salesRep?.zipCode) && (
                        <div className="uppercase">
                          {[invoiceData?.salesRep?.city, invoiceData?.salesRep?.state, invoiceData?.salesRep?.zipCode]
                            .filter(Boolean)
                            .join(" ")}
                        </div>
                      )}
                    {invoiceData?.salesRep?.country && (
                      <div className="uppercase">{invoiceData?.salesRep?.country}</div>
                    )}
                    {(invoiceData?.salesRep?.countryCode || invoiceData?.salesRep?.phoneNumber) && (
                      <div>
                        {[invoiceData?.salesRep?.countryCode, invoiceData?.salesRep?.phoneNumber]
                          .filter(Boolean)
                          .join(" ")}
                      </div>
                    )}
                    {invoiceData?.salesRep?.email && <div>{invoiceData?.salesRep?.email}</div>}
                  </>
                ) : (
                  // Fallback to admin address
                  <>
                    <div className="uppercase">Busy Bean Coffee Inc.</div>
                    <div className="uppercase">{adminAddress?.salesRepName}</div>
                    {adminAddress?.territoryName && (
                      <div className="uppercase">{adminAddress?.territoryName}</div>
                    )}
                    {adminAddress?.address && (
                      <div className="uppercase">{adminAddress?.address}</div>
                    )}
                    {(adminAddress?.city + ", " + adminAddress?.state + ", " + adminAddress?.zipCode) && (
                      <div className="uppercase">
                        {adminAddress?.city + ", " + adminAddress?.state + " " + adminAddress?.zipCode}
                      </div>
                    )}
                    {adminAddress?.country && (
                      <div className="uppercase">{adminAddress?.country}</div>
                    )}
                    {(adminAddress?.countryCode || adminAddress?.phoneNumber) && (
                      <div>
                        {[adminAddress?.countryCode, adminAddress?.phoneNumber]
                          .filter(Boolean)
                          .join(" ")}
                      </div>
                    )}
                    {adminAddress?.supportEmail && <div>{adminAddress?.supportEmail}</div>}
                  </>

                )}
              </div>
              {/* Bill To Section */}
              <div className="uppercase">
                <div className="font-bold capitalize">Bill to</div>

                {isPartnerSelfOrder ? (
                  // For partner self orders, show sales rep billing address
                  <>
                    {/* Company address or name */}
                    {salesRepBillAddr?.companyaddress && <div>{salesRepBillAddr.companyaddress}</div>}

                    {/* Company name if available */}
                    {invoiceData?.salesRep?.companyName && <div>{invoiceData?.salesRep?.companyName}</div>}

                    {/* Address lines */}
                    {(salesRepBillAddr?.addressLineOne || salesRepBillAddr?.addressLineTwo) && (
                      <div>
                        {[salesRepBillAddr?.addressLineOne, salesRepBillAddr?.addressLineTwo]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    )}

                    {/* Town, State, Zip */}
                    {(salesRepBillAddr?.town || salesRepBillAddr?.state || salesRepBillAddr?.zipCode) && (
                      <div>
                        {[salesRepBillAddr?.town, salesRepBillAddr?.state, salesRepBillAddr?.zipCode]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    )}

                    {/* Country */}
                    {salesRepBillAddr?.country && <div>{salesRepBillAddr.country}</div>}

                    {/* Phone */}
                    {salesRepPhoneText && <div>{salesRepPhoneText}</div>}

                    {/* Email */}
                    {salesRepEmail && <div className="lowercase">{salesRepEmail}</div>}
                  </>
                ) : (
                  // For customer orders, show customer billing address (unchanged)
                  <>
                    {/* Company address or name */}
                    {billAddr?.companyaddress && <div>{billAddr.companyaddress}</div>}

                    {/* Company name if available */}
                    {bill?.companyName && <div>{bill.companyName}</div>}

                    {/* Address lines */}
                    {(billAddr?.addressLineOne || billAddr?.addressLineTwo) && (
                      <div>
                        {[billAddr?.addressLineOne, billAddr?.addressLineTwo]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    )}

                    {/* Town, State, Zip */}
                    {(billAddr?.town || billAddr?.state || billAddr?.zipCode) && (
                      <div>
                        {[billAddr?.town, billAddr?.state, billAddr?.zipCode]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    )}

                    {/* Country */}
                    {billAddr?.country && <div>{billAddr.country}</div>}

                    {/* Phone */}
                    {phoneText && <div>{phoneText}</div>}

                    {/* Email (prefer invoice email, fallback to user email) */}
                    {invoiceEmail && <div className="lowercase">{invoiceEmail}</div>}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Amount Due */}
          <div className="text-xl font-semibold mt-10">
            ${invoiceData?.totalBill} due amount
          </div>
          {!isPrint && (
            <>
              <button
                onClick={() => window.open(`https://www.busybeancoffee.com/paymentCheck?orderId=${invoiceData?.id}`, '_blank')}
                className="mb-4 px-4 py-2 bg-theme text-white rounded inline-block hover:bg-theme-dark"
              >
                Pay Online
              </button>

              <button
                onClick={handleCopyLink}
                className={`ml-2 mb-4 px-4 py-2 rounded inline-block transition-colors ${isLinkCopied ? "bg-green-500 text-white" : "bg-black text-white"
                  }`}
              >
                {isLinkCopied ? "Link Copied!" : "Copy Payment Link"}
              </button>
            </>
          )}
          {/* Table */}
          <div className="mt-4">
            <div className="w-full text-sm">
              <div className="border-b-2 grid grid-cols-7 gap-4">
                <p className="py-2 px-2 font-semibold">Code</p>
                <p className="text-left py-2 px-2 font-semibold col-span-2">Item</p>
                <p className="text-left py-2 px-2 font-semibold">Grind</p>
                <p className="text-right py-2 px-2 font-semibold">Quantity</p>
                <p className="text-right py-2 px-2 font-semibold">Unit price</p>
                <p className="text-right py-2 px-2 font-semibold">Amount</p>
              </div>

              <div>
                {data &&
                  data?.map((prod, index) => {
                    return (
                      <div
                        key={prod?.id || prod?.productId || index}
                        className="border-b last:border-0 grid grid-cols-7 gap-4 h-8 items-center">
                        <div className="px-2 text-left">{prod?.productCode ?? ""}</div>
                        <div className="px-2 py-2 font-semibold col-span-2 overflow-hidden text-ellipsis whitespace-nowrap">
                          {prod?.product ?? prod?.productName ?? prod?.name ?? ""}
                        </div>
                        <div className="px-2 py-2 text-left overflow-hidden text-ellipsis whitespace-nowrap">
                          {prod?.grind}
                        </div>
                        <div className="px-2 text-right">
                          {isPrint ? (
                            <div className="text-center font-semibold">{prod?.qty ?? ""}</div>
                          ) : (
                            <input
                              className="w-12 text-center outline-none bg-transparent border rounded font-semibold"
                              type="text"
                              value={prod?.qty}
                              disabled
                              onChange={(e) => handleChange(index, e.target.value)}
                            />
                          )}
                        </div>
                        <div className="px-2 text-right">${prod?.unitPrice ?? ""}</div>
                        <div className="px-2 text-right">${prod?.price ?? ""}</div>
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
  
      </div>
    </div>
  );
}
