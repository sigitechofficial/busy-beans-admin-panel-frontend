"use client";
import BackButton from "@/components/ui/BackButton";
import Loader from "@/components/ui/Loader";
import MiniLoader from "@/components/ui/MiniLoader";
import MyDataTable from "@/components/ui/MyDataTable";
import { DeleteAPI } from "@/utilities/DeleteAPI";
import ErrorHandler from "@/utilities/ErrorHandler";
import GetAPI from "@/utilities/GetAPI";
import { PatchAPI } from "@/utilities/PatchAPI";
import { PostAPI } from "@/utilities/PostAPI";
import { success_toaster } from "@/utilities/Toaster";
import dayjs from "dayjs";
import { useParams, useRouter } from "next/navigation";
import { Dialog } from "primereact/dialog";
import React, { useEffect, useState } from "react";

function page() {
  const { userId } = useParams();
  const router = useRouter();
  let userType = "";
  if (typeof window !== "undefined") {
    userType = localStorage.getItem("userType");
  }
  const { data: salesRepresentativeData, reFetch } = GetAPI(
    "api/v1/admin/sales-rep"
  );
  const { data } = GetAPI(`api/v1/admin/view-customer-detail/${userId}`);
  const { data: userOrders } = GetAPI(`api/v1/admin/orders?userid=${userId}`);

  const [userData, setUserData] = useState({
    edit: false,
    email: "",
    modal: false,
    type: "",
  });
  const salesRepresentativeDatas = [
    {
      sl: "",
      srName: "Admin",
      territoryName: "Busy Bean Coffee Inc.",

      action: (
        <button
          className="w-24 bg-theme text-white hover:bg-white hover:text-theme border border-theme duration-150 font-semibold p-2 rounded-md flex justify-center "
          onClick={() => handleAssignSalesRepresentative(null)}
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
        setModal(false);
        reFetch();
      } else {
        throw new Error(res?.data?.message || "An unexpected error occurred.");
      }
    } catch (error) {
      ErrorHandler(error);
    }
  };

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
  useEffect(() => {
    setUserData({
      ...userData,
      email: data?.data?.customer?.emailToSendInvoices,
    });
  }, [data]);

  return data?.length === 0 ? (
    <Loader />
  ) : (
    <div className="w-full">
      <div className="w-full sm:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[94px] border-b px-6 2xl:px-12 fixed">
        <h2 className="text-xl lg:text-2xl font-inter font-semibold flex items-center gap-2">
          <div className="text-base">
            <BackButton />
          </div>
          Customers /
          <span className="text-theme">
            {data?.data?.customer?.companyName}
          </span>{" "}
          <span
            className={`rounded-full text-xs text-white font-normal p-1 ${
              data?.data?.customer?.status ? "bg-themeGreen " : "bg-red-500"
            }`}
          >
            {data?.data?.customer?.status ? "Active" : "Inactive"}
          </span>
        </h2>

        <ul className="flex items-center text-sm font-medium [&>li]:border-r [&>li]:px-2 [&>li]:cursor-pointer relative text-blue-500">
          <li
            onClick={() =>
              setUserData({ ...userData, modal: true, type: "localPartner" })
            }
          >
            Assign local Partner
          </li>
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
          {/* <li>Addresses</li>
          <li>Reset Password</li>
          <li>Export</li> */}
          <li onClick={() => setUserData({ ...userData, modal: true })}>
            Delete Account
          </li>
        </ul>
      </div>

      <div className="w-full pt-32 px-6 2xl:px-12 ">
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
                <div className="text-blue-600">
                  {data?.data?.customer?.email}
                </div>
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
                <div>
                  {(data?.data?.customer?.countryCode || "+1") +
                    " " +
                    data?.data?.customer?.phoneNumber}
                </div>
              </div>
              <div className="flex items-center h-12 border-b [&>span]:w-44">
                <span className="text-gray-500 font-medium">Local Partner</span>
                <div>
                  {data?.data?.customer?.salesRepName ?? "Not Assigned"}
                </div>
              </div>
              <div className="flex items-center h-12 border-b [&>span]:w-44">
                <span className="text-gray-500 font-medium">Price List</span>
                <div className="font-semibold">
                  {data?.data?.customer?.totalOrderAmount} (USD)
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    No billing address available
                  </div>
                )}
              </div>
            </div>
          </div>

          {userOrders?.data?.data?.length > 0 && (
            <div className="bg-white">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Orders
              </h2>

              <div className="bg-white overflow-x-auto">
                <table className="w-full text-left border-collapse ">
                  <thead>
                    <tr className="text-sm font-semibold text-gray-600 border-b [&>th]:whitespace-nowrap">
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Order Date</th>
                      <th className="py-2 px-3">Deliver On</th>
                      <th className="py-2 px-3">Total</th>
                      <th className="py-2 px-3">Invoice</th>
                      <th className="py-2 px-3">Status</th>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                  {userData?.edit ? (
                    <input
                      className="rounded-lg border border-theme px-2 h-12 my-3 bg-transparent outline-none text-black"
                      value={userData?.email}
                      type="text"
                      onChange={(e) =>
                        setUserData({ ...userData, email: e.target.value })
                      }
                    />
                  ) : (
                    data?.data?.customer?.emailToSendInvoices
                  )}
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
          maxWidth: userData?.type === "localPartner" ? "" : "500px",
        }}
        className="font-nunito"
        onHide={() => setUserData({ ...userData, modal: false })}
        header={
          userData?.type === "localPartner" ? (
            "Assign Local Partner"
          ) : (
            <div className="font-bold text-2xl text-center text-red-600">
              Confirm Deletion
            </div>
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
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg border border-theme bg-theme text-white hover:bg-white hover:text-theme duration-150
                      shadow-buttonShadow px-6 font-nunito py-3 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 text-center px-4 pt-2">
            <div className="text-lg text-gray-700">
              Are you sure you want to delete this customer?
            </div>
            <div className="text-sm text-gray-500">
              This action cannot be undone. The customer’s account and related
              data will be permanently removed.
            </div>

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
          </div>
        )}
      </Dialog>
    </div>
  );
}

export default page;
