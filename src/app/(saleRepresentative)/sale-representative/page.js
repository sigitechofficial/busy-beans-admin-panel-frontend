"use client";
import HomeMiniCards from "@/components/ui/HomeMiniCards";
import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import Select from "react-select";
import selectStyles from "@/utilities/SelectStyle";
import { FaEdit, FaEye } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Switch from "react-switch";
import GetAPI from "@/utilities/GetAPI";
import ErrorHandler from "@/utilities/ErrorHandler";
import { success_toaster } from "@/utilities/Toaster";
import { PatchAPI } from "@/utilities/PatchAPI";
import { useState } from "react";
import { Dialog } from "primereact/dialog";
import MiniLoader from "@/components/ui/MiniLoader";
import { DeleteAPI } from "@/utilities/DeleteAPI";
import { useRouter } from "next/navigation";
import Loader from "@/components/ui/Loader";

export default function SaleRepresentative() {
  const router = useRouter();
  const [modal, setModal] = useState("");
  const [saleRepresentativeID, setSaleRepresentativeID] = useState("");
  const [loader, setLoader] = useState("");

  const { data, reFetch } = GetAPI("api/v1/admin/sales-rep");

  const handleStatus = async (id, status) => {
    try {
      const res = await PatchAPI(`api/v1/admin/sales-rep/${id}`, {
        status: !status,
      });
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
    setSaleRepresentativeID("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoader("delete");
    try {
      const res = await DeleteAPI(
        `api/v1/admin/sales-rep/${saleRepresentativeID}`
      );
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
    { field: "sl", header: "SL", sort: true },
    { field: "srName", header: "Name" },
    { field: "email", header: "email" },
    { field: "address", header: "Address" },
    { field: "phoneNum", header: "phoneNum" },

    { field: "registerDate", header: "registerDate" },

    { field: "registerBy", header: "registerBy" },
    { field: "creditLimit", header: "Credit Limit" },
    {
      field: "currentStatus",
      header: "Current Status",
    },
    {
      field: "changeStatus",
      header: "Change Status",
    },
    { field: "action", header: "Action" },
  ];

  const datas = [];
  data?.data?.data?.map((sR, i) => {
    datas.push({
      sl: i + 1,
      srName: sR?.srName,
      email: sR?.email,
      address: `${sR?.address}, ${sR?.city}, ${sR?.state}, ${sR?.country}`,
      phoneNum: `${sR?.countryCode} ${sR?.phoneNumber}`,
      sRType: sR?.sRType,
      registerDate: sR?.registerDate ?? "No date found",
      registerBy: sR?.registerBy,
      creditLimit: `$${sR?.creditLimit}`,
      currentStatus: (
        <div>
          {sR?.status ? (
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
        <label>
          <Switch
            onChange={() => {
              handleStatus(sR?.id, sR?.status);
            }}
            checked={sR?.status}
            uncheckedIcon={false}
            checkedIcon={false}
            onColor="#86644c"
            onHandleColor="#fff"
            className="react-switch"
            boxShadow="none"
          />
        </label>
      ),
      // /orders/pending-pullouts
      action: (
        <div className="flex gap-x-2">
          <button
            className="border border-yellow-400 rounded-md p-2 text-yellow-400"
            onClick={() => {
              router.push(`/orders/pending-pullouts/${sR?.id}`);
            }}
          >
            <FaEye size={24} />
          </button>
          <button
            className="border border-theme rounded-md p-2 text-theme"
            onClick={() => router.push(`/sale-representative/edit/${sR?.id}`)}
          >
            <FaEdit size={24} />
          </button>
          <button
            className="border border-red-400 rounded-md p-2 text-red-400"
            onClick={() => {
              setModal("delete");
              setSaleRepresentativeID(sR?.id);
            }}
          >
            <MdDelete size={24} />
          </button>
        </div>
      ),
    });
  });

  return data?.length === 0 ? (
    <Loader />
  ) : (
    <div>
      <div className="w-full sm:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[94px] border-b px-6 2xl:px-12 fixed">
        <h2 className="text-xl lg:text-2xl font-inter font-semibold">
          Local Partners
        </h2>
      </div>
      <div className="space-y-8 pt-32 px-6 2xl:px-12 ">
        <div className="space-y-4">
          {/* <div className="flex items-center justify-between">
            <h2 className="text-xl lg:text-2xl font-inter font-semibold">
              Local Partners
            </h2>

            <Select
            placeholder="Filters"
            className="w-40"
            styles={selectStyles}
          />
          </div> */}
          <div className="flex justify-end">
            <button
              onClick={() => router.push("/sale-representative/add")}
              className="rounded-lg font-inter font-medium border border-theme text-white bg-theme hover:bg-white hover:text-theme duration-150 px-2 sm:px-3 py-2.5 sm:py-4"
            >
              + Add New Local Partner
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid  grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <ManagementTab
              title="Total Local Partners"
              desc={data?.data?.data?.length ?? 0}
            />
            {/* <ManagementTab title="New Sales Represenatives" desc="5000" /> */}
          </div>
        </div>

        <div>
          <MyDataTable
            columns={columns}
            data={datas}
            placeholder={"Search ..."}
            pagination={true}
            search={true}
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
            {loader === "delete" ? (
              <MiniLoader />
            ) : (
              <div className="w-full space-y-4">
                {modal === "delete" && (
                  <p className="text-labelColor font-nunito font-medium text-lg text-center">
                    Are you sure you want to delete this Local Partner ?
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
                    Delete
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
