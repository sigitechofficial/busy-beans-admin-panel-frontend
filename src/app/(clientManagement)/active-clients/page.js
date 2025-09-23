// "use client";
// import ManagementTab from "@/components/ui/ManagementTab";
// import MyDataTable from "@/components/ui/MyDataTable";
// import GetAPI from "@/utilities/GetAPI";
// import { useState } from "react";
// import Loader from "@/components/ui/Loader";
// import { useRouter } from "next/navigation";
// import { useDataContext } from "@/utilities/DataContext";
// import { CiMenuBurger } from "react-icons/ci";
// import { hasPermission } from "@/utilities/Permission";

// export default function CustomersByEmployee() {
//   const router = useRouter();
//   const [type, setType] = useState("assigned-employee");

//   const { data } = GetAPI(
//     `api/v1/admin/customer-management/customer-list${
//       type === "all"
//         ? "/all"
//         : type === "unassigned-employee"
//         ? "/sale-rep/not-assigned-employee"
//         : "/sale-rep/assigned-employee"
//     } `
//   );

//   const columns = [
//     { field: "name", header: "Name" },
//     { field: "mainContact", header: "Main Contact" },
//     { field: "employee", header: "Employee" },
//     { field: "status", header: "Status" },
//     { field: "lastOrder", header: "Last Order" },
//   ];

//   const datas = [];
//   data?.data?.data?.map((customer, i) => {
//     datas.push({
//       id: customer?.id,
//       sl: i + 1,
//       name: customer?.companyName,
//       mainContact: customer?.name,
//       employee: customer?.employee ?? (
//         <div className="w-max text-xs bg-[#EE4A4A14] text-[#EE4A4A] font-semibold p-2 rounded-md flex justify-center">
//           Not Assigned
//         </div>
//       ),
//       status: (
//         <div>
//           {customer?.status ? (
//             <div className="w-24 bg-themeGreen text-white font-semibold p-2 rounded-md flex justify-center">
//               Active
//             </div>
//           ) : (
//             <div className="w-24 text-white bg-[#EE4A4A] font-semibold p-2 rounded-md flex justify-center">
//               Inactive
//             </div>
//           )}
//         </div>
//       ),
//       lastOrder: "Last order", 
//     });
//   });

//   const { toggle, setToggle } = useDataContext();

//   return data?.length === 0 ? (
//     <Loader />
//   ) : (
//     <div>
//       <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed">
//         <div className="flex items-center gap-2">
//           <p
//             onClick={() => setToggle(!toggle)}
//             className="cursor-pointer md:hidden"
//           >
//             <CiMenuBurger size={20} />
//           </p>
//           <h2 className="text-xl font-inter font-semibold">
//             Customer - Employee Management
//           </h2>
//         </div>
//       </div>

//       <div className="space-y-8 pb-6 pt-28 2xl:pt-32 px-6 2xl:px-12">
//         {/* Filter Buttons */}
//         <div>
//           <button
//             onClick={() => setType("all")}
//             className={`${
//               type === "all" ? "bg-black text-white" : "bg-white text-black"
//             } font-workSans font-medium border border-black px-5 sm:px-8 py-2.5 duration-200`}
//           >
//             All Customers
//           </button>
//           <button
//             onClick={() => setType("unassigned-employee")}
//             className={`${
//               type === "unassigned-employee"
//                 ? "bg-black text-white"
//                 : "bg-white text-black"
//             } font-workSans font-medium border border-black px-5 sm:px-8 py-2.5 duration-200`}
//           >
//             Unassigned Employee
//           </button>
//           <button
//             onClick={() => setType("assigned-employee")}
//             className={`${
//               type === "assigned-employee"
//                 ? "bg-black text-white"
//                 : "bg-white text-black"
//             } font-workSans font-medium border border-black px-5 sm:px-8 py-2.5 duration-200`}
//           >
//             Assigned Employee
//           </button>
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
//           <ManagementTab title="Total Customers" desc={datas?.length} />
//         </div>

