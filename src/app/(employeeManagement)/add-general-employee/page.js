"use client";
import BackButton from "@/components/ui/BackButton";
import { LuImageUp } from "react-icons/lu";
import Select from "react-select";
import { selectStyles2 } from "@/utilities/SelectStyle";
import PhoneInput from "react-phone-input-2";

export default function AddGeneralEmployee() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <BackButton />
          <h2 className="text-xl lg:text-2xl font-inter font-semibold">
            Add General Employee
          </h2>
        </div>
      </div>

      <div className="px-5 md:px-10 xl:px-14 py-5 md:py-8 xl:py-10 shadow-tableShadow border border-borderColor rounded-sm space-y-6">
        <div className="rounded-xl border border-tabBorderColor border-opacity-40 size-20 flex items-center justify-center">
          <LuImageUp size={"60"} color="rgba(0, 0, 0, 0.6)" />
        </div>
        <div className="grid xl:grid-cols-2 gap-y-4 lg:gap-x-12 xl:gap-16">
          {/* Left Side */}
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 max-md:gap-y-4 gap-x-6">
              <div className="flex flex-col gap-y-2">
                <label className="text-labelColor font-medium font-satoshi">
                  Employee Name
                </label>
                <input
                  type="text"
                  name="Supplier Name"
                  placeholder="Enter Supplier Name"
                  className="border border-borderColor text-secondary placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                />
              </div>
              <div className="flex flex-col gap-y-2 w-full">
                <label className="text-labelColor font-medium font-satoshi">
                  Country
                </label>
                <Select
                  placeholder="Choose country"
                  className="w-full"
                  styles={selectStyles2}
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 max-md:gap-y-4 gap-x-6">
              <div className="flex flex-col gap-y-2 w-full">
                <label className="text-labelColor font-medium font-satoshi">
                  City
                </label>
                <Select
                  placeholder="Select City"
                  className="w-full"
                  styles={selectStyles2}
                />
              </div>
              <div className="flex flex-col gap-y-2 w-full">
                <label className="text-labelColor font-medium font-satoshi">
                  State
                </label>
                <Select
                  placeholder="Select State"
                  className="w-full"
                  styles={selectStyles2}
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 max-md:gap-y-4 gap-x-6">
              <div className="flex flex-col gap-y-2">
                <label className="text-labelColor font-medium font-satoshi">
                  Zip Code
                </label>
                <input
                  type="text"
                  name=""
                  placeholder="Enter Zip code"
                  className="border border-borderColor text-secondary placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                />
              </div>
              <div className="flex flex-col gap-y-2">
                <label className="text-labelColor font-medium font-satoshi">
                  Registration Date
                </label>
                <input
                  type="date"
                  name=""
                  placeholder=""
                  className="border border-borderColor text-secondary placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                />
              </div>
            </div>
            <div className="flex flex-col gap-y-2">
              <label className="text-labelColor font-medium font-satoshi">
                Address
              </label>
              <input
                type="text"
                name=""
                placeholder="Enter Address 1"
                className="border border-borderColor text-secondary placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
              />
            </div>
            <div className="flex flex-col gap-y-2">
              <label className="text-labelColor font-medium font-satoshi">
                Phone number
              </label>
              {/* <input
                  type="text"
                  name=""
                  placeholder="Enter Phone Number"
                  className="border border-borderColor text-secondary placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                /> */}
              <div className="grid grid-cols-10 gap-x-2">
                <PhoneInput
                  focusBorderColor="none"
                  borderWidth="none"
                  className="chakra_input col-span-2"
                  inputStyle={{
                    width: "90px",
                    height: "45px",
                    borderRadius: "4px",
                    border: "1px solid #00000033",
                    backgroundColor: "#ffffff",
                    color: "#6f4e37",
                    opacity: "20",
                  }}
                  buttonStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #86644C",
                  }}
                  containerStyle={{
                    borderRadius: "12px",
                    backgroundColor: "#6f4e37",
                  }}
                  dropdownStyle={{
                    backgroundColor: "#6f4e37",
                    borderRadius: "8px",
                  }}
                  country={"pk"}
                  // onChange={(phone) =>
                  //   setSaleRepresentative({
                  //     ...saleRepresentative,
                  //     countryCode: phone,
                  //   })
                  // }
                />
                <input
                  type="number"
                  name="phoneNumber"
                  // value={saleRepresentative?.phoneNumber}
                  placeholder="Enter Phone Number"
                  className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5  w-full col-span-8"
                  // onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex flex-col gap-y-2">
              <label className="text-labelColor font-medium font-satoshi">
                Employee Category
              </label>
              <Select
                placeholder="General"
                className="w-full"
                styles={selectStyles2}
              />
            </div>
          </div>

          {/* right side */}
          <div className="flex flex-col justify-between gap-y-4">
            <div className="space-y-4">
              <div className="flex flex-col gap-y-2 w-full">
                <label className="text-labelColor font-medium font-satoshi">
                  Add Role
                </label>
                <Select
                  placeholder="Manager"
                  className="w-full"
                  styles={selectStyles2}
                />
              </div>
              <div className="flex flex-col gap-y-2">
                <label className="text-labelColor font-medium font-satoshi">
                  Password
                </label>
                <input
                  type="password"
                  name=""
                  placeholder="Enter password"
                  className="border border-borderColor text-secondary placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                />
              </div>
            </div>
            <div>
              <button className="font-inter font-medium rounded-sm text-buttonTextColor bg-theme w-full py-3">
                Add Employee
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
