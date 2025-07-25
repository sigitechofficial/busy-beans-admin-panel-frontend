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

  // Separate state for shipping and billing
  const [shippingStates, setShippingStates] = useState([]);
  console.log("🚀 ~ EditPage ~ shippingStates:", shippingStates);
  const [shippingCities, setShippingCities] = useState([]);
  console.log("🚀 ~ EditPage ~ shippingCities:", shippingCities);
  const [billingStates, setBillingStates] = useState([]);
  console.log("🚀 ~ EditPage ~ billingStates:", billingStates);
  const [billingCities, setBillingCities] = useState([]);
  console.log("🚀 ~ EditPage ~ billingCities:", billingCities);

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
    billingcity: "",
    billingzipCode: "",
    billingstatus: true,
  });

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

  // SHIPPING handlers
  const handleShippingCountry = async (countryName) => {
    setSupplier((prev) => ({
      ...prev,
      country: countryName,
      // state: "",
      // city: "",
    }));
    const selectedCountry = data?.data?.data?.find(
      (country) => country?.name === countryName
    );
    if (selectedCountry) {
      const res = await axios.get(
        BASE_URL +
          `api/v1/admin/address-management/state?countryInSystemId=${selectedCountry?.id}`
      );
      if (res?.data?.status === "success") {
        setShippingStates(
          res?.data?.data?.data?.map((state) => ({
            value: state?.id,
            label: state?.name,
          }))
        );
        setShippingCities([]);
      }
    }
  };

  const handleShippingState = async (stateObj) => {
    setSupplier((prev) => ({
      ...prev,
      state: stateObj?.label,
      city: "",
    }));
    const res = await axios.get(
      BASE_URL +
        `api/v1/admin/address-management/city?stateInSystemId=${stateObj?.value}`
    );
    if (res?.data?.status === "success") {
      setShippingCities(
        res?.data?.data?.data?.map((city) => ({
          value: city?.name,
          label: city?.name,
        }))
      );
    }
  };

  // BILLING handlers
  const handleBillingCountry = async (countryName) => {
    setSupplier((prev) => ({
      ...prev,
      billingcountry: countryName,
      // billingstate: "",
      // billingcity: "",
    }));
    const selectedCountry = data?.data?.data?.find(
      (country) => country?.name === countryName
    );
    if (selectedCountry) {
      const res = await axios.get(
        BASE_URL +
          `api/v1/admin/address-management/state?countryInSystemId=${selectedCountry?.id}`
      );
      if (res?.data?.status === "success") {
        setBillingStates(
          res?.data?.data?.data?.map((state) => ({
            value: state?.id,
            label: state?.name,
          }))
        );
        setBillingCities([]);
      }
    }
  };

  const handleBillingState = async (stateObj) => {
    setSupplier((prev) => ({
      ...prev,
      billingstate: stateObj?.label,
      billingcity: "",
    }));
    const res = await axios.get(
      BASE_URL +
        `api/v1/admin/address-management/city?stateInSystemId=${stateObj?.value}`
    );
    if (res?.data?.status === "success") {
      setBillingCities(
        res?.data?.data?.data?.map((city) => ({
          value: city?.name,
          label: city?.name,
        }))
      );
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
      `api/v1/admin/address-management/update-billing-address/${orderData?.data?.order?.user?.billingAddresses[0]?.id}`,
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
      // companyaddress: orderData?.data?.order?.address?.companyaddress,
      companyaddress: "",
      country: orderData?.data?.order?.address?.country,
      city: orderData?.data?.order?.address?.town,
      state: orderData?.data?.order?.address?.state,
      zipCode: orderData?.data?.order?.address?.zipCode,
      addressOne:
        orderData?.data?.order?.address?.companyaddress +
        "" +
        orderData?.data?.order?.address?.addressLineOne,
      addressTwo: orderData?.data?.order?.address?.addressLineTwo,
      status: orderData?.data?.order?.address?.status,

      //billing data here
      // billingcompanyaddress:
      //   orderData?.data?.order?.user?.billingAddresses?.[0]?.companyaddress,
      billingcompanyaddress: "",
      billingaddressOne:
        orderData?.data?.order?.user?.billingAddresses?.[0]?.companyaddress +
        "" +
        orderData?.data?.order?.user?.billingAddresses?.[0]?.addressLineOne,
      billingaddressTwo:
        orderData?.data?.order?.user?.billingAddresses?.[0]?.addressLineTwo,
      billingtown: orderData?.data?.order?.user?.billingAddresses?.[0]?.town,
      billingcountry:
        orderData?.data?.order?.user?.billingAddresses?.[0]?.country,
      billingstate: orderData?.data?.order?.user?.billingAddresses?.[0]?.state,
      billingcity: orderData?.data?.order?.user?.billingAddresses?.[0]?.town,
      billingzipCode:
        orderData?.data?.order?.user?.billingAddresses?.[0]?.zipCode,
      billingstatus:
        orderData?.data?.order?.user?.billingAddresses?.[0]?.status,
    });

    // Pre-populate shipping states/cities
    if (orderData?.data?.order?.address?.country) {
      handleShippingCountry(orderData?.data?.order?.address?.country);
    }
    // Pre-populate billing states/cities
    if (orderData?.data?.order?.user?.billingAddresses?.[0]?.country) {
      handleBillingCountry(
        orderData?.data?.order?.user?.billingAddresses?.[0]?.country
      );
    }
    // eslint-disable-next-line
  }, [data]);

  return (
    <div>
      <div className="w-full sm:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[94px] border-b px-6 2xl:px-12 fixed">
        <h2 className="text-xl lg:text-2xl font-inter font-semibold">
          Orders / {orderID} / Addresses
        </h2>
      </div>
      <div className="pt-32 px-6 2xl:px-12 ">
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-10 py-8 px-8 font-inter border border-borderColor bg-white shadow-tableShadow rounded-sm">
          {/* Shipping Address */}
          <div className="w-full space-y-2">
            <h4 className="font-semibold">Shipping Address</h4>
            {/* <div className="w-full space-y-2 pt-8">
              <p>Company Address</p>
              <input
                className="w-full h-12 bg-transparent outline-none border-2 px-4 border-gray-100 rounded-lg"
                type="text"
                name="companyaddress"
                value={supplier?.companyaddress}
                onChange={handleChange}
              />
            </div> */}
            <div className="w-full space-y-2 pt-8">
              <p>Address Line 1</p>
              <input
                className="w-full h-12 bg-transparent outline-none border-2 px-4 border-gray-100 rounded-lg"
                type="text"
                name="addressOne"
                value={supplier?.addressOne}
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
                      ? { value: supplier?.country, label: supplier?.country }
                      : null
                  }
                  options={allCountries}
                  onChange={(e) => handleShippingCountry(e.label)}
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
                      ? shippingStates.find((s) => s.label === supplier?.state)
                      : null
                  }
                  options={shippingStates}
                  onChange={handleShippingState}
                />
              </div>
            </div>
            <div className="w-full grid grid-cols-2 gap-5">
              <div className="w-full space-y-2">
                <p>Town / City</p>
                <input
                  type="text"
                  name=""
                  id=""
                  placeholder="Enter City"
                  className="w-full h-12 bg-transparent outline-none border-2 px-4 border-gray-100 rounded-lg"
                  value={supplier?.city}
                  onChange={(e) =>
                    setSupplier((prev) => ({ ...prev, city: e.target.value }))
                  }
                />
                {/* <Select
                  placeholder="Select City"
                  className="w-full"
                  styles={drawerSelectStyles}
                  value={
                    supplier?.city
                      ? { value: supplier?.city, label: supplier?.city }
                      : null
                  }
                  options={shippingCities}
                  onChange={(e) =>
                    setSupplier((prev) => ({ ...prev, city: e.label }))
                  }
                /> */}
              </div>
              <div className="w-full space-y-2">
                <p>ZIP Code</p>
                <input
                  className="w-full h-12 bg-transparent outline-none border-2 px-4 border-gray-100 rounded-lg"
                  type="text"
                  name="zipCode"
                  value={supplier?.zipCode}
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

          {/* Billing Address */}
          <div className="w-full space-y-2">
            <h4 className="font-semibold">Billing Address</h4>
            {/* <div className="w-full space-y-2 pt-8">
              <p>Address</p>
              <input
                className="w-full h-12 bg-transparent outline-none border-2 px-4 border-gray-100 rounded-lg"
                type="text"
                name="billingcompanyaddress"
                value={supplier?.billingcompanyaddress}
                onChange={handleChange}
              />
            </div> */}
            <div className="w-full space-y-2 pt-8">
              <p>Address Line 1</p>
              <input
                className="w-full h-12 bg-transparent outline-none border-2 px-4 border-gray-100 rounded-lg"
                type="text"
                name="billingaddressOne"
                value={supplier?.billingaddressOne}
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
                  options={allCountries}
                  onChange={(e) => handleBillingCountry(e.label)}
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
                      ? billingStates.find(
                          (s) => s.label === supplier?.billingstate
                        )
                      : null
                  }
                  options={billingStates}
                  onChange={handleBillingState}
                />
              </div>
            </div>
            <div className="w-full grid grid-cols-2 gap-5">
              <div className="w-full space-y-2">
                <p>Town / City</p>
                <input
                  type="text"
                  name=""
                  id=""
                  placeholder="Enter Billing City"
                  className="w-full h-12 bg-transparent outline-none border-2 px-4 border-gray-100 rounded-lg"
                  value={supplier?.billingcity}
                  onChange={(e) =>
                    setSupplier((prev) => ({
                      ...prev,
                      billingcity: e.target.value,
                    }))
                  }
                />
                {/* <Select
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
                  options={billingCities}
                  onChange={(e) =>
                    setSupplier((prev) => ({ ...prev, billingcity: e.label }))
                  }
                /> */}
              </div>
              <div className="w-full space-y-2">
                <p>ZIP Code</p>
                <input
                  className="w-full h-12 bg-transparent outline-none border-2 px-4 border-gray-100 rounded-lg"
                  type="text"
                  name="billingzipCode"
                  value={supplier?.billingzipCode}
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
      </div>
    </div>
  );
}

export default EditPage;