//         <MyDataTable
//           columns={columns}
//           data={datas}
//           placeholder={"Search ..."}
//           pagination={true}
//           search={true}
//           onRowClick={(e) => {
//             router.push(`/customers/${e?.data?.id}`);
//           }}
//         />
//       </div>
//     </div>
//   );
// }


"use client";
import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import GetAPI from "@/utilities/GetAPI";
import { useState, useEffect } from "react";
import Loader from "@/components/ui/Loader";
import { useRouter } from "next/navigation";
import { useDataContext } from "@/utilities/DataContext";
import { CiMenuBurger } from "react-icons/ci";
import { hasPermission } from "@/utilities/Permission";

export default function CustomersByEmployee() {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState(null);

  const [type, setType] = useState("all");

  useEffect(() => {
    const storedEmployeeId = typeof window !== "undefined" ? localStorage.getItem("employeeId") : null;
    setEmployeeId(storedEmployeeId);
  }, []);

  const apiUrl = employeeId
    ? `api/v1/admin/customer-management/customer-list/employee-id/${employeeId}`
    : ""; 

  const { data, isLoading } = GetAPI(apiUrl);

  const columns = [
    { field: "name", header: "Name" },
    { field: "mainContact", header: "Main Contact" },
    { field: "employee", header: "Employee" },
    { field: "status", header: "Status" },
    { field: "lastOrder", header: "Last Order" },
  ];

  const datas = [];
  if (data?.data?.data?.length) {
    data.data.data.map((customer, i) => {
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
        status: customer?.status ? (
          <div className="w-24 bg-themeGreen text-white font-semibold p-2 rounded-md flex justify-center">Active</div>
        ) : (
          <div className="w-24 text-white bg-[#EE4A4A] font-semibold p-2 rounded-md flex justify-center">Inactive</div>
        ),
        lastOrder: "Last order",
      });
    });
  }

  const { toggle, setToggle } = useDataContext();

  return data?.length === 0 ? (
    <Loader />
  ) : (
    <div>
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed">
        <div className="flex items-center gap-2">
          <p onClick={() => setToggle(!toggle)} className="cursor-pointer md:hidden">
            <CiMenuBurger size={20} />
          </p>
          <h2 className="text-xl font-inter font-semibold">Customer - Employee Management</h2>
        </div>

        <ul className="flex items-center text-sm font-medium [&>li]:border-r [&>li]:px-2 [&>li]:cursor-pointer relative">
          {hasPermission("selected-customer_create") && (
            <li onClick={() => router.push("/customers/add")}>Add Customer</li>
          )}
        </ul>
      </div>

      <div className="space-y-8 pb-6 pt-28 2xl:pt-32 px-6 2xl:px-12">
        {!employeeId && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setType("all")}
              className={`${type === "all" ? "bg-black text-white" : "bg-white text-black"} font-workSans font-medium border border-black px-5 sm:px-8 py-2.5 duration-200`}
            >
              All Customers
            </button>
            <button
              onClick={() => setType("unassigned-employee")}
              className={`${type === "unassigned-employee" ? "bg-black text-white" : "bg-white text-black"} font-workSans font-medium border border-black px-5 sm:px-8 py-2.5 duration-200`}
            >
              Unassigned Employee
            </button>
            <button
              onClick={() => setType("assigned-employee")}
              className={`${type === "assigned-employee" ? "bg-black text-white" : "bg-white text-black"} font-workSans font-medium border border-black px-5 sm:px-8 py-2.5 duration-200`}
            >
              Assigned Employee
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <ManagementTab title="Total Customers" desc={datas?.length} />
        </div>

        <MyDataTable
          columns={columns}
          data={datas}
          placeholder={"Search ..."}
          pagination={true}
          search={true}
          onRowClick={(e) => router.push(`/customers/${e?.data?.id}`)}
        />
      </div>
    </div>
  );
}
