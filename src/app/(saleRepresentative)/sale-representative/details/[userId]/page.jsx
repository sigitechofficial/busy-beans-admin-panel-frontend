"use client";
import BackButton from "@/components/ui/BackButton";
import Loader from "@/components/ui/Loader";
import { useDataContext } from "@/utilities/DataContext";
import GetAPI from "@/utilities/GetAPI";
import dayjs from "dayjs";
import { drawerSelectStyles } from "@/utilities/SelectStyle";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Dialog } from "primereact/dialog";
import axios from "axios";
import { BASE_URL } from "@/utilities/URL";
import React, { useEffect, useState, useMemo } from "react";
import Select from "react-select";
import { PatchAPI } from "@/utilities/PatchAPI";
import { CiMenuBurger } from "react-icons/ci";
import { hasPermission } from "@/utilities/Permission";
import ErrorHandler from "@/utilities/ErrorHandler";
import { success_toaster, warning_toaster } from "@/utilities/Toaster";

export default function SalesRepDetails() {
  if (typeof window !== "undefined") {
    var userType = localStorage.getItem("userType");
  }
  const { userId } = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const { data, reFetch, isLoading } = GetAPI(
    `api/v1/admin/sales-rep/${userId}`,
    "sales-rep"
  );
  const { toggle, setToggle } = useDataContext();

  const { data: countriesData } = GetAPI(
    "api/v1/admin/address-management/country"
  );
  const allCountries = React.useMemo(() => {
    const arr = [];
    countriesData?.data?.data?.map((country) =>
      arr.push({ value: country?.name, label: country?.name, id: country?.id })
    );
    return arr;
  }, [countriesData]);

  const [allStates, setAllStates] = useState([]);
  const [allCities, setAllCities] = useState([]);

  const handleSelectedCountryStates = async (countryName) => {
    const selectedCountry = countriesData?.data?.data?.find(
      (country) => country?.name === countryName
    );
    try {
      const res = await axios.get(
        BASE_URL +
          `api/v1/admin/address-management/state?countryInSystemId=${selectedCountry?.id}`
      );
      if (res?.data?.status === "success") {
        const tempAllStates = [];
        res?.data?.data?.data?.map((state) =>
          tempAllStates.push({ value: state?.id, label: state?.name })
        );
        setAllStates([...tempAllStates]);
      } else {
        throw new Error(res?.data?.message || "An unexpected error occurred.");
      }
    } catch (error) {
      ErrorHandler(error);
    }
  };

  const handleSelectedCountryStatesCities = async (stateID) => {
    try {
      const res = await axios.get(
        BASE_URL +
          `api/v1/admin/address-management/city?stateInSystemId=${stateID}`
      );
      if (res?.data?.status === "success") {
        const tempAllCities = [];
        res?.data?.data?.data?.map((state) =>
          tempAllCities.push({ value: state?.name, label: state?.name })
        );
        setAllCities([...tempAllCities]);
      } else {
        throw new Error(res?.data?.message || "An unexpected error occurred.");
      }
    } catch (error) {
      ErrorHandler(error);
    }
  };

  const [addrDialogOpen, setAddrDialogOpen] = useState(false);
  const [addrSaving, setAddrSaving] = useState(false);
  const [addrMode, setAddrMode] = useState("create");

  const [addrKind, setAddrKind] = useState("shipping");

  const [editingAddress, setEditingAddress] = useState(null);

  const emptyAddress = {
    id: undefined,
    addressLineOne: "",
    addressLineTwo: "",
    town: "",
    country: "",
    state: "",
    zipCode: "",
    status: true,
  };
  const [addressForm, setAddressForm] = useState(emptyAddress);

  // Helper: billing availability (only 1 allowed)
  const hasBilling = (data?.data?.billingAddresses?.length ?? 0) > 0;
  const currentBilling = hasBilling ? data?.data?.billingAddresses?.[0] : null;

  const openCreateAddress = (kind = "shipping") => {
    if (kind === "billing" && hasBilling) {
      warning_toaster?.("Only one billing address is allowed.");
      return;
    }
    setAddrKind(kind);
    setAddrMode("create");
    setAddressForm(emptyAddress);
    setAllStates([]);
    setAllCities([]);
    setAddrDialogOpen(true);
  };

  const handleAddrInput = (eOrName, maybeValue) => {
    if (eOrName && eOrName.target) {
      const { name, value } = eOrName.target;
      setAddressForm((prev) => ({ ...prev, [name]: value }));
    } else {
      const name = eOrName;
      const value = maybeValue;
      setAddressForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const openEditAddress = (addr, kind = "shipping") => {
    setAddrKind(kind);
    setAddrMode("edit");
    setEditingAddress(addr || null);
    setAddressForm({
      id: addr?.id,
      addressLineOne: addr?.addressLineOne || "",
      addressLineTwo: addr?.addressLineTwo || "",
      town: addr?.town || "",
      country: addr?.country || "",
      state: addr?.state || "",
      zipCode: addr?.zipCode || "",
      status: addr?.status ?? true,
    });
    if (addr?.country) handleSelectedCountryStates(addr.country);
    setAddrDialogOpen(true);
  };

  const saveAddress = async () => {
    const baseAddress = {
      salesRepId: userId,
      ...(addressForm.id ? { id: addressForm.id } : {}),
      addressLineOne: addressForm.addressLineOne,
      addressLineTwo: addressForm.addressLineTwo,
      town: addressForm.town,
      country: addressForm.country,
      state: addressForm.state,
      zipCode: addressForm.zipCode,
      status: Boolean(addressForm.status),
    };

    let payload;
    if (addrMode === "edit") {
      if (addrKind === "billing") {
        payload = { billingAddresses: baseAddress };
      } else {
        payload = { addresses: baseAddress };
      }
    } else {
      if (addrKind === "billing") {
        payload = { billingAddresses: baseAddress };
      } else {
        payload = { newAddressess: [baseAddress ]};
      }
    }

    try {
      setAddrSaving(true);
      const res = await PatchAPI(
        `api/v1/admin/sales-rep/address-update/${userId}`,
        payload,
        "sales-rep"
      );
      if (res?.data?.status === "success") {
        success_toaster(
          addrMode === "create"
            ? addrKind === "billing"
              ? "Billing address added."
              : "Address added."
            : addrKind === "billing"
            ? "Billing address updated."
            : "Address updated."
        );
        setAddrDialogOpen(false);
        setEditingAddress(null);
        setAddressForm(emptyAddress);
        reFetch?.();
      } else {
        throw new Error(res?.data?.message || "Failed to save address");
      }
    } catch (err) {
      ErrorHandler(err);
    } finally {
      setAddrSaving(false);
    }
  };

  return isLoading ? (
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
          <span className="text-theme">{data?.data?.srName}</span>{" "}
          <span
            className={`rounded-full text-xs text-white font-normal p-1 ${
              data?.data?.status ? "bg-themeGreen " : "bg-red-500"
            }`}
          >
            {data?.data?.status ? "Active" : "Inactive"}
          </span>
        </h2>

        <ul className="flex items-center text-sm font-medium [&>li]:border-r [&>li]:px-2 [&>li]:cursor-pointer relative text-blue-500">
          {hasPermission("local-partner_update") && (
            <li
              onClick={() => {
                router.push(`/sale-representative/edit/${userId}`);
              }}
            >
              Edit
            </li>
          )}
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
                <div className="font-semibold">{data?.data?.srName}</div>
              </div>
              <div className="flex items-center h-12 border-b [&>span]:w-44">
                <span className="text-gray-500 font-medium">Email</span>
                <div className="text-blue-600">{data?.data?.email}</div>
              </div>
              <div className="flex items-center h-12 border-b [&>span]:w-44">
                <span className="text-gray-500 font-medium">Partner Type</span>
                <div className="font-semibold">
                  {data?.data?.partnerType === "direct-partner"
                    ? "Direct Partner"
                    : "Dropship Partner"}
                </div>
              </div>
              <div className="flex items-center h-12 border-b [&>span]:w-44">
                <span className="text-gray-500 font-medium">Created At</span>
                <div>{dayjs(data?.data?.createdAt).format("MM/DD/YYYY")}</div>
              </div>

              <div className="flex items-center h-12 border-b [&>span]:w-44">
                <span className="text-gray-500 font-medium">Credit Limits</span>
                <div className="font-semibold">{data?.data?.creditLimit}</div>
              </div>
              <div className="flex items-center h-12 border-b [&>span]:w-44">
                <span className="text-gray-500 font-medium">
                  Account Connected
                </span>
                <div className="font-semibold">
                  {data?.data?.isAccountConnected ? "Yes" : "No"}
                </div>
              </div>
              <div className="flex items-center h-12 border-b [&>span]:w-44">
                <span className="text-gray-500 font-medium">
                  Bank Account Connected
                </span>
                <div className="font-semibold">
                  {data?.data?.defaultBankAccount ? "Yes" : "No"}
                </div>
              </div>
              <div className="flex items-center h-12 border-b [&>span]:w-44">
                <span className="text-gray-500 font-medium">
                  Stripe Account Connected
                </span>
                <div className="font-semibold">
                  {data?.data?.stripeCustomerId ? "Yes" : "No"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-1">
                  Address
                </h3>
                {data?.data ? (
                  <div className="text-sm text-gray-700 space-y-1 uppercase">
                    <div>{data?.data?.territoryName}</div>

                    {/* Company Name (if present) */}
                    {data?.data?.address?.trim() && (
                      <div>{data?.data?.address}</div>
                    )}

                    {/* Address Line One */}
                    {data?.data?.addressOne?.trim() && (
                      <div>{data?.data?.addressOne}</div>
                    )}

                    {/* Address Line Two (optional) */}
                    {data?.data?.addressTwo?.trim() && (
                      <div>{data?.data?.addressTwo}</div>
                    )}

                    {/* Town, State, ZIP */}
                    {(data?.data?.city ||
                      data?.data?.state ||
                      data?.data?.zipCode) && (
                      <div>
                        {data?.data?.city || ""}
                        {data?.data?.city && data?.data?.state ? ", " : ""}
                        {data?.data?.state || ""}
                        {data?.data?.zipCode ? ` ${data?.data?.zipCode}` : ""}
                      </div>
                    )}

                    {/* Country */}
                    {data?.data?.country?.trim() && (
                      <div>{data?.data?.country}</div>
                    )}

                    <div>
                      {data?.data?.countryCode + " " + data?.data?.phoneNumber}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    No address available
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="w-full flex justify-end gap-3">
            <button
              type="button"
              onClick={openCreateAddress}
              className="rounded-lg border border-theme text-theme hover:bg-theme hover:text-white duration-150 shadow-buttonShadow px-6 font-nunito py-3 font-medium"
            >
              Add New Address
            </button>
            <button
              type="button"
              onClick={() => openCreateAddress("billing")}
              disabled={hasBilling}
              className={`rounded-lg border duration-150 shadow-buttonShadow px-6 font-nunito py-3 font-medium ${
                hasBilling
                  ? "border-gray-300 text-gray-400 cursor-not-allowed"
                  : "border-theme text-theme hover:bg-theme hover:text-white"
              }`}
              title={
                hasBilling
                  ? "Only one billing address is allowed"
                  : "Add Billing Address"
              }
            >
              Add Billing Address
            </button>
          </div>

          {/* ---- Billing Address (single) ---- */}
          <div className="pt-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Billing Address
            </h2>
            {currentBilling ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-md flex flex-col justify-between">
                  <div className="text-sm text-gray-700 space-y-1 uppercase">
                    {currentBilling?.addressLineOne?.trim() && (
                      <div>{currentBilling.addressLineOne}</div>
                    )}
                    {currentBilling?.addressLineTwo?.trim() && (
                      <div>{currentBilling.addressLineTwo}</div>
                    )}
                    {(currentBilling?.town ||
                      currentBilling?.state ||
                      currentBilling?.zipCode) && (
                      <div>
                        {currentBilling?.town || ""}
                        {currentBilling?.town && currentBilling?.state
                          ? ", "
                          : ""}
                        {currentBilling?.state || ""}
                        {currentBilling?.zipCode
                          ? ` ${currentBilling?.zipCode}`
                          : ""}
                      </div>
                    )}
                    {currentBilling?.country?.trim() && (
                      <div>{currentBilling.country}</div>
                    )}
                  </div>
                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={() => openEditAddress(currentBilling, "billing")}
                      className="text-xs px-2 py-1 rounded border hover:bg-gray-100"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                No billing address added yet.
              </div>
            )}
          </div>

          {/* ---- Additional Shipping Addresses ---- */}
          {data?.data?.addresses?.length > 0 && (
            <div className="pt-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Additional Shipping Addresses
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {data?.data?.addresses?.map((addr, i) => (
                  <div
                    key={addr?.id ?? `extra-addr-${i}`}
                    className="bg-gray-50 p-4 rounded-md flex flex-col justify-between"
                  >
                    <div className="text-sm text-gray-700 space-y-1 uppercase">
                      {/* Company (optional) */}
                      {addr?.companyaddress?.trim() && (
                        <div>{addr.companyaddress}</div>
                      )}

                      {addr?.addressLineOne?.trim() && (
                        <div>{addr.addressLineOne}</div>
                      )}
                      {addr?.addressLineTwo?.trim() && (
                        <div>{addr.addressLineTwo}</div>
                      )}

                      {/* Town, State, ZIP */}
                      {(addr?.town || addr?.state || addr?.zipCode) && (
                        <div>
                          {addr?.town || ""}
                          {addr?.town && addr?.state ? ", " : ""}
                          {addr?.state || ""}
                          {addr?.zipCode ? ` ${addr.zipCode}` : ""}
                        </div>
                      )}

                      {/* Country */}
                      {addr?.country?.trim() && <div>{addr.country}</div>}
                    </div>

                    <div className="pt-3">
                      <button
                        type="button"
                        onClick={() => openEditAddress(addr)}
                        className="text-xs px-2 py-1 rounded border hover:bg-gray-100"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Dialog
        visible={addrDialogOpen}
        onHide={() => setAddrDialogOpen(false)}
        dismissableMask={true}
        header={
          <div className="font-bold text-lg">
            {addrMode === "create"
              ? addrKind === "billing"
                ? "Add Billing Address"
                : "Add New Address"
              : addrKind === "billing"
              ? "Edit Billing Address"
              : "Edit Address"}
          </div>
        }
        className="w-screen max-w-none sm:w-[95%] sm:max-w-lg !m-0 sm:!m-auto font-satoshi"
        contentClassName="!p-4 sm:!p-5"
      >
        <div className="grid gap-4">
          <div className="flex flex-col gap-y-2">
            <label className="text-labelColor font-medium">
              Address Line 1
            </label>
            <input
              name="addressLineOne"
              value={addressForm.addressLineOne}
              onChange={handleAddrInput}
              placeholder="Address line 1"
              className="border rounded px-3 py-2 outline-none"
            />
          </div>

          <div className="flex flex-col gap-y-2">
            <label className="text-labelColor font-medium">
              Address Line 2
            </label>
            <input
              name="addressLineTwo"
              value={addressForm.addressLineTwo}
              onChange={handleAddrInput}
              placeholder="Address line 2"
              className="border rounded px-3 py-2 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-y-2">
              <label className="text-labelColor font-medium">Country</label>
              <Select
                placeholder="Select Country"
                className="w-full"
                styles={drawerSelectStyles}
                value={
                  addressForm.country
                    ? { value: addressForm.country, label: addressForm.country }
                    : null
                }
                options={allCountries ?? []}
                onChange={(opt) => {
                  setAddressForm((prev) => ({
                    ...prev,
                    country: opt?.label || "",
                    state: "",
                    town: "",
                  }));
                  if (opt?.label) handleSelectedCountryStates(opt.label);
                }}
              />
            </div>

            <div className="flex flex-col gap-y-2">
              <label className="text-labelColor font-medium">State</label>
              <Select
                placeholder="Select State"
                className="w-full"
                styles={drawerSelectStyles}
                value={
                  addressForm.state
                    ? { value: addressForm.state, label: addressForm.state }
                    : null
                }
                options={allStates ?? []}
                onChange={(opt) => {
                  setAddressForm((prev) => ({
                    ...prev,
                    state: opt?.label || "",
                    town: "",
                  }));
                  if (opt?.value) handleSelectedCountryStatesCities(opt.value);
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-y-2">
              <label className="text-labelColor font-medium">Town / City</label>
              <input
                name="town"
                value={addressForm.town}
                onChange={handleAddrInput}
                placeholder="Town / City"
                className="border rounded px-3 py-2 outline-none"
              />
            </div>

            <div className="flex flex-col gap-y-2">
              <label className="text-labelColor font-medium">Zip Code</label>
              <input
                name="zipCode"
                value={addressForm.zipCode}
                onChange={handleAddrInput}
                placeholder="Zip / Postal Code"
                className="border rounded px-3 py-2 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!addressForm.status}
              onChange={(e) =>
                setAddressForm((prev) => ({
                  ...prev,
                  status: e.target.checked,
                }))
              }
              className="size-4"
            />
            <span className="text-sm">Active</span>
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={() => setAddrDialogOpen(false)}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={addrSaving}
              onClick={saveAddress}
              className="px-4 py-2 bg-theme text-white rounded hover:bg-themeDark disabled:opacity-70"
            >
              {addrSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
