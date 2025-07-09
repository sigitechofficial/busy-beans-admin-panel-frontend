"use client";
import InvoicePDFDownload from "@/components/InvoicePdfDownload";
import GetAPI from "@/utilities/GetAPI";
import { useParams } from "next/navigation";
import React from "react";

function Invoice() {
  const { orderID } = useParams();
  const { data, reFetch } = GetAPI(`api/v1/admin/order-details/${orderID}`);
  return (
    <div className="w-full">
      <InvoicePDFDownload invoiceData={data?.data?.order} reFetch={reFetch} />
    </div>
  );
}

export default Invoice;
