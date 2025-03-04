"use client";
import CityCard from "@/components/ui/CityCard";
import { Dialog } from "primereact/dialog";
import { useState } from "react";
import { RiFileDownloadLine } from "react-icons/ri";
import Select from "react-select";
import { selectStyles2 } from "@/utilities/SelectStyle";

export default function Cities() {
  const [modal, setModal] = useState(false);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl lg:text-2xl font-inter font-semibold">
            All Cities
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
            onClick={() => setModal(true)}
            className="rounded-lg font-inter font-medium text-white px-6 sm:px-10 py-2.5 sm:py-4 bg-theme"
          >
            + Add City
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <CityCard name="Berlin" />
        <CityCard name="Munich" />
        <CityCard name="Frankfurt" />
        <CityCard name="Heidelberg" />
        <CityCard name="Chemnitz" />
      </div>

      {/* Modal */}
      <Dialog
        visible={modal}
        style={{ width: "40vw" }}
        className="font-nunito"
        onHide={() => setModal(false)}
        header={
          <div className="font-nunito font-bold text-2xl text-center">
            Add City
          </div>
        }
      >
        <div className="space-y-4 flex flex-col items-center">
          {/* body */}
          <div className="w-full space-y-4">
            <div className="flex flex-col gap-y-2 w-full">
              <label className="text-labelColor font-medium font-satoshi">
                Country
              </label>
              <Select
                placeholder="Germany"
                className="w-full"
                styles={selectStyles2}
              />
            </div>
            <div className="flex flex-col gap-y-2 w-full">
              <label className="text-labelColor font-medium font-satoshi">
                City
              </label>
              <Select
                placeholder="Berlin"
                className="w-full"
                styles={selectStyles2}
              />
            </div>
            <div className="flex items-center justify-end gap-x-4 [&>button]:font-nunito [&>button]:py-3 [&>button]:font-medium">
              <button
                onClick={() => setModal(false)}
                className="rounded-lg border border-black shadow-buttonShadow  px-6"
              >
                Cancel
              </button>
              <button className="rounded-lg border border-theme text-white px-10 bg-theme">
                Add City
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
