"use client";
import { useState } from "react";
import Loader from "@/components/ui/Loader";
import StockCard from "@/components/ui/StockCard";
import GetAPI from "@/utilities/GetAPI";
import DrawerBeans from "@/components/ui/DrawerBeans";
import Select from "react-select";
import selectStyles, { selectStyles2 } from "@/utilities/SelectStyle";
import { success_toaster } from "@/utilities/Toaster";


export default function SalesRepresentativeInventory() {
  if(typeof window !== 'undefined'){
    var quotationData = JSON.parse(localStorage.getItem("quotationData")) || []
  }
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [quotationData, setQuotationData] = useState(
    quotationData
  );

  const [visibleRight, setVisibleRight] = useState(false);

  const { data, reFetch } = GetAPI("api/v1/admin/product");

  const handlePlus = (id, itemQuantity) => {
    const findItemIndex = quotationData?.findIndex((item) => item?.id === id);
    if (findItemIndex === -1) {
      const item = data?.data?.data.find((item) => item?.id === id);
      quotationData.push({ ...item, qty: itemQuantity });
      setQuotationData([...quotationData]);
      localStorage.setItem("quotationData", JSON.stringify(quotationData));
      success_toaster("Item Added Successfully");
    } else {
      quotationData[findItemIndex]["qty"] = itemQuantity;
      setQuotationData(quotationData);
      localStorage.setItem("quotationData", JSON.stringify(quotationData));
      success_toaster("Item Updated Successfully");
    }
  };

  const handleMinus = (id, itemQuantity) => {
    const findItemIndex = quotationData?.findIndex((item) => item?.id === id);
    console.log("🚀 ~ handleMinus ~ findItemIndex:", findItemIndex);
    if (findItemIndex !== -1) {
      if (itemQuantity === 0) {
        const filteredQuotationItem = quotationData?.filter(
          (item) => item?.id !== id
        );
        setQuotationData(filteredQuotationItem);
        localStorage.setItem(
          "quotationData",
          JSON.stringify(filteredQuotationItem)
        );
        success_toaster("Item Removed Successfully");
      } else {
        quotationData[findItemIndex]["qty"] = itemQuantity;
        setQuotationData(quotationData);
        localStorage.setItem("quotationData", JSON.stringify(quotationData));
        success_toaster("Item Updated Successfully");
      }
    }
  };

  const handleQty = (id) => {
    const quotationData =
      JSON.parse(localStorage.getItem("quotationData")) || [];
    const InventoryItem = quotationData.find((item) => item?.id === id);
    console.log("InventoryItem?.qty:- ", InventoryItem?.qty)
    return InventoryItem ? InventoryItem?.qty : 0;
  };

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
              id={item?.id}
              itemName={item?.name}
              quantity={item?.quantity}
              unit={item?.unit}
              imageURL={item?.image}
              qty={handleQty(item?.id)}
              handlePlus={handlePlus}
              handleMinus={handleMinus}
            />
          ))}
        </div>
        <div className="flex justify-end relative">
          <button
            onClick={() => setVisibleRight(true)}
            className="rounded-lg font-inter font-medium text-white px-2 sm:px-3 py-2.5 sm:py-4 bg-theme"
          >
            Send Quote
            <div className="absolute -right-3 -top-3 bg-black size-7 rounded-full text-lg">{quotationData?.length}</div>
          </button>
        </div>
        <DrawerBeans
          drawerOpen={visibleRight}
          setDrawerOpen={setVisibleRight}
          setQuotationData={setQuotationData}
        />
      </div>
    </div>
  );
}
