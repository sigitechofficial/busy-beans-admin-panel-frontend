"use client";
import CityCard from "@/components/ui/CityCard";
import { Dialog } from "primereact/dialog";
import { useState } from "react";
import { RiFileDownloadLine } from "react-icons/ri";
import Select from "react-select";
import { selectStyles2 } from "@/utilities/SelectStyle";
import GetAPI from "@/utilities/GetAPI";
import { useParams } from "next/navigation";
import ManagementTab from "@/components/ui/ManagementTab";
import { Country, State, City } from "country-state-city";
import MyDataTable from "@/components/ui/MyDataTable";
import { MdDelete } from "react-icons/md";
import { PostAPI } from "@/utilities/PostAPI";
import { success_toaster } from "@/utilities/Toaster";
import ErrorHandler from "@/utilities/ErrorHandler";
import { DeleteAPI } from "@/utilities/DeleteAPI";
import BackButton from "@/components/ui/BackButton";
import ZoneEditTab from "@/components/ui/ZoneEditTab";
import { PatchAPI } from "@/utilities/PatchAPI";

export default function AddTerritory() {
  const { countryID, stateID } = useParams();
  const [modal, setModal] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [territotyName, setTerritotyName] = useState("");
  const [id, setID] = useState("");

  const { data, reFetch } = GetAPI(
    `api/v1/admin/address-management/territory?stateInSystemId=${stateID}`
  );

  const { data: territoryCities, reFetch: refetchTerritoryCities } = GetAPI(
    `api/v1/admin/address-management/city?stateInSystemId=${stateID}`
  );

  console.log("🚀 ~ AddTerritory ~ territoryCities:", territoryCities?.data);

  const { data: countryData } = GetAPI(
    `api/v1/admin/address-management/country/${countryID}`
  );

  const { data: stateData } = GetAPI(
    `api/v1/admin/address-management/state/${stateID}`
  );

  const territoryColumns = [
    { field: "sl", header: "SL", sort: true },
    { field: "name", header: "City Name", sort: true },
  ];

  const territoryCitiesDatas = [];
  //   const territoryCitiesNotIncludedDatas = [];

  territoryCities?.data?.data?.map(
    (city, i) =>
      !city?.territoryId &&
      territoryCitiesDatas.push({
        id: city?.id,
        sl: i + 1,
        name: city?.name,
      })
  );

  const handleDeleteCity = (id, modalStatus) => {
    setModal(modalStatus);
    setID(id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (modal === "delete") {
      try {
        const res = await PatchAPI(
          `api/v1/admin/address-management/city/${id}`,
          {
            territoryId: null,
          }
        );
        if (res?.data?.status === "success") {
          success_toaster("City Delete Successfully");
          reFetch();
          refetchTerritoryCities();
          setModal("");
          setID("");
        } else {
          throw new Error(
            res?.data?.message || "An unexpected error occurred."
          );
        }
      } catch (error) {
        ErrorHandler(error);
      }
    } else if (modal === "deleteTerritory") {
      try {
        const res = await DeleteAPI(
          `api/v1/admin/address-management/territory/${id}`
        );
        if (res?.data?.status === "success") {
          success_toaster("Territory Deleted Successfully");
          reFetch();
          refetchTerritoryCities();
          setModal("");
          setID("");
        } else {
          throw new Error(
            res?.data?.message || "An unexpected error occurred."
          );
        }
      } catch (error) {
        ErrorHandler(error);
      }
    } else if (modal === "territory") {
      const citiesID = [];
      selectedRows?.map((city, i) => citiesID.push(city?.id));
      try {
        const res = await PostAPI("api/v1/admin/address-management/territory", {
          name: territotyName,
          countryInSystemId: countryID,
          stateInSystemId: stateID,
          cities: citiesID,
        });
        if (res?.data?.status === "success") {
          success_toaster("Territory Created Successfully");
          reFetch();
          refetchTerritoryCities();
          setModal("");
          setTerritotyName("");
          setSelectedRows([]);
        } else {
          throw new Error(
            res?.data?.message || "An unexpected error occurred."
          );
        }
      } catch (error) {
        ErrorHandler(error);
      }
    } else if (modal === "edit") {
      const citiesID = [];
      selectedRows?.map((city, i) => citiesID.push(city?.id));
      try {
        const res = await PatchAPI(
          `api/v1/admin/address-management/add-cities-in-territory/${id}`,
          {
            cities: citiesID,
          }
        );
        if (res?.data?.status === "success") {
          success_toaster("Territory Updated Successfully");
          reFetch();
          refetchTerritoryCities();
          setModal("");
          setTerritotyName("");
          setSelectedRows([]);
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
            <BackButton /> Territory Details
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
            onClick={() => setModal("territory")}
            className="rounded-lg font-inter font-medium text-white px-6 sm:px-10 py-2.5 sm:py-4 bg-theme"
          >
            + Add Territory
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <ManagementTab
          countryCode={countryData?.data?.data?.isoCode}
          title={countryData?.data?.data?.name}
        />
        <CityCard name={stateData?.data?.data?.name} />
        {/* <CityCard name="Munich" />
        <CityCard name="Frankfurt" />
        <CityCard name="Heidelberg" />
        <CityCard name="Chemnitz" /> */}
      </div>

      <div className="space-y-6">
        {data?.data?.results.map((territory, i) => (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <ZoneEditTab
                id={territory?.id}
                handleDeleteCity={handleDeleteCity}
                handleEditTerritory={() => {
                  setModal("edit");
                  setTerritotyName(territory?.name);
                  setID(territory?.id);
                }}
                name={territory?.name}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-4">
              {territory?.cityInSystems?.map((city, i) => (
                <CityCard
                  id={city?.id}
                  handleDeleteCity={handleDeleteCity}
                  name={city?.name}
                  delete={true}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Dialog
        visible={
          modal === "territory" ||
          modal === "delete" ||
          modal === "deleteTerritory" ||
          modal === "edit"
        }
        style={{ width: "50vw" }}
        className="font-nunito"
        onHide={() => setModal(false)}
        header={
          <div className="font-nunito font-bold text-2xl text-center">
            {modal === "territory"
              ? "Add Territoty"
              : modal === "deleteTerritory"
              ? "Delete Territory"
              : "Delete City"}
          </div>
        }
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-4 flex flex-col items-center"
        >
          {/* body */}
          <div className="w-full space-y-4">
            {modal === "delete" || modal === "deleteTerritory" ? (
              <p className="text-labelColor font-nunito font-medium text-lg text-center">
                Are you sure you want to delete this{" "}
                {modal === "deleteTerritory" ? "Delete Territory" : "City"} ?
              </p>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col gap-y-2">
                  <label
                    htmlFor="territotyName"
                    className=" text-labelColor font-workSans font-semibold"
                  >
                    Territoy Name
                  </label>
                  <input
                    type="text"
                    id="territotyName"
                    disabled={modal === "edit" ? true : false}
                    name="territotyName"
                    placeholder="Enter Territoy name"
                    value={territotyName}
                    onChange={(e) => setTerritotyName(e.target.value)}
                    className="h-[42px] rounded-md px-3 outline-none border font-workSans font-medium 
                            text-labelColor disabled:cursor-not-allowed"
                  />
                </div>

                <MyDataTable
                  columns={territoryColumns}
                  data={territoryCitiesDatas}
                  placeholder={"Search ..."}
                  pagination={true}
                  hide={true}
                  checkbox={true}
                  selectedRows={selectedRows}
                  setSelectedRows={setSelectedRows}
                />
              </div>
            )}
            <div className="flex items-center justify-end gap-x-4 [&>button]:font-nunito [&>button]:py-3 [&>button]:font-medium">
              <button
                type="button"
                onClick={() => {
                  setModal("");
                  setTerritotyName("");
                  setID("");
                  setSelectedRows([]);
                }}
                className="rounded-lg border border-black shadow-buttonShadow  px-6"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg border border-theme text-white px-10 bg-theme"
              >
                {modal === "territory"
                  ? "Add Territoty"
                  : modal === "deleteTerritory"
                  ? "Delete Territory"
                  : modal === "edit"
                  ? "Update Territory"
                  : "Delete City"}
              </button>
            </div>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
