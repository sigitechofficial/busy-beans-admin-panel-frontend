"use client";
import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import Select from "react-select";
import selectStyles from "@/utilities/SelectStyle";
import HomeMiniCards from "@/components/ui/HomeMiniCards";
import { useRouter } from "next/navigation";
import { useState } from "react";
import GetAPI from "@/utilities/GetAPI";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Switch from "react-switch";
import ErrorHandler from "@/utilities/ErrorHandler";
import { PatchAPI } from "@/utilities/PatchAPI";
import { success_toaster } from "@/utilities/Toaster";
import { DeleteAPI } from "@/utilities/DeleteAPI";
import MiniLoader from "@/components/ui/MiniLoader";
import { Dialog } from "primereact/dialog";
import Loader from "@/components/ui/Loader";
import { useDataContext } from "@/utilities/DataContext";
import { CiMenuBurger } from "react-icons/ci";
import { hasPermission } from "@/utilities/Permission";

export default function Suppliers() {
  const router = useRouter();
  const [supplierID, setSupplierID] = useState("");
  const [loader, setLoader] = useState("");
  const [modal, setModal] = useState("");

  const { data, reFetch } = GetAPI("api/v1/admin/supplier/?sort=-createdAt", "supplier");

  const handleStatus = async (id, status) => {
    try {
      const res = await PatchAPI(`api/v1/admin/supplier/${id}`, {
        status: !status,
      }, "supplier");
      if (res?.data?.status === "success") {
        success_toaster("Status updated successfully");
        reFetch();
      } else {
        throw new Error(res?.data?.message || "An unexpected error occurred.");
      }
    } catch (error) {
      ErrorHandler(error);
    }
  };

  const handleModalClose = () => {
    setModal("");
    setSupplierID("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoader("delete");
    try {
      const res = await DeleteAPI(`api/v1/admin/supplier/${supplierID}`, "supplier");
      if (res?.data?.status === "success") {
        success_toaster("Supplier Deleted Successfully");
        reFetch();
        setModal("");
        setLoader("");
      }
    } catch (error) {
      ErrorHandler(error);
      setLoader("");
    }
  };
  const columns = [
    // { field: "sl", header: "SL", sort: true },
    { field: "supplierName", header: "supplierName" },
    { field: "email", header: "email" },
    { field: "address", header: "Address" },
    { field: "phoneNum", header: "phoneNum" },
    // { field: "addressOne", header: "addressOne" },
    // { field: "addressTwo", header: "addressTwo" },
    // {
    //   field: "businessRegistrationNumber",
    //   header: "businessRegistrationNumber",
    // },
    // { field: "supplierType", header: "supplierType" },
    // { field: "registerDate", header: "registerDate" },

    // { field: "bankAccount", header: "bankAccount" },
    // { field: "registerBy", header: "registerBy" },
    // {
    //   field: "currentStatus",
    //   header: "Current Status",
    // },
    {
      field: "changeStatus",
      header: "Change Status",
    },
    // { field: "action", header: "Action" },
  ];

  const datas = [];
  data?.data?.data?.map((supplier, i) => {
    datas.push({
      sl: i + 1,
      id: supplier?.id,
      supplierName: supplier?.supplierName,
      email: supplier?.email,
      address: `${supplier?.addressOne}, ${supplier?.addressTwo}, ${supplier?.city}, ${supplier?.state}, ${supplier?.zipCode}, ${supplier?.country}`,
      phoneNum: supplier?.countryCode + supplier?.phoneNum,
      // addressOne: supplier?.addressOne,
      // addressTwo: supplier?.addressTwo,
      businessRegistrationNumber: supplier?.businessRegistrationNumber,
      supplierType: supplier?.supplierType,
      registerDate: supplier?.registerDate,
      bankAccount: supplier?.bankAccount,
      registerBy: supplier?.registerBy,
      currentStatus: (
        <div>
          {supplier?.status ? (
            <div className="w-24 bg-theme text-white font-semibold p-2 rounded-md flex justify-center">
              Active
            </div>
          ) : (
            <div className="w-24 bg-[#EE4A4A14] text-[#EE4A4A] font-semibold p-2 rounded-md flex justify-center">
              Inactive
            </div>
          )}
        </div>
      ),
      changeStatus: (
        hasPermission("supplier_update") ? (
        <label className="flex items-center gap-2 ">
          <div>
            {supplier?.status ? (
              <div className="w-max text-xs bg-theme text-white font-semibold p-2 rounded-md flex justify-center">
                Active
              </div>
            ) : (
              <div className="w-max text-xs bg-[#EE4A4A14] text-[#EE4A4A] font-semibold p-2 rounded-md flex justify-center">
                Inactive
              </div>
            )}
          </div>
          <Switch
            onChange={() => {
              handleStatus(supplier?.id, supplier?.status);
            }}
            checked={supplier?.status}
            uncheckedIcon={false}
            checkedIcon={false}
            onColor="#86644c"
            onHandleColor="#fff"
            className="react-switch"
            boxShadow="none"
          />
        </label>
        ) : (
        <span className="text-gray-400">No Access</span>
        )
      ),
      // action: (
      //   <div className="flex gap-x-2">
      //     <button
      //       too
      //       className="border border-theme rounded-md p-2 text-theme"
      //       // onClick={() => {
      //       //   setName(cat?.name);
      //       //   setModal("edit");
      //       //   setCategoryID(cat?.id);
      //       // }}
      //       onClick={() => router.push(`/suppliers/edit/${supplier?.id}`)}
      //     >
      //       <FaEdit size={24} />
      //     </button>
      //     <button
      //       className="border border-red-400 rounded-md p-2 text-red-400"
      //       onClick={() => {
      //         setModal("delete");
      //         setSupplierID(supplier?.id);
      //       }}
      //     >
      //       <MdDelete size={24} />
      //     </button>
      //   </div>
      // ),
    });
  });
  const { toggle, setToggle } = useDataContext();

  return data?.length === 0 ? (
    <Loader />
  ) : (
    <div>
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed">
        <div className="flex items-center gap-2">
          <p
            onClick={() => setToggle(!toggle)}
            className="cursor-pointer md:hidden"
          >
            <CiMenuBurger size={20} />
          </p>
          <h2 className="text-xl font-inter font-semibold">
            Supplier Management
          </h2>
        </div>
      </div>

      <div className="space-y-8 pb-6 pt-28 2xl:pt-32 px-6 2xl:px-12">
        <div className="space-y-4">
          {/* <div className="flex items-center justify-between">
            <h2 className="text-xl lg:text-2xl font-inter font-semibold">
              Supplier Management
            </h2>

            <Select
            placeholder="Filters"
            className="w-40"
            styles={selectStyles}
          />
          </div> */}
          <div className="flex justify-end">
            {hasPermission("supplier_create") && (
            <button
              onClick={() => router.push("/suppliers/add")}
              className="rounded-lg font-inter font-medium text-white px-2 sm:px-3 py-2.5 sm:py-4 bg-theme"
            >
              + Add New Supplier
            </button> )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid  grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <ManagementTab
              title="Total Supplier"
              desc={data?.data?.data?.length}
            />
            {/* <ManagementTab title="New Supplier" desc="5000" />
          <ManagementTab title="Pending Request" desc="500" />
          <ManagementTab title="Active Supplier" desc="55,000" />
          <ManagementTab title="Inactive supplier" desc="18,000" /> */}
          </div>

          {/* <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mt-12">
          <HomeMiniCards
            title="Total Earning"
            // description="The bookings that are booked and an employee has been assigned to them."
            total={"$2000"}
            // Icon={FiBox}
          />
          <HomeMiniCards
            title="Payable Balance"
            total={"$2000"}
            // Icon={LuPackageCheck}
          />
          <HomeMiniCards
            title="Total Withdrawn"
            total={"$2000"}
            // Icon={LuPackageX}
          />
          <HomeMiniCards
            title="Pending"
            // description="The bookings in which minimum 1 service is not assigned to any employee"
            total={"$2000"}
            // Icon={FiBox}
          />
        </div> */}
        </div>

        <div>
          <MyDataTable
            columns={columns}
            data={datas}
            placeholder={"Search ..."}
            pagination={true}
            search={true}
            onRowClick={(e) => router.push(`/suppliers/details/${e?.data?.id}`)}
          />
        </div>

        <Dialog
          visible={modal === "delete"}
          style={{ width: "40vw" }}
          className="font-nunito"
          onHide={handleModalClose}
          header={
            <div className="font-nunito font-bold text-2xl text-center">
              Delete Supplier
            </div>
          }
        >
          <form
            onSubmit={handleSubmit}
            className="space-y-4 flex flex-col items-center"
          >
            {/* body */}
            {loader === "delete" ? (
              <MiniLoader />
            ) : (
              <div className="w-full space-y-4">
                {modal === "delete" && (
                  <p className="text-labelColor font-nunito font-medium text-lg text-center">
                    Are you sure you want to delete this Suuplier ?
                  </p>
                )}
                <div className="flex items-center justify-end gap-x-4 [&>button]:font-nunito [&>button]:py-3 [&>button]:font-medium">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="hover:bg-theme hover:text-white duration-150 rounded-lg border border-theme text-theme shadow-buttonShadow  px-6"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg border border-theme text-white px-10 bg-theme"
                  >
                    Delete Supplier
                  </button>
                </div>
              </div>
            )}
          </form>
        </Dialog>
      </div>
    </div>
  );
}
