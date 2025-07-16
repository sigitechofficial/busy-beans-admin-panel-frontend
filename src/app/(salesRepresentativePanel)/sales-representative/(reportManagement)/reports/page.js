"use client";
import ReportCard from "@/components/ui/ReportCard";
import React from "react";
import { TbReportAnalytics } from "react-icons/tb";

export default function page() {
  return (
    <>
      <div className="w-full sm:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[94px] border-b px-6 2xl:px-12 fixed">
        <h2 className="text-xl lg:text-2xl font-inter font-semibold">
          Local Partner Report Management
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
            Local Partner Report Management
          </h2>
        </div> */}

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 xl:gap-10">
          <ReportCard
            Icon={TbReportAnalytics}
            title="Orders Placed Report"
            to="/sales-representative/reports/orders-placed"
          />

          <ReportCard
            Icon={TbReportAnalytics}
            title="Customer Acquisition Report"
            to="/sales-representative/reports/customer-acquisition"
          />

          <ReportCard
            Icon={TbReportAnalytics}
            title="Credit Limit Status Report"
            to="/sales-representative/reports/credit-limit-status"
          />
        </div>
      </div>
    </>
  );
}
