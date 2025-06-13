"use client";
import ReportCard from "@/components/ui/ReportCard";
import React from "react";
import { TbReportAnalytics } from "react-icons/tb";

export default function page() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl lg:text-2xl font-inter font-semibold">
          Sales Representative Report Management
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 xl:gap-10">
        <ReportCard
          Icon={TbReportAnalytics}
          title="Orders Placed Report"
          to="/sales-representative/reports/orders-placed"
        />

        
      </div>
    </div>
  );
}
