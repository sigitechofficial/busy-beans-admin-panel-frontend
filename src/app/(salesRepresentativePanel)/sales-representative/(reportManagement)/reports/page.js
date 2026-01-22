/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import ReportCard from "@/components/ui/ReportCard";
import { useDataContext } from "@/utilities/DataContext";
import { useRouter, usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";
import { CiMenuBurger } from "react-icons/ci";
import { TbReportAnalytics } from "react-icons/tb";

const tabs = [
  {
    id: "sales-by-customer-summary",
    label: "Sales by Customer Summary Report",
    path: "/sales-representative/sales-by-customer-summary",
  },
  {
    id: "sales-by-customer-details",
    label: "Sales by Customer Detail",
    path: "/sales-representative/sales-by-customer-details",
  },
  {
    id: "product-wise-sales-summary",
    label: "Product wise sales summary",
    path: "/sales-representative/product-wise-sales-summary",
  },
  {
    id: "products-sale",
    label: "Product Sale Report",
    path: "/sales-representative/products-sale",
  },
];

export default function page() {
  const { toggle, setToggle } = useDataContext();
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState(() => {
    const currentTab = tabs.find((tab) => pathname === tab.path);
    return currentTab ? currentTab.id : null;
  });

  // Update active tab when pathname changes
  useEffect(() => {
    const currentTab = tabs.find((tab) => pathname === tab.path);
    setActiveTab(currentTab ? currentTab.id : null);
  }, [pathname]);

  const handleTabClick = (tab) => {
    setActiveTab(tab.id);
    router.push(tab.path);
  };

  return (
    <>
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed">
        <div className="flex items-center gap-2">
          <p
            onClick={() => setToggle(!toggle)}
            className="cursor-pointer md:hidden"
          >
            <CiMenuBurger size={20} />
          </p>
          <h2 className="text-xl font-inter font-semibold">
            Local Partner Report Management
          </h2>
        </div>
      </div>
      <div className="space-y-8 pb-6 pt-28 2xl:pt-32 px-6 2xl:px-12">
        {/* New Tabs Section - Using same grid as report cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 xl:gap-10 mb-6">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={`bg-white flex justify-start items-center border border-tabBorderColor shadow-lg rounded-lg py-10 px-5 cursor-pointer hover:bg-theme group ${
                activeTab === tab.id ? "bg-theme" : ""
              }`}
            >
              <div className={`flex items-center gap-x-4 text-xl duration-150 font-chivo font-semibold ${
                activeTab === tab.id
                  ? "text-white"
                  : "text-theme group-hover:text-white"
              }`}>
                <TbReportAnalytics size={24} />
                <p>{tab.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Existing Report Cards */}
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
