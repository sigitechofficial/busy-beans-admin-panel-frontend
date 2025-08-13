"use client";
import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import { Dialog } from "primereact/dialog";
import { useState } from "react";
import { PostAPI } from "@/utilities/PostAPI";
import { info_toaster, success_toaster } from "@/utilities/Toaster";
import GetAPI from "@/utilities/GetAPI";
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
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

export default function Employee() {
  const { data, reFetch } = GetAPI("api/v1/admin/employees");

  const [modal, setModal] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    // employeeOf: "Admin",
    phoneNumber: "",
    countryCode: "",
  });
  const [categoryID, setCategoryID] = useState("");
  const [loader, setLoader] = useState("");
  const [visible, setVisible] = useState(false);
  const [changePasswordStatus, setChangePasswordStatus] = useState(false);

  const handleModalClose = () => {
    setModal("");
    setCategoryID("");
    setFormData({
      name: "",
      email: "",
      password: "",
      // employeeOf: "Admin",
      phoneNumber: "",
      countryCode: "",
    });
    setVisible(false);
    setChangePasswordStatus(false);
  };

  const handleStatus = async (id, status) => {
    try {
      const res = await PatchAPI(`api/v1/admin/employee/${id}`, {
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

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (modal === "add") {
      if (
        !formData.name.trim() ||
        !formData.email.trim() ||
        !formData.password.trim()
      ) {
        return info_toaster("Name, email, and password are required");
      }
      setLoader("add");
      try {
        const res = await PostAPI("api/v1/admin/employee", formData);
        if (res?.data?.status === "success") {
          handleModalClose();
          setLoader("");
          reFetch();
          success_toaster("Employee added successfully");
        } else {
          throw new Error(res?.data?.message || "An unexpected error occurred.");
        }
      } catch (error) {
        handleModalClose();
        setLoader("");
        ErrorHandler(error);
      }
    } else if (modal === "edit") {
      if (!formData.name.trim() || !formData.email.trim()) {
        return info_toaster("Name and email are required");
      }
      // Build payload (include password only if checkbox is enabled)
      const payload = {
        name: formData.name,
        email: formData.email,
        // employeeOf: formData.employeeOf,
        phoneNumber: formData.phoneNumber,
        countryCode: formData.countryCode,
      };
      if (changePasswordStatus) {
        if (!formData.password.trim()) {
          return info_toaster(
            "Enter a new password or uncheck 'Update Password'"
          );
        }
        payload.password = formData.password;
      }

      setLoader("edit");
      try {
        const res = await PatchAPI(
          `api/v1/admin/employee/${categoryID}`,
          payload
        );
        if (res?.data?.status === "success") {
          handleModalClose();
          setLoader("");
          reFetch();
          success_toaster("Employee updated successfully");
        } else {
          throw new Error(res?.data?.message || "An unexpected error occurred.");
        }
      } catch (error) {
        handleModalClose();
        setLoader("");
        ErrorHandler(error);
      }
    } else {
      setLoader("delete");
      try {
        const res = await DeleteAPI(`api/v1/admin/employee/${categoryID}`);
        if (res?.data?.status === "success") {
          success_toaster("Employee Deleted Successfully");
          reFetch();
          handleModalClose();
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
    { field: "email", header: "Email" },
    // { field: "employeeOf", header: "Employee Of" },
    { field: "phoneNumber", header: "Phone Number" },
    { field: "countryCode", header: "Country Code" },
    { field: "currentStatus", header: "Current Status" },
    { field: "changeStatus", header: "Change Status" },
    { field: "action", header: "Action" },
  ];

  const datas = [];
  data?.data?.data?.map((cat, i) => {
    return datas.push({
      sl: i + 1,
      name: cat?.name,
      email: cat?.email,
      // employeeOf: cat?.employeeOf,
      phoneNumber: cat?.phoneNumber || "-",
      countryCode: cat?.countryCode || "-",
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
      ),
      action: (
        <div className="flex gap-x-2">
          <button
            className="border border-theme rounded-md p-2 text-theme"
            onClick={() => {
              setFormData({
                name: cat?.name,
                email: cat?.email,
                password: "",
                // employeeOf: cat?.employeeOf,
                phoneNumber: cat?.phoneNumber || "",
                countryCode: cat?.countryCode || "",
              });
              setVisible(false);
              setChangePasswordStatus(false);
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

  const { toggle, setToggle } = useDataContext();

  return data?.length === 0 ? (
    <Loader />
  ) : (
    <div>
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed">
        <div className="flex items-center gap-2">
          <p onClick={() => setToggle(!toggle)} className="cursor-pointer md:hidden">
            <CiMenuBurger size={20} />
          </p>
          <h2 className="text-xl font-inter font-semibold">All Employees</h2>
        </div>
        <ul className="flex items-center text-sm font-medium [&>li]:border-r [&>li]:px-2 [&>li]:cursor-pointer relative">
          <li
            onClick={() => {
              setFormData({
                name: "",
                email: "",
                password: "",
                // employeeOf: "Admin",
                phoneNumber: "",
                countryCode: "",
              });
              setVisible(false);
              setChangePasswordStatus(false);
              setModal("add");
            }}
          >
            New Employee
          </li>
        </ul>
      </div>

      <div className="space-y-8 pt-32 px-6 2xl:px-12 ">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <ManagementTab title="Total Employees" desc={data?.data?.data?.length} />
        </div>

        <MyDataTable
          columns={columns}
          data={datas}
          placeholder={"Search ..."}
          pagination={true}
          search={true}
        />

        {/* Modal */}
        <Dialog
          visible={modal === "add" || modal === "edit" || modal === "delete"}
          className="font-nunito w-[80%] lg:w-[40vw]"
          onHide={handleModalClose}
          header={
            <div className="font-nunito font-bold text-sm lg:text-2xl text-center">
              {modal === "add"
                ? "Add"
                : modal === "edit"
                ? "Update"
                : modal === "delete"
                ? "Delete"
                : ""}{" "}
              Employee
            </div>
          }
        >
          <form onSubmit={handleSubmit} className="space-y-4 flex flex-col items-center">
            {loader === "add" || loader === "edit" || loader === "delete" ? (
              <MiniLoader />
            ) : (
              <div className="w-full space-y-4">
                {modal === "delete" ? (
                  <p className="text-labelColor font-nunito font-medium text-lg text-center">
                    Are you sure you want to delete this Employee?
                  </p>
                ) : (
                  <>
                    {/* Name */}
                    <div className="flex flex-col gap-y-2">
                      <label className="text-labelColor font-medium font-satoshi">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter Employee name"
                        className="border border-borderColor rounded-[4px] px-2.5 py-3"
                      />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-y-2">
                      <label className="text-labelColor font-medium font-satoshi">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter Email"
                        className="border border-borderColor rounded-[4px] px-2.5 py-3"
                      />
                    </div>

                    {/* Password (Add mode) */}
                    {modal === "add" && (
                      <div className="flex flex-col gap-y-2 relative">
                        <label className="text-labelColor font-medium font-satoshi">Password</label>
                        <input
                          type={visible ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Enter Password"
                          className="border border-borderColor rounded-[4px] ps-2.5 pe-12 py-3"
                        />
                        <button
                          onClick={() => setVisible(!visible)}
                          type="button"
                          className="absolute right-4 top-11"
                        >
                          {visible ? (
                            <AiOutlineEye size={24} color="#000000" />
                          ) : (
                            <AiOutlineEyeInvisible size={24} color="#64748b" />
                          )}
                        </button>
                      </div>
                    )}

                    {/* Update Password (Edit mode) */}
                    {modal === "edit" && (
                      <div className="space-y-2">
                        {changePasswordStatus && (
                          <div className="flex flex-col gap-y-2 relative">
                            <label className="text-labelColor font-medium font-satoshi">
                              Update Password
                            </label>
                            <input
                              type={visible ? "text" : "password"}
                              name="password"
                              autoComplete="off"
                              value={formData.password}
                              placeholder="Enter New Password"
                              className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none ps-2.5 pe-12 py-3"
                              onChange={handleChange}
                            />
                            <button
                              onClick={() => setVisible(!visible)}
                              type="button"
                              className="text-labelColor absolute right-4 top-11"
                            >
                              {visible ? (
                                <AiOutlineEye size={24} color="#000000" />
                              ) : (
                                <AiOutlineEyeInvisible size={24} color="#64748b" />
                              )}
                            </button>
                          </div>
                        )}
                        <div className="flex items-center justify-end gap-x-2">
                          <label className="text-black font-medium font-satoshi">
                            Update Password
                          </label>
                          <input
                            checked={changePasswordStatus}
                            type="checkbox"
                            name="passwordStatus"
                            onChange={() =>
                              setChangePasswordStatus(!changePasswordStatus)
                            }
                            className="size-4 border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* Phone Number */}
                    <div className="flex flex-col gap-y-2">
                      <label className="text-labelColor font-medium font-satoshi">
                        Phone Number
                      </label>
                      <div className="grid grid-cols-12 gap-3 items-start">
                        {/* Country code */}
                        <div className="col-span-5 sm:col-span-4 md:col-span-3">
                          <PhoneInput
                            country={"us"}
                            value={formData.countryCode}
                            onChange={(phone) =>
                              setFormData({ ...formData, countryCode: phone })
                            }
                            containerStyle={{ width: "100%" }}
                            inputStyle={{
                              width: "100%",
                              height: "45px",
                              borderRadius: "4px",
                              border: "1px solid #00000033",
                              paddingLeft: "48px",
                            }}
                            buttonStyle={{
                              height: "45px",
                              border: "1px solid #00000033",
                              borderRight: "none",
                              borderTopLeftRadius: "4px",
                              borderBottomLeftRadius: "4px",
                            }}
                            dropdownStyle={{
                              zIndex: 50,
                            }}
                          />
                        </div>
                        {/* Local phone number */}
                        <div className="col-span-7 sm:col-span-8 md:col-span-9">
                          <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            placeholder="Enter Phone Number"
                            className="w-full border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-2.5"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
                <div className="flex items-center justify-end gap-x-4">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="hover:bg-theme hover:text-white duration-150 rounded-lg border border-theme text-theme shadow-buttonShadow px-6"
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
                    Employee
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
