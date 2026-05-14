/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import ReportCard from "@/components/ui/ReportCard";
import { useDataContext } from "@/utilities/DataContext";
import React from "react";
import { BsCardList } from "react-icons/bs";
import { CiMenuBurger } from "react-icons/ci";
import { TbReportAnalytics } from "react-icons/tb";
import { REPORT_MANAGEMENT } from "./report.testid";

export default function page() {
  const { toggle, setToggle } = useDataContext();
  return (
    <div data-testid={REPORT_MANAGEMENT.root}>
      <div
        className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed"
        data-testid={REPORT_MANAGEMENT.headerBar}
      >
        <div className="flex items-center gap-2">
          <p
            onClick={() => setToggle(!toggle)}
            className="cursor-pointer md:hidden"
            data-testid={REPORT_MANAGEMENT.menuToggleButton}
          >
            <CiMenuBurger size={20} />
          </p>
          <h2
            className="text-xl font-inter font-semibold"
            data-testid={REPORT_MANAGEMENT.title}
          >
            Report Management
          </h2>
        </div>
      </div>
      <div className="space-y-8 pt-28 2xl:pt-32 px-6 2xl:px-12 ">
        {/* <div className="flex items-center justify-between">
          <h2 className="text-xl lg:text-2xl font-inter font-semibold">
            Report Management
          </h2>
        </div> */}

        <div
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 xl:gap-10"
          data-testid={REPORT_MANAGEMENT.reportCardSection}
        >
          <ReportCard
            Icon={TbReportAnalytics}
            title="Partner Profits Report"
            to="/reports/partner-commission"
            data-testid={REPORT_MANAGEMENT.partnerProfitsReportCard}
          />

          <ReportCard
            Icon={TbReportAnalytics}
            title="Partner Credit Limit Report"
            to="/reports/partner-credit-limit"
            data-testid={REPORT_MANAGEMENT.partnerCreditLimitReportCard}
          />

          <ReportCard
            Icon={BsCardList}
            title="Unpaid Partner Balances Report"
            to="/reports/unpaid-partner-balances"
            data-testid={REPORT_MANAGEMENT.unpaidPartnerBalancesReportCard}
          />

          <ReportCard
            Icon={BsCardList}
            title="Products Sale Report"
            to="/reports/products-sale"
            data-testid={REPORT_MANAGEMENT.productsSaleReportCard}
          />

          <ReportCard
            Icon={TbReportAnalytics}
            title="Customers Report"
            to="/reports/customers"
            data-testid={REPORT_MANAGEMENT.customersReportCard}
          />

          <ReportCard
            Icon={TbReportAnalytics}
            title="Direct Partner Report"
            to="/reports/direct-partner"
            data-testid={REPORT_MANAGEMENT.customersReportCard}
          />

          <ReportCard
            Icon={TbReportAnalytics}
            title="Sales by Customer Summary Report"
            to="/reports/sales-by-customer-summary"
            data-testid={REPORT_MANAGEMENT.salesByCustomerSummaryReportCard}
          />

          <ReportCard
            Icon={TbReportAnalytics}
            title="Sales by Customer Details"
            to="/reports/sales-by-customer-details"
            data-testid={REPORT_MANAGEMENT.salesByCustomerDetailsReportCard}
          />

          <ReportCard
            Icon={TbReportAnalytics}
            title="Product wise sales summary"
            to="/reports/product-wise-sales-summary"
            data-testid={REPORT_MANAGEMENT.productWiseSalesSummaryReportCard}
          />

          <ReportCard
            Icon={BsCardList}
            title="Pulled Orders Receivable Report"
            to="/reports/pulled-orders-receivable"
            data-testid={REPORT_MANAGEMENT.pulledOrdersReceivableReportCard}
          />
        </div>
      </div>
    </div>
  );
}
