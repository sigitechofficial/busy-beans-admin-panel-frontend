/* eslint-disable react/jsx-key */
"use client";
export const dynamic = "force-dynamic";
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
import { info_toaster, success_toaster } from "@/utilities/Toaster";
import ErrorHandler from "@/utilities/ErrorHandler";
import { DeleteAPI } from "@/utilities/DeleteAPI";
import BackButton from "@/components/ui/BackButton";
import ZoneEditTab from "@/components/ui/ZoneEditTab";
import { PatchAPI } from "@/utilities/PatchAPI";
import Loader from "@/components/ui/Loader";
import { TERRITORY } from "../../../../country.testid";

export default function AddTerritory() {
  const { countryID, stateID } = useParams();
  const [loading, setLoading] = useState(false);
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
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    } else if (modal === "deleteTerritory") {
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    } else if (modal === "territory") {
      if (selectedRows.length === 0) {
        info_toaster("No City is Selected");
      } else if (!territotyName) {
        info_toaster("Enter Territory Name");
      } else {
        const citiesID = [];
        selectedRows?.map((city, i) => citiesID.push(city?.id));
        setLoading(true);
        try {
          const res = await PostAPI(
            "api/v1/admin/address-management/territory",
            {
              name: territotyName,
              countryInSystemId: countryID,
              stateInSystemId: stateID,
              cities: citiesID,
            }
          );
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
        } finally {
          setLoading(false);
        }
      }
    } else if (modal === "edit") {
      if (selectedRows.length === 0) {
        info_toaster("No City is Selected");
      } else {
        setLoading(true);
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
        } finally {
          setLoading(false);
        }
      }
    }
  };

  return data?.length === 0 ? (
    <Loader />
  ) : (
    <div className="w-full" data-testid={TERRITORY.root}>
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed"
      data-testid={TERRITORY.headerBar}>
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-x-2 text-xl lg:text-2xl font-inter font-semibold" data-testid={TERRITORY.title}>
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
      </div>

      <div className="space-y-8 pb-6 pt-28 2xl:pt-32 px-6 2xl:px-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="flex items-center gap-4 justify-end col-span-1 sm:col-span-2 xl:col-span-4">
          <button
            onClick={() => setModal("territory")}
            className="rounded-lg font-inter font-medium text-white bg-theme hover:bg-white hover:text-theme border border-theme duration-150 px-6 sm:px-10 py-2.5 sm:py-4"
            data-testid={TERRITORY.addTerritoryBtn}
          >
            + Add Territory
          </button>
        </div>
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

      {data?.data?.results?.length === 0 ? (
        <p className="text-red-500 text-center text-xl font-inter font-bold">
          No Territory Found !
        </p>
      ) : (
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
      )}
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
         data-testid={TERRITORY.territoryModal}
        header={
          <div className="font-nunito font-bold text-2xl text-center" data-testid={TERRITORY.territoryModalTitle}>
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
          <div className="w-full space-y-4" data-testid={TERRITORY.territoryModalBody}>
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
                    data-testid={TERRITORY.territoryNameInput}
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
                  search={true}
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
                className="hover:bg-theme hover:text-white duration-150 rounded-lg border border-theme text-theme shadow-buttonShadow  px-6"
                data-testid={TERRITORY.territoryModalCancelBtn}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg border border-theme text-white bg-theme hover:bg-white hover:text-theme duration-150 px-10"
                data-testid={TERRITORY.territoryModalSubmitBtn}
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
