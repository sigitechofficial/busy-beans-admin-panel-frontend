"use client";
import { useParams } from "next/navigation";
import React from "react";

function page() {
  const { userId } = useParams();

  return (
    <div className="w-full">
      <div className="w-full sm:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[94px] border-b px-6 2xl:px-12 fixed">
        <h2 className="text-xl lg:text-2xl font-inter font-semibold">
          Customers / <span className="text-theme">3 Eleven Corp</span> <span className="bg-themeGreen rounded-full text-xs text-white font-normal p-1">Active</span>
        </h2>

        <ul className="flex items-center text-sm font-medium [&>li]:border-r [&>li]:px-2 [&>li]:cursor-pointer relative">
          <li>Edit Customer</li>
          <li>Addresses</li>
          <li>Reset Password</li>
          <li>Export</li>
          <li>Close Account</li>
        </ul>
      </div>

      <div className="w-full pt-32 px-6 2xl:px-12 ">
        <div className="max-w-6xl mx-auto space-y-6 py-8 px-8 font-inter border border-borderColor bg-white shadow-tableShadow rounded-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center h-12 border-b [&>span]:w-44">
                <span className="text-gray-500 font-medium">Contact</span>
                <div className="font-semibold">Raymond Perez 3Leven Corp</div>
              </div>
              <div className="flex items-center h-12 border-b [&>span]:w-44">
                <span className="text-gray-500 font-medium">Email</span>
                <div className="text-blue-600">ray.prez@threeeleven.com</div>
              </div>
              <div className="flex items-center h-12 border-b [&>span]:w-44">
                <span className="text-gray-500 font-medium">Created On</span>
                <div>Mar 20 2025</div>
              </div>

              <div className="gap-3 flex items-center h-12 border-b [&>span]:w-44">
                <span className="text-gray-500 font-medium">Last Seen</span>
                <div>Mar 20 2025</div>
                <button className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded">
                  Re-send Invite
                </button>
              </div>

              <div className="flex items-center h-12 border-b [&>span]:w-44">
                <span className="text-gray-500 font-medium">Phone</span>
                <div>4077483500</div>
              </div>
              <div className="flex items-center h-12 border-b [&>span]:w-44">
                <span className="text-gray-500 font-medium">Payment Terms</span>
                <div>30 Days</div>
              </div>
              <div className="flex items-center h-12 border-b [&>span]:w-44">
                <span className="text-gray-500 font-medium">Price List</span>
                <div className="font-semibold">Default (USD)</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-1">
                  SHIPPING
                </h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <div>RAYMOND PEREZ 3LEVEN CORP</div>
                  <div>3LEVEN CORP</div>
                  <div>8010 SUNPORT DRIVE</div>
                  <div>STE 122</div>
                  <div>ORLANDO FL 32809</div>
                  <div>USA</div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-1">
                  BILLING
                </h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <div>RAYMOND PEREZ 3LEVEN CORP</div>
                  <div>3LEVEN CORP</div>
                  <div>8010 SUNPORT DRIVE</div>
                  <div>STE 122</div>
                  <div>ORLANDO FL 32809</div>
                  <div>USA</div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Signup Answers
            </h2>
            <div className="bg-gray-50 p-4 rounded-md flex justify-between items-center">
              <div className="text-sm">
                <div className="text-gray-700 font-medium">
                  Email to send invoices
                </div>
                <div className="text-gray-600 italic">
                  raymond.perez@3levencorp.com
                </div>
              </div>
              <button className="text-blue-600 hover:underline text-sm">
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default page;
