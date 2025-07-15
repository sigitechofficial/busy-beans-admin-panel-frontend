"use client";
import ManagementTab from "@/components/ui/ManagementTab";
import ReportCard from "@/components/ui/ReportCard";
import selectStyles from "@/utilities/SelectStyle";
import React from "react";
import { BsCardList } from "react-icons/bs";
import { TbReportAnalytics } from "react-icons/tb";
import Select from "react-select";

export default function page() {
  return (
    <div>
      <div className="w-full sm:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[94px] border-b px-6 2xl:px-12 fixed">
        <h2 className="text-xl lg:text-2xl font-inter font-semibold">
          Report Management
        </h2>
      </div>
      <div className="space-y-8 pt-32 px-6 2xl:px-12 ">
        {/* <div className="flex items-center justify-between">
          <h2 className="text-xl lg:text-2xl font-inter font-semibold">
            Report Management
          </h2>
        </div> */}

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 xl:gap-10">
          <ReportCard
            Icon={TbReportAnalytics}
            title="Partner Profits Report"
            to="/reports/partner-commission"
          />

          <ReportCard
            Icon={TbReportAnalytics}
            title="Partner Credit Limit Report"
            to="/reports/partner-credit-limit"
          />

          <ReportCard
            Icon={BsCardList}
            title="Unpaid Partner Balances Report"
            to="/reports/unpaid-partner-balances"
          />

          <ReportCard
            Icon={BsCardList}
            title="Products Sale Report"
            to="/reports/products-sale"
          />

          <ReportCard
            Icon={TbReportAnalytics}
            title="Customers Report"
            to="/reports/customers"
          />
        </div>
      </div>
    </div>
  );
}
