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
import { SUB_ADMINS } from "./subAdmins.testids";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { SUB_ADMIN_FEATURE_ITEMS, SUB_ADMIN_FEATURES } from "@/utilities/subAdminNav";

/** Dial (left) + national (right) must form a valid E.164 number when national is non-empty. */
const DEFAULT_COUNTRY_CODE = "1";

function getEmployeePhoneValidationMessage(countryCode, phoneNumber) {
  const dial = String(countryCode ?? "").replace(/\D/g, "");
  const national = String(phoneNumber ?? "").replace(/\D/g, "");
  if (!national) return null;
  if (!dial) return "Please select a country code.";
  const parsed = parsePhoneNumberFromString(`+${dial}${national}`);
  if (!parsed?.isValid()) return "Please enter a valid phone number.";
  return null;
}

export default function SubAdmins() {
  if (typeof window !== "undefined") {
    var userType = localStorage.getItem("userType");
    var isEmployee = localStorage.getItem("isEmployee") === "true";
    var isSubAdmin = localStorage.getItem("isSubAdmin") === "true";
  }
  const canManage =
    (userType === "admin" && !isEmployee) ||
    (isSubAdmin && hasPermission("sub-admins_view"));

  const { data, reFetch, isLoading } = GetAPI(
    canManage ? "api/v1/admin/sub-admins" : "",
    "sub-admins"
  );

  const [modal, setModal] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    countryCode: DEFAULT_COUNTRY_CODE,
    features: [],
  });
  const [categoryID, setCategoryID] = useState("");
  const [loader, setLoader] = useState("");
  const [visible, setVisible] = useState(false);
  const [changePasswordStatus, setChangePasswordStatus] = useState(false);
  const allFeatures = SUB_ADMIN_FEATURES;
  const MAX_PHONE_DIGITS = 15;

  const handleModalClose = () => {
    setModal("");
    setCategoryID("");
    setFormData({
      name: "",
      email: "",
      password: "",
      phoneNumber: "",
      countryCode: DEFAULT_COUNTRY_CODE,
      features: [],
    });
    setVisible(false);
    setChangePasswordStatus(false);
  };

  const handleStatus = async (id, status) => {
    try {
      const res = await PatchAPI(`api/v1/admin/sub-admin/${id}`, {
        status: !status,
      }, "sub-admins");
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

  const handlePhoneNumberChange = (e) => {
    const raw = e.target.value ?? "";
    const digitsOnly = String(raw).replace(/\D/g, "").slice(0, MAX_PHONE_DIGITS);
    setFormData((prev) => ({ ...prev, phoneNumber: digitsOnly }));
  };

  const handlePhoneKeyDown = (e) => {
    const allowedKeys = new Set([
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
      "Tab",
      "Enter",
    ]);
    if (allowedKeys.has(e.key)) return;
    if (e.ctrlKey || e.metaKey) return; // allow copy/paste/select-all shortcuts
    if (/^\d$/.test(e.key)) return;
    e.preventDefault();
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
      const phoneMsg = getEmployeePhoneValidationMessage(
        formData.countryCode,
        formData.phoneNumber
      );
      if (phoneMsg) return info_toaster(phoneMsg);
      setLoader("add");
      try {
        const res = await PostAPI("api/v1/admin/sub-admin", formData, "sub-admins");
        if (res?.data?.status === "success") {
          handleModalClose();
          setLoader("");
          reFetch();
          success_toaster("Sub-admin added successfully");
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
      const phoneMsg = getEmployeePhoneValidationMessage(
        formData.countryCode,
        formData.phoneNumber
      );
      if (phoneMsg) return info_toaster(phoneMsg);
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
          `api/v1/admin/sub-admin/${categoryID}`,
          payload,
          "sub-admins"
        );
        if (res?.data?.status === "success") {
          handleModalClose();
          setLoader("");
          reFetch();
          success_toaster("Sub-admin updated successfully");
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
        const res = await DeleteAPI(`api/v1/admin/sub-admin/${categoryID}`, "sub-admins");
        if (res?.data?.status === "success") {
          success_toaster("Sub-admin deleted successfully");
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

      const res = await fetch(`${BASE_URL}api/v1/admin/sub-admin/${id}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "feature": "sub-admins",
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
          countryCode: emp?.countryCode || DEFAULT_COUNTRY_CODE,
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
    { field: "name", header: "Name" },
    { field: "email", header: "Email" },
    { field: "phoneNumber", header: "Phone Number" },
    { field: "changeStatus", header: "Change Status" },
    { field: "action", header: "Action" },
  ];

  const datas = [];
  data?.data?.data?.map((cat, i) => {
    return datas.push({
      id: cat?.id,
      // sl: i + 1,
      name: cat?.name,
      email: cat?.email,
      phoneNumber: (<div> {cat?.countryCode && `+${cat?.countryCode} `}{cat?.phoneNumber || ""} </div>),
      changeStatus: (
        hasPermission("sub-admins_update") ? (
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
              data-testid={SUB_ADMINS.rowStatusSwitch(cat?.id)}
            />
          </label>
        ) : (
          <span className="text-gray-400">No Access</span>
        )
      ),
      action: (
        <div className="flex gap-x-2" data-testid={SUB_ADMINS.row(cat?.id)}>
          {hasPermission("sub-admins_update") && (
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
              onClick={(e) => {
                e.stopPropagation();
                handleEditClick(cat?.id);
              }}
              data-testid={SUB_ADMINS.rowEditBtn(cat?.id)}
            >
              <FaEdit size={24} />
            </button>)}
          {hasPermission("sub-admins_delete") && (
            <button
              className="border border-red-400 rounded-md p-2 text-red-400"
              onClick={(e) => {
                e.stopPropagation();
                setModal("delete");
                setCategoryID(cat?.id);
              }}
              data-testid={SUB_ADMINS.rowDeleteBtn(cat?.id)}
            >
              <MdDelete size={24} />
            </button>)}
        </div>
      ),
    });
  });

  const { toggle, setToggle } = useDataContext();

  return isLoading ? (
    <Loader />
  ) : (
    <div data-testid={SUB_ADMINS.root}>
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed"
        data-testid={SUB_ADMINS.headerBar}>
        <div className="flex items-center gap-2">
          <p onClick={() => setToggle(!toggle)} className="cursor-pointer md:hidden">
            <CiMenuBurger size={20} />
          </p>
          <h2 className="text-xl font-inter font-semibold" data-testid={SUB_ADMINS.title}>All Sub Admins</h2>
        </div>
        <ul className="flex items-center text-sm font-medium [&>li]:border-r [&>li]:px-2 [&>li]:cursor-pointer relative" data-testid={SUB_ADMINS.newSubAdmin}>
          {hasPermission("sub-admins_create") && (
            <li
              onClick={() => {
                setFormData({
                  name: "",
                  email: "",
                  password: "",
                  phoneNumber: "",
                  countryCode: DEFAULT_COUNTRY_CODE,
                  features: [],
                });
                setVisible(false);
                setChangePasswordStatus(false);
                setModal("add");
              }}
            >
              New Sub Admin
            </li>)}
        </ul>
      </div>


      <div className="space-y-8 pt-32 px-6 2xl:px-12 ">
        <div className="flex sm:justify-between gap-4">
          <div className="w-56">
            <ManagementTab title="Total Sub Admins" desc={data?.data?.data?.length} />
          </div>
        </div>

        <MyDataTable
          columns={columns}
          data={datas}
          placeholder={"Search ..."}
          pagination={true}
          search={true}
          onRowClick={undefined}
          data-testid={SUB_ADMINS.tableWrapper}
          rowTestId={(row) => `data-testid-${SUB_ADMINS.row(row.id)}`}
        />

        {/* Modal */}
        <Dialog
          visible={modal === "add" || modal === "edit" || modal === "delete"}
          className="font-nunito employee-modal w-[92%] sm:max-w-[560px] rounded-xl shadow-xl [&_.p-dialog-header]:py-2 [&_.p-dialog-header]:px-4 [&_.p-dialog-content]:flex [&_.p-dialog-content]:flex-col [&_.p-dialog-content]:max-h-[85vh] [&_.p-dialog-content]:min-h-0 [&_.p-dialog-content]:overflow-hidden [&_.p-dialog-content]:p-0"
          data-testid={SUB_ADMINS.modal}
          dismissableMask={true}
          onHide={handleModalClose}
          header={
            <div className="font-nunito font-semibold text-base text-gray-800" data-testid={SUB_ADMINS.modalTitle}>
              {modal === "add"
                ? "Add"
                : modal === "edit"
                  ? "Update"
                  : modal === "delete"
                    ? "Delete"
                    : ""}{" "}
              Sub Admin
            </div>
          }
        >
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            {loader === "add" || loader === "edit" || loader === "delete" ? (
              <div className="py-12 flex justify-center">
                <MiniLoader />
              </div>
            ) : (
              <>
                <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-5">
                  {modal === "delete" ? (
                    <p className="text-labelColor font-medium text-center py-4">
                      Are you sure you want to delete this Sub Admin?
                    </p>
                  ) : (
                    <>
                      {/* Basic Information */}
                      <section className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-2">
                          Basic Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-y-1.5">
                            <label className="text-labelColor font-medium text-sm">Name</label>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              placeholder="Enter name"
                              className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-theme/20 focus:border-theme outline-none"
                              data-testid={SUB_ADMINS.nameInput}
                            />
                          </div>
                          <div className="flex flex-col gap-y-1.5">
                            <label className="text-labelColor font-medium text-sm">Email</label>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              placeholder="Enter Email"
                              className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-theme/20 focus:border-theme outline-none"
                              data-testid={SUB_ADMINS.emailInput}
                            />
                          </div>
                        </div>

                        {/* Password (Add mode) */}
                        {modal === "add" && (
                          <div className="flex flex-col gap-y-1.5">
                            <label className="text-labelColor font-medium text-sm">Password</label>
                            <div className="relative">
                              <input
                                type={visible ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter Password"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-theme/20 focus:border-theme outline-none"
                                data-testid={SUB_ADMINS.passwordInput}
                              />
                              <button
                                onClick={() => setVisible(!visible)}
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-0.5"
                                aria-label={visible ? "Hide password" : "Show password"}
                                data-testid={SUB_ADMINS.passwordVisibilityToggle}
                              >
                                {visible ? <AiOutlineEye size={20} /> : <AiOutlineEyeInvisible size={20} />}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Update Password (Edit mode) */}
                        {modal === "edit" && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <span className="text-labelColor font-medium text-sm">Update Password</span>
                              <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                  checked={changePasswordStatus}
                                  type="checkbox"
                                  name="passwordStatus"
                                  onChange={() => setChangePasswordStatus(!changePasswordStatus)}
                                  className="size-4 rounded border-gray-300 text-theme focus:ring-theme/20"
                                  data-testid={SUB_ADMINS.changePasswordCheckbox}
                                />
                                <span className="text-sm text-gray-600">Enable</span>
                              </label>
                            </div>
                            {changePasswordStatus && (
                              <div className="relative">
                                <input
                                  type={visible ? "text" : "password"}
                                  name="password"
                                  autoComplete="off"
                                  value={formData.password}
                                  placeholder="Enter New Password"
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-theme/20 focus:border-theme outline-none"
                                  onChange={handleChange}
                                  data-testid={SUB_ADMINS.passwordInput}
                                />
                                <button
                                  onClick={() => setVisible(!visible)}
                                  type="button"
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-0.5"
                                  aria-label={visible ? "Hide password" : "Show password"}
                                  data-testid={SUB_ADMINS.passwordVisibilityToggle}
                                >
                                  {visible ? <AiOutlineEye size={20} /> : <AiOutlineEyeInvisible size={20} />}
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex flex-col gap-y-1.5">
                          <label className="text-labelColor font-medium text-sm">Phone Number</label>
                          <div className="grid grid-cols-12 gap-2">
                            <div className="col-span-4 sm:col-span-3">
                              <PhoneInput
                                country={"us"}
                                value={formData.countryCode}
                                onChange={(phone) =>
                                  setFormData((prev) => ({ ...prev, countryCode: phone }))
                                }
                                countryCodeEditable={false}
                                enableSearch={false}
                                containerStyle={{ width: "100%" }}
                                inputStyle={{
                                  width: "100%",
                                  height: "40px",
                                  borderRadius: "8px",
                                  border: "1px solid #d1d5db",
                                  paddingLeft: "44px",
                                  cursor: "default",
                                }}
                                buttonStyle={{
                                  height: "40px",
                                  border: "1px solid #d1d5db",
                                  borderRight: "none",
                                  borderRadius: "8px 0 0 8px",
                                }}
                                dropdownStyle={{ zIndex: 1100 }}
                                inputProps={{
                                  readOnly: true,
                                  autoComplete: "off",
                                  onPaste: (e) => e.preventDefault(),
                                  onDrop: (e) => e.preventDefault(),
                                  onKeyDown: (e) => {
                                    if (
                                      e.key === "Tab" ||
                                      e.key === "Escape" ||
                                      e.ctrlKey ||
                                      e.metaKey
                                    ) {
                                      return;
                                    }
                                    e.preventDefault();
                                  },
                                }}
                              />
                            </div>
                            <div className="col-span-8 sm:col-span-9">
                              <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handlePhoneNumberChange}
                                onKeyDown={handlePhoneKeyDown}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={MAX_PHONE_DIGITS}
                                placeholder="Phone number"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm h-[40px] focus:ring-2 focus:ring-theme/20 focus:border-theme outline-none"
                                data-testid={SUB_ADMINS.phoneInput}
                              />
                            </div>
                          </div>
                        </div>
                      </section>

                      {/* Permissions */}
                      <section className="space-y-2">
                        <h3 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-2">
                          Permissions
                        </h3>
                        <p className="text-xs text-gray-500">
                          Granted modules use Admin-wide data (all customers, including local partners).
                        </p>
                        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                          <div className="grid grid-cols-6 gap-3 px-3 py-2.5 bg-gray-100 border-b border-gray-200 text-xs font-semibold text-gray-600">
                            <span className="col-span-2">Feature</span>
                            {["Create", "View", "Update", "Delete"].map((action) => (
                              <span key={action} className="text-center">{action}</span>
                            ))}
                          </div>
                          <div className="divide-y divide-gray-100">
                            {SUB_ADMIN_FEATURE_ITEMS.map(({ key: feature, label }, idx) => {
                              const existingFeature = formData.features.find((f) => f.feature === feature) || {};
                              return (
                                <div
                                  key={feature}
                                  className={`grid grid-cols-6 gap-3 px-3 py-2 items-center text-sm ${idx % 2 === 1 ? "bg-gray-50" : "bg-white"}`}
                                >
                                  <span className="col-span-2 text-gray-800">
                                    {label}
                                  </span>
                                  {["create", "view", "update", "delete"].map((action) => (
                                    <div key={`${feature}-${action}`} className="flex justify-center">
                                      <input
                                        type="checkbox"
                                        checked={!!existingFeature[action]}
                                        onChange={(e) => {
                                          const checked = e.target.checked;
                                          let newFeatures = [...formData.features];
                                          const featureIndex = newFeatures.findIndex((f) => f.feature === feature);
                                          if (featureIndex !== -1) {
                                            newFeatures[featureIndex] = { ...newFeatures[featureIndex], [action]: checked };
                                          } else {
                                            newFeatures.push({ feature, [action]: checked });
                                          }
                                          setFormData({ ...formData, features: newFeatures });
                                        }}
                                        className="size-4 rounded border-gray-300 text-theme focus:ring-theme/20"
                                        data-testid={SUB_ADMINS.featuresCheckbox}
                                      />
                                    </div>
                                  ))}
                                </div>
                              );
                            })}
                          </div>
                          <div className="px-3 py-2.5 bg-gray-100 border-t border-gray-200 flex items-center justify-end gap-2">
                            <input
                              type="checkbox"
                              checked={
                                allFeatures.length > 0 &&
                                allFeatures.every((feature) => {
                                  const f = formData.features.find((x) => x.feature === feature);
                                  if (feature === "dashboard") return !!f?.view;
                                  return f && ["create", "view", "update", "delete"].every((a) => f[a]);
                                })
                              }
                              onChange={(e) => {
                                const checked = e.target.checked;
                                const newFeatures = allFeatures.map((feature) => {
                                  if (feature === "dashboard") {
                                    return { feature, create: false, view: checked, update: false, delete: false };
                                  }
                                  return { feature, create: checked, view: checked, update: checked, delete: checked };
                                });
                                setFormData({ ...formData, features: newFeatures });
                              }}
                              className="size-4 rounded border-gray-300 text-theme focus:ring-theme/20"
                            />
                            <span className="text-sm font-medium text-gray-600">Select All</span>
                          </div>
                        </div>
                      </section>
                    </>
                  )}
                </div>
                <div className="flex-shrink-0 flex justify-end gap-2 px-4 py-3 border-t border-gray-200 bg-gray-50">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-sm bg-theme text-white rounded-lg hover:opacity-90 disabled:opacity-60 transition-opacity"
                    data-testid={SUB_ADMINS.modalSubmitBtn}
                  >
                    {modal === "add"
                      ? "Add"
                      : modal === "edit"
                        ? "Update"
                        : modal === "delete"
                          ? "Delete"
                          : ""}{" "}
                    Sub Admin
                  </button>
                </div>
              </>
            )}
          </form>
        </Dialog>
      </div>
    </div>
  );
}
