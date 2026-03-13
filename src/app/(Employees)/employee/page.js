"use client";
import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import { Dialog } from "primereact/dialog";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PostAPI } from "@/utilities/PostAPI";
import { info_toaster, success_toaster } from "@/utilities/Toaster";
import { BASE_URL } from "@/utilities/URL";
import GetAPI from "@/utilities/GetAPI";
import { MdDelete } from "react-icons/md";
import { FaEdit, FaEye } from "react-icons/fa";
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
import Select from "react-select";
import selectStyles from "@/utilities/SelectStyle";
import { EMPLOYEES } from "./employee.testids"

export default function Employee() {
  const router = useRouter();
  if (typeof window !== "undefined") {
    var userType = localStorage.getItem("userType");
    var isEmployee = localStorage.getItem("isEmployee") === "true";
  }
  const isAdmin = userType === "admin" && !isEmployee;

  const [selectedPartnerId, setSelectedPartnerId] = useState("");
  const employeesUrl =
    isAdmin && selectedPartnerId
      ? `api/v1/admin/employees?salesRepId=${selectedPartnerId}`
      : "api/v1/admin/employees";
  const { data, reFetch, isLoading } = GetAPI(employeesUrl, "employees");
  const { data: salesRepData } = GetAPI(isAdmin ? "api/v1/admin/sales-rep" : "", "sales-rep");

  const partnerOptions = [
    { value: "", label: "All (Admin employees)" },
    ...(salesRepData?.data?.data?.map((p) => ({
      value: String(p?.id),
      label: p?.territoryName ? `${p?.srName} (${p.territoryName})` : p?.srName || "",
    })) || []),
  ];
  const selectedPartnerOption = partnerOptions.find((o) => o.value === selectedPartnerId) || partnerOptions[0];

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
  const [commissionModal, setCommissionModal] = useState(false);
  const [commissionEmployeeId, setCommissionEmployeeId] = useState("");
  const [commissionPercentage, setCommissionPercentage] = useState("");
  const [commissionLoader, setCommissionLoader] = useState(false);
  const ADMIN_FEATURES = ["dashboard", "orders", "supplier", "invoice", "customer", "selected-customer", "category", "employees", "country", "charges", "payment-pullout", "report","leads-dashboard", "quickbooks", "quickbooks-invoices"];
  const SALES_REP_FEATURES = ["dashboard", "quotation", "customer", "selected-customer", "orders", "invoice", "payment-pullout", "employees", "account", "wallet", "report", "subscription","leads-dashboard", "quickbooks", "quickbooks-invoices"];
  const allFeatures = userType === "salesRepresentative" ? SALES_REP_FEATURES : ADMIN_FEATURES;

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
    { field: "commissionPercentage", header: "Commission %" },
    // { field: "currentStatus", header: "Current Status" },
    { field: "changeStatus", header: "Change Status" },
    { field: "action", header: "Action" },
  ];

  const handleCommissionSubmit = async (e) => {
    e.preventDefault();
    if (!commissionPercentage || isNaN(commissionPercentage) || parseFloat(commissionPercentage) < 0 || parseFloat(commissionPercentage) > 100) {
      return info_toaster("Please enter a valid commission percentage (0-100)");
    }
    setCommissionLoader(true);
    try {
      const res = await PatchAPI(
        `api/v1/admin/employee/${commissionEmployeeId}/commission`,
        {
          commissionPercentage: parseFloat(commissionPercentage),
        },
        "employees"
      );
      if (res?.data?.status === "success") {
        success_toaster("Commission percentage updated successfully");
        setCommissionModal(false);
        setCommissionEmployeeId("");
        setCommissionPercentage("");
        reFetch();
      } else {
        throw new Error(res?.data?.message || "An unexpected error occurred.");
      }
    } catch (error) {
      ErrorHandler(error);
    } finally {
      setCommissionLoader(false);
    }
  };

  const handleOpenCommissionModal = (employeeId, currentCommission) => {
    setCommissionEmployeeId(employeeId);
    setCommissionPercentage(currentCommission || "");
    setCommissionModal(true);
  };

  const datas = [];
  data?.data?.data?.map((cat, i) => {
    return datas.push({
      id: cat?.id,
      // sl: i + 1,
      name: cat?.name,
      email: cat?.email,
      phoneNumber: (<div> {cat?.countryCode && `+${cat?.countryCode} `}{cat?.phoneNumber || ""} </div>),
      commissionPercentage: (
        <div className="flex items-center gap-2">
          <span>{cat?.commissionPercentage ? `${cat.commissionPercentage}%` : "N/A"}</span>
          {hasPermission("employees_update") && (
            <button
              className="text-theme hover:text-themeDark text-sm font-medium underline"
              onClick={() => handleOpenCommissionModal(cat?.id, cat?.commissionPercentage)}
            >
              {cat?.commissionPercentage ? "Edit" : "Add"}
            </button>
          )}
        </div>
      ),
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
          {hasPermission("employees_view") && (
            <button
              className="border border-gray-400 rounded-md p-2 text-gray-600 hover:text-theme hover:border-theme"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/employee/${cat?.id}`);
              }}
              title="View details"
            >
              <FaEye size={24} />
            </button>
          )}
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
              onClick={(e) => {
                e.stopPropagation();
                handleEditClick(cat?.id);
              }}
              data-testid={EMPLOYEES.rowEditBtn(cat?.id)}
            >
              <FaEdit size={24} />
            </button>)}
          {hasPermission("employees_delete") && (
            <button
              className="border border-red-400 rounded-md p-2 text-red-400"
              onClick={(e) => {
                e.stopPropagation();
                setModal("delete");
                setCategoryID(cat?.id);
              }}
              data-testid={EMPLOYEES.rowDeleteBtn(cat?.id)}
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
            </li>)}
        </ul>
      </div>


      <div className="space-y-8 pt-32 px-6 2xl:px-12 ">
        <div className="flex sm:justify-between gap-4">
          <div className="w-56">
            <ManagementTab title="Total Employees" desc={data?.data?.data?.length} />
          </div>


          {/* Local Partner filter - admin only, same row as Total Employees */}
          {isAdmin && (
            <div className="flex items-center gap-2 shrink-0 min-w-[220px] max-w-[280px]">
              <Select
                options={partnerOptions}
                value={selectedPartnerOption}
                onChange={(opt) => setSelectedPartnerId(opt?.value ?? "")}
                styles={selectStyles}
                placeholder="Local Partner"
                isClearable={false}
              />
            </div>
          )}
        </div>

        <MyDataTable
          columns={columns}
          data={datas}
          placeholder={"Search ..."}
          pagination={true}
          search={true}
          onRowClick={(e) => e?.data?.id && router.push(`/employee/${e.data.id}`)}
          data-testid={EMPLOYEES.tableWrapper}
          rowTestId={(row) => `data-testid-${EMPLOYEES.row(row.id)}`}
        />

        {/* Modal */}
        <Dialog
          visible={modal === "add" || modal === "edit" || modal === "delete"}
          className="font-nunito employee-modal w-[92%] sm:max-w-[560px] rounded-xl shadow-xl [&_.p-dialog-header]:py-2 [&_.p-dialog-header]:px-4 [&_.p-dialog-content]:flex [&_.p-dialog-content]:flex-col [&_.p-dialog-content]:max-h-[85vh] [&_.p-dialog-content]:min-h-0 [&_.p-dialog-content]:overflow-hidden [&_.p-dialog-content]:p-0"
          data-testid={EMPLOYEES.modal}
          dismissableMask={true}
          onHide={handleModalClose}
          header={
            <div className="font-nunito font-semibold text-base text-gray-800" data-testid={EMPLOYEES.modalTitle}>
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
                      Are you sure you want to delete this Employee?
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
                              placeholder="Enter Employee name"
                              className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-theme/20 focus:border-theme outline-none"
                              data-testid={EMPLOYEES.nameInput}
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
                              data-testid={EMPLOYEES.emailInput}
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
                                data-testid={EMPLOYEES.passwordInput}
                              />
                              <button
                                onClick={() => setVisible(!visible)}
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-0.5"
                                aria-label={visible ? "Hide password" : "Show password"}
                                data-testid={EMPLOYEES.passwordVisibilityToggle}
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
                                  data-testid={EMPLOYEES.changePasswordCheckbox}
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
                                  data-testid={EMPLOYEES.passwordInput}
                                />
                                <button
                                  onClick={() => setVisible(!visible)}
                                  type="button"
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-0.5"
                                  aria-label={visible ? "Hide password" : "Show password"}
                                  data-testid={EMPLOYEES.passwordVisibilityToggle}
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
                                onChange={(phone) => setFormData({ ...formData, countryCode: phone })}
                                containerStyle={{ width: "100%" }}
                                inputStyle={{
                                  width: "100%",
                                  height: "40px",
                                  borderRadius: "8px",
                                  border: "1px solid #d1d5db",
                                  paddingLeft: "44px",
                                }}
                                buttonStyle={{
                                  height: "40px",
                                  border: "1px solid #d1d5db",
                                  borderRight: "none",
                                  borderRadius: "8px 0 0 8px",
                                }}
                                dropdownStyle={{ zIndex: 50 }}
                              />
                            </div>
                            <div className="col-span-8 sm:col-span-9">
                              <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                placeholder="Phone number"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm h-[40px] focus:ring-2 focus:ring-theme/20 focus:border-theme outline-none"
                                data-testid={EMPLOYEES.phoneInput}
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
                        <p className="text-xs text-gray-500">Choose one of Customer or Selected customer only.</p>
                        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                          <div className="grid grid-cols-6 gap-3 px-3 py-2.5 bg-gray-100 border-b border-gray-200 text-xs font-semibold text-gray-600">
                            <span className="col-span-2">Feature</span>
                            {["Create", "View", "Update", "Delete"].map((action) => (
                              <span key={action} className="text-center">{action}</span>
                            ))}
                          </div>
                          <div className="divide-y divide-gray-100">
                            {allFeatures.map((feature, idx) => {
                              const existingFeature = formData.features.find((f) => f.feature === feature) || {};
                              return (
                                <div
                                  key={feature}
                                  className={`grid grid-cols-6 gap-3 px-3 py-2 items-center text-sm ${idx % 2 === 1 ? "bg-gray-50" : "bg-white"}`}
                                >
                                  <span className="col-span-2 text-gray-800 capitalize">
                                    {feature.replace(/-/g, " ")}
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
                                          const otherFeature = feature === "customer" ? "selected-customer" : feature === "selected-customer" ? "customer" : null;
                                          if (checked && otherFeature) {
                                            newFeatures = newFeatures.map((f) =>
                                              f.feature === otherFeature ? { feature: otherFeature, create: false, view: false, update: false, delete: false } : f
                                            );
                                          }
                                          setFormData({ ...formData, features: newFeatures });
                                        }}
                                        className="size-4 rounded border-gray-300 text-theme focus:ring-theme/20"
                                        data-testid={EMPLOYEES.featuresCheckbox}
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
                              checked={(() => {
                                if (formData.features.length !== allFeatures.length) return false;
                                const allFull = (f) => f && ["create", "view", "update", "delete"].every((action) => f[action]);
                                const customerEntry = formData.features.find((f) => f.feature === "customer");
                                const selectedEntry = formData.features.find((f) => f.feature === "selected-customer");
                                const rest = formData.features.filter((f) => f.feature !== "customer" && f.feature !== "selected-customer");
                                const restAllFull = rest.length === allFeatures.length - 2 && rest.every(allFull);
                                const oneOfCustomerSelected = allFull(customerEntry) !== allFull(selectedEntry) && (allFull(customerEntry) || allFull(selectedEntry));
                                return restAllFull && oneOfCustomerSelected;
                              })()}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                const newFeatures = allFeatures.map((feature) => {
                                  if (feature === "selected-customer") return { feature, create: false, view: false, update: false, delete: false };
                                  if (feature === "customer") return { feature, create: checked, view: checked, update: checked, delete: checked };
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
              </>
            )}
          </form>
        </Dialog>

        {/* Commission Percentage Modal */}
        <Dialog
          visible={commissionModal}
          className="font-nunito w-[80%] lg:w-[40vw]"
          dismissableMask={true}
          onHide={() => {
            setCommissionModal(false);
            setCommissionEmployeeId("");
            setCommissionPercentage("");
          }}
          header={
            <div className="font-nunito font-bold text-sm lg:text-2xl text-center">
             Update Commission Percentage
            </div>
          }
        >
          <form onSubmit={handleCommissionSubmit} className="space-y-4 flex flex-col items-center">
            {commissionLoader ? (
              <MiniLoader />
            ) : (
              <div className="w-full space-y-4">
                <div className="flex flex-col gap-y-2">
                  <label className="text-labelColor font-medium font-satoshi">
                    Commission Percentage (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={commissionPercentage}
                    onChange={(e) => setCommissionPercentage(e.target.value)}
                    placeholder="Enter commission percentage (0-100)"
                    className="border border-borderColor rounded-[4px] px-2.5 py-3"
                    required
                  />
                  <p className="text-sm text-gray-500">
                    Enter a value between 0 and 100
                  </p>
                </div>
                <div className="flex justify-end gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCommissionModal(false);
                      setCommissionEmployeeId("");
                      setCommissionPercentage("");
                    }}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-theme text-white rounded hover:bg-themeDark disabled:opacity-70"
                  >
                   Update Commission
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
