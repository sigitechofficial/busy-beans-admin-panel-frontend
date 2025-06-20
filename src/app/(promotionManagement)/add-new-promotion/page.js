"use client";
import BackButton from "@/components/ui/BackButton";
import { LuImageUp } from "react-icons/lu";
import Select from "react-select";
import { selectStyles2 } from "@/utilities/SelectStyle";

export default function AddNewPromotion() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <BackButton />
          <h2 className="text-xl lg:text-2xl font-inter font-semibold">
            Add New Promotion
          </h2>
        </div>
      </div>

      <div className="px-5 md:px-10 xl:px-14 py-5 md:py-8 xl:py-10 shadow-tableShadow border border-borderColor rounded-sm space-y-6">
        <div className="grid xl:grid-cols-2 gap-y-4 lg:gap-x-12 xl:gap-16">
          {/* Left Side */}
          <div className="space-y-4">
            <div className="py-8 rounded-xl border border-tabBorderColor border-opacity-40 flex items-center justify-center">
              <LuImageUp size={"80"} color="rgba(0, 0, 0, 0.6)" />
            </div>
            <div className="flex flex-col gap-y-2 w-full">
              <label className="text-labelColor font-medium font-satoshi">
                Promotion type
              </label>
              <Select
                placeholder="Bulk Purchase Discount"
                className="w-full"
                styles={selectStyles2}
              />
            </div>
            <div className="flex flex-col gap-y-2">
              <label className="text-labelColor font-medium font-satoshi">
                Promotion Name
              </label>
              <input
                type="text"
                name=""
                placeholder="Buy More, Save More"
                className="border border-borderColor text-secondary placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
              />
            </div>
            <div className="flex flex-col gap-y-2 w-full">
              <label className="text-labelColor font-medium font-satoshi">
                Discount Structure
              </label>
              <Select
                placeholder="Quantity based Discount"
                className="w-full"
                styles={selectStyles2}
              />
            </div>
          </div>

          {/* Right Side */}
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 max-md:gap-y-4 gap-x-6">
              <div className="flex flex-col gap-y-2">
                <label className="text-labelColor font-medium font-satoshi">
                  Discount Type
                </label>
                <Select
                  placeholder="Percentage"
                  className="w-full"
                  styles={selectStyles2}
                />
              </div>
              <div className="flex flex-col gap-y-2 w-full">
                <label className="text-labelColor font-medium font-satoshi">
                  Discount percentage
                </label>
                <input
                  type="text"
                  name="Supplier Name"
                  placeholder="20%"
                  className="border border-borderColor text-secondary placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                />
              </div>
            </div>
            <div className="flex flex-col gap-y-2 w-full">
              <label className="text-labelColor font-medium font-satoshi">
                Applicable Products
              </label>
              <Select
                placeholder="All Products"
                className="w-full"
                styles={selectStyles2}
              />
            </div>
            <div className="grid md:grid-cols-2 max-md:gap-y-4 gap-x-6">
              <div className="flex flex-col gap-y-2">
                <label className="text-labelColor font-medium font-satoshi">
                  Minimum Order Quantity
                </label>
                <input
                  type="text"
                  name=""
                  placeholder="mini order qty"
                  className="border border-borderColor text-secondary placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                />
              </div>
              <div className="flex flex-col gap-y-2">
                <label className="text-labelColor font-medium font-satoshi">
                  Maximum Order Quantity
                </label>
                <input
                  type="text"
                  name=""
                  placeholder="Max order qty"
                  className="border border-borderColor text-secondary placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 max-md:gap-y-4 gap-x-6">
              <div className="flex flex-col gap-y-2">
                <label className="text-labelColor font-medium font-satoshi">
                  Start Date
                </label>
                <input
                  type="date"
                  name=""
                  placeholder="Enter Zip code"
                  className="border border-borderColor text-secondary placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                />
              </div>
              <div className="flex flex-col gap-y-2">
                <label className="text-labelColor font-medium font-satoshi">
                  End Date
                </label>
                <input
                  type="date"
                  name=""
                  placeholder="Enter Date"
                  className="border border-borderColor text-secondary placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                />
              </div>
            </div>
            <div>
              <button className="font-inter font-medium rounded-sm text-buttonTextColor bg-theme w-full py-3">
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
