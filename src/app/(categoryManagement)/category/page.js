"use client";
import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import Select from "react-select";
import selectStyles from "@/utilities/SelectStyle";
import { selectStyles2 } from "@/utilities/SelectStyle";
import { Dialog } from "primereact/dialog";
import { useState } from "react";
import { PostAPI } from "@/utilities/PostAPI";
import {
  error_toaster,
  info_toaster,
  success_toaster,
} from "@/utilities/Toaster";
import GetAPI from "@/utilities/GetAPI";
import { Tooltip } from "primereact/tooltip";
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import Switch from "react-switch";
import { PatchAPI } from "@/utilities/PatchAPI";
import { DeleteAPI } from "@/utilities/DeleteAPI";
import Loader from "@/components/ui/Loader";
import MiniLoader from "@/components/ui/MiniLoader";
import ErrorHandler from "@/utilities/ErrorHandler";
import { CiMenuBurger } from "react-icons/ci";
import { useDataContext } from "@/utilities/DataContext";
import { hasPermission } from "@/utilities/Permission";
import { CATEGORY_MANAGEMENT } from "./category.testid";

export default function Category() {
  const { data, reFetch, isLoading } = GetAPI("api/v1/admin/category", "category");

  const [modal, setModal] = useState("");
  const [name, setName] = useState("");
  const [categoryID, setCategoryID] = useState("");
  const [loader, setLoader] = useState("");

  const handleModalClose = () => {
    setModal("");
    setCategoryID("");
  };

  const handleStatus = async (id, status) => {
    try {
      const res = await PatchAPI(`api/v1/admin/category/${id}`, {
        status: !status,
      }, "category");
      if (res?.data?.status === "success") {
        success_toaster("Status updated successfully");
        reFetch();
      } else {
        throw new Error(res?.data?.message || "An unexpected error occurred.");
      }
    } catch (error) {
      ErrorHandler(error);
      setLoader(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (modal === "add") {
      if (name.trim() === "") {
        info_toaster("Category name cannot be empty");
      } else {
        setLoader("add");
        try {
          const res = await PostAPI("api/v1/admin/category", {
            name: name,
          }, "category");
          if (res?.data?.status === "success") {
            setModal("");
            setLoader("");
            reFetch();
            success_toaster("Category added successfully");
          } else {
            throw new Error(
              res?.data?.message || "An unexpected error occurred."
            );
          }
        } catch (error) {
          setModal("");
          setLoader("");
          ErrorHandler(error);
        }
      }
    } else if (modal === "edit") {
      if (name.trim() === "") {
        info_toaster("Category name cannot be empty");
      } else {
        setLoader("edit");
        try {
          const res = await PatchAPI(`api/v1/admin/category/${categoryID}`, {
            name: name,
          }, "category");
          if (res?.data?.status === "success") {
            setModal("");
            setLoader("");
            reFetch();
            success_toaster("Category updated successfully");
          } else {
            throw new Error(
              res?.data?.message || "An unexpected error occurred."
            );
          }
        } catch (error) {
          setModal("");
          setLoader("");
          ErrorHandler(error);
        }
      }
    } else {
      setLoader("delete");
      try {
        const res = await DeleteAPI(`api/v1/admin/category/${categoryID}`, "category");
        if (res?.data?.status === "success") {
          success_toaster("Category Deleted Successfully");
          reFetch();
          setModal("");
          setLoader("");
        }
      } catch (error) {
        ErrorHandler(error);
        setLoader("");
      }
    }
  };

  const columns = [
    { field: "sl", header: "SL", sort: true },
    { field: "name", header: "Name" },
    { field: "numberOfProducts", header: "No. of products" },
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
      numberOfProducts: cat?.numberOfProducts,
      changeStatus: (
        hasPermission("category_update") ? (
        <label className="flex items-center gap-2">
          <div>
            {cat?.status ? (
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
                handleStatus(cat?.id, cat?.status);
              }}
              checked={cat?.status}
              uncheckedIcon={false}
              checkedIcon={false}
              onColor="#86644c"
              onHandleColor="#fff"
              className="react-switch"
              boxShadow="none"
              data-testid={CATEGORY_MANAGEMENT.rowStatusSwitch(cat.id)}
            />
          </label>
        ) : (
          <span className="text-gray-400">No Access</span>
        )
      ),
      action: (
        <div className="flex gap-x-2" data-testid={CATEGORY_MANAGEMENT.row(cat.id)}>
          {hasPermission("category_update") && (
          <button
            too
            className="border border-theme rounded-md p-2 text-theme"
            onClick={() => {
              setName(cat?.name);
              setModal("edit");
              setCategoryID(cat?.id);
            }}
            data-testid={CATEGORY_MANAGEMENT.rowEditBtn(cat.id)}
          >
            <FaEdit size={24} />
          </button> )}
          {hasPermission("category_delete") && (
          <button
            className="border border-red-400 rounded-md p-2 text-red-400"
            onClick={() => {
              setModal("delete");
              setCategoryID(cat?.id);
            }}
            data-testid={CATEGORY_MANAGEMENT.rowDeleteBtn(cat.id)}
          >
            <MdDelete size={24} />
          </button> )}
        </div>
      ),
    });
  });

  const { toggle, setToggle } = useDataContext();

  return isLoading ? (
    <Loader />
  ) : (
    <div data-testid={CATEGORY_MANAGEMENT.root}>
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed"
       data-testid={CATEGORY_MANAGEMENT.headerBar}>
        <div className="flex items-center gap-2">
          <p
            onClick={() => setToggle(!toggle)}
            className="cursor-pointer md:hidden"
          >
            <CiMenuBurger size={20} />
          </p>
          <h2 className="text-xl font-inter font-semibold" data-testid={CATEGORY_MANAGEMENT.title}>All Categories</h2>
        </div>

        <ul className="flex items-center text-sm font-medium [&>li]:border-r [&>li]:px-2 [&>li]:cursor-pointer relative">
          {hasPermission("category_create") && (
          <li
            onClick={() => {
              setName("");
              setModal("add");
            }}
            data-testid={CATEGORY_MANAGEMENT.newCategory}
          >
            New Category
          </li> )}
        </ul>
      </div>
      <div className="space-y-8 pt-32 px-6 2xl:px-12 ">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5" data-testid={CATEGORY_MANAGEMENT.statsGrid}>
          <ManagementTab
            title="Total Categories"
            desc={data?.data?.data?.length}
            data-testid={CATEGORY_MANAGEMENT.totalCategoriesCard}
          />
        </div>

        <div data-testid={CATEGORY_MANAGEMENT.tableWrapper}>
          <MyDataTable
            columns={columns}
            data={datas}
            placeholder={"Search ..."}
            pagination={true}
            search={true}
            data-testid={CATEGORY_MANAGEMENT.table}
            rowTestId={(row) => `data-testid-${CATEGORY_MANAGEMENT.row(row.id)}`}
          />
        </div>

        {/* Modal */}
        <Dialog
          visible={modal === "add" || modal === "edit" || modal === "delete"}
          // style={{ width: "40vw" }}
          className="font-nunito w-[80%] lg:w-[40vw]"
          onHide={handleModalClose}
          dismissableMask={true}
          data-testid={CATEGORY_MANAGEMENT.modal}
          header={
            <div className="font-nunito font-bold text-sm lg:text-2xl text-center" data-testid={CATEGORY_MANAGEMENT.modalTitle}>
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
                        Are you sure you want to delete this Category
                        {data?.data?.data?.find((cat) => cat.id === categoryID)?.numberOfProducts > 0 && (
                          <span className="text-red-600 font-bold">
                            {" "}which has {
                              data?.data?.data?.find((cat) => cat.id === categoryID)?.numberOfProducts
                            } product(s)
                          </span>
                        )}?
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
                      data-testid={CATEGORY_MANAGEMENT.nameInput}
                    />
                  </div>
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
                    data-testid={CATEGORY_MANAGEMENT.modalSubmitBtn}
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
    </div>
  );
}
