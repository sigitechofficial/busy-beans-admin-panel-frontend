"use client";
import CusSupInformationCard from "@/components/ui/CusSupInformationCard";
import OrderCard from "@/components/ui/OrderCard";
import TrackOrder from "@/components/ui/TrackOrder";
import React, { useState } from "react";

export default function OrderDetail({ params }) {
  // const { orderID } = params;
  const [modal, setModal] = useState({
    type: "",
    status: false,
  });

  const handleAssignSupplier = () => {
    setModal({
      type: "assignSupplier",
      status: true,
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center space-y-2 justify-between">
        <h2 className="text-xl lg:text-2xl font-inter font-semibold">
          Order Details
        </h2>

        <div className="flex items-center gap-x-2 sm:gap-x-4 [&>button]:py-2 sm:[&>button]:py-3 [&>button]:px-2 sm:[&>button]:px-5 [&>button]:rounded-lg [&>button]:font-nunito [&>button]:font-medium max-sm:[&>button]:text-sm">
          <button
            className="bg-black text-white"
            onClick={handleAssignSupplier}
          >
            Assign Supplier
          </button>
          <button className="bg-theme text-white">Add Cheque</button>
          <button className="border border-buttonBorderColor shadow-buttonShadow">
            Print Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 xl:gap-x-12">
        {/* Left side */}
        <div className="space-y-6">
          <CusSupInformationCard
            heading="Customer Information"
            name="Ahsan Munir"
            email="Ahsanmunir74@gmail.com"
            phoneNo="+44823742334"
            subHeading="Delivery Information"
            subHeadingData={{
              "Company Name": "Sigi Technologies",
              "Sale Tax": "-",
              Address:
                "2 Raiwind Rd, Shabbir Town Kibria Town, Lahore, Punjab, Pakistan, 58000",
            }}
          />
          <CusSupInformationCard
            heading="Supplier Information"
            name="Ali Ali"
            email="Ahsanmunir74@gmail.com"
            phoneNo="+44823742334"
            subHeading="Supplier Information"
            subHeadingData={{
              "Supplier Type": "Sigi Technologies",
              "Business Tax No": "96743834",
              "Business Website": "If Needed",
              Address:
                "2 Raiwind Rd, Shabbir Town Kibria Town, Lahore, Punjab, Pakistan, 58000",
            }}
          />
        </div>

        {/* Right side */}
        <div className="space-y-8 -order-last xl:-order-first">
          <TrackOrder />
          <OrderCard modal={modal} setModal={setModal} />
        </div>
      </div>
    </div>
  );
}
