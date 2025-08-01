"use client";
import BackButton from "@/components/ui/BackButton";
import Loader from "@/components/ui/Loader";
import { useDataContext } from "@/utilities/DataContext";
import GetAPI from "@/utilities/GetAPI";
import dayjs from "dayjs";
import { useParams, usePathname, useRouter } from "next/navigation";
import React from "react";
import { CiMenuBurger } from "react-icons/ci";

export default function SalesRepDetails() {
  if (typeof window !== "undefined") {
    var userType = localStorage.getItem("userType");
  }
  const { userId } = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const { data, reFetch } = GetAPI(`api/v1/admin/sales-rep/${userId}`);
  const { toggle, setToggle } = useDataContext();

  return data?.length === 0 ? (
    <Loader />
  ) : (
    <div className="w-full">
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed">
        <h2 className="text-xl lg:text-2xl font-inter font-semibold flex items-center gap-2">
          {/* <div className="text-base">
            <BackButton />
          </div> */}
          <p
            onClick={() => setToggle(!toggle)}
            className="cursor-pointer md:hidden"
          >
            <CiMenuBurger size={20} />
          </p>
          {pathname.includes("supplier") ? "Supplier" : "Local partner"} /
          <span className="text-theme">{data?.data?.data?.srName}</span>{" "}
          <span
            className={`rounded-full text-xs text-white font-normal p-1 ${
              data?.data?.data?.status ? "bg-themeGreen " : "bg-red-500"
            }`}
          >
            {data?.data?.data?.status ? "Active" : "Inactive"}
          </span>
        </h2>

        <ul className="flex items-center text-sm font-medium [&>li]:border-r [&>li]:px-2 [&>li]:cursor-pointer relative text-blue-500">
          <li
            onClick={() => {
              router.push(`/sale-representative/edit/${userId}`);
            }}
          >
            Edit
          </li>
          <li
            onClick={() => {
              router.push(`/orders/pending-pullouts/${userId}`);
            }}
          >
            Pending Pullouts
          </li>
          {/* <li>Addresses</li>
            <li>Reset Password</li>
            <li>Export</li> */}
          {/* <li onClick={() => setUserData({ ...userData, modal: true })}>
            Delete Account
          </li> */}
        </ul>
      </div>

      <div className="w-full pt-28 2xl:pt-32 px-6 2xl:px-12 ">
        <div className="max-w-6xl mx-auto space-y-6 py-8 px-8 font-inter border border-borderColor bg-white shadow-tableShadow rounded-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center h-12 border-b [&>span]:w-44">
                <span className="text-gray-500 font-medium">Contact</span>
                <div className="font-semibold">{data?.data?.data?.srName}</div>
              </div>
              <div className="flex items-center h-12 border-b [&>span]:w-44">
                <span className="text-gray-500 font-medium">Email</span>
                <div className="text-blue-600">{data?.data?.data?.email}</div>
              </div>
              <div className="flex items-center h-12 border-b [&>span]:w-44">
                <span className="text-gray-500 font-medium">Created At</span>
                <div>
                  {dayjs(data?.data?.data?.createdAt).format("MM/DD/YYYY")}
                </div>
              </div>

              <div className="flex items-center h-12 border-b [&>span]:w-44">
                <span className="text-gray-500 font-medium">Credit Limits</span>
                <div className="font-semibold">
                  {data?.data?.data?.creditLimit}
                </div>
              </div>
              <div className="flex items-center h-12 border-b [&>span]:w-44">
                <span className="text-gray-500 font-medium">
                  Account Connected
                </span>
                <div className="font-semibold">
                  {data?.data?.data?.isAccountConnected ? "Yes" : "No"}
                </div>
              </div>
              <div className="flex items-center h-12 border-b [&>span]:w-44">
                <span className="text-gray-500 font-medium">
                  Bank Account Connected
                </span>
                <div className="font-semibold">
                  {data?.data?.data?.defaultBankAccount ? "Yes" : "No"}
                </div>
              </div>
              <div className="flex items-center h-12 border-b [&>span]:w-44">
                <span className="text-gray-500 font-medium">
                  Stripe Account Connected
                </span>
                <div className="font-semibold">
                  {data?.data?.data?.stripeCustomerId ? "Yes" : "No"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-1">
                  Address
                </h3>
                {data?.data?.data ? (
                  <div className="text-sm text-gray-700 space-y-1 uppercase">
                    <div>{data?.data?.data?.territoryName}</div>

                    {/* Company Name (if present) */}
                    {data?.data?.data?.address?.trim() && (
                      <div>{data?.data?.data?.address}</div>
                    )}

                    {/* Address Line One */}
                    {data?.data?.data?.addressOne?.trim() && (
                      <div>{data?.data?.data?.addressOne}</div>
                    )}

                    {/* Address Line Two (optional) */}
                    {data?.data?.data?.addressTwo?.trim() && (
                      <div>{data?.data?.data?.addressTwo}</div>
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
                      <div>{data?.data?.data?.country}</div>
                    )}

                    <div>
                      {data?.data?.data?.countryCode +
                        " " +
                        data?.data?.data?.phoneNumber}
                    </div>
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
    </div>
  );
}
