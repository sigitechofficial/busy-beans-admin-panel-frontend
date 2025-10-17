"use client";
import { useState } from "react";
import Loader from "@/components/ui/Loader";
import StockCard from "@/components/ui/StockCard";
import GetAPI from "@/utilities/GetAPI";
import DrawerBeans from "@/components/ui/DrawerBeans";
import Select from "react-select";
import selectStyles, { selectStyles2 } from "@/utilities/SelectStyle";
import { hasPermission } from "@/utilities/Permission";
import { success_toaster } from "@/utilities/Toaster";

export default function SalesRepresentativeInventory() {
  if (typeof window !== "undefined") {
    var quotationDataList =
      JSON.parse(localStorage.getItem("quotationData")) || [];
  }
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [quotationData, setQuotationData] = useState(quotationDataList);
  const [filterId, setFilterId] = useState("");
  const [visibleRight, setVisibleRight] = useState(false);

  const { data: category } = GetAPI(`api/v1/admin/category`);
  let categoryList = [{ value: "", label: "All" }];
  if (category) {
    category?.data?.data?.map((cat) => {
      categoryList.push({ value: cat?.id, label: cat?.name });
    });
  }
  const url = filterId
    ? `api/v1/admin/product?categoryId=${filterId}`
    : `api/v1/admin/product`;

  const { data, reFetch, isLoading } = GetAPI(url);
  console.log("🚀 ~ SalesRepresentativeInventory ~ data:", data?.data?.data)

  const handleFilter = () => {
    const filteredData = data?.data?.data?.filter((item) =>
      item?.name?.toLowerCase().includes(filter.toLowerCase())
    );

    return filteredData;
  };

  const handlePlus = (id, itemQuantity) => {
    const findItemIndex = quotationData?.findIndex((item) => item?.id === id);
    if (findItemIndex === -1) {
      const item = data?.data?.data.find((item) => item?.id === id);
      quotationData.push({ ...item, qty: itemQuantity });
      setQuotationData([...quotationData]);
      localStorage.setItem("quotationData", JSON.stringify(quotationData));
      // success_toaster("Item Added Successfully");
    } else {
      quotationData[findItemIndex]["qty"] = itemQuantity;
      setQuotationData(quotationData);
      localStorage.setItem("quotationData", JSON.stringify(quotationData));
      // success_toaster("Item Updated Successfully");
    }
  };

  const handleMinus = (id, itemQuantity) => {
    const findItemIndex = quotationData?.findIndex((item) => item?.id === id);
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
        // success_toaster("Item Removed Successfully");
      } else {
        quotationData[findItemIndex]["qty"] = itemQuantity;
        setQuotationData(quotationData);
        localStorage.setItem("quotationData", JSON.stringify(quotationData));
        // success_toaster("Item Updated Successfully");
      }
    }
  };

  const handleQty = (id) => {
    const quotationData =
      JSON.parse(localStorage.getItem("quotationData")) || [];
    const InventoryItem = quotationData.find((item) => item?.id === id);
    return InventoryItem ? InventoryItem?.qty : 0;
  };
 
  return isLoading ? (
      <Loader />
    ) : (
    <div>
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed">
        <h2 className="text-xl font-inter font-semibold">
          Quotation Management
        </h2>
      </div>
      <div className="space-y-8 pb-6 pt-28 2xl:pt-32 px-6 2xl:px-12">
        <div className="flex items-center justify-end gap-x-3">
          <input
            type="text"
            name="name"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
            }}
            // value={userData?.info?.name}
            placeholder="Search Product by name"
            className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-2"
          />
          {/* <Select placeholder="Filters" className="w-40" styles={selectStyles} /> */}
          {/* <div className="flex items-center gap-x-4">
      <div>
        <button className="flex items-center gap-x-2 px-2 sm:px-5 md:px-8 py-2.5 md:py-3 rounded-lg shadow-buttonShadow border border-buttonBorderColor bg-white ">
          <RiFileDownloadLine size={24} />
          <span className="font-nunito text-black">Download CSV</span>
        </button>
      </div>
    </div> */}

          <Select
            onChange={(e) => setFilterId(e?.value)}
            placeholder="Category"
            options={categoryList}
            className="w-40"
            styles={selectStyles}
          />
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {handleFilter()?.map((item, i) => (
              <StockCard
                key={i}
                id={item?.id}
                productCode={item?.productCode}
                sku={item?.sku}
                grind={item?.grind}
                itemName={item?.name}
                quantity={item?.quantity}
                price={item?.price}
                wholesalePrice={item?.wholesalePrice}
                weight={item?.weight}
                unit={item?.unit}
                imageURL={item?.image}
                qty={handleQty(item?.id)}
                handlePlus={handlePlus}
                handleMinus={handleMinus}
              />
            ))}
          </div>
          <div className="fixed bottom-4 right-3">
            {(hasPermission("quotation_create") || hasPermission("quotation_update")) &&
            <button
              onClick={() => setVisibleRight(true)}
              className="rounded-lg font-inter font-medium text-white px-2 sm:px-3 py-2.5 sm:py-4 bg-theme"
            >
              Send Quote
              <div className="absolute -right-3 -top-3 bg-black size-7 rounded-full text-lg">
                {quotationData?.length}
              </div>
            </button>}
          </div>
          <DrawerBeans
            drawerOpen={visibleRight}
            setDrawerOpen={setVisibleRight}
            setQuotationData={setQuotationData}
            quotationData={quotationData}
          />
        </div>
      </div>
    </div>
  );
}
