"use client";
import Charts from "@/components/ui/Charts";
import HomeCards from "@/components/ui/HomeCards";
import HomeMiniCards from "@/components/ui/HomeMiniCards";
import GetAPI from "@/utilities/GetAPI";
import { useEffect } from "react";
import { BsCardList } from "react-icons/bs";
import { FaChartLine } from "react-icons/fa";
import { PiHandbagFill, PiUsersThreeBold } from "react-icons/pi";

// ✅ Required since PrimeReact requires Client Components

export default function Home() {
  if (typeof window !== "undefined") {
    var userType = localStorage.getItem("userType");
    var userID = localStorage.getItem("userID");
    var connectAccountId = localStorage.getItem("connectAccountId");
    var isAccountConnected = localStorage.getItem("isAccountConnected");
    var url = window.location.href;
  }

  const { data } = GetAPI("api/v1/admin/dashboard");

  useEffect(() => {
    const stripeAccountStatus = async () => {
      try {
        const res = await axios.get(
          BASE_URL + `api/v1/admin/stripe-connect-account-retrieve/${userID}`
        );
        console.log("🚀 ~ stripeAccountStatus ~ res:", res?.data);
        if (res?.data?.status === "success") {
          localStorage.setItem("isAccountConnected", true);
        } else {
          throw new Error(
            res?.data?.message || "An unexpected error occurred."
          );
        }
      } catch (error) {
        ErrorHandler(error);
      }
    };
    if (userType === "salesRepresentative") {
      stripeAccountStatus();
    }
  }, []);

  return (
    <>
      <div className="bg-red-500 z-10">hamza</div>
      <div className="bg-homeGradient w-full h-44 relative before:absolute before:bg-texture before:w-full before:h-44 before:bg-contain">
        <div className="relative z-30 py-5 px-6 2xl:px-12">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-white text-xl lg:text-3xl font-inter font-semibold">
                Welcome, Zeeshan N.
              </h1>
              <p className="text-white font-inter">
                Monitor your business analytics and statistics
              </p>
            </div>

            {/* <div className="min-w-40">
            {displayCustomFilters ? (
              <div className="flex gap-x-2 items-center h-[42px]">
                <div className=" space-x-2">
                  <label
                    htmlFor="startDate"
                    className=" text-labelColor font-workSans font-semibold"
                  >
                    Start Date:
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={customDates?.startDate}
                    onChange={handleCustomDates}
                    className="h-[42px] rounded-md px-3 outline-none border font-workSans font-medium 
                            text-labelColor"
                  />
                </div>
                <div className="space-x-2">
                  <label
                    htmlFor="endDate"
                    className=" text-labelColor font-workSans font-semibold"
                  >
                    End Date:
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={customDates?.endDate}
                    onChange={handleCustomDates}
                    className="h-[42px] rounded-md px-3 outline-none border font-workSans font-medium 
                            text-labelColor"
                  />
                </div>
                <div className="h-full flex items-center gap-x-2">
                  <button
                    onClick={handleCancel}
                    className="px-2 h-full rounded-lg border border-black text-black bg-white hover:text-white hover:bg-black duration-200 group"
                  >
                    <ImCross size={24} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="font-bold">
                <Select
                  styles={selectStyles}
                  defaultValue={{ value: "allTime", label: "All Time" }}
                  placeholder="Select Year, Month, Week ..."
                  value={selectedOption ? selectedOption : null}
                  onChange={(val) => handleChange(val)}
                  options={options ? options : null}
                />
              </div>
            )}
          </div> */}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-5">
            <HomeCards
              title="Total Countries"
              // description="Upcoming bookings + completed bookings + Cancelled bookings"
              total={data?.data?.totalCountries}
              Icon={BsCardList}
              bgColor="bg-homeCards"
              iconBg="bg-white"
            />
            <HomeCards
              currecncyunit={"$"}
              title="Total States"
              // description="Total of all the completed bookings only"
              total={data?.data?.totalStates}
              Icon={FaChartLine}
              bgColor="bg-homeCards"
              iconBg="bg-white"
            />
            <HomeCards
              title="Total Cities"
              // description="All active and inactive Customers"
              total={data?.data?.totalCities}
              Icon={PiUsersThreeBold}
              bgColor="bg-homeCards"
              iconBg="bg-white"
            />
            <HomeCards
              title="Total Local Partners"
              // description="Salons that have completed at least one registration step. Specifically Add your business address and team size"
              total={data?.data?.totalPatners}
              Icon={PiHandbagFill}
              bgColor="bg-homeCards"
              iconBg="bg-white"
            />
            <HomeCards
              title="Total Suppliers"
              // description="Salons that have completed at least one registration step. Specifically Add your business address and team size"
              total={data?.data?.totalSupplier}
              Icon={PiHandbagFill}
              bgColor="bg-homeCards"
              iconBg="bg-white"
            />
            <HomeCards
              title="Total Clients"
              // description="Salons that have completed at least one registration step. Specifically Add your business address and team size"
              total={data?.data?.totalUser}
              Icon={PiHandbagFill}
              bgColor="bg-homeCards"
              iconBg="bg-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mt-12">
            <HomeMiniCards
              title="Total Sale"
              // description="The bookings that are booked and an employee has been assigned to them."
              total={`$${data?.data?.salesSummary?.sales}`}
              // Icon={FiBox}
            />
            <HomeMiniCards
              title="Whole Sale"
              total={`$${data?.data?.salesSummary?.wholesalePriceTotal}`}
              // Icon={LuPackageCheck}
            />
            <HomeMiniCards
              title="Suppliers Earning"
              total={`$${data?.data?.revenueSummary?.revenueCollected}`}
              // Icon={LuPackageX}
            />
            {/* <HomeMiniCards
            title="Pending Payments"
            description="The bookings in which minimum 1 service is not assigned to any employee"
            total={"$2000"}
            Icon={FiBox}
          /> */}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mt-6">
            <HomeMiniCards
              title="Total Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.ordersSummary?.orderPlaced}
              // Icon={FiBox}
            />
            <HomeMiniCards
              title="Assigned Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.ordersSummary?.assignedToSupplier}
              // Icon={FiBox}
            />
            <HomeMiniCards
              title="Acknowledged Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.ordersSummary?.supplierAcknowledged}
              // Icon={FiBox}
            />
            <HomeMiniCards
              title="Dispatched Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.ordersSummary?.dispatchedOrders}
              // Icon={FiBox}
            />
            <HomeMiniCards
              title="Delivered Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.ordersSummary?.deliveredOrders}
              // Icon={FiBox}
            />
            <HomeMiniCards
              title="Cancelled Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.ordersSummary?.CanceledOrders}
              // Icon={FiBox}
            />
            <HomeMiniCards
              title="Unpaid Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.ordersSummary?.paymentPending}
              // Icon={FiBox}
            />
            <HomeMiniCards
              title="Paid Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.ordersSummary?.paymentDone}
              // Icon={FiBox}
            />
          </div>

          <div className="mt-12">
            {/* <Charts today={today} /> */}
            {/* <Charts  /> */}
          </div>
        </div>
      </div>
    </>
  );
}
