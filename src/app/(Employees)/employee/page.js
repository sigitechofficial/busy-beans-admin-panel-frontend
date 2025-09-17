"use client";
import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import { Dialog } from "primereact/dialog";
import { useState } from "react";
import { PostAPI } from "@/utilities/PostAPI";
import { info_toaster, success_toaster } from "@/utilities/Toaster";
import { BASE_URL } from "@/utilities/URL";
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
import { hasPermission } from "@/utilities/Permission";
import { EMPLOYEES } from "./employee.testids"

export default function Employee() {
  const { data, reFetch } = GetAPI("api/v1/admin/employees", "employees");
  if (typeof window !== "undefined") {
    var userType = localStorage.getItem("userType");
  }

  const [modal, setModal] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    countryCode: "",
    features: [], 
  });
  const [categoryID, setCategoryID] = useState("");
  const [loader, setLoader] = useState("");
  const [visible, setVisible] = useState(false);
  const [changePasswordStatus, setChangePasswordStatus] = useState(false);
  const ADMIN_FEATURES = [ "dashboard", "orders", "supplier", "invoice", "customer", "selected-customer",  "local-partner", "product", "category", "employees", "country", "charges", "payment-pullout", "report" ];
  const SALES_REP_FEATURES = [ "dashboard", "quotation", "customer", "selected-customer", "orders", "invoice", "payment-pullout", "employees", "account", "wallet", "report" ];
  const allFeatures =  userType === "salesRepresentative" ? SALES_REP_FEATURES : ADMIN_FEATURES;

  const handleModalClose = () => {
    setModal("");
    setCategoryID("");
    setFormData({
      name: "",
      email: "",
      password: "",
      phoneNumber: "",
      countryCode: "",
      features: [], 
    });
    setVisible(false);
    setChangePasswordStatus(false);
  };

  const handleStatus = async (id, status) => {
    try {
      const res = await PatchAPI(`api/v1/admin/employee/${id}`, {
        status: !status,
      }, "employees");
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
        const res = await PostAPI("api/v1/admin/employee", formData, "employees");
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
      const payload = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        countryCode: formData.countryCode,
        features: formData.features, 
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
          payload,
          "employees"
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
        // handleModalClose();
        setLoader("");
        ErrorHandler(error);
      }
    } else {
      setLoader("delete");
      try {
        const res = await DeleteAPI(`api/v1/admin/employee/${categoryID}`, "employees");
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
  
  const handleEditClick = async (id) => {
    try {
      setLoader("prefill");
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token") || localStorage.getItem("accessToken")
          : "";

      const res = await fetch(`${BASE_URL}api/v1/admin/employee/${id}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "feature": "employees",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const json = await res.json();
      if (res.ok && json?.status === "success") {
        const emp = json?.data || {};
        const permissions = Array.isArray(emp?.permissions) ? emp.permissions : [];

        const featuresMap = {};
        const validActions = new Set(["create", "view", "update", "delete"]);

        permissions.forEach((perm) => {
          if (!perm || typeof perm.key !== "string") return;
          const [feature, action] = perm.key.split("_");
          if (!feature || !validActions.has(action)) return;

          if (!featuresMap[feature]) {
            featuresMap[feature] = {
              feature,
              create: false,
              view: false,
              update: false,
              delete: false,
            };
          }
          featuresMap[feature][action] = true;
        });

        const mappedFeatures = Object.values(featuresMap);
        const filteredMapped = mappedFeatures.filter((f) =>
          allFeatures.includes(f.feature)
        );
        setFormData({
          name: emp?.name || "",
          email: emp?.email || "",
          password: "",
          phoneNumber: emp?.phoneNumber || "",
          countryCode: emp?.countryCode || "",
          features:
            filteredMapped.length
              ? filteredMapped
              : (Array.isArray(emp?.features)
                ? emp.features.filter((f) => allFeatures.includes(f.feature))
                : []),
        });
        setVisible(false);
        setChangePasswordStatus(false);
        setCategoryID(String(id));
        setModal("edit");
      } else {
        throw new Error(json?.message || "Failed to load employee.");
      }
    } catch (error) {
      ErrorHandler(error);
    } finally {
      setLoader("");
    }
  };

  const columns = [
    // { field: "sl", header: "SL", sort: true },
    { field: "name", header: "Name" },
    { field: "email", header: "Email" },
    { field: "phoneNumber", header: "Phone Number" }, 
    // { field: "currentStatus", header: "Current Status" },
    { field: "changeStatus", header: "Change Status" },
    { field: "action", header: "Action" },
  ];

  const datas = [];
  data?.data?.data?.map((cat, i) => {
    return datas.push({
      // sl: i + 1,
      name: cat?.name,
      email: cat?.email,
      phoneNumber: ( <div> {cat?.countryCode && `+${cat?.countryCode} `}{cat?.phoneNumber || ""} </div> ),
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
        hasPermission("employees_update") ? (
        <label className="flex items-center gap-2 ">
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
          data-testid={EMPLOYEES.rowStatusSwitch(cat?.id)}
        /> 
        </label>
        ) : (
        <span className="text-gray-400">No Access</span>
        )
      ),
      action: (
        <div className="flex gap-x-2" data-testid={EMPLOYEES.row(cat?.id)}>
          {hasPermission("employees_update") && (
          <button
            className="border border-theme rounded-md p-2 text-theme"
            // onClick={() => {
            //   setFormData({
            //     name: cat?.name,
            //     email: cat?.email,
            //     password: "",
            //     phoneNumber: cat?.phoneNumber || "",
            //     countryCode: cat?.countryCode || "",
            //     features: cat?.features || [],
            //   });
            //   setVisible(false);
            //   setChangePasswordStatus(false);
            //   setModal("edit");
            //   setCategoryID(cat?.id);
            // }}
            onClick={() => handleEditClick(cat?.id)}
            data-testid={EMPLOYEES.rowEditBtn(cat?.id)}
          >
            <FaEdit size={24} />
          </button> )}
          {hasPermission("employees_delete") && (
          <button
            className="border border-red-400 rounded-md p-2 text-red-400"
            onClick={() => {
              setModal("delete");
              setCategoryID(cat?.id);
            }}
            data-testid={EMPLOYEES.rowDeleteBtn(cat?.id)}
          >
            <MdDelete size={24} />
          </button> )}
        </div>
      ),
    });
  });

  const { toggle, setToggle } = useDataContext();

  return data?.length === 0 ? (
    <Loader />
  ) : (
    <div data-testid={EMPLOYEES.root}>
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed"
        data-testid={EMPLOYEES.headerBar}>
        <div className="flex items-center gap-2">
          <p onClick={() => setToggle(!toggle)} className="cursor-pointer md:hidden">
            <CiMenuBurger size={20} />
          </p>
          <h2 className="text-xl font-inter font-semibold" data-testid={EMPLOYEES.title}>All Employees</h2>
        </div>
        <ul className="flex items-center text-sm font-medium [&>li]:border-r [&>li]:px-2 [&>li]:cursor-pointer relative" data-testid={EMPLOYEES.newEmployee}>
          {hasPermission("employees_create") && (
          <li
            onClick={() => {
              setFormData({
                name: "",
                email: "",
                password: "",
                phoneNumber: "",
                countryCode: "",
                features: [],
              });
              setVisible(false);
              setChangePasswordStatus(false);
              setModal("add");
            }}
          >
            New Employee
          </li> )}
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
          data-testid={EMPLOYEES.tableWrapper}
          rowTestId={(row) => `data-testid-${EMPLOYEES.row(row.id)}`}
        />

        {/* Modal */}
        <Dialog
          visible={modal === "add" || modal === "edit" || modal === "delete"}
          className="font-nunito w-[80%] lg:w-[40vw]"
          data-testid={EMPLOYEES.modal}
          onHide={handleModalClose}
          header={
            <div className="font-nunito font-bold text-sm lg:text-2xl text-center" data-testid={EMPLOYEES.modalTitle}>
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
                        data-testid={EMPLOYEES.nameInput}
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
                        data-testid={EMPLOYEES.emailInput}
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
                          data-testid={EMPLOYEES.passwordInput}
                        />
                        <button
                          onClick={() => setVisible(!visible)}
                          type="button"
                          className="absolute right-4 top-11"
                          data-testid={EMPLOYEES.passwordVisibilityToggle}
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
                              data-testid={EMPLOYEES.changePasswordCheckbox}
                            />
                            <button
                              onClick={() => setVisible(!visible)}
                              type="button"
                              className="text-labelColor absolute right-4 top-11"
                              data-testid={EMPLOYEES.passwordVisibilityToggle}
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
                            data-testid={EMPLOYEES.phoneInput}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                          <div className="flex flex-col gap-y-4">
                              <div className="flex items-center justify-end gap-2">
                                <input
                                  type="checkbox"
                                  checked={
                                    formData.features.length === allFeatures.length &&
                                    formData.features.every(f =>
                                      ["create", "view", "update", "delete"].every(action => f[action])
                                    )
                                  }
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    const newFeatures = allFeatures.map(feature => ({
                                      feature,
                                      create: checked,
                                      view: checked,
                                      update: checked,
                                      delete: checked,
                                    }));
                                    setFormData({ ...formData, features: newFeatures });
                                  }}
                                  className="form-checkbox"
                                />
                                <label className="text-black font-medium font-satoshi">Select All</label>
                              </div>
                            <div className="grid grid-cols-6 gap-6 font-bold mb-2 items-center">
                              <span className="col-span-2 text-left text-labelColor font-medium font-satoshi">
                                Features
                              </span>

                              {["Create", "View", "Update", "Delete"].map((action) => (
                                <span key={action} className="text-center w-20">
                                  {action}
                                </span>
                              ))}

                            </div>

                            {allFeatures.map((feature) => {
                              const existingFeature =
                                formData.features.find((f) => f.feature === feature) || {};
                              return (
                                <div
                                  key={feature}
                                  className="grid grid-cols-6 gap-6 items-center mb-2"
                                >
                                  <span className="col-span-2 font-bold capitalize">
                                    {feature.replace("-", " ")}
                                  </span>
                                  {["create", "view", "update", "delete"].map((action) => (
                                    <div key={`${feature}-${action}`} className="flex justify-center">
                                      <input
                                        type="checkbox"
                                        checked={!!existingFeature[action]}
                                        onChange={(e) => {
                                          const checked = e.target.checked;
                                          const newFeatures = [...formData.features];
                                          const featureIndex = newFeatures.findIndex(
                                            (f) => f.feature === feature
                                          );

                                          if (featureIndex !== -1) {
                                            newFeatures[featureIndex] = {
                                              ...newFeatures[featureIndex],
                                              [action]: checked,
                                            };
                                          } else {
                                            newFeatures.push({ feature, [action]: checked });
                                          }

                                          setFormData({ ...formData, features: newFeatures });
                                        }}
                                        className="form-checkbox"
                                        data-testid={EMPLOYEES.featuresCheckbox}
                                      />
                                    </div>
                                  ))}
                                  <div></div>
                                </div>
                              );
                            })}
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
                    data-testid={EMPLOYEES.modalSubmitBtn}
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
