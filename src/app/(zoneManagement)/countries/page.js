"use client";
import CountryCard from "@/components/ui/CountryCard";
import { Dialog } from "primereact/dialog";
import { LuImageUp } from "react-icons/lu";
import { RiFileDownloadLine } from "react-icons/ri";
// import countries from "world-countries";
import Select from "react-select";
import { selectStyles2 } from "@/utilities/SelectStyle";
import { useState } from "react";
import GetAPI from "@/utilities/GetAPI";
import { PostAPI } from "@/utilities/PostAPI";
import ErrorHandler from "@/utilities/ErrorHandler";
import { info_toaster, success_toaster } from "@/utilities/Toaster";
import { DeleteAPI } from "@/utilities/DeleteAPI";
import { Country, State, City } from "country-state-city";
import Loader from "@/components/ui/Loader";
import MiniLoader from "@/components/ui/MiniLoader";

export default function Countries() {
  const countries = Country.getAllCountries();
  // const states = State.getStatesOfCountry("PK");

  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState("");
  const [countryID, setCountryID] = useState("");
  const [countryName, setCountryName] = useState({
    value: "",
    label: "",
  });
  const allCountriesData = [];
  // countries.map((country) =>
  //   allCountries.push({
  //     value: country?.name?.common,
  //     label: country?.name?.common,
  //     // name: country?.name?.common,
  //     // code: country?.cca2?.toLowerCase(),
  //   })
  // );

  countries?.map((country) =>
    allCountriesData.push({
      value: country?.isoCode,
      label: country?.name,
      // name: country?.name?.common,
      // code: country?.cca2?.toLowerCase(),
    })
  );

  const { data, reFetch } = GetAPI("api/v1/admin/address-management/country");

  const handleAddCountry = async (e) => {
    e.preventDefault();
    if (modal === "add") {
      if (!countryName?.label || !countryName?.value) {
        info_toaster("Select Country");
      } else {
        try {
          setLoading(true);
          const res = await PostAPI("api/v1/admin/address-management/country", {
            name: countryName?.label,
            isoCode: countryName?.value,
          });
          if (res?.data?.status === "success") {
            success_toaster("Country Added Successfully");
            reFetch();
            setModal("");
            setCountryName({
              value: "",
              label: "",
            });
            setLoading(false);
          } else {
            throw new Error(
              res?.data?.message || "An unexpected error occurred."
            );
          }
        } catch (error) {
          ErrorHandler(error);
        } finally {
          setLoading(false);
        }
      }
    } else {
      setLoading(true);
      try {
        const res = await DeleteAPI(
          `api/v1/admin/address-management/country/${countryID}`
        );
        if (res?.data?.status === "success") {
          success_toaster("Country Delete Successfully");
          reFetch();
          setModal("");
          setCountryID("");
        } else {
          throw new Error(
            res?.data?.message || "An unexpected error occurred."
          );
        }
      } catch (error) {
        ErrorHandler(error);
      } finally {
        setLoading(false);
      }
    }
  };

  return data?.length === 0 ? (
    <Loader />
  ) : (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl lg:text-2xl font-inter font-semibold">
            All Countries
          </h2>

          {/* <div className="flex items-center gap-x-4">
            <div>
              <button className="flex items-center gap-x-2 px-2 sm:px-5 md:px-8 py-2.5 md:py-3 rounded-lg shadow-buttonShadow border border-buttonBorderColor bg-white ">
                <RiFileDownloadLine size={24} />
                <span className="font-nunito text-black">Download CSV</span>
              </button>
            </div>
          </div> */}
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => setModal("add")}
            className="rounded-lg font-inter font-medium text-white px-6 sm:px-10 py-2.5 sm:py-4 bg-theme hover:bg-white hover:text-theme border
             border-theme duration-150"
          >
            + Add Country
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data?.data?.data?.map((country, i) => (
          <CountryCard
            countryName={country?.name}
            id={country?.id}
            setModal={setModal}
            setCountryID={setCountryID}
            countryCode={country?.isoCode}
          />
        ))}
        {/* <CountryCard countryName="Denmark" countryCode="DK" />
        <CountryCard countryName="Australia" countryCode="AU" />
        <CountryCard countryName="Canada" countryCode="CA" />
        <CountryCard countryName="Austria" countryCode="AT" /> */}
      </div>

      {/* Modal */}
      <Dialog
        visible={modal === "add" || modal === "delete"}
        style={{ width: "40vw" }}
        className="font-nunito"
        onHide={() => setModal(false)}
        header={
          <div className="font-nunito font-bold text-2xl text-center">
            {modal === "add" ? "Add" : modal === "delete" ? "Delete" : ""}{" "}
            Country
          </div>
        }
      >
        {loading ? (
          <MiniLoader />
        ) : (
          <form
            onSubmit={handleAddCountry}
            className="space-y-4 flex flex-col items-center"
          >
            {/* header */}
            {/* <div className="rounded-xl border border-tabBorderColor border-opacity-40 size-28 flex items-center justify-center">
            <LuImageUp size={"100"} color="rgba(0, 0, 0, 0.6)" />
          </div> */}

            {/* body */}

            <div className="w-full space-y-4">
              {modal === "add" ? (
                <div className="flex flex-col gap-y-2 w-full">
                  <label className="text-labelColor font-medium font-satoshi">
                    Country
                  </label>
                  <Select
                    placeholder="Germany"
                    className="w-full"
                    styles={selectStyles2}
                    options={allCountriesData}
                    onChange={(e) =>
                      setCountryName({ label: e.label, value: e.value })
                    }
                  />
                </div>
              ) : (
                <p className="text-labelColor font-nunito font-medium text-lg text-center">
                  Are you sure you want to delete this Country ?
                </p>
              )}
              <div className="flex items-center justify-end gap-x-4 [&>button]:font-nunito [&>button]:py-3 [&>button]:font-medium">
                <button
                  type="button"
                  onClick={() => setModal("")}
                  className="hover:bg-theme hover:text-white duration-150 rounded-lg border border-theme text-theme shadow-buttonShadow  px-6"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg border border-theme text-white px-10 bg-theme hover:bg-white hover:text-theme duration-150"
                >
                  {modal === "add" ? "Add" : modal === "delete" ? "Delete" : ""}{" "}
                  Country
                </button>
              </div>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}
