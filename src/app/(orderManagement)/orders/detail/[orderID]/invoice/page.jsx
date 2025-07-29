"use client";
import InvoicePDFDownload from "@/components/InvoicePdfDownload";
import Loader from "@/components/ui/Loader";
import GetAPI from "@/utilities/GetAPI";
import { useParams } from "next/navigation";
import React from "react";
import { RiArrowDownSLine } from "react-icons/ri";

function Invoice() {
  const { orderID } = useParams();
  const { data, reFetch } = GetAPI(`api/v1/admin/order-details/${orderID}`);
  return data?.length === 0 ? (
    <Loader />
  ) : (
    <div className="w-full">
      <div className="w-full sm:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[94px] border-b px-6 2xl:px-12 fixed">
        <h2 className="text-xl lg:text-2xl font-inter font-semibold">
          Invoices / {data?.data?.order?.invoiceNumber}
        </h2>
        {/* to do this part */}
        {/* <ul className="flex items-center text-sm font-medium [&>li]:border-r [&>li]:px-2 [&>li]:cursor-pointer relative">
          <li>Email</li>

          <li className="group flex items-center">
            More
            <RiArrowDownSLine />
            <ul className="absolute top-5 right-0 bg-theme text-white rounded-lg p-3 space-y-2 hidden group-hover:block">
              <li>View as PDF</li>
              <li>Export</li>
              <li>Delete</li>
            </ul>
          </li>
        </ul> */}
      </div>
      <InvoicePDFDownload invoiceData={data?.data?.order} reFetch={reFetch} />
    </div>
  );
}

export default Invoice;
