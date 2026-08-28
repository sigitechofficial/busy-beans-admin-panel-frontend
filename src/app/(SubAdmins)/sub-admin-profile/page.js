"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  success_toaster,
  info_toaster,
} from "@/utilities/Toaster";
import GetAPI from "@/utilities/GetAPI";
import { PatchAPI } from "@/utilities/PatchAPI";
import Loader from "@/components/ui/Loader";
import ErrorHandler from "@/utilities/ErrorHandler";
import { isStoredSubAdmin } from "@/utilities/subAdminNav";

const inputClass =
  "border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3";

export default function SubAdminProfile() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    countryCode: "",
    phoneNumber: "",
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    password: "",
    passwordConfirm: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isStoredSubAdmin()) {
      router.replace("/");
      return;
    }
    setAllowed(true);
  }, [router]);

  const { data: profileResp, isLoading } = GetAPI(
    allowed ? "api/v1/admin/sub-admin/me" : "",
    "sub-admin-profile"
  );

  useEffect(() => {
    if (!profileResp?.data) return;
    const userData = profileResp.data;
    setProfile({
      name: userData?.name ?? "",
      email: userData?.email ?? "",
      countryCode: userData?.countryCode ?? "",
      phoneNumber: userData?.phoneNumber ?? "",
    });
  }, [profileResp]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentPassword = passwords.currentPassword.trim();
    const password = passwords.password.trim();
    const passwordConfirm = passwords.passwordConfirm.trim();

    if (!currentPassword) {
      info_toaster("Current password is required");
      return;
    }
    if (!password) {
      info_toaster("New password is required");
      return;
    }
    if (password.length < 6) {
      info_toaster("Password must be at least 6 characters");
      return;
    }
    if (!passwordConfirm) {
      info_toaster("Confirm new password");
      return;
    }
    if (password !== passwordConfirm) {
      info_toaster("Password and confirm password do not match");
      return;
    }
    if (currentPassword === password) {
      info_toaster("New password must differ from current password");
      return;
    }

    setSaving(true);
    try {
      const res = await PatchAPI(
        "api/v1/admin/sub-admin/me",
        { currentPassword, password, passwordConfirm },
        "sub-admin-profile"
      );
      if (res?.data?.status === "success") {
        success_toaster("Password updated successfully");
        setPasswords({
          currentPassword: "",
          password: "",
          passwordConfirm: "",
        });
      } else {
        throw new Error(res?.data?.message || "Failed to update password");
      }
    } catch (err) {
      ErrorHandler(err);
    } finally {
      setSaving(false);
    }
  };

  const phoneDisplay =
    profile.countryCode || profile.phoneNumber
      ? `${profile.countryCode ? `${profile.countryCode} ` : ""}${profile.phoneNumber || ""}`
      : "—";

  if (!allowed || isLoading) {
    return <Loader />;
  }

  return (
    <div className="w-full">
      <div className="w-full mdm:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed">
        <h2 className="text-xl font-inter font-semibold">Profile</h2>
      </div>
      <div className="w-full pt-28 2xl:pt-32 px-6 2xl:px-12">
        <div className="max-w-3xl mx-auto space-y-6 py-8 px-8 font-inter border border-borderColor bg-white shadow-tableShadow rounded-sm">
          <div className="font-satoshi space-y-4">
            <p className="font-black text-xl lg:text-2xl text-theme">
              Login Details
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-gray-500 font-medium">Name</label>
                <span>{profile.name || "—"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-gray-500 font-medium">Email</label>
                <span>{profile.email || "—"}</span>
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-gray-500 font-medium">Phone Number</label>
                <span>{phoneDisplay}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="font-satoshi space-y-4">
              <p className="font-black text-xl lg:text-2xl text-theme">
                Change Password
              </p>
              <div className="flex flex-col gap-1">
                <label className="text-gray-500 font-medium">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwords.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-gray-500 font-medium">New Password</label>
                <input
                  type="password"
                  name="password"
                  value={passwords.password}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-gray-500 font-medium">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="passwordConfirm"
                  value={passwords.passwordConfirm}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-theme text-white rounded hover:bg-themeDark disabled:opacity-70"
              >
                {saving ? "Saving..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
