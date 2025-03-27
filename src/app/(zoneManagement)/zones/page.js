"use client";
import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import Select from "react-select";
import selectStyles from "@/utilities/SelectStyle";
import { selectStyles2 } from "@/utilities/SelectStyle";
import { Dialog } from "primereact/dialog";
import { useState } from "react";
 
export default function Zones() {
  const [modal, setModal] = useState(false);

  const columns = [
    { field: "#", header: "SL", sort: true },
    { field: "countries", header: "Countries" },
    { field: "zones", header: "Zones" },
    { field: "action", header: "Action" },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl lg:text-2xl font-inter font-semibold">
            All Zones
          </h2>

          <Select
            placeholder="Filters"
            className="w-40"
            styles={selectStyles}
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => setModal(true)}
            className="rounded-lg font-inter font-medium text-white px-5 sm:px-8 py-2.5 sm:py-4 bg-theme"
          >
            + Add Zone
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <ManagementTab title="Total Zones" desc="5000" />
        <ManagementTab title="Total Countries" desc="5000" />
        <ManagementTab title="Total Cities" desc="55000" />
      </div>

      <div>
        <MyDataTable columns={columns} data={[]} placeholder={"Search ..."} />
      </div>

      {/* Modal */}
      <Dialog
        visible={modal}
        style={{ width: "40vw" }}
        className="font-nunito"
        onHide={() => setModal(false)}
        header={
          <div className="font-nunito font-bold text-2xl text-center">
            Add Zone
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
                Select City
              </label>
              <Select
                placeholder="Berlin"
                className="w-full"
                styles={selectStyles2}
              />
            </div>
            <div className="flex flex-col gap-y-2">
              <label className="text-labelColor font-medium font-satoshi">
                Zone No/ Name*
              </label>
              <input
                type="text"
                name="Supplier Name"
                placeholder="021"
                className="border border-borderColor text-secondary placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
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
                Add Zone
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
