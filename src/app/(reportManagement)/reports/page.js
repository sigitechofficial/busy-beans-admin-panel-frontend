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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl lg:text-2xl font-inter font-semibold">
          Report Management
        </h2>
        <Select placeholder="Filters" className="w-40" styles={selectStyles} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 xl:gap-10">
        <ReportCard
          Icon={TbReportAnalytics}
          title="Partner Commission Report"
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
      </div>
    </div>
  );
}
