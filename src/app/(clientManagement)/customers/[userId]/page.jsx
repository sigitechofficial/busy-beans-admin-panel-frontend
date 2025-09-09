"use client";
import BackButton from "@/components/ui/BackButton";
import Loader from "@/components/ui/Loader";
import MiniLoader from "@/components/ui/MiniLoader";
import MyDataTable from "@/components/ui/MyDataTable";
import { useDataContext } from "@/utilities/DataContext";
import { DeleteAPI } from "@/utilities/DeleteAPI";
import ErrorHandler from "@/utilities/ErrorHandler";
import GetAPI from "@/utilities/GetAPI";
import { PatchAPI } from "@/utilities/PatchAPI";
import { PostAPI } from "@/utilities/PostAPI";
import { info_toaster, success_toaster } from "@/utilities/Toaster";
import dayjs from "dayjs";
import { useParams, useRouter } from "next/navigation";
import { Dialog } from "primereact/dialog";
import React, { useEffect, useState } from "react";
import { CiMenuBurger } from "react-icons/ci";
import { hasPermission } from "@/utilities/Permission";

function CustomerDetails() {
  const { userId } = useParams();
  const router = useRouter();

  if (typeof window !== "undefined") {
    var userType = localStorage.getItem("userType");
    var salesRepId = localStorage.getItem("userID");
    var isEmployee = localStorage.getItem("isEmployee") ? true : false;
  }
  const { data: salesRepresentativeData } = GetAPI("api/v1/admin/sales-rep");
  const { data, reFetch } = GetAPI(
    `api/v1/admin/view-customer-detail/${userId}`, "customer"
  );
  // const { data: userOrders } = GetAPI(`api/v1/admin/orders?userid=${userId}`);

  //   const { data: userOrders } = GetAPI(
  //   `api/v1/admin/orders?userid=${userId}&paymentStatus=pending&salesRepId=${data?.data?.customer?.salesRepId}&statusId[ne]=6`
  // );

  let url =
    userType === "admin"
      ? `api/v1/admin/orders?userid=${userId}&statusId[ne]=6`
      : `api/v1/admin/orders?userid=${userId}&salesRepId=${salesRepId}&statusId[ne]=6`;
  const { data: userOrders } = GetAPI(url);
  
  const { data: employeesData } = GetAPI("api/v1/admin/employees", "employee");

  const employeesDatas = [];
  employeesData?.data?.data?.map((emp, i) => {
    const empName =
      emp?.name ||
      emp?.fullName ||
      [emp?.firstName, emp?.lastName].filter(Boolean).join(" ") ||
      emp?.email ||
      `Employee #${i + 1}`;

    employeesDatas.push({
      sl: i + 1,
      name: empName,
      email: emp?.email ?? "-",
      action: (
        <button
          className="w-24 bg-theme text-white hover:bg-white hover:text-theme border border-theme duration-150 font-semibold p-2 rounded-md flex justify-center"
          onClick={() => handleAssignEmployee(emp?.id)}
        >
          Assign
        </button>
      ),
    });
  });

  const employeesColumns = [
    { field: "name", header: "Name" },
    { field: "email", header: "Email" },
    { field: "action", header: "Action" },
  ];

  const handleAssignEmployee = async (employeeId) => {
    try {
      const res = await PatchAPI(`api/v1/admin/customer-update/${userId}`, {
        info: { employeeId },
      });
      if (res?.data?.status === "success") {
        success_toaster("Employee assigned successfully");
        reFetch();
        handleCancel();
      } else {
        throw new Error(res?.data?.message || "An unexpected error occurred.");
      }
    } catch (error) {
      ErrorHandler(error);
    }
  };

  const [selectedRows, setSelectedRows] = useState([]);
  const [isDisable, setIsDisable] = useState(false);

  const [userData, setUserData] = useState({
    edit: false,
    email: "",
    modal: false,
    type: "",
  });
  const orderColumn = [
    { field: "sl", header: "#", minWidth: "5px" },
    { field: "orderDate", header: "Order Date", minWidth: "6rem" },
    { field: "deliverOn", header: "Deliver On", minWidth: "6rem" },
    { field: "total", header: "Total", minWidth: "5rem" },
    { field: "invoice", header: "Invoice", minWidth: "5rem" },
    { field: "status", header: "Status", minWidth: "5rem" },
    { field: "overdue", header: "Overdue", minWidth: "5rem" },
    { field: "invSendDate", header: "Invoice Send", minWidth: "9rem" },
    { field: "invPaidDate", header: "Invoice Paid", minWidth: "8rem" },
  ];

  const getOrderPriority = (order) => {
    if (order.overdueInvoice) return 1; // Overdue first
    if (order.paymentStatus === "pending") return 2; // Unpaid next
    return 3; // paid
  };

  const orderDatas = [];

  userOrders?.data?.data?.map((elem, idx) => {
    const today = dayjs();
    const invoiceDate = dayjs(elem?.invoiceDate);
    const daysSinceInvoice = invoiceDate.isValid() ? today.diff(invoiceDate, "day") : 0;
    const termDays = elem?.termDays ?? 30;
    const isOverdue = daysSinceInvoice > termDays;

    orderDatas.push({
      sl: elem?.id,
      id: elem?.id,
      invoicePdf: elem?.invoiceDate,
      orderDate: dayjs(elem?.on).format("MM/DD/YYYY"),
      deliveredOn: dayjs(elem?.deliveredOn).format("MM/DD/YYYY"),
      total: "$" + elem?.totalBill,
      invoice: (
        <span
          className={`text-xs font-medium px-3 py-1 rounded-full text-white ${
            elem?.paymentStatus !== "pending" ? "bg-green-600" : "bg-yellow-500"
          }`}
        >
          {elem?.paymentStatus === "pending" ? "Unpaid" : "Paid"}
        </span>
      ),
      status: (
        <span
          className={`text-xs font-medium px-3 py-1 rounded-full text-white whitespace-nowrap ${
            elem?.orderCurrentStatus !== "Cancelled"
              ? "bg-green-600"
              : "bg-red-500"
          }`}
        >
          {elem?.orderCurrentStatus}
        </span>
      ),
      // overdue: (
      //   <span
      //     className={`text-xs font-medium px-3 py-1 rounded-full text-white whitespace-nowrap ${
      //       !elem?.overdueInvoice ? "bg-green-600 hidden" : "bg-red-500"
      //     }`}
      //   >
      //     {elem?.overdueInvoice ? "Yes" : ""}
      //   </span>
      // ),
      overdue: (
        <span
          className={`text-xs font-medium px-3 py-1 rounded-full text-white whitespace-nowrap ${
            isOverdue ? "bg-red-500" : "bg-green-600 hidden"
          }`}
        >
          {isOverdue ? "Yes" : ""}
        </span>
      ),
      invSendDate: elem?.invoiceDate
        ? dayjs(elem?.invoiceDate).format("MM/DD/YYYY")
        : "",
      invPaidDate: elem?.invoicePaidDate
        ? dayjs(elem?.invoicePaidDate).format("MM/DD/YYYY")
        : "",
    });
  });

  orderDatas?.sort((a, b) => {
    const priorityA = getOrderPriority(a);
    const priorityB = getOrderPriority(b);
    return priorityA - priorityB;
  });
  const salesRepresentativeDatas = [
    {
      sl: "",
      srName: "Admin",
      territoryName: "Busy Bean Coffee Inc.",

      action: (
        <button
          className="w-24 bg-theme text-white hover:bg-white hover:text-theme border border-theme duration-150 font-semibold p-2 rounded-md flex justify-center "
          onClick={() => handleAssignSalesRepresentative("remove")}
        >
          Assign
        </button>
      ),
    },
  ];
  salesRepresentativeData?.data?.data?.map((sR, i) => {
    salesRepresentativeDatas.push({
      sl: i + 1,
      srName: sR?.srName,
      territoryName: sR?.territoryName,

      action: (
        <button
          className="w-24 bg-theme text-white hover:bg-white hover:text-theme border border-theme duration-150 font-semibold p-2 rounded-md flex justify-center "
          onClick={() => handleAssignSalesRepresentative(sR?.id)}
        >
          Assign
        </button>
      ),
    });
  });
  const salesRepresentativeColumns = [
    { field: "srName", header: "Name" },
    { field: "territoryName", header: "Territory" },

    {
      field: "action",
      header: "Action",
    },
  ];

  const handleCancel = () => {
    setUserData({ modal: false });
  };

  const handleAssignSalesRepresentative = async (id) => {
    try {
      const res = await PatchAPI(
        `api/v1/admin/customer-management/assign-sale-rep/${id}`,
        {
          id: userId,
        }
      );
      if (res?.data?.status === "success") {
        success_toaster("Local Partner Assigned successfully");
        reFetch();
        handleCancel();
      } else {
        throw new Error(res?.data?.message || "An unexpected error occurred.");
      }
    } catch (error) {
      ErrorHandler(error);
    }
  };

  // const handleAssignSalesRepresentative = async (id) => {
  //   try {
  //     const info =
  //       id === "remove"
  //         ? { salesRepId: null }
  //         : { salesRepId: id, employeeId: null };

  //     const res = await PatchAPI(`api/v1/admin/customer-update/${userId}`, { info });

  //     if (res?.data?.status === "success") {
  //       success_toaster("Local Partner updated successfully");
  //       reFetch();
  //       handleCancel();
  //     } else {
  //       throw new Error(res?.data?.message || "An unexpected error occurred.");
  //     }
  //   } catch (error) {
  //     ErrorHandler(error);
  //   }
  // };

  const handleDelete = async () => {
    const res = await DeleteAPI(`api/v1/admin/delete-customer/${userId}`);
    if (res?.data?.status === "success") {
      success_toaster("Customer Deleted successfully");
      setUserData({ modal: false });
      window.history.back();
    } else {
      throw new Error(res?.data?.message || "An unexpected error occurred.");
    }
  };

  const handleSendInvoice = async () => {
    if (selectedRows?.length == 0) {
      info_toaster("Select Order to send invoice reminder");
      return;
    }

    setIsDisable(true);
    const selected = selectedRows?.map((el) => ({
      orderId: el.id,
      reminder: el?.invoicePdf ? true : false,
      invoiceDate: el?.invoiceDate ? undefined : Date.now(),
      invoiceReminder: el?.invoiceDate ? Date.now() : undefined,
    }));

    try {
      const res = await PostAPI(`api/v1/admin/order-management/send-invoice`, {
        order: selected,
        successUrl:
          "https://main.d28wfx1ny3of09.amplifyapp.com/invoice-payment-success",
        cancelUrl:
          "https://main.d28wfx1ny3of09.amplifyapp.com/invoice-payment-failure",
      });
      if (res?.data?.status === "success") {
        success_toaster("Invoice Send Successfully");
        reFetch();
        setSelectedRows([]);
        setIsDisable(false);
      } else {
        throw new Error(res?.data?.message || "An unexpected error occurred.");
      }
    } catch (error) {
      setIsDisable(false);
      ErrorHandler(error);
    }
  };
  const { toggle, setToggle } = useDataContext();

  // Preview/toggle for user discounts
  const [showAllDiscounts, setShowAllDiscounts] = useState(false);
  const previewCount = 2;

  const rawDiscounts =
    data?.data?.customer?.userDiscounts ||
    data?.data?.customer?.userDiscount ||
    data?.data?.customer?.categoryDiscounts ||
    [];

  const normalizedDiscounts = (rawDiscounts || [])
    .map((d, idx) => {
      const pct = Number(d?.percentage ?? d?.percent ?? d?.discount);
      const categoryName =
        d?.categoryName || d?.employee || d?.name || `Category #${d?.categoryId ?? d?.id ?? idx + 1}`;

      return {
        key: String(d?.categoryId ?? d?.id ?? idx),
        categoryName,
        percentage: Number.isFinite(pct) ? pct : 0,
      };
    })
    .filter((x) => x.categoryName && x.percentage > 0);

  const discountsToShow = showAllDiscounts ? normalizedDiscounts : normalizedDiscounts.slice(0, previewCount);

  return data?.length === 0 ? (
    <Loader />
  ) : (
    <div className="w-full">
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed">
        <div className="text-xl font-inter font-semibold flex items-center gap-2 [&>p]:cursor-pointer">
          <p
            onClick={() => setToggle(!toggle)}
            className="cursor-pointer md:hidden"
          >
            <CiMenuBurger size={20} />
          </p>
          <p
            onClick={() => {
              router.push(
                userType === "admin"
                  ? "/customers"
                  : "/sales-representative/customers"
              );
            }}
          >
            Customers
          </p>{" "}
          /<p className="text-theme">{data?.data?.customer?.name}</p>{" "}
          <p
            className={`text-xs font-medium px-3 py-1 rounded-full text-white whitespace-nowrap ${
              data?.data?.customer?.status ? "bg-themeGreen " : "bg-red-500"
            }`}
          >
            {data?.data?.customer?.status ? "Active" : "Inactive"}
          </p>
        </div>

        {/* <ul className="flex items-center text-sm font-medium [&>li]:border-r [&>li]:px-2 [&>li]:cursor-pointer relative text-blue-500">
            {userType === "admin" ||
              userType === "salesRepresentative" ? (
              <li
                onClick={() =>
                  setUserData({ ...userData, modal: true, type: "employee" })
                }
              >
                Assign Employee
              </li>
            ) : null}
          {userType === "admin" && (
            <li
              onClick={() =>
                setUserData({ ...userData, modal: true, type: "localPartner" })
              }
            >
              Assign local Partner
            </li>
          )}
          <li
            onClick={() => {
              const url =
                userType === "admin"
                  ? `/customers/edit/${userId}`
                  : `/sales-representative/customers/edit/${userId}`;
              router.push(url);
            }}
          >
            Edit Customer
          </li>
          <li
            onClick={() =>
              setUserData({ ...userData, modal: true, type: "delete" })
            }
          >
            Delete Account
          </li>
        </ul> */}
          <ul className="flex items-center text-sm font-medium [&>li]:border-r [&>li]:px-2 [&>li]:cursor-pointer relative text-blue-500">
            {(userType === "admin" && !isEmployee) &&
                <li
                  onClick={() =>
                    setUserData({ ...userData, modal: true, type: "employee" })
                  }
                >
                  Assign Employee
                </li>
            }

            {(userType === "admin" && !isEmployee) &&(
              <li
                onClick={() =>
                  setUserData({ ...userData, modal: true, type: "localPartner" })
                }
              >
                Assign Local Partner
              </li>
            )}

            {(hasPermission("customer_update") || hasPermission("selected-customer_update")) && (
              <li
                onClick={() => {
                  const url =
                    userType === "admin"
                      ? `/customers/edit/${userId}`
                      : `/sales-representative/customers/edit/${userId}`;
                  router.push(url);
                }}
              >
                Edit Customer
              </li>
            )}

            {(hasPermission("customer_delete") || hasPermission("selected-customer_delete")) && (
              <li
                onClick={() =>
                  setUserData({ ...userData, modal: true, type: "delete" })
                }
              >
                Delete Account
              </li>
            )}
          </ul>
      </div>

      <div className="w-full pt-28 2xl:pt-32 px-6 2xl:px-12 ">
        <div className="max-w-6xl mx-auto space-y-6 py-8 px-8 font-inter border border-borderColor bg-white shadow-tableShadow rounded-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center h-12 border-b [&>span]:w-44">
                <span className="text-gray-500 font-medium">Company Name</span>
                <div className="font-semibold">
                  {data?.data?.customer?.companyName}
                </div>
              </div>
              <div className="flex items-center h-12 border-b [&>span]:w-44">
                <span className="text-gray-500 font-medium">User Name</span>
                <div className="font-semibold">
                  {data?.data?.customer?.name}
                </div>
              </div>
              <div className="flex items-center h-12 border-b [&>span]:w-44">
                <span className="text-gray-500 font-medium">Email</span>
                {/* <div className="text-blue-600">
                  {data?.data?.customer?.email}
                </div> */}

                <a
                  href={`mailto:${data?.data?.customer?.email}`}
                  className="hover:underline text-blue-500"
                >
                  {data?.data?.customer?.email}
                </a>
              </div>
              <div className="flex items-center h-12 border-b [&>span]:w-44">
                <span className="text-gray-500 font-medium">Created On</span>
                <div>---</div>
              </div>

              <div className="gap-3 flex items-center h-12 border-b [&>span]:w-44">
                <span className="text-gray-500 font-medium">Last Seen</span>
                <div>---</div>
                {/* <button className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded">
                  Re-send Invite
                </button> */}
              </div>

              <div className="flex items-center h-12 border-b [&>span]:w-44">
                <span className="text-gray-500 font-medium">Phone</span>
                {/* <div>
                  {(data?.data?.customer?.countryCode || "+1") +
                    " " +
                    data?.data?.customer?.phoneNumber}
                </div> */}

                <a
                  href={`tel:${data?.data?.customer?.countryCode || "+1"}${
                    data?.data?.customer?.phoneNumber
                  }`}
                  className="hover:underline text-blue-500"
                >
                  {(data?.data?.customer?.countryCode || "+1") +
                    " " +
                    data?.data?.customer?.phoneNumber}
                </a>
              </div>
              <div className="flex items-center h-12 border-b [&>span]:w-44">
                <span className="text-gray-500 font-medium">Local Partner</span>
                  <div
                    onClick={() => {
                      if (userType === "admin" && !isEmployee) {
                        if (data?.data?.customer?.salesRepId) {
                          router.push(`/sale-representative/details/${data?.data?.customer?.salesRepId}`);
                        } else {
                          setUserData({ ...userData, type: "localPartner", modal: true });
                        }
                      }
                    }}
                    className={`${userType === "admin" && !isEmployee ? "text-blue-500 cursor-pointer" : "cursor-default text-gray-600"}`}
                  >
                    {data?.data?.customer?.salesRepName ?? "Not Assigned"}
                  </div>
              </div>

                <div className="flex items-center h-12 border-b [&>span]:w-44">
                  <span className="text-gray-500 font-medium">Employee</span>
                  <div
                    onClick={() => {
                      if (userType === "admin" && !isEmployee) {
                        setUserData({ ...userData, type: "employee", modal: true });
                      }
                    }}
                    className={`${userType === "admin" && !isEmployee? "text-blue-500 cursor-pointer" : "cursor-default text-gray-600"}`}
                  >
                    {data?.data?.customer?.employee ?? "Not Assigned"}
                  </div>
                </div>

              <div className="flex items-center h-12 border-b [&>span]:w-44">
                <span className="text-gray-500 font-medium">Price List</span>
                <div className="font-semibold">
                  {data?.data?.customer?.totalOrderAmount} (USD)
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 pt-1">
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-1">
                  SHIPPING
                </h3>
                {data?.data?.customer?.addresses?.[0] ? (
                  <div className="text-sm text-gray-700 space-y-1 uppercase">
                    {/* Company Name (if present) */}
                    {data?.data?.customer?.addresses?.[0].companyaddress?.trim() && (
                      <div>
                        {data?.data?.customer?.addresses?.[0].companyaddress}
                      </div>
                    )}

                    {/* Address Line One */}
                    {data?.data?.customer?.addresses?.[0].addressLineOne?.trim() && (
                      <div>
                        {data?.data?.customer?.addresses?.[0].addressLineOne}
                      </div>
                    )}

                    {/* Address Line Two (optional) */}
                    {data?.data?.customer?.addresses?.[0].addressLineTwo?.trim() && (
                      <div>
                        {data?.data?.customer?.addresses?.[0].addressLineTwo}
                      </div>
                    )}

                    {/* Town, State, ZIP */}
                    {(data?.data?.customer?.addresses?.[0].town ||
                      data?.data?.customer?.addresses?.[0].state ||
                      data?.data?.customer?.addresses?.[0].zipCode) && (
                      <div>
                        {data?.data?.customer?.addresses?.[0].town || ""}
                        {data?.data?.customer?.addresses?.[0].town &&
                        data?.data?.customer?.addresses?.[0].state
                          ? ", "
                          : ""}
                        {data?.data?.customer?.addresses?.[0].state || ""}
                        {data?.data?.customer?.addresses?.[0].zipCode
                          ? ` ${data?.data?.customer?.addresses?.[0].zipCode}`
                          : ""}
                      </div>
                    )}

                    {/* Country */}
                    {data?.data?.customer?.addresses?.[0].country?.trim() && (
                      <div>{data?.data?.customer?.addresses?.[0].country}</div>
                    )}
                    {data?.data?.customer?.dispatchEmail && (
                      <div className="lowercase break-all">
                        {data?.data?.customer?.dispatchEmail}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    No shipping address available
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-1">
                  BILLING
                </h3>
                {data?.data?.customer?.billingAddresses?.[0] ? (
                  <div className="text-sm text-gray-700 space-y-1 uppercase">
                    {/* Company Name (if available) */}
                    {data?.data?.customer?.billingAddresses?.[0].companyaddress?.trim() && (
                      <div>
                        {
                          data?.data?.customer?.billingAddresses?.[0]
                            .companyaddress
                        }
                      </div>
                    )}

                    {/* Address Line One (required) */}
                    {data?.data?.customer?.billingAddresses?.[0].addressLineOne?.trim() && (
                      <div>
                        {
                          data?.data?.customer?.billingAddresses?.[0]
                            .addressLineOne
                        }
                      </div>
                    )}

                    {/* Address Line Two (optional) */}
                    {data?.data?.customer?.billingAddresses?.[0].addressLineTwo?.trim() && (
                      <div>
                        {
                          data?.data?.customer?.billingAddresses?.[0]
                            .addressLineTwo
                        }
                      </div>
                    )}

                    {/* Town, State, ZIP (combined, fallback-safe) */}
                    {(data?.data?.customer?.billingAddresses?.[0].town ||
                      data?.data?.customer?.billingAddresses?.[0].state ||
                      data?.data?.customer?.billingAddresses?.[0].zipCode) && (
                      <div>
                        {data?.data?.customer?.billingAddresses?.[0].town || ""}
                        {data?.data?.customer?.billingAddresses?.[0].town &&
                        data?.data?.customer?.billingAddresses?.[0].state
                          ? ", "
                          : ""}
                        {data?.data?.customer?.billingAddresses?.[0].state ||
                          ""}
                        {data?.data?.customer?.billingAddresses?.[0].zipCode
                          ? ` ${data?.data?.customer?.billingAddresses?.[0].zipCode}`
                          : ""}
                      </div>
                    )}

                    {/* Country (optional) */}
                    {data?.data?.customer?.billingAddresses?.[0].country?.trim() && (
                      <div>
                        {data?.data?.customer?.billingAddresses?.[0].country}
                      </div>
                    )}
                    {data?.data?.customer?.emailToSendInvoices && (
                      <div className="lowercase break-all">
                        {data?.data?.customer?.emailToSendInvoices}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    No billing address available
                  </div>
                )}
              </div>
              <div className="md:col-span-2" >
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">User Discounts</h2>
                  {!normalizedDiscounts.length ? (
                    <div className="text-sm text-gray-500">No user discounts.</div>
                  ) : (
                    <div className="border border-borderColor rounded-md bg-white overflow-hidden">
                      <div className="divide-y">
                        {discountsToShow.map((d) => (
                          <div
                            key={d.key}
                            className="flex items-center justify-between px-4 py-2"
                          >
                            <span className="text-sm text-gray-700">{d.categoryName}</span>
                            <span className="text-sm font-semibold">{d.percentage}%</span>
                          </div>
                        ))}
                      </div>

                      {normalizedDiscounts.length > previewCount && (
                        <button
                          type="button"
                          onClick={() => setShowAllDiscounts((v) => !v)}
                          className="w-full text-sm text-theme py-2 hover:bg-gray-50"
                        >
                          {showAllDiscounts
                            ? "Show less"
                            : `Show ${normalizedDiscounts.length - previewCount} more`}
                        </button>
                      )}
                    </div>
                  )}
                </div>
            </div>
          </div>

          <div className="w-full flex justify-end">
            {hasPermission("customer_update") && (
            <button
              disabled={isDisable}
              onClick={handleSendInvoice}
              type="button"
              title={`Select Order to send invoice`}
              className={`rounded-lg border border-theme bg-theme text-white hover:bg-white hover:text-theme duration-150
                 shadow-buttonShadow px-6 font-nunito py-3 font-medium ${
                   isDisable
                     ? "cursor-not-allowed opacity-60"
                     : "cursor-pointer"
                 } `}
            >
              Invoice Reminder
            </button> )}
          </div>

          {userOrders?.data?.data?.length > 0 && (
            <div className="bg-white">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-semibold text-gray-800">Orders</h2>
              </div>

              <div className="bg-white overflow-x-auto">
                {/* <table className="w-full text-left border-collapse ">
                  <thead>
                    <tr className="text-sm font-semibold text-gray-600 border-b [&>th]:whitespace-nowrap">
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Order Date</th>
                      <th className="py-2 px-3">Deliver On</th>
                      <th className="py-2 px-3">Total</th>
                      <th className="py-2 px-3">Invoice</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3">Overdue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userOrders?.data?.data?.map((order) => (
                      <tr
                        key={order?.id}
                        onClick={() =>
                          router.push(`/orders/detail/${order?.id}`)
                        }
                        className="text-sm border-b hover:bg-gray-50 transition cursor-pointer"
                      >
                        <td className="py-2 px-3">{order.id}</td>
                        <td className="py-2 px-3">
                          {dayjs(order?.on).format("MM/DD/YYYY")}
                        </td>
                        <td className="py-2 px-3">--</td>
                        <td className="py-2 px-3">
                          ${parseFloat(order?.totalBill)?.toFixed(2)}
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`text-xs font-medium px-3 py-1 rounded-full text-white ${
                              order?.paymentStatus !== "pending"
                                ? "bg-green-600"
                                : "bg-yellow-500"
                            }`}
                          >
                            {order?.paymentStatus === "pending"
                              ? "Unpaid"
                              : "Paid"}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`text-xs font-medium px-3 py-1 rounded-full text-white whitespace-nowrap ${
                              order?.orderCurrentStatus !== "Cancelled"
                                ? "bg-green-600"
                                : "bg-red-500"
                            }`}
                          >
                            {order?.orderCurrentStatus}
                          </span>
                        </td>
                        <td className="py-2 px-3 flex items-center gap-2">
                          <span
                            className={`text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap `}
                          >
                            {order?.overdueOrder ? "OverDue" : "Not Yet"}
                          </span>
                          <span
                            className={`text-xs font-medium px-3 py-1 rounded-full text-white whitespace-nowrap bg-green-600`}
                          >
                            invoice Reminder
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table> */}

                <MyDataTable
                  columns={orderColumn}
                  data={orderDatas}
                  placeholder={"Search ..."}
                  pagination={false}
                  checkbox={true}
                  selectedRows={selectedRows}
                  setSelectedRows={setSelectedRows}
                  search={false}
                  hide
                  Styles
                  onRowClick={(e) => {
                    router.push(`/orders/detail/${e.data.id}`);
                  }}
                />
              </div>
            </div>
          )}

          <div className="pt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Signup Answers
            </h2>
            <div className="bg-gray-50 p-4 rounded-md flex justify-between items-center">
              <div className="text-sm">
                <div className="text-gray-700 font-medium">
                  Email to send invoices
                </div>
                <div className="text-gray-600 italic">
                  {data?.data?.customer?.emailToSendInvoices}
                </div>
              </div>
              {/* <button
                onClick={() =>
                  setUserData({ ...userData, edit: !userData.edit })
                }
                className="text-blue-600 hover:underline text-sm"
              >
                {userData?.edit ? "Save" : "Edit"}
              </button> */}
            </div>
          </div>
        </div>
      </div>

      <Dialog
        visible={userData?.modal}
        style={{
          width: "90vw",
          maxWidth: userData?.type === "localPartner" || userData?.type === "employee" ? "1200px" : "500px",
        }}
        className="font-nunito"
        onHide={() => setUserData({ ...userData, modal: false })}
        header={
        userData?.type === "localPartner"
          ? "Assign Local Partner"
          : userData?.type === "employee"
          ? "Assign Employee"
          : userData?.type === "delete"
          ? (
            <div className="font-bold text-2xl text-center text-red-600">
              Confirm Deletion
            </div>
          )
          : ""
        }
        footer={
          userData?.type === "localPartner" || userData?.type === "employee" ? (
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg border border-theme bg-theme text-white hover:bg-white hover:text-theme duration-150
                      shadow-buttonShadow px-6 font-nunito py-3 font-medium"
              >
                Cancel
              </button>
            </div>
          ) : userData?.type === "delete" ? (
            <div className="flex justify-end gap-3 pt-6">
              <button
                type="button"
                onClick={() => setUserData({ ...userData, modal: false })}
                className="rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 px-5 py-2 font-medium transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-md bg-red-600 text-white hover:bg-red-700 px-5 py-2 font-medium transition shadow-md"
              >
                Delete
              </button>
            </div>
          ) : (
            ""
          )
        }
      >
        {userData?.type === "localPartner" ? (
          <div className="space-y-4">
            <MyDataTable
              columns={salesRepresentativeColumns}
              data={salesRepresentativeDatas}
              placeholder={"Search ..."}
              pagination={false}
              hide={true}
              search={true}
              Styles={"space-y-4"}
            />
          </div>
        ) : userData?.type === "employee" ? (
    <div className="space-y-4">
      <MyDataTable
        columns={employeesColumns}
        data={employeesDatas}
        placeholder={"Search ..."}
        pagination={false}
        hide={true}
        search={true}
        Styles={"space-y-4"}
      />
    </div>
  ): userData?.type === "delete" ? (
          <div className="space-y-6 text-center px-4 pt-2">
            <div className="text-lg text-gray-700">
              Are you sure you want to delete this customer?
            </div>
            <div className="text-sm text-gray-500">
              This action cannot be undone. The customer’s account and related
              data will be permanently removed.
            </div>
          </div>
        ) : (
          ""
        )}
      </Dialog>
    </div>
  );
}

export default CustomerDetails;
