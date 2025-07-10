"use client";
import GetAPI from "@/utilities/GetAPI";
import { drawerSelectStyles } from "@/utilities/SelectStyle";
import Select from "react-select";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import axios from "axios";
import ErrorHandler from "@/utilities/ErrorHandler";
import { BASE_URL } from "@/utilities/URL";
import { PatchAPI } from "@/utilities/PatchAPI";
import { info_toaster, success_toaster } from "@/utilities/Toaster";

function EditPage() {
  const { orderID } = useParams();
  const { data: orderData, reFetch } =
    orderID && GetAPI(`api/v1/admin/order-details/${orderID}`);

  const { data } = GetAPI("api/v1/admin/address-management/country");
  const [allStates, setAllStates] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [supplier, setSupplier] = useState({
    supplierName: "",
    companyaddress: "",
    email: "",
    password: "",
    country: "",
    city: "",
    state: "",
    zipCode: "",
    phoneNum: "",
    countryCode: "+1",
    addressOne: "",
    addressTwo: "",
    businessWeb: "",
    image: "",
    businessRegistrationNumber: "",
    supplierType: "",
    status: true,
    deleted: false,
    registerDate: "",
    bankAccount: "",
    //billing data here
    billingcompanyaddress: "",
    billingaddressOne: "",
    billingaddressTwo: "",
    billingtown: "",
    billingcountry: "",
    billingstate: "",
    billingzipCode: "",
    billingstatus: true,
  });
  console.log("🚀 ~ EditPage ~ supplier:", supplier);

  const allCountries = [];
  data?.data?.data?.map((country) =>
    allCountries.push({
      value: country?.name,
      label: country?.name,
    })
  );

  const handleChange = (e) => {
    setSupplier({ ...supplier, [e.target.name]: e.target.value });
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
          tempAllCities.push({
            value: state?.name,
            label: state?.name,
          })
        );
        setAllCities([...tempAllCities]);
      } else {
        throw new Error(res?.data?.message || "An unexpected error occurred.");
      }
    } catch (error) {
      ErrorHandler(error);
    }
  };

  const handleSelectedCountryStates = async (countryName) => {
    const selectedCountry = data?.data?.data?.find(
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
          tempAllStates.push({
            value: state?.id,
            label: state?.name,
          })
        );
        setAllStates([...tempAllStates]);
      } else {
        throw new Error(res?.data?.message || "An unexpected error occurred.");
      }
    } catch (error) {
      ErrorHandler(error);
    }
  };

  const handleSupplierUpdate = async () => {
    let res = await PatchAPI(
      `api/v1/admin/address-management/update-address/${orderData?.data?.order?.address?.id}`,
      {
        companyaddress: supplier?.companyaddress,
        addressLineOne: supplier?.addressOne,
        addressLineTwo: supplier?.addressTwo,
        town: supplier?.city,
        country: supplier?.country,
        state: supplier?.state,
        zipCode: supplier?.zipCode,
        status: supplier?.status,
      }
    );

    if (res?.data?.status === "success") {
      success_toaster(res?.data?.status);
      reFetch();
    } else {
      info_toaster(res?.data?.message);
    }
  };

  const handleBillingToUpdate = async () => {
    let res = await PatchAPI(
      `api/v1/admin/address-management/update-billing-address/${orderData?.data?.order?.user?.id}`,
      {
        companyaddress: supplier?.billingcompanyaddress,
        addressLineOne: supplier?.billingaddressOne,
        addressLineTwo: supplier?.billingaddressTwo,
        town: supplier?.billingcity,
        country: supplier?.billingcountry,
        state: supplier?.billingstate,
        zipCode: supplier?.billingzipCode,
        status: supplier?.billingstatus,
      }
    );
    console.log("🚀 ~ handleBillingToUpdate ~ res:", res);

    if (res?.data?.status === "success") {
      success_toaster(res?.data?.status);
      reFetch();
    } else {
      info_toaster(res?.data?.message);
    }
  };

  useEffect(() => {
    setSupplier({
      supplierName: orderData?.data?.order?.salesRepName,
      companyaddress: orderData?.data?.order?.address?.companyaddress,
      country: orderData?.data?.order?.address?.country,
      city: orderData?.data?.order?.address?.town,
      state: orderData?.data?.order?.address?.state,
      zipCode: orderData?.data?.order?.address?.zipCode,
      addressOne: orderData?.data?.order?.address?.addressLineOne,
      addressTwo: orderData?.data?.order?.address?.addressLineTwo,
      status: orderData?.data?.order?.address?.status,

      //billing data here
      billingcompanyaddress:
        orderData?.data?.order?.user?.billingAddresses?.[0]?.companyaddress,
      billingaddressOne:
        orderData?.data?.order?.user?.billingAddresses?.[0]?.addressLineOne,
      billingaddressTwo:
        orderData?.data?.order?.user?.billingAddresses?.[0]?.addressLineTwo,
      billingtown: orderData?.data?.order?.user?.billingAddresses?.[0]?.town,
      billingcountry:
        orderData?.data?.order?.user?.billingAddresses?.[0]?.country,
      billingstate: orderData?.data?.order?.user?.billingAddresses?.[0]?.state,
      billingzipCode:
        orderData?.data?.order?.user?.billingAddresses?.[0]?.zipCode,
      billingstatus:
        orderData?.data?.order?.user?.billingAddresses?.[0]?.status,
    });
  }, [data]);

  return (
    <div className="w-full grid grid-cols-2 gap-10 py-4 px-8 font-inter border border-borderColor bg-white shadow-tableShadow rounded-sm">
      <div className="w-full space-y-2">
        <h4 className="font-semibold">Shipping Address</h4>
        <div className="w-full space-y-2">
          <p>Company Address</p>
          <input
            className="w-full h-12 bg-transparent outline-none border-2 px-4 border-gray-100 rounded-lg"
            type="text"
            name="companyaddress"
            value={supplier?.companyaddress}
            id=""
            onChange={handleChange}
          />
        </div>
        <div className="w-full space-y-2">
          <p>Address Line 1</p>
          <input
            className="w-full h-12 bg-transparent outline-none border-2 px-4 border-gray-100 rounded-lg"
            type="text"
            name="addressOne"
            value={supplier?.addressOne}
            id=""
            onChange={handleChange}
          />
        </div>
        <div className="w-full space-y-2">
          <p>Address Line 2</p>
          <input
            className="w-full h-12 bg-transparent outline-none border-2 px-4 border-gray-100 rounded-lg"
            type="text"
            name="addressTwo"
            value={supplier?.addressTwo}
            id=""
            onChange={handleChange}
          />
        </div>
        <div className="w-full grid grid-cols-2 gap-5">
          <div className="w-full space-y-2">
            <p>Country</p>

            <Select
              placeholder="Select Country"
              className="w-full"
              styles={drawerSelectStyles}
              value={
                supplier?.country
                  ? {
                      value: supplier?.country,
                      label: supplier?.country,
                    }
                  : null
              }
              options={allCountries ?? []}
              onChange={(e) => {
                setSupplier({
                  ...supplier,
                  country: e.label,
                  state: "",
                  city: "",
                });
                handleSelectedCountryStates(e.label);
              }}
            />
          </div>
          <div className="w-full space-y-2">
            <p>State</p>

            <Select
              placeholder="Select State"
              className="w-full"
              styles={drawerSelectStyles}
              value={
                supplier?.state
                  ? {
                      value: supplier?.state,
                      label: supplier?.state,
                    }
                  : null
              }
              options={allStates ?? []}
              onChange={(e) => {
                setSupplier({
                  ...supplier,
                  state: e?.label,
                  city: "",
                });
                handleSelectedCountryStatesCities(e.value);
              }}
            />
          </div>
        </div>
        <div className="w-full grid grid-cols-2 gap-5">
          <div className="w-full space-y-2">
            <p>Town / City</p>

            <Select
              placeholder="Select City"
              className="w-full"
              styles={drawerSelectStyles}
              value={
                supplier?.city
                  ? {
                      value: supplier?.city,
                      label: supplier?.city,
                    }
                  : null
              }
              options={allCities ?? []}
              onChange={(e) => {
                setSupplier({
                  ...supplier,
                  city: e.label,
                });
              }}
            />
          </div>
          <div className="w-full space-y-2">
            <p>ZIP Code</p>
            <input
              className="w-full h-12 bg-transparent outline-none border-2 px-4 border-gray-100 rounded-lg"
              type="text"
              name="zipCode"
              value={supplier?.zipCode}
              id=""
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="pt-5">
          <button
            onClick={handleSupplierUpdate}
            className="h-12 px-4 bg-theme text-white rounded-lg"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* ================= */}
      <div className="w-full space-y-2">
        <h4 className="font-semibold">Billing Address</h4>

        <div className="w-full space-y-2">
          <p>Address</p>
          <input
            className="w-full h-12 bg-transparent outline-none border-2 px-4 border-gray-100 rounded-lg"
            type="text"
            name="billingcompanyaddress"
            value={supplier?.billingcompanyaddress}
            id=""
            onChange={handleChange}
          />
        </div>
        <div className="w-full space-y-2">
          <p>Address Line 1</p>
          <input
            className="w-full h-12 bg-transparent outline-none border-2 px-4 border-gray-100 rounded-lg"
            type="text"
            name="billingaddressOne"
            value={supplier?.billingaddressOne}
            id=""
            onChange={handleChange}
          />
        </div>
        <div className="w-full space-y-2">
          <p>Address Line 2</p>
          <input
            className="w-full h-12 bg-transparent outline-none border-2 px-4 border-gray-100 rounded-lg"
            type="text"
            name="billingaddressTwo"
            value={supplier?.billingaddressTwo}
            id=""
            onChange={handleChange}
          />
        </div>
        <div className="w-full grid grid-cols-2 gap-5">
          <div className="w-full space-y-2">
            <p>Country</p>

            <Select
              placeholder="Select Country"
              className="w-full"
              styles={drawerSelectStyles}
              value={
                supplier?.billingcountry
                  ? {
                      value: supplier?.billingcountry,
                      label: supplier?.billingcountry,
                    }
                  : null
              }
              options={allCountries ?? []}
              onChange={(e) => {
                setSupplier({
                  ...supplier,
                  billingcountry: e.label,
                  billingstate: "",
                  billingcity: "",
                });
                handleSelectedCountryStates(e.label);
              }}
            />
          </div>
          <div className="w-full space-y-2">
            <p>State</p>

            <Select
              placeholder="Select State"
              className="w-full"
              styles={drawerSelectStyles}
              value={
                supplier?.billingstate
                  ? {
                      value: supplier?.billingstate,
                      label: supplier?.billingstate,
                    }
                  : null
              }
              options={allStates ?? []}
              onChange={(e) => {
                setSupplier({
                  ...supplier,
                  billingstate: e?.label,
                  billingcity: "",
                });
                handleSelectedCountryStatesCities(e.value);
              }}
            />
          </div>
        </div>
        <div className="w-full grid grid-cols-2 gap-5">
          <div className="w-full space-y-2">
            <p>Town / City</p>

            <Select
              placeholder="Select City"
              className="w-full"
              styles={drawerSelectStyles}
              value={
                supplier?.billingcity
                  ? {
                      value: supplier?.billingcity,
                      label: supplier?.billingcity,
                    }
                  : null
              }
              options={allCities ?? []}
              onChange={(e) => {
                setSupplier({
                  ...supplier,
                  billingcity: e.label,
                });
              }}
            />
          </div>
          <div className="w-full space-y-2">
            <p>ZIP Code</p>
            <input
              className="w-full h-12 bg-transparent outline-none border-2 px-4 border-gray-100 rounded-lg"
              type="text"
              name="billingzipCode"
              value={supplier?.billingzipCode}
              id=""
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="pt-5">
          <button
            onClick={handleBillingToUpdate}
            className="h-12 px-4 bg-theme text-white rounded-lg"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditPage;
