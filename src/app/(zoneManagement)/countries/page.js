"use client";
import CountryCard from "@/components/ui/CountryCard";
import { Dialog } from "primereact/dialog";
import { LuImageUp } from "react-icons/lu";
import { RiFileDownloadLine } from "react-icons/ri";
import countries from "world-countries";
import Select from "react-select";
import { selectStyles2 } from "@/utilities/SelectStyle";
import { useState } from "react";

export default function Countries() {
  const [modal, setModal] = useState(false);
  const allCountries = countries.map((country) => ({
    name: country?.name?.common,
    code: country?.cca2?.toLowerCase(),
  }));

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl lg:text-2xl font-inter font-semibold">
            All Countries
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
            + Add Country
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <CountryCard countryName="Germany" countryCode="DE" />
        <CountryCard countryName="Denmark" countryCode="DK" />
        <CountryCard countryName="Australia" countryCode="AU" />
        <CountryCard countryName="Canada" countryCode="CA" />
        <CountryCard countryName="Austria" countryCode="AT" />
      </div>

      {/* Modal */}
      <Dialog
        visible={modal}
        style={{ width: "40vw" }}
        className="font-nunito"
        onHide={() => setModal(false)}
        header={
          <div className="font-nunito font-bold text-2xl text-center">
            Add Country
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
                Country
              </label>
              <Select
                placeholder="Germany"
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
                Add Country
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
