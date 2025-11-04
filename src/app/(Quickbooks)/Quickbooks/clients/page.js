"use client";

import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import GetAPI from "@/utilities/GetAPI";
import { useState } from "react";
import Loader from "@/components/ui/Loader";
import { useRouter } from "next/navigation";
import { success_toaster, error_toaster } from "@/utilities/Toaster";
import { useDataContext } from "@/utilities/DataContext";
import { CiMenuBurger } from "react-icons/ci";
import { PostAPI } from "@/utilities/PostAPI";

export default function CustomersByEmployee() {
  const router = useRouter();
  const [type, setType] = useState("qbo-registered");
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toggle, setToggle } = useDataContext();

  // Get accessToken and realmId from localStorage
  const accessTokenQbo =
    typeof window !== "undefined" ? localStorage.getItem("accessTokenQbo") : "";
  const realmId =
    typeof window !== "undefined" ? localStorage.getItem("realmId") : "";

  const isAuthenticated = accessTokenQbo && realmId;

  if (!isAuthenticated) {
    return (
      <div className="w-full">
        <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-inter font-semibold">
              Customer Management
            </h2>
          </div>
        </div>

        <div className="space-y-8 pb-6 pt-28 2xl:pt-32 px-6 2xl:px-12">
          <div className="text-center text-red-600">
            <p className="text-xl font-semibold">
              Authentication details are missing!
            </p>
            <p>Please check your login and try again.</p>
          </div>
        </div>
      </div>
    );
  }

  // Fetch data if authenticated
  const { data } = GetAPI(
    `api/v1/admin/customer-management/customer-list${
      type === "qbo-registered"
        ? "/qbo-registered"
        : type === "qbo-not-registered"
        ? "/qbo-not-registered"
        : " "
    } `
  );

  const columns = [
    { field: "name", header: "Name" },
    { field: "mainContact", header: "Main Contact" },
    { field: "employee", header: "Employee" },
    { field: "status", header: "Status" },
    { field: "lastOrder", header: "Last Order" },
  ];

  const datas = [];
  data?.data?.data?.map((customer, i) => {
    datas.push({
      id: customer?.id,
      sl: i + 1,
      name: customer?.companyName,
      mainContact: customer?.name,
      employee: customer?.employee ?? (
        <div className="w-max text-xs bg-[#EE4A4A14] text-[#EE4A4A] font-semibold p-2 rounded-md flex justify-center">
          Not Assigned
        </div>
      ),
      status: (
        <div>
          {customer?.status ? (
            <div className="w-24 bg-themeGreen text-white font-semibold p-2 rounded-md flex justify-center">
              Active
            </div>
          ) : (
            <div className="w-24 text-white bg-[#EE4A4A] font-semibold p-2 rounded-md flex justify-center">
              Inactive
            </div>
          )}
        </div>
      ),
      lastOrder: "Last order",
    });
  });

  const handleImportCustomers = async () => {
    if (!selectedRows?.length) {
      return;
    }

    setLoading(true);
    try {
      const customerIds = selectedRows.map((row) => row.id);
      const payload = { ids: customerIds };

      const res = await PostAPI(
        `qbo/customers/import`,
        payload,
        "",
        {},
        {
          // "x-qbo-access": accessTokenQbo,
          // "x-qbo-realmid": realmId,
        }
      );

      if (res?.data?.status === "success") {
        // success_toaster("Customers imported successfully!");
        setSelectedRows([]);
      } else {
        throw new Error(res?.data?.message || "An unexpected error occurred.");
      }
    } catch (error) {
      error_toaster("Error importing customers.");
    } finally {
      setLoading(false);
    }
  };

  return data?.length === 0 ? (
    <Loader />
  ) : (
    <div>
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed">
        <div className="flex items-center gap-2">
          <p
            onClick={() => setToggle(!toggle)}
            className="cursor-pointer md:hidden"
          >
            <CiMenuBurger size={20} />
          </p>
          <h2 className="text-xl font-inter font-semibold">
            Customer Management
          </h2>
        </div>
      </div>

      <div className="space-y-8 pb-6 pt-28 2xl:pt-32 px-6 2xl:px-12">
        <div className="flex justify-between items-center mt-6">
          <div>
            <button
              onClick={() => setType("qbo-registered")}
              className={`${
                type === "qbo-registered"
                  ? "bg-black text-white"
                  : "bg-white text-black"
              } font-workSans font-medium border border-black px-5 sm:px-8 py-2.5 duration-200`}
            >
              Qbo Registered
            </button>

            <button
              onClick={() => setType("qbo-not-registered")}
              className={`${
                type === "qbo-not-registered"
                  ? "bg-black text-white"
                  : "bg-white text-black"
              } font-workSans font-medium border border-black px-5 sm:px-8 py-2.5 duration-200`}
            >
              Qbo Unregistered
            </button>
          </div>

          {type !== "qbo-registered" && (
            <button
              onClick={handleImportCustomers}
              disabled={loading || selectedRows.length === 0}
              className={`${
                loading || selectedRows.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-theme text-white"
              } px-6 py-3 rounded-lg font-inter font-medium`}
            >
              {loading ? "Importing..." : "Export Customers"}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <ManagementTab title="Total Customers" desc={datas?.length} />
        </div>

        {/* MyDataTable */}
        <MyDataTable
          columns={columns}
          data={datas}
          placeholder={"Search ..."}
          pagination={true}
          search={true}
          checkbox={type !== "qbo-registered"}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          onRowClick={(e) => {
            router.push(`/customers/${e?.data?.id}`);
          }}
        />
      </div>
    </div>
  );
}
