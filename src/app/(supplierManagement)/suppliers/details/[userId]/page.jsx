"use client";
import BackButton from "@/components/ui/BackButton";
import Loader from "@/components/ui/Loader";
import { useDataContext } from "@/utilities/DataContext";
import GetAPI from "@/utilities/GetAPI";
import dayjs from "dayjs";
import { useParams, usePathname, useRouter } from "next/navigation";
import { React, useState } from "react";
import { DeleteAPI } from "@/utilities/DeleteAPI";
import ErrorHandler from "@/utilities/ErrorHandler";
import { success_toaster } from "@/utilities/Toaster";
import { hasPermission } from "@/utilities/Permission";
import { DETAIL_SUPPLIER } from "../../supplier.testid";

export default function LocalPartnerSupplierDetails() {
  if (typeof window !== "undefined") {
    var userType = localStorage.getItem("userType");
  }
  const { userId } = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const { data, reFetch } = GetAPI(`api/v1/admin/supplier/${userId}`, "supplier");
  const { toggle, setToggle } = useDataContext();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [loader, setLoader] = useState("");

  const handleDelete = async (e) => {
    e.preventDefault();
    setLoader("delete");
    try {
      const res = await DeleteAPI(`api/v1/admin/supplier/${userId}`);
      if (res?.data?.status === "success") {
        success_toaster("Supplier Deleted Successfully");
        setIsDeleteOpen(false);
        setLoader("");
        router.push("/suppliers"); 
      }
    } catch (error) {
      ErrorHandler(error);
      setLoader("");
    }
  };

  return data?.length === 0 ? (
    <Loader />
  ) : (
    <div className="w-full" data-testid={DETAIL_SUPPLIER.root}>
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed"
       data-testid={DETAIL_SUPPLIER.headerBar}>
        <h2 className="text-xl font-inter font-semibold flex items-center gap-2" data-testid={DETAIL_SUPPLIER.title}>
          <div className="text-base">
            <BackButton />
          </div>
          {pathname.includes("supplier") ? "Supplier" : "Local partner"} /
          <span className="text-theme">{data?.data?.data?.supplierName}</span>{" "}
          <span
            className={`text-xs font-medium px-3 py-1 rounded-full text-white whitespace-nowrap ${
              data?.data?.data?.status ? "bg-themeGreen " : "bg-red-500"
            }`}
          >
            {data?.data?.data?.status ? "Active" : "Inactive"}
          </span>
        </h2>

        <ul className="flex items-center text-sm font-medium [&>li]:border-r [&>li]:px-2 [&>li]:cursor-pointer relative">
          {hasPermission("supplier_update") && (
          <li
            onClick={() => {
              router.push(`/suppliers/edit/${userId}`);
            }}
            data-testid={DETAIL_SUPPLIER.editButton}
          >
            Edit
          </li> )}
          {/* <li>Addresses</li>
            <li>Reset Password</li>
            <li>Export</li> */}          
            {hasPermission("supplier_delete") && (
            <li onClick={() => setIsDeleteOpen(true)} data-testid={DETAIL_SUPPLIER.deleteButton}>Delete Account</li> )}
        </ul>
      </div>

      <div className="w-full pt-28 2xl:pt-32 px-6 2xl:px-12 ">
        <div className="max-w-6xl mx-auto space-y-6 py-8 px-8 font-inter border border-borderColor bg-white shadow-tableShadow rounded-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div data-testid={DETAIL_SUPPLIER.contactSection}>
              <div className="flex items-center h-12 border-b [&>span]:w-44">
                <span className="text-gray-500 font-medium">Contact</span>
                <div className="font-semibold" data-testid={DETAIL_SUPPLIER.supplierName}>
                  {data?.data?.data?.supplierName}
                </div>
              </div>
              <div className="flex items-center h-12 border-b [&>span]:w-44" data-testid={DETAIL_SUPPLIER.supplierEmail}>
                <span className="text-gray-500 font-medium">Email</span>
                <div className="text-blue-600">{data?.data?.data?.email}</div>
              </div>
              <div className="flex items-center h-12 border-b [&>span]:w-44" data-testid={DETAIL_SUPPLIER.supplierCreatedAt}>
                <span className="text-gray-500 font-medium">Created At</span>
                <div>
                  {dayjs(data?.data?.data?.createdAt).format("MM/DD/YYYY")}
                </div>
              </div>

              <div className="gap-3 flex items-center h-12 border-b [&>span]:w-44" data-testid={DETAIL_SUPPLIER.supplierRegisteredBy}>
                <span className="text-gray-500 font-medium">Registered By</span>
                <div>{data?.data?.data?.registerBy}</div>
              </div>

              <div className="flex items-center h-12 border-b [&>span]:w-44" data-testid={DETAIL_SUPPLIER.supplierPhone}>
                <span className="text-gray-500 font-medium">Phone</span>
                <div>
                  {data?.data?.data?.countryCode +
                    " " +
                    data?.data?.data?.phoneNum}
                </div>
              </div>
              <div className="flex items-center h-12 border-b [&>span]:w-44" data-testid={DETAIL_SUPPLIER.supplierBankAccount}>
                <span className="text-gray-500 font-medium">Bank Account</span>
                <div>{data?.data?.data?.bankAccount}</div>
              </div>
              <div className="flex items-center h-12 border-b [&>span]:w-44" data-testid={DETAIL_SUPPLIER.supplierType}>
                <span className="text-gray-500 font-medium">Supplier Type</span>
                <div className="font-semibold">
                  {data?.data?.data?.supplierType}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div data-testid={DETAIL_SUPPLIER.addressSection}>
                <h3 className="text-sm font-bold text-gray-700 mb-1">
                  Address
                </h3>
                {data?.data?.data ? (
                  <div className="text-sm text-gray-700 space-y-1 uppercase">
                    {/* Company Name (if present) */}
                    {data?.data?.data?.companyaddress?.trim() && (
                      <div data-testid={DETAIL_SUPPLIER.companyAddress}>
                        {data?.data?.data?.addresses?.[0].companyaddress}
                      </div>
                    )}

                    {/* Address Line One */}
                    {data?.data?.data?.addressOne?.trim() && (
                      <div data-testid={DETAIL_SUPPLIER.addressLineOne}>{data?.data?.data?.addressOne}</div>
                    )}

                    {/* Address Line Two (optional) */}
                    {data?.data?.data?.addressTwo?.trim() && (
                      <div data-testid={DETAIL_SUPPLIER.addressLineTwo}>{data?.data?.data?.addressTwo}</div>
                    )}

                    {/* Town, State, ZIP */}
                    {(data?.data?.data?.city ||
                      data?.data?.data?.state ||
                      data?.data?.data?.zipCode) && (
                      <div>
                        {data?.data?.data?.city || ""}
                        {data?.data?.data?.city && data?.data?.data?.state
                          ? ", "
                          : ""}
                        {data?.data?.data?.state || ""}
                        {data?.data?.data?.zipCode
                          ? ` ${data?.data?.data?.zipCode}`
                          : ""}
                      </div>
                    )}

                    {/* Country */}
                    {data?.data?.data?.country?.trim() && (
                      <div data-testid={DETAIL_SUPPLIER.country}>{data?.data?.data?.country}</div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    No address available
                  </div>
                )}
              </div>

              {/* <div>
                <h3 className="text-sm font-bold text-gray-700 mb-1">
                  BILLING
                </h3>
                {data?.data?.data?.billingAddresses?.[0] ? (
                  <div className="text-sm text-gray-700 space-y-1 uppercase">
     
                    {data?.data?.data?.billingAddresses?.[0].companyaddress?.trim() && (
                      <div>
                        {data?.data?.data?.billingAddresses?.[0].companyaddress}
                      </div>
                    )}

       
                    {data?.data?.data?.billingAddresses?.[0].addressLineOne?.trim() && (
                      <div>
                        {data?.data?.data?.billingAddresses?.[0].addressLineOne}
                      </div>
                    )}

             
                    {data?.data?.data?.billingAddresses?.[0].addressLineTwo?.trim() && (
                      <div>
                        {data?.data?.data?.billingAddresses?.[0].addressLineTwo}
                      </div>
                    )}

      
                    {(data?.data?.data?.billingAddresses?.[0].town ||
                      data?.data?.data?.billingAddresses?.[0].state ||
                      data?.data?.data?.billingAddresses?.[0].zipCode) && (
                      <div>
                        {data?.data?.data?.billingAddresses?.[0].town || ""}
                        {data?.data?.data?.billingAddresses?.[0].town &&
                        data?.data?.data?.billingAddresses?.[0].state
                          ? ", "
                          : ""}
                        {data?.data?.data?.billingAddresses?.[0].state || ""}
                        {data?.data?.data?.billingAddresses?.[0].zipCode
                          ? ` ${data?.data?.data?.billingAddresses?.[0].zipCode}`
                          : ""}
                      </div>
                    )}

                 
                    {data?.data?.data?.billingAddresses?.[0].country?.trim() && (
                      <div>
                        {data?.data?.data?.billingAddresses?.[0].country}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    No billing address available
                  </div>
                )}
              </div> */}
            </div>
          </div>

          {/* <div className="pt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Signup Answers
            </h2>
            <div className="bg-gray-50 p-4 rounded-md flex justify-between items-center">
              <div className="text-sm">
                <div className="text-gray-700 font-medium">
                  Email to send invoices
                </div>
                <div className="text-gray-600 italic">
                  {data?.data?.data?.emailToSendInvoices}
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>
        {isDeleteOpen && (
          <div
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40"
            onClick={() => (loader ? null : setIsDeleteOpen(false))}
            data-testid={DETAIL_SUPPLIER.deleteModal}
          >
            <div
              className="w-[90%] max-w-md rounded-md bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-title"
            >
              <h3 id="delete-title" className="text-lg font-semibold">
                Delete Supplier Account
              </h3>
              <p className="mt-2 text-sm text-gray-600" data-testid={DETAIL_SUPPLIER.deleteModalMessage}>
                Are you sure you want to delete{" "}
                <span className="font-medium">{data?.data?.data?.supplierName}</span>?
              </p>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 rounded border"
                  onClick={() => setIsDeleteOpen(false)}
                  data-testid={DETAIL_SUPPLIER.deleteModalCancelButton}
                  disabled={loader === "delete"}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded text-white ${loader === "delete" ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                    }`}
                  onClick={handleDelete}
                  disabled={loader === "delete"}
                  data-testid={DETAIL_SUPPLIER.deleteModalConfirmButton}
                >
                  {loader === "delete" ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
