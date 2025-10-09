// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { useDataContext } from "@/utilities/DataContext";
// import { usePathname } from "next/navigation";
// import { CiMenuBurger } from "react-icons/ci";
// import { PiUserBold } from "react-icons/pi";
// import { Dialog } from "primereact/dialog";
// import GetAPI from "@/utilities/GetAPI";
// import { PatchAPI } from "@/utilities/PatchAPI";
// import {
//   success_toaster,
//   error_toaster,
//   info_toaster,
// } from "@/utilities/Toaster";

// export default function Header() {
//   const pathname = usePathname();
//   const { toggle, setToggle } = useDataContext();

//   const [userName, setUserName] = useState("User Name");
//   const [userType, setUserType] = useState("");
//   const [isEmployee, setIsEmployee] = useState(false);
//   const [userID, setUserID] = useState(null);

//   const [openProfile, setOpenProfile] = useState(false);

//   const [profileKey, setProfileKey] = useState(null);
//   const { data: profileResp, reFetch, isLoading } = GetAPI(profileKey, "profile");

//   const [saving, setSaving] = useState(false);

//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     supportEmail: "",
//     countryCode: "",
//     phoneNumber: "",
//     address: "",
//     country: "",
//     state: "",
//     city: "",
//     zipCode: "",
//     password: "",
//   });

//   const readonlyInfo = useMemo(() => {
//     const d = userType === "salesRepresentative" ? profileResp?.data?.data : profileResp?.data || {};
//     return {
//       id: d.id ?? "",
//       latestOtp: d.latestOtp ?? "",
//       createdAt: d.createdAt ?? "",
//       updatedAt: d.updatedAt ?? "",
//     };
//   }, [profileResp]);

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       setUserName(localStorage.getItem("userName") ?? "User Name");
//       setUserType(localStorage.getItem("userType") ?? "");
//       setUserID(localStorage.getItem("userID") ?? null);
//       setIsEmployee(!!localStorage.getItem("isEmployee"));
//     }
//   }, []);

//   useEffect(() => {
//     if (!profileResp?.data) return;

//     const userData = userType === "salesRepresentative" ? profileResp?.data?.data : profileResp?.data;
//     setForm({
//       name: userData.srName ?? userData.name ?? "",
//       email: userData.email ?? "",
//       supportEmail: userData.supportEmail ?? "",
//       countryCode: userData.countryCode ?? "",
//       phoneNumber: userData.phoneNumber ?? "",
//       address: userData.address ?? "",
//       country: userData.country ?? "",
//       state: userData.state ?? "",
//       city: userData.city ?? "",
//       zipCode: userData.zipCode ?? "",
//       password: "",
//     });
//   }, [profileResp, userType]);

//   useEffect(() => {
//     if (userType === "salesRepresentative") {
//       setProfileKey(`api/v1/admin/sales-rep/${userID}`);
//     } else if (userType === "admin") {
//       setProfileKey("api/v1/admin/profile");
//     }
//   }, [userType, userID]);

