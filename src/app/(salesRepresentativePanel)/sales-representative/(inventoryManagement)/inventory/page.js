"use client";
import { useState } from "react";
import Loader from "@/components/ui/Loader";
import StockCard from "@/components/ui/StockCard";
import GetAPI from "@/utilities/GetAPI";
import DrawerBeans from "@/components/ui/DrawerBeans";
import Select from "react-select";
import selectStyles, { selectStyles2 } from "@/utilities/SelectStyle";

export default function SalesRepresentativeInventory() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [visibleRight, setVisibleRight] = useState(false);

  const { data, reFetch } = GetAPI("api/v1/admin/product");
  console.log("🚀 ~ SalesRepresentativeInventory ~ data:", data?.data?.data);

  return data?.length === 0 ? (
    <Loader />
  ) : (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl lg:text-2xl font-inter font-semibold">
           Add Quote
        </h2>

        <Select placeholder="Filters" className="w-40" styles={selectStyles} />
        {/* <div className="flex items-center gap-x-4">
      <div>
        <button className="flex items-center gap-x-2 px-2 sm:px-5 md:px-8 py-2.5 md:py-3 rounded-lg shadow-buttonShadow border border-buttonBorderColor bg-white ">
          <RiFileDownloadLine size={24} />
          <span className="font-nunito text-black">Download CSV</span>
        </button>
      </div>
    </div> */}
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {data?.data?.data?.map((item, i) => (
            <StockCard
              key={i}
              itemName={item?.name}
              quantity={item?.quantity}
              unit={item?.unit}
              imageURL={item?.image}
            />
          ))}
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => setVisibleRight(true)}
            className="rounded-lg font-inter font-medium text-white px-2 sm:px-3 py-2.5 sm:py-4 bg-theme"
          >
            Send Quote
          </button>
        </div>
        <DrawerBeans
          drawerOpen={visibleRight}
          setDrawerOpen={setVisibleRight}
        />
      </div>
    </div>
  );
}
