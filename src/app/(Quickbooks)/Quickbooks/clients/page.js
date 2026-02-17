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
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function CustomersByEmployee() {
  const router = useRouter();
  const [type, setType] = useState("qbo-registered");
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [searchQuery, setSearchQuery] = useState("");
  const { toggle, setToggle } = useDataContext();

  // Get accessToken and realmId from localStorage
  const accessTokenQbo =
    typeof window !== "undefined" ? localStorage.getItem("accessTokenQbo") : "";
  const realmId =
    typeof window !== "undefined" ? localStorage.getItem("realmId") : "";
  const isEmployee =
    typeof window !== "undefined"
      ? localStorage.getItem("isEmployee")
        ? true
        : false
      : false;

  // const isAuthenticated = accessTokenQbo && realmId;

  // if (!isAuthenticated) {
  //   return (
  //     <div className="w-full">
  //       <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed">
  //         <div className="flex items-center gap-2">
  //           <h2 className="text-xl font-inter font-semibold">
  //             Customer Management
  //           </h2>
  //         </div>
  //       </div>

  //       <div className="space-y-8 pb-6 pt-28 2xl:pt-32 px-6 2xl:px-12">
  //         <div className="text-center text-red-600">
  //           <p className="text-xl font-semibold">
  //             Authentication details are missing!
  //           </p>
  //           <p>Please check your login and try again.</p>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // Build API URL with pagination and search query parameters
  const baseUrl = `api/v1/admin/qbo-customer-management/customer-list${
    type === "qbo-registered"
      ? "/qbo-registered"
      : type === "qbo-not-registered"
        ? "/qbo-not-registered"
        : " "
  }`;

  // Build URL with proper query parameters
  const params = new URLSearchParams();
  params.set("page", page.toString());
  params.set("limit", limit.toString());
  if (searchQuery.trim()) {
    params.set("search", searchQuery.trim());
  }
  const apiUrl = `${baseUrl.trim()}?${params.toString()}`;

  // Fetch data if authenticated
  const { data, isLoading } = GetAPI(apiUrl);

  const columns = [
    { field: "name", header: "Name" },
    { field: "mainContact", header: "Main Contact" },
    { field: "employee", header: "Employee" },
    { field: "status", header: "Status" },
    { field: "lastOrder", header: "Last Order" },
  ];

  const datas = [];
  // Handle both possible API response structures: { data: [...], pagination: {...} } or { data: { data: [...], pagination: {...} } }
  const customersArray = Array.isArray(data?.data?.data)
    ? data?.data?.data
    : Array.isArray(data?.data)
      ? data?.data
      : [];

  customersArray.map((customer, i) => {
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
        },
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

  return isLoading ? (
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
              onClick={() => {
                setType("qbo-registered");
                setPage(1); // Reset to first page when filter changes
              }}
              className={`${
                type === "qbo-registered"
                  ? "bg-black text-white"
                  : "bg-white text-black"
              } font-workSans font-medium border border-black px-5 sm:px-8 py-2.5 duration-200`}
            >
              Qbo Registered
            </button>

            <button
              onClick={() => {
                setType("qbo-not-registered");
                setPage(1); // Reset to first page when filter changes
              }}
              className={`${
                type === "qbo-not-registered"
                  ? "bg-black text-white"
                  : "bg-white text-black"
              } font-workSans font-medium border border-black px-5 sm:px-8 py-2.5 duration-200`}
            >
              Qbo Unregistered
            </button>
          </div>

          {type !== "qbo-registered" && !isEmployee && (
            <button
              onClick={handleImportCustomers}
              disabled={loading || selectedRows.length === 0}
              className="inline-flex items-center justify-center gap-2 bg-theme text-white px-4 py-2 rounded-lg border border-theme hover:bg-white hover:text-theme transition-colors duration-200 font-medium disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-theme disabled:hover:text-white"
            >
              Export Customers
              {loading && (
                <AiOutlineLoading3Quarters className="w-4 h-4 animate-spin flex-shrink-0" />
              )}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <ManagementTab
            title="Total Customers"
            desc={
              data?.pagination?.totalItems ||
              data?.data?.pagination?.totalItems ||
              datas?.length ||
              0
            }
          />
        </div>

        {/* MyDataTable */}
        <MyDataTable
          columns={columns}
          data={datas}
          placeholder={"Search by Name, Main Contact, Employee..."}
          pagination={true}
          serverPagination={{
            page:
              data?.pagination?.page || data?.data?.pagination?.page || page,
            limit:
              data?.pagination?.limit || data?.data?.pagination?.limit || limit,
            totalRecords:
              data?.pagination?.totalItems ||
              data?.data?.pagination?.totalItems ||
              0,
            totalPages:
              data?.pagination?.totalPages ||
              data?.data?.pagination?.totalPages,
            onPageChange: (newPage) => setPage(newPage),
            onLimitChange: (newLimit) => {
              setLimit(newLimit);
              setPage(1);
            },
          }}
          searchValue={searchQuery}
          onSearchChange={(searchValue) => {
            setSearchQuery(searchValue);
            setPage(1); // Reset to first page when search changes
          }}
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
