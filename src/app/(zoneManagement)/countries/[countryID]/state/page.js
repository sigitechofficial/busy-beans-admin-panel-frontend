"use client";
import { useEffect, useState } from "react";
import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import Select from "react-select";
import selectStyles from "@/utilities/SelectStyle";
import { selectStyles2 } from "@/utilities/SelectStyle";
import { Dialog } from "primereact/dialog";
import GetAPI from "@/utilities/GetAPI";
import { useParams } from "next/navigation";
// import { CountryRegionData } from 'country-region-data';
import { allCountries } from "country-region-data";
import { MdDelete } from "react-icons/md";
import { PostAPI } from "@/utilities/PostAPI";
import { success_toaster } from "@/utilities/Toaster";
import ErrorHandler from "@/utilities/ErrorHandler";
import { DeleteAPI } from "@/utilities/DeleteAPI";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Country, State, City } from "country-state-city";
import BackButton from "@/components/ui/BackButton";

export default function States() {
  // const router = useRouter();
  const { countryID } = useParams();
  let stateListOptions = [];
  const [modal, setModal] = useState("");
  const [stateID, setStateID] = useState("");
  const [stateName, setStateName] = useState({
    value: "",
    label: "",
  });
  const { data } = GetAPI(
    `api/v1/admin/address-management/country/${countryID}`
  );
  const { data: countryStates, reFetch } = GetAPI(
    `api/v1/admin/address-management/state?countryInSystemId=${countryID}`
  );
  console.log("🚀 ~ State ~ countryStates:", countryStates);

  const columns = [
    { field: "sl", header: "SL", sort: true },
    { field: "name", header: "State Name" },
    { field: "city", header: "City" },
    { field: "action", header: "Action" },
  ];

  const stateListDatas = [];
  countryStates?.data?.data?.map((state, i) =>
    stateListDatas.push({
      sl: i + 1,
      name: state?.name,
      city: (
        <button
          type="button"
          // onClick={() =>
          //   router.push(`/countries/${countryID}/state/${state?.id}/city`)
          // }
          className="w-24 bg-theme text-white hover:bg-white hover:text-theme border border-theme duration-150 font-semibold p-2 rounded-md flex justify-center "
        >
          <Link href={`/countries/${countryID}/state/${state?.id}/city`}>
            Add City
          </Link>
        </button>
      ),
      action: (
        <button
          className="border border-red-400 rounded-md p-2 text-red-400"
          onClick={() => {
            setModal("delete");
            setStateID(state?.id);
          }}
        >
          <MdDelete size={24} />
        </button>
      ),
    })
  );

  // const stateList = allCountries?.filter(
  //   (country) => country[0] === data?.data?.data?.name
  // );
  // stateList?.[0]?.[2]?.map((state) =>
  //   stateListOptions.push({
  //     value: state[0],
  //     label: state[0],
  //   })
  // );

  const states = State.getStatesOfCountry(data?.data?.data?.isoCode);
  console.log("🚀 ~ State ~ states:", states);

  // const stateList = allCountries?.filter(
  //   (country) => country[0] === data?.data?.data?.name
  // );
  states?.map((state) =>
    stateListOptions.push({
      value: state?.isoCode,
      label: state?.name,
    })
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (modal === "add") {
      try {
        const res = await PostAPI("api/v1/admin/address-management/state", {
          name: stateName?.label,
          isoCode: stateName?.value,
          countryInSystemId: countryID,
        });
        if (res?.data?.status === "success") {
          success_toaster("State Added Successfully");
          reFetch();
          setModal("");
          setStateName({ value: "", label: "" });
        } else {
          throw new Error(
            res?.data?.message || "An unexpected error occurred."
          );
        }
      } catch (error) {
        ErrorHandler(error);
      }
    } else {
      try {
        const res = await DeleteAPI(
          `api/v1/admin/address-management/state/${stateID}`
        );
        if (res?.data?.status === "success") {
          success_toaster("State Delete Successfully");
          reFetch();
          setModal("");
          setStateID("");
        } else {
          throw new Error(
            res?.data?.message || "An unexpected error occurred."
          );
        }
      } catch (error) {
        ErrorHandler(error);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-x-2 text-xl lg:text-2xl font-inter font-semibold">
            <BackButton />
            All States
          </h2>

          <Select
            placeholder="Filters"
            className="w-40"
            styles={selectStyles}
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => setModal("add")}
            className="rounded-lg font-inter font-medium text-white px-5 sm:px-8 py-2.5 sm:py-4 bg-theme"
          >
            + Add State
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <ManagementTab
          countryCode={data?.data?.data?.isoCode}
          title={data?.data?.data?.name}
        />
        {/* <ManagementTab title="Total Countries" desc="5000" /> */}
        {/* <ManagementTab title="Total Cities" desc="55000" /> */}
      </div>

      <div>
        <MyDataTable
          columns={columns}
          data={stateListDatas}
          placeholder={"Search ..."}
          pagination={true}
        />
      </div>

      {/* Modal */}
      <Dialog
        visible={modal}
        style={{ width: "40vw" }}
        className="font-nunito"
        onHide={() => setModal(false)}
        header={
          <div className="font-nunito font-bold text-2xl text-center">
            {modal === "add" ? "Add" : modal === "delete" ? "Delete" : ""} State
          </div>
        }
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-4 flex flex-col items-center"
        >
          {/* body */}
          <div className="w-full space-y-4">
            {modal === "add" ? (
              <div className="flex flex-col gap-y-2 w-full">
                <label className="text-labelColor font-medium font-satoshi">
                  State
                </label>
                <Select
                  placeholder="Select State"
                  className="w-full"
                  styles={selectStyles2}
                  options={stateListOptions}
                  onChange={(e) =>
                    setStateName({ label: e.label, value: e.value })
                  }
                />
              </div>
            ) : (
              <p className="text-labelColor font-nunito font-medium text-lg text-center">
                Are you sure you want to delete this State ?
              </p>
            )}
            {/* <div className="flex flex-col gap-y-2 w-full">
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
            </div> */}
            <div className="flex items-center justify-end gap-x-4 [&>button]:font-nunito [&>button]:py-3 [&>button]:font-medium">
              <button
                type="button"
                onClick={() => setModal("")}
                className="rounded-lg border border-black shadow-buttonShadow  px-6"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg border border-theme text-white px-10 bg-theme"
              >
                {modal === "add" ? "Add" : modal === "delete" ? "Delete" : ""}{" "}
                State
              </button>
            </div>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
