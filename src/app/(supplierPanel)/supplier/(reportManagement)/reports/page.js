"use client";
import ReportCard from "@/components/ui/ReportCard";
import React from "react";
import { TbReportAnalytics } from "react-icons/tb";

export default function page() {
  return (
    <div>
      <div className="w-full sm:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[94px] border-b px-6 2xl:px-12 fixed">
        <h2 className="text-xl lg:text-2xl font-inter font-semibold">
          Supplier Report Management
        </h2>

        {/* <ul className="flex items-center text-sm font-medium [&>li]:border-r [&>li]:px-2 [&>li]:cursor-pointer">
          <li>Invoice</li>
          <li>Quickbooks</li>
          <li>Schedule</li>
          <li>Bulk Modify</li>
          <li>Export</li>
        </ul> */}
      </div>
      <div className="space-y-8 pb-6 pt-32 px-6 2xl:px-12">
        {/* <div className="flex items-center justify-between">
          <h2 className="text-xl lg:text-2xl font-inter font-semibold">
            Supplier Report Management
          </h2>
        </div> */}

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 xl:gap-10">
          <ReportCard
            Icon={TbReportAnalytics}
            title="Assigned Orders Report"
            to="/supplier/reports/assigned-orders"
          />

          <ReportCard
            Icon={TbReportAnalytics}
            title="Orders Status Report"
            to="/supplier/reports/orders-status"
          />

          <ReportCard
            Icon={TbReportAnalytics}
            title="Top Products Ordered Report"
            to="/supplier/reports/top-products-ordered"
          />
        </div>
      </div>
    </div>
  );
}
