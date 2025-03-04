"use client";
import StockCard from "@/components/ui/StockCard";
import { Dialog } from "primereact/dialog";
import { LuImageUp } from "react-icons/lu";
import { RiFileDownloadLine } from "react-icons/ri";
import Select from "react-select";
import { selectStyles2 } from "@/utilities/SelectStyle";
import { useState } from "react";

export default function Stock() {
  const [modal, setModal] = useState({
    type: "",
    status: false,
  });

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl lg:text-2xl font-inter font-semibold">
            Available Stock
          </h2>

          <div className="flex items-center gap-x-4">
            <div>
              <button className="flex items-center gap-x-2 px-2 sm:px-5 md:px-8 py-2.5 md:py-3 rounded-lg shadow-buttonShadow border border-buttonBorderColor bg-white ">
                <RiFileDownloadLine size={24} />
                <span className="font-nunito text-black">Download CSV</span>
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => setModal({ type: "addStock", status: true })}
            className="rounded-lg font-inter font-medium text-white px-10 py-2.5 sm:py-4 bg-theme"
          >
            + Add Stock
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StockCard itemName="Coffee" quantity="100kga" />
        <StockCard itemName="Coffee" quantity="100kg" />
        <StockCard itemName="Coffee" quantity="100kg" />
        <StockCard itemName="Coffee" quantity="100kg" />
        <StockCard itemName="Coffee" quantity="100kg" />
        <StockCard itemName="Coffee" quantity="100kg" />
      </div>

      {/* Modal */}
      <Dialog
        visible={modal?.type === "addStock" && modal?.status}
        // style={{ width: "40vw" }}
        breakpoints={{"1496px": "40vw", "1024px": "70vw" ,"641px": "80vw" }}
        className="font-nunito"
        onHide={() => setModal({ type: "", status: false })}
        header={
          <div className="font-nunito font-bold text-2xl text-center">
            Add Stock/ Inventory
          </div>
        }
      >
        <div className="space-y-4 flex flex-col items-center">
          {/* header */}
          <div className="rounded-xl border border-tabBorderColor border-opacity-40 size-28 flex items-center justify-center">
            <LuImageUp size={"100"} color="rgba(0, 0, 0, 0.6)" />
          </div>

          {/* body */}
          <div className="w-full space-y-4">
            <div className="flex flex-col gap-y-2 w-full">
              <label className="text-labelColor font-medium font-satoshi">
                Item Name
              </label>
              <Select
                placeholder="Coffee"
                className="w-full"
                styles={selectStyles2}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-y-4 gap-x-6">
              <div className="flex flex-col gap-y-2">
                <label className="text-labelColor font-medium font-satoshi">
                  Quantity
                </label>
                <input
                  type="text"
                  name="Supplier Name"
                  placeholder="1000"
                  className="border border-borderColor text-secondary placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                />
              </div>
              <div className="flex flex-col gap-y-2 w-full">
                <label className="text-labelColor font-medium font-satoshi">
                  Units
                </label>
                <Select
                  placeholder="Kg"
                  className="w-full"
                  styles={selectStyles2}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-x-4 [&>button]:font-nunito [&>button]:py-3 [&>button]:font-medium">
              <button
                onClick={() => setModal({ type: "", status: false })}
                className="rounded-lg border border-black shadow-buttonShadow  px-6"
              >
                Cancel
              </button>
              <button className="rounded-lg border border-theme text-white px-10  bg-theme">
                Add Stock
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
