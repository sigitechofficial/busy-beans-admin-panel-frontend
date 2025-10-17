"use client";
export const dynamic = "force-dynamic";
import CityCard from "@/components/ui/CityCard";
import { Dialog } from "primereact/dialog";
import { useState } from "react";
import { RiFileDownloadLine } from "react-icons/ri";
import Select from "react-select";
import { selectStyles2 } from "@/utilities/SelectStyle";
import GetAPI from "@/utilities/GetAPI";
import { useParams, useRouter } from "next/navigation";
import ManagementTab from "@/components/ui/ManagementTab";
import { Country, State, City } from "country-state-city";
import MyDataTable from "@/components/ui/MyDataTable";
import { MdDelete } from "react-icons/md";
import { PostAPI } from "@/utilities/PostAPI";
import { info_toaster, success_toaster } from "@/utilities/Toaster";
import ErrorHandler from "@/utilities/ErrorHandler";
import { DeleteAPI } from "@/utilities/DeleteAPI";
import BackButton from "@/components/ui/BackButton";
import Loader from "@/components/ui/Loader";
import MiniLoader from "@/components/ui/MiniLoader";
import { hasPermission } from "@/utilities/Permission";
import { CITIES } from "../../../../country.testid";

export default function Cities() {
  const router = useRouter();
  const citiesDataOptions = [];
  const [loading, setLoading] = useState(false);
  const { countryID, stateID } = useParams();
  const [modal, setModal] = useState("");
  const [cityID, setCityID] = useState("");
  const [cityName, setCityName] = useState({
    value: "",
    label: "",
  });

  const { data, reFetch, isLoading } = GetAPI(
    `api/v1/admin/address-management/city?stateInSystemId=${stateID}`
  );

  const { data: countryData } = GetAPI(
    `api/v1/admin/address-management/country/${countryID}`
  );

  const { data: stateData } = GetAPI(
    `api/v1/admin/address-management/state/${stateID}`
  );

  const cities = City.getCitiesOfState(
    countryData?.data?.data?.isoCode,
    stateData?.data?.data?.isoCode
  );
  cities?.map((city, i) =>
    citiesDataOptions.push({
      label: city?.name,
      value: city?.name,
    })
  );

  const datas = [];
  const columns = [
    { field: "sl", header: "SL", sort: true },
    { field: "name", header: "City Name", sort: true },
    { field: "action", header: "action", sort: true },
  ];

  data?.data?.data?.map((city, i) =>
    datas.push({
      id: city?.id,
      sl: i + 1,
      name: city?.name,
      action: (
        <>
        {hasPermission("country_delete") && (
        <button
          className="border border-red-400 rounded-md p-2 text-red-400"
          onClick={() => {
            setModal("delete");
            setCityID(city?.id);
          }}
        >
          <MdDelete size={24} />
        </button> )}
        </>
      ),
    })
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (modal === "add") {
      if (!cityName?.value || !cityName?.label) {
        info_toaster("Select city name");
      } else {
        setLoading(true);
        try {
          const res = await PostAPI("api/v1/admin/address-management/city", {
            name: cityName?.value,
            countryInSystemId: countryID,
            stateInSystemId: stateID,
          });
          if (res?.data?.status === "success") {
            success_toaster("City Added Successfully");
            reFetch();
            setModal("");
            setCityName({ value: "", label: "" });
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
          `api/v1/admin/address-management/city/${cityID}`
        );
        if (res?.data?.status === "success") {
          success_toaster("City Delete Successfully");
          reFetch();
          setModal("");
          setCityID("");
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
 
  return isLoading ? (
      <Loader />
    ) : (
    <div className="w-full" data-testid={CITIES.root}>
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed"
       data-testid={CITIES.headerBar}>
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-x-2 text-xl lg:text-2xl font-inter font-semibold" data-testid={CITIES.title}>
            <BackButton /> All Cities
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
          {hasPermission("country_create") && (
          <button
            onClick={() => setModal("add")}
            className="rounded-lg font-inter font-medium text-white px-6 sm:px-10 py-2.5 sm:py-4 bg-theme hover:bg-white hover:text-theme border border-theme duration-150"
            data-testid={CITIES.addCityBtn}
          >
            + Add City
          </button> )}
          {hasPermission("country_create") && (
          <button
            // onClick={() => setModal("territory")}
            onClick={() =>
              router.push(
                `/countries/${countryID}/state/${stateID}/add-territory`
              )
            }
            className="text-theme bg-white border border-theme hover:text-white hover:bg-theme duration-150 rounded-lg font-inter font-medium px-6 sm:px-10 py-2.5 sm:py-4 "
            data-testid={CITIES.addTerritoryBtn}
          >
            + Add Territory
          </button> )}
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

      <div>
        <MyDataTable
          columns={columns}
          data={datas}
          placeholder={"Search ..."}
          pagination={true}
          search={true}
          //   checkbox={true}
          //   selectedRows={selectedRows}
          //   setSelectedRows={setSelectedRows}
          rowTestId={(row) => `data-testid-${CITIES.row(row.id)}`}
        />
      </div>
      </div>

      {/* Modal */}
      <Dialog
        visible={modal === "add" || modal === "delete"}
        style={{ width: "50vw" }}
        className="font-nunito"
        data-testid={CITIES.cityModal}
        onHide={() => setModal(false)}
        header={
          <div className="font-nunito font-bold text-2xl text-center" data-testid={CITIES.cityModalTitle}>
            {modal === "add" ? "Add" : "Delete"} City
          </div>
        }
      >
        {loading ? (
          <MiniLoader />
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 flex flex-col items-center"
          >
            {/* body */}
            <div className="w-full space-y-4" data-testid={CITIES.cityModalBody}>
              {modal === "add" ? (
                <div className="flex flex-col gap-y-2 w-full">
                  <label className="text-labelColor font-medium font-satoshi">
                    City
                  </label>
                  <Select
                    placeholder="Select City"
                    className="w-full"
                    styles={selectStyles2}
                    options={citiesDataOptions}
                    onChange={(e) =>
                      setCityName({ label: e.label, value: e.value })
                    }
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    data-testid={CITIES.citySelectDropdown}
                  />
                </div>
              ) : (
                <p className="text-labelColor font-nunito font-medium text-lg text-center">
                  Are you sure you want to delete this City?
                </p>
              )}
              <div className="flex items-center justify-end gap-x-4 [&>button]:font-nunito [&>button]:py-3 [&>button]:font-medium">
                <button
                  type="button"
                  onClick={() => {
                    setModal("");
                    setTerritotyName("");
                    setCityID("");
                    setSelectedRows([]);
                  }}
                  className="hover:bg-theme hover:text-white duration-150 rounded-lg border border-theme text-theme shadow-buttonShadow  px-6"
                  data-testid={CITIES.cityModalCancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="hover:bg-white hover:text-theme duration-150 rounded-lg border border-theme text-white px-10 bg-theme"
                  data-testid={CITIES.cityModalSubmitBtn}
                >
                  {modal === "add" ? "Add" : "Delete"} City
                </button>
              </div>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}

// "use client";
// export const dynamic = "force-dynamic";
// import CityCard from "@/components/ui/CityCard";
// import { Dialog } from "primereact/dialog";
// import { useState } from "react";
// import { RiFileDownloadLine } from "react-icons/ri";
// import Select from "react-select";
// import { selectStyles2 } from "@/utilities/SelectStyle";
// import GetAPI from "@/utilities/GetAPI";
// import { useParams, useRouter } from "next/navigation";
// import ManagementTab from "@/components/ui/ManagementTab";
// import { Country, State, City } from "country-state-city";
// import MyDataTable from "@/components/ui/MyDataTable";
// import { MdDelete } from "react-icons/md";
// import { PostAPI } from "@/utilities/PostAPI";
// import { info_toaster, success_toaster } from "@/utilities/Toaster";
// import ErrorHandler from "@/utilities/ErrorHandler";
// import { DeleteAPI } from "@/utilities/DeleteAPI";
// import BackButton from "@/components/ui/BackButton";
// import Loader from "@/components/ui/Loader";
// import MiniLoader from "@/components/ui/MiniLoader";

// export default function Cities() {
//   const router = useRouter();
//   const citiesDataOptions = [];
//   const [loading, setLoading] = useState(false);
//   const { countryID, stateID } = useParams();
//   const [modal, setModal] = useState("");
//   const [cityID, setCityID] = useState("");
//   const [cityName, setCityName] = useState({
//     value: "",
//     label: "",
//   });
//   const [citiesList, setCitiesList] = useState([]);

//   const { data, reFetch } = GetAPI(
//     `api/v1/admin/address-management/city?stateInSystemId=${stateID}`
//   );
//   console.log("🚀 ~ Cities ~ data:", data?.data)

//   const { data: countryData } = GetAPI(
//     `api/v1/admin/address-management/country/${countryID}`
//   );

//   const { data: stateData } = GetAPI(
//     `api/v1/admin/address-management/state/${stateID}`
//   );

//   const cities = City.getCitiesOfState(
//     countryData?.data?.data?.isoCode,
//     stateData?.data?.data?.isoCode
//   );
//   cities?.map((city, i) =>
//     citiesDataOptions.push({
//       label: city?.name,
//       value: city?.name,
//     })
//   );

//   const datas = [];
//   const columns = [
//     { field: "sl", header: "SL", sort: true },
//     { field: "name", header: "City Name", sort: true },
//     { field: "action", header: "action", sort: true },
//   ];

//   data?.data?.data?.map((city, i) =>
//     datas.push({
//       id: city?.id,
//       sl: i + 1,
//       name: city?.name,
//       action: (
//         <button
//           className="border border-red-400 rounded-md p-2 text-red-400"
//           onClick={() => {
//             setModal("delete");
//             setCityID(city?.id);
//           }}
//         >
//           <MdDelete size={24} />
//         </button>
//       ),
//     })
//   );

//   const handleSelectAllCities = () => {
//     const allCities = [];
//     cities?.map((city, i) => allCities.push(city?.name, i));
//     setCitiesList([...allCities]);
//     console.log("🚀 ~ handleSelectAllCities ~ allCities:", allCities)
//     success_toaster("All Cities Selected");
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (modal === "add") {
//       // if (!cityName?.value || !cityName?.label) {
//       //   info_toaster("Select city name");
//       // } else {
//       setLoading(true);
//       try {
//         const res = await PostAPI("api/v1/admin/address-management/city", {
//           name: citiesList,
//           countryInSystemId: countryID,
//           stateInSystemId: stateID,
//         });
//         if (res?.data?.status === "success") {
//           success_toaster("City Added Successfully");
//           reFetch();
//           setModal("");
//           setCityName({ value: "", label: "" });
//         } else {
//           throw new Error(
//             res?.data?.message || "An unexpected error occurred."
//           );
//         }
//       } catch (error) {
//         ErrorHandler(error);
//       } finally {
//         setLoading(false);
//       }
//       // }
//     } else {
//       setLoading(true);
//       try {
//         const res = await DeleteAPI(
//           `api/v1/admin/address-management/city/${cityID}`
//         );
//         if (res?.data?.status === "success") {
//           success_toaster("City Delete Successfully");
//           reFetch();
//           setModal("");
//           setCityID("");
//         } else {
//           throw new Error(
//             res?.data?.message || "An unexpected error occurred."
//           );
//         }
//       } catch (error) {
//         ErrorHandler(error);
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   return data?.length === 0 ? (
//     <Loader />
//   ) : (
//     <div className="space-y-8">
//       <div className="space-y-4">
//         <div className="flex items-center justify-between">
//           <h2 className="flex items-center gap-x-2 text-xl lg:text-2xl font-inter font-semibold">
//             <BackButton /> All Cities
//           </h2>

//           {/* <div className="flex items-center gap-x-4">
//             <div>
//               <button className="flex items-center gap-x-2 px-2 sm:px-5 md:px-8 py-2.5 md:py-3 rounded-lg shadow-buttonShadow border border-buttonBorderColor bg-white ">
//                 <RiFileDownloadLine size={24} />
//                 <span className="font-nunito text-black">Download CSV</span>
//               </button>
//             </div>
//           </div> */}
//         </div>
//         <div className="flex gap-x-2 justify-end">
//           <button
//             onClick={() => setModal("add")}
//             className="rounded-lg font-inter font-medium text-white px-6 sm:px-10 py-2.5 sm:py-4 bg-theme hover:bg-white hover:text-theme border border-theme duration-150"
//           >
//             + Add City
//           </button>
//           <button
//             // onClick={() => setModal("territory")}
//             onClick={() =>
//               router.push(
//                 `/countries/${countryID}/state/${stateID}/add-territory`
//               )
//             }
//             className="text-theme bg-white border border-theme hover:text-white hover:bg-theme duration-150 rounded-lg font-inter font-medium px-6 sm:px-10 py-2.5 sm:py-4 "
//           >
//             + Add Territory
//           </button>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//         <ManagementTab
//           countryCode={countryData?.data?.data?.isoCode}
//           title={countryData?.data?.data?.name}
//         />
//         <CityCard name={stateData?.data?.data?.name} />
//         {/* <CityCard name="Munich" />
//         <CityCard name="Frankfurt" />
//         <CityCard name="Heidelberg" />
//         <CityCard name="Chemnitz" /> */}
//       </div>

//       <div>
//         <MyDataTable
//           columns={columns}
//           data={datas}
//           placeholder={"Search ..."}
//           pagination={true}
//           //   checkbox={true}
//           //   selectedRows={selectedRows}
//           //   setSelectedRows={setSelectedRows}
//         />
//       </div>

//       {/* Modal */}
//       <Dialog
//         visible={modal === "add" || modal === "delete"}
//         style={{ width: "50vw" }}
//         className="font-nunito"
//         onHide={() => setModal(false)}
//         header={
//           <div className="font-nunito font-bold text-2xl text-center">
//             {modal === "add" ? "Add" : "Delete"} City
//           </div>
//         }
//       >
//         {loading ? (
//           <MiniLoader />
//         ) : (
//           <form
//             onSubmit={handleSubmit}
//             className="space-y-4 flex flex-col items-center"
//           >
//             {/* body */}
//             <div className="w-full space-y-4">
//               {modal === "add" ? (
//                 <>
//                   <div className="flex justify-end w-full">
//                     <button
//                       onClick={handleSelectAllCities}
//                       type="button"
//                       className="hover:bg-white hover:text-theme duration-150 rounded-lg border py-3 border-theme text-white px-10 bg-theme"
//                     >
//                       Select All Cities
//                     </button>
//                   </div>
//                   <div className="flex flex-col gap-y-2 w-full">
//                     <label className="text-labelColor font-medium font-satoshi">
//                       City
//                     </label>
//                     <Select
//                       placeholder="Select City"
//                       className="w-full"
//                       styles={selectStyles2}
//                       options={citiesDataOptions}
//                       onChange={(e) =>
//                         setCityName({ label: e.label, value: e.value })
//                       }
//                       menuPortalTarget={document.body}
//                       menuPosition="fixed"
//                     />
//                   </div>
//                 </>
//               ) : (
//                 <p className="text-labelColor font-nunito font-medium text-lg text-center">
//                   Are you sure you want to delete this City?
//                 </p>
//               )}
//               <div className="flex items-center justify-end gap-x-4 [&>button]:font-nunito [&>button]:py-3 [&>button]:font-medium">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setModal("");
//                     setTerritotyName("");
//                     setCityID("");
//                     setSelectedRows([]);
//                   }}
//                   className="hover:bg-theme hover:text-white duration-150 rounded-lg border border-theme text-theme shadow-buttonShadow  px-6"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="hover:bg-white hover:text-theme duration-150 rounded-lg border border-theme text-white px-10 bg-theme"
//                 >
//                   {modal === "add" ? "Add" : "Delete"} City
//                 </button>
//               </div>
//             </div>
//           </form>
//         )}
//       </Dialog>
//     </div>
//   );
// }
