"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { success_toaster, error_toaster, info_toaster } from "@/utilities/Toaster";
import GetAPI from "@/utilities/GetAPI";
import { PatchAPI } from "@/utilities/PatchAPI";
import Loader from "@/components/ui/Loader";
import BackButton from "@/components/ui/BackButton";

export default function Profile() {
  const router = useRouter();
  const [userType, setUserType] = useState("");
  const [userID, setUserID] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    supportEmail: "",
    countryCode: "",
    phoneNumber: "",
    address: "",
    country: "",
    state: "",
    city: "",
    zipCode: "",
    password: "",
  });
  const [profileKey, setProfileKey] = useState(null);

  const { data: profileResp, isLoading, reFetch  } = GetAPI(profileKey, "profile");

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserType(localStorage.getItem("userType") ?? "");
      setUserID(localStorage.getItem("userID") ?? null);
    }
  }, []);

  useEffect(() => {
    if (userType === "salesRepresentative") {
      setProfileKey(`api/v1/admin/sales-rep/${userID}`);
    } else if (userType === "admin") {
      setProfileKey("api/v1/admin/profile");
    }
  }, [userType, userID]);

  const readonlyInfo = useMemo(() => {
    const d = userType === "salesRepresentative" ? profileResp?.data?.data : profileResp?.data || {};
    return {
      id: d.id ?? "",
      latestOtp: d.latestOtp ?? "",
      createdAt: d.createdAt ?? "",
      updatedAt: d.updatedAt ?? "",
    };
  }, [profileResp]);

  useEffect(() => {
    if (!profileResp?.data) return;

    const userData = userType === "salesRepresentative" ? profileResp?.data?.data : profileResp?.data;
    setForm({
      name: userData.srName ?? userData.name ?? "",
      email: userData.email ?? "",
      supportEmail: userData.supportEmail ?? "",
      countryCode: userData.countryCode ?? "",
      phoneNumber: userData.phoneNumber ?? "",
      address: userData.address ?? "",
      country: userData.country ?? "",
      state: userData.state ?? "",
      city: userData.city ?? "",
      zipCode: userData.zipCode ?? "",
      password: "",
    });
  }, [profileResp, userType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle profile update submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userID) {
      info_toaster("User id not found.");
      return;
    }
    if (!form.email?.trim()) {
      info_toaster("Email is required");
      return;
    }
    if (!form.name?.trim()) {
      info_toaster("Name is required");
      return;
    }
    const payload = { ...form };
    if (!payload.password) delete payload.password;
    try {
      let res;
      if (userType === "salesRepresentative") {
        res = await PatchAPI(`api/v1/admin/sales-rep/${userID}`, payload, "profile");
      } else {
        res = await PatchAPI(`api/v1/admin/profile-update/${userID}`, payload, "profile");
      }

      if (res?.data?.status === "success") {
        success_toaster("Profile updated successfully");
        reFetch();
        setIsEditing(false);
      } else {
        throw new Error(res?.data?.message || "Failed to update profile");
      }
    } catch (err) {
      error_toaster(err?.message || "Something went wrong");
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
     <div className="w-full">
      <div className="w-full mdm:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed">
        <div className="flex items-center gap-x-2">
          <BackButton />
          <h2 className="text-xl font-inter font-semibold">Profile</h2>
        </div>
      </div>
      <div className="w-full pt-28 2xl:pt-32 px-6 2xl:px-12 ">
        <div className="max-w-6xl mx-auto space-y-6 py-8 px-8 font-inter border border-borderColor bg-white shadow-tableShadow rounded-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Readonly Fields */}
          <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
            <div>
              <span className="block">User ID</span>
              <span className="font-medium text-gray-700">{readonlyInfo.id}</span>
            </div>
            <div>
              <span className="block">Latest OTP</span>
              <span className="font-medium text-gray-700">{readonlyInfo.latestOtp}</span>
            </div>
            <div>
              <span className="block">Created At</span>
              <span className="font-medium text-gray-700">
                {readonlyInfo.createdAt ? new Date(readonlyInfo.createdAt).toLocaleString() : "-"}
              </span>
            </div>
            <div>
              <span className="block">Updated At</span>
              <span className="font-medium text-gray-700">
                {readonlyInfo.updatedAt ? new Date(readonlyInfo.updatedAt).toLocaleString() : "-"}
              </span>
            </div>
          </div>

          {/* Section 1: Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="font-satoshi space-y-4">
            <p className="font-black text-xl lg:text-2xl text-theme flex items-center justify-between gap-x-2">
              1. Login Details
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-gray-500 font-medium">Name</label>
                {isEditing ? (
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Full name"
                    className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                  />
                ) : (
                  <span>{form.name}</span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-gray-500 font-medium">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                    className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                  />
                ) : (
                  <span>{form.email}</span>
                )}
              </div>
            </div>

            {/* Support Email (admin condition) and Phone Number */}
            <div className={`grid grid-cols-1 sm:${isEditing ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
              {userType === "admin" && (
                <div className="flex flex-col gap-1">
                  <label className="text-gray-500 font-medium">Support Email</label>
                  {isEditing ? (
                    <input
                      name="supportEmail"
                      value={form.supportEmail}
                      onChange={handleChange}
                      placeholder="Enter Support Email"
                      className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                    />
                  ) : (
                    <span>{form.supportEmail}</span>
                  )}
                </div>
              )}
              <div className="flex flex-col gap-1">
                <label className="text-gray-500 font-medium">Phone Number</label>
                {isEditing ? (
                  <div className="flex gap-2">
                    <input
                      name="countryCode"
                      value={form.countryCode}
                      onChange={handleChange}
                      placeholder="Code"
                      className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3 w-14"
                    />
                    <input
                      name="phoneNumber"
                      value={form.phoneNumber}
                      onChange={handleChange}
                      placeholder="Phone Number"
                      className="border flex-1 border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                    />
                  </div>
                ) : (
                 <span>{form.countryCode ? `${form.countryCode} ` : ''}{form.phoneNumber}</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Address Details */}
          <div className="font-satoshi space-y-4">
            <p className="font-black text-xl lg:text-2xl text-theme flex items-center justify-between gap-x-2">
              2. Address Details
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-gray-500 font-medium">Address</label>
                {isEditing ? (
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Street / Address"
                    className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                  />
                ) : (
                  <span>{form.address}</span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-gray-500 font-medium">Country</label>
                {isEditing ? (
                  <input
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    placeholder="Country"
                    className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                  />
                ) : (
                  <span>{form.country}</span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-gray-500 font-medium">State</label>
                {isEditing ? (
                  <input
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="State / Province"
                    className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                  />
                ) : (
                  <span>{form.state}</span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-gray-500 font-medium">City</label>
                {isEditing ? (
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="City"
                    className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                  />
                ) : (
                  <span>{form.city}</span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-gray-500 font-medium">Zip Code</label>
                {isEditing ? (
                  <input
                    name="zipCode"
                    value={form.zipCode}
                    onChange={handleChange}
                    placeholder="Zip / Postal code"
                    className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                  />
                ) : (
                  <span>{form.zipCode}</span>
                )}
              </div>
            </div>
          </div> </div>

          {/* Section 3: Password */}
          <div className="font-satoshi space-y-4">
            <p className="font-black text-xl lg:text-2xl text-theme flex items-center justify-between gap-x-2">
              3. Change Password
            </p>
            <div className="flex flex-col gap-1">
              <label className="text-gray-500 font-medium">New Password</label>
              {isEditing ? (
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter new password (optional)"
                  className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                />
              ) : (
                <span>{"******"}</span>
              )}
            </div>
          </div>

           {/* Actions */}
          <div className="flex justify-end gap-3 mt-2">
            {/* <button
              type="button"
              onClick={() => router.push("/")}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button> */}
             {!isEditing && (
            <button
              type="button"
              onClick={handleEdit}
              className="px-4 py-2 bg-theme text-white rounded hover:bg-themeDark"
            >
              Edit
            </button> )}
            {isEditing && (
              <>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-theme text-white rounded hover:bg-themeDark disabled:opacity-70"
                >
                  {isLoading ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
