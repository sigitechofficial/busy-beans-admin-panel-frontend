"use client";
import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import Select from "react-select";
import selectStyles from "@/utilities/SelectStyle";
import { selectStyles2 } from "@/utilities/SelectStyle";
import { Dialog } from "primereact/dialog";
import { useState } from "react";
import { PostAPI } from "@/utilities/PostAPI";
import { error_toaster, success_toaster } from "@/utilities/Toaster";
import GetAPI from "@/utilities/GetAPI";
import { Tooltip } from "primereact/tooltip";
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import Switch from "react-switch";
import { PatchAPI } from "@/utilities/PatchAPI";
import { DeleteAPI } from "@/utilities/DeleteAPI";
import Loader from "@/components/ui/Loader";
import MiniLoader from "@/components/ui/MiniLoader";

export default function Category() {
  const { data, reFetch } = GetAPI("api/v1/admin/category");

  const [modal, setModal] = useState("");
  const [name, setName] = useState("");
  const [categoryID, setCategoryID] = useState("");
  const [loader, setLoader] = useState("");

  const handleModalClose = () => {
    setModal("");
    setCategoryID("");
  };

  const handleStatus = async (id, status) => {
    const res = await PatchAPI(`api/v1/admin/category/${id}`, {
      status: !status,
    });
    if (res?.data?.status === "success") {
      success_toaster("Status updated successfully");
      reFetch();
    } else if (res?.data?.status === "error") {
      error_toaster(res?.data?.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (modal === "add") {
      setLoader("add");
      const res = await PostAPI("api/v1/admin/category", {
        name: name,
      });
      if (res?.data?.status === "success") {
        setModal("");
        setLoader("");
        reFetch();
        success_toaster("Category added successfully");
      } else if (res?.data?.status === "error") {
        setModal("");
        setLoader("");
        error_toaster(res?.data?.message);
      }
    } else if (modal === "edit") {
      setLoader("edit");
      const res = await PatchAPI(`api/v1/admin/category/${categoryID}`, {
        name: name,
      });
      if (res?.data?.status === "success") {
        setModal("");
        setLoader("");
        reFetch();
        success_toaster("Category updated successfully");
      } else if (res?.data?.status === "error") {
        setModal("");
        setLoader("");
        error_toaster(res?.data?.message);
      }
    } else {
      setLoader("delete");
      const res = await DeleteAPI(`api/v1/admin/category/${categoryID}`);
      if (res?.data?.status === "success") {
        success_toaster("Category Deleted Successfully");
        reFetch();
        setModal("");
        setLoader("");
      } else if (res?.data?.status === "error") {
        error_toaster(res?.data?.message);
        setLoader("");
      }
    }
  };

  const columns = [
    { field: "sl", header: "SL", sort: true },
    { field: "name", header: "Name" },
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
  data?.data?.data?.map((cat, i) => {
    return datas.push({
      sl: i + 1,
      name: cat?.name,
      currentStatus: (
        <div>
          {cat?.status ? (
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
              handleStatus(cat?.id, cat?.status);
            }}
            checked={cat?.status}
            uncheckedIcon={false}
            checkedIcon={false}
            onColor="#86644c"
            onHandleColor="#fff"
            className="react-switch"
            boxShadow="none"
          />
        </label>
      ),
      action: (
        <div className="flex gap-x-2">
          <button
            too
            className="border border-theme rounded-md p-2 text-theme"
            onClick={() => {
              setName(cat?.name);
              setModal("edit");
              setCategoryID(cat?.id);
            }}
          >
            <FaEdit size={24} />
          </button>
          <button
            className="border border-red-400 rounded-md p-2 text-red-400"
            onClick={() => {
              setModal("delete");
              setCategoryID(cat?.id);
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
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl lg:text-2xl font-inter font-semibold">
            All Categories
          </h2>

          <Select
            placeholder="Filters"
            className="w-40"
            styles={selectStyles}
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => {
              setName("");
              setModal("add");
            }}
            className="rounded-lg font-inter font-medium text-white px-5 sm:px-8 py-2.5 sm:py-4 bg-theme"
          >
            + Add Category
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <ManagementTab
          title="Total Categories"
          desc={data?.data?.data?.length}
        />
        {/* <ManagementTab title="Total Countries" desc="5000" /> */}
        {/* <ManagementTab title="Total Cities" desc="55000" /> */}
      </div>

      <div>
        <MyDataTable
          columns={columns}
          data={datas}
          placeholder={"Search ..."}
          search={true}
        />
      </div>

      {/* Modal */}
      <Dialog
        visible={modal === "add" || modal === "edit" || modal === "delete"}
        style={{ width: "40vw" }}
        className="font-nunito"
        onHide={handleModalClose}
        header={
          <div className="font-nunito font-bold text-2xl text-center">
            {modal === "add"
              ? "Add"
              : modal === "edit"
              ? "Update"
              : modal === "delete"
              ? "Delete"
              : ""}{" "}
            Category
          </div>
        }
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-4 flex flex-col items-center"
        >
          {/* body */}
          {loader === "add" || loader === "edit" || loader === "delete" ? (
            <MiniLoader />
          ) : (
            <div className="w-full space-y-4">
              {modal === "delete" ? (
                <p className="text-labelColor font-nunito font-medium text-lg text-center">
                  Are you sure you want to delete this Category ?
                </p>
              ) : (
                <div className="flex flex-col gap-y-2">
                  <label className="text-labelColor font-medium font-satoshi">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter Category name"
                    className="border border-borderColor text-secondary placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                  />
                </div>
              )}
              <div className="flex items-center justify-end gap-x-4 [&>button]:font-nunito [&>button]:py-3 [&>button]:font-medium">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="rounded-lg border border-black shadow-buttonShadow  px-6"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg border border-theme text-white px-10 bg-theme"
                >
                  {modal === "add"
                    ? "Add"
                    : modal === "edit"
                    ? "Update"
                    : modal === "delete"
                    ? "Delete"
                    : ""}{" "}
                  Category
                </button>
              </div>
            </div>
          )}
        </form>
      </Dialog>
    </div>
  );
}