//   const handleOpenProfile = () => {
//     if (isEmployee) return;
//     if (userType !== "admin" && userType !== "salesRepresentative") {
//       info_toaster("Only admin or Local Partner can view profile");
//       return;
//     }
//     setOpenProfile(true);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e?.target || {};
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!userID) {
//       info_toaster("User id not found.");
//       return;
//     }
//     if (!form.email?.trim()) {
//       info_toaster("Email is required");
//       return;
//     }
//     if (!form.name?.trim()) {
//       info_toaster("Name is required");
//       return;
//     }

//     const payload = { ...form };
//     if (!payload.password) delete payload.password;

//     setSaving(true);
//     try {
//       let res;
//       if (userType === "salesRepresentative") {
//         res = await PatchAPI(
//           `api/v1/admin/sales-rep/${userID}`,
//           payload,
//           "profile"
//         );
//       } else {
//         res = await PatchAPI(
//           `api/v1/admin/profile-update/${userID}`,
//           payload,
//           "profile"
//         );
//       }

//       if (res?.data?.status === "success") {
//         success_toaster("Profile updated successfully");
//         if (profileKey) reFetch?.();
//         setOpenProfile(false);
//       } else {
//         throw new Error(res?.data?.message || "Failed to update profile");
//       }
//     } catch (err) {
//       error_toaster(err?.message || "Something went wrong");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Only show this header on home
//   if (pathname !== "/") return null;

//   return (
//     <>
//       <header className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-themeTab shadow-tabShadow fixed right-0 border-b-2 border-tabBorderColor border-opacity-60 z-50 h-full max-h-[70px] 2xl:max-h-[94px]">
//         <nav className="flex justify-between items-center h-full px-4 sm:px-6 py-3 md:w-11/12 mx-auto">
//           {/* Left (mobile)*/}
//           <button
//             type="button"
//             className="md:hidden inline-flex items-center justify-center rounded p-1.5"
//             onClick={() => setToggle(!toggle)}
//             aria-label="Open menu"
//           >
//             <CiMenuBurger color="black" size={22} />
//           </button>
//           <div className="flex-1" />
//           {/* Right (desktop) */}
//           <div className="hidden md:flex items-center gap-x-3 ml-auto absolute md:right-14">
//             <button
//               type="button"
//               className="size-10 2xl:size-12 bg-black rounded-full flex items-center justify-center cursor-pointer"
//               onClick={handleOpenProfile}
//               title={userType === "admin" ? "Admin Profile" : userType === "salesRepresentative" ? "Local Partner Profile" : ""}
//               aria-label={userType === "admin" ? "Admin Profile" : userType === "salesRepresentative" ? "Local Partner Profile" : ""}
//             >
//               <PiUserBold size={28} color="white" />
//             </button>
//             <div>
//               <h2 className="font-rubik font-semibold text-sm 2xl:text-base">
//                 {userName}
//               </h2>
//               <p className="text-lightGray text-xs 2xl:text-sm font-normal font-workSans">
//                 {userType === "admin"
//                   ? "Admin"
//                   : userType === "salesRepresentative"
//                   ? "Local Partner"
//                   : "Supplier"}
//               </p>
//             </div>
//           </div>
//           {!isEmployee && (
//             <button
//               type="button"
//               className="md:hidden inline-flex items-center justify-center rounded p-1.5 ml-3"
//               onClick={handleOpenProfile}
//               title={userType === "admin" ? "Admin Profile" : userType === "salesRepresentative" ? "Local Partner Profile" : ""}
//               aria-label={userType === "admin" ? "Admin Profile" : userType === "salesRepresentative" ? "Local Partner Profile" : ""}
//             >
//               <div className="size-9 bg-black rounded-full flex items-center justify-center">
//                 <PiUserBold size={22} color="white" />
//               </div>
//             </button>
//           )}
//         </nav>
//       </header>

//       <Dialog
//         visible={openProfile}
//         onHide={() => setOpenProfile(false)}
//         dismissableMask={true}
//         header={
//         <div className="font-bold text-lg">
//           {userType === "admin" ? "Admin Profile" : "Local Partner Profile"}
//         </div>}
//         className="w-screen max-w-none sm:w-[95%] sm:max-w-lg !m-0 sm:!m-auto font-satoshi"
//         contentClassName="!p-4 sm:!p-5"
//       >
//         {!profileResp && isLoading ? (
//           <div className="py-10 text-center text-sm opacity-70">
//             Loading profile...
//           </div>
//         ) : (
//           <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
//             {/* Readonly fields*/}
//             <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
//               <div>
//                 <span className="block">User ID</span>
//                 <span className="font-medium text-gray-700">{readonlyInfo.id}</span>
//               </div>
//               <div>
//                 <span className="block">Latest OTP</span>
//                 <span className="font-medium text-gray-700">{readonlyInfo.latestOtp}</span>
//               </div>
//               <div>
//                 <span className="block">Created</span>
//                 <span className="font-medium text-gray-700">
//                   {readonlyInfo.createdAt
//                     ? new Date(readonlyInfo.createdAt).toLocaleString()
//                     : "-"}
//                 </span>
//               </div>
//               <div>
//                 <span className="block">Updated</span>
//                 <span className="font-medium text-gray-700">
//                   {readonlyInfo.updatedAt
//                     ? new Date(readonlyInfo.updatedAt).toLocaleString()
//                     : "-"}
//                 </span>
//               </div>
//             </div>

//             {/* Editable fields */}
//             <div className="grid grid-cols-1 gap-4">
//               <div className="flex flex-col gap-1">
//                 <label className="font-medium text-sm">Name</label>
//                 <input
//                   name="name"
//                   value={form.name}
//                   onChange={handleChange}
//                   placeholder="Full name"
//                   className="border rounded px-3 py-2 outline-none"
//                 />
//               </div>

//               <div className="flex flex-col gap-1">
//                 <label className="font-medium text-sm">Email</label>
//                 <input
//                   type="email"
//                   name="email"
//                   value={form.email}
//                   onChange={handleChange}
//                   placeholder="Enter email"
//                   className="border rounded px-3 py-2 outline-none"
//                 />
//               </div>
//               {userType === "admin" && (
//               <div className="flex flex-col gap-1">
//                 <label className="font-medium text-sm">Support Email</label>
//                 <input
//                   name="supportEmail"
//                   value={form.supportEmail}
//                   onChange={handleChange}
//                   placeholder="Enter Support Email"
//                   className="border rounded px-3 py-2 outline-none"
//                 />
//               </div>
//               )}
//               <div className="flex flex-col gap-1">
//                 <label className="font-medium text-sm">Phone</label>
//                 <div className="flex gap-2">
//                   <input
//                     name="countryCode"
//                     value={form.countryCode}
//                     onChange={handleChange}
//                     placeholder="Country code"
//                     className="border rounded px-3 py-2 w-28 outline-none"
//                   />
//                   <input
//                     name="phoneNumber"
//                     value={form.phoneNumber}
//                     onChange={handleChange}
//                     placeholder="Phone number"
//                     className="border rounded px-3 py-2 flex-1 outline-none"
//                   />
//                 </div>
//               </div>

//               <div className="flex flex-col gap-1">
//                 <label className="font-medium text-sm">Address</label>
//                 <input
//                   name="address"
//                   value={form.address}
//                   onChange={handleChange}
//                   placeholder="Street / Address"
//                   className="border rounded px-3 py-2 outline-none"
//                 />
//               </div>

//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                 <div className="flex flex-col gap-1">
//                   <label className="font-medium text-sm">Country</label>
//                   <input
//                     name="country"
//                     value={form.country}
//                     onChange={handleChange}
//                     placeholder="Country"
//                     className="border rounded px-3 py-2 outline-none"
//                   />
//                 </div>
//                 <div className="flex flex-col gap-1">
//                   <label className="font-medium text-sm">State</label>
//                   <input
//                     name="state"
//                     value={form.state}
//                     onChange={handleChange}
//                     placeholder="State / Province"
//                     className="border rounded px-3 py-2 outline-none"
//                   />
//                 </div>
//                 <div className="flex flex-col gap-1">
//                   <label className="font-medium text-sm">City</label>
//                   <input
//                     name="city"
//                     value={form.city}
//                     onChange={handleChange}
//                     placeholder="City"
//                     className="border rounded px-3 py-2 outline-none"
//                   />
//                 </div>
//                 <div className="flex flex-col gap-1">
//                   <label className="font-medium text-sm">Zip Code</label>
//                   <input
//                     name="zipCode"
//                     value={form.zipCode}
//                     onChange={handleChange}
//                     placeholder="Zip / Postal code"
//                     className="border rounded px-3 py-2 outline-none"
//                   />
//                 </div>
//               </div>
//               <div className="flex flex-col gap-1">
//                 <label className="font-medium text-sm">New Password</label>
//                 <input
//                   type="password"
//                   name="password"
//                   value={form.password}
//                   onChange={handleChange}
//                   placeholder="Enter new password (optional)"
//                   className="border rounded px-3 py-2 outline-none"
//                 />
//                 <small className="text-gray-500">
//                   Leave blank to keep current password
//                 </small>
//               </div>
//             </div>

//             {/* Actions */}
//             <div className="flex justify-end gap-3 mt-2">
//               <button
//                 type="button"
//                 onClick={() => setOpenProfile(false)}
//                 className="px-4 py-2 border rounded hover:bg-gray-100"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={saving}
//                 className="px-4 py-2 bg-theme text-white rounded hover:bg-themeDark disabled:opacity-70"
//               >
//                 {saving ? "Saving..." : "Save"}
//               </button>
//             </div>
//           </form>
//         )}
//       </Dialog>
//     </>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import { useDataContext } from "@/utilities/DataContext";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { CiMenuBurger } from "react-icons/ci";
import { PiUserBold } from "react-icons/pi";
import { info_toaster } from "@/utilities/Toaster";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { toggle, setToggle } = useDataContext();

  const [userName, setUserName] = useState("User Name");
  const [userType, setUserType] = useState("");
  const [isEmployee, setIsEmployee] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserName(localStorage.getItem("userName") ?? "User Name");
      setUserType(localStorage.getItem("userType") ?? "");
      setIsEmployee(!!localStorage.getItem("isEmployee"));
    }
  }, []);

  const handleOpenProfile = () => {
    if (isEmployee) return;
    if (userType !== "admin" && userType !== "salesRepresentative") {
      info_toaster("Only admin or Local Partner can view profile");
      return;
    }
    router.push("/profile");
  };

  if (pathname !== "/") return null;
  
  return (
    <>
    <header className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-themeTab shadow-tabShadow fixed right-0 border-b-2 border-tabBorderColor border-opacity-60 z-50 h-full max-h-[70px] 2xl:max-h-[94px]">
      <nav className="flex justify-between items-center h-full px-4 sm:px-6 py-3 md:w-11/12 mx-auto">
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center rounded p-1.5"
          onClick={() => setToggle(!toggle)}
          aria-label="Open menu"
        >
          <CiMenuBurger color="black" size={22} />
        </button>
        <div className="flex-1" />
        <div className="hidden md:flex items-center gap-x-3 ml-auto absolute md:right-14">
          <button
            type="button"
            className="size-10 2xl:size-12 bg-black rounded-full flex items-center justify-center cursor-pointer"
            onClick={handleOpenProfile}
            title={userType === "admin" ? "Admin Profile" : userType === "salesRepresentative" ? "Local Partner Profile" : ""}
            aria-label={userType === "admin" ? "Admin Profile" : userType === "salesRepresentative" ? "Local Partner Profile" : ""}
          >
            <PiUserBold size={28} color="white" />
          </button>
          <div>
            <h2 className="font-rubik font-semibold text-sm 2xl:text-base">{userName}</h2>
            <p className="text-lightGray text-xs 2xl:text-sm font-normal font-workSans">
              {userType === "admin" ? "Admin" : userType === "salesRepresentative" ? "Local Partner" : "Supplier"}
            </p>
          </div>
        </div>
        {!isEmployee && (
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded p-1.5 ml-3"
            onClick={handleOpenProfile}
            title={userType === "admin" ? "Admin Profile" : userType === "salesRepresentative" ? "Local Partner Profile" : ""}
            aria-label={userType === "admin" ? "Admin Profile" : userType === "salesRepresentative" ? "Local Partner Profile" : ""}
          >
            <div className="size-9 bg-black rounded-full flex items-center justify-center">
              <PiUserBold size={22} color="white" />
            </div>
          </button>
        )}
      </nav>
    </header>
</>
  );
}
