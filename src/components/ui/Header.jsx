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
  if (typeof window !== "undefined") {
    var userID = localStorage.getItem("userID");
  }
  const pathname = usePathname();
  const { toggle, setToggle } = useDataContext();

  const [userName, setUserName] = useState("");
  const [userType, setUserType] = useState("");
  const [isEmployee, setIsEmployee] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserName(localStorage.getItem("userName") ?? "");
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
              title={
                userType === "admin"
                  ? "Admin Profile"
                  : userType === "salesRepresentative"
                  ? "Local Partner Profile"
                  : ""
              }
              aria-label={
                userType === "admin"
                  ? "Admin Profile"
                  : userType === "salesRepresentative"
                  ? "Local Partner Profile"
                  : ""
              }
            >
              <PiUserBold size={28} color="white" />
            </button>
            <div
              onClick={() => {
                if (userType !== "admin") {
                  router.push(`/sale-representative/details/${userID}`);
                }
              }}
            >
              <h2 className="font-rubik font-semibold text-sm 2xl:text-base cursor-pointer">
                {userName}
              </h2>
              <p className="text-lightGray text-xs 2xl:text-sm font-normal font-workSans">
                {userType === "admin"
                  ? "Admin"
                  : userType === "salesRepresentative"
                  ? "Local Partner"
                  : userType === "supplier"
                  ? "Supplier"
                  : ""}
              </p>
            </div>
          </div>
          {!isEmployee && (
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center rounded p-1.5 ml-3"
              onClick={handleOpenProfile}
              title={
                userType === "admin"
                  ? "Admin Profile"
                  : userType === "salesRepresentative"
                  ? "Local Partner Profile"
                  : ""
              }
              aria-label={
                userType === "admin"
                  ? "Admin Profile"
                  : userType === "salesRepresentative"
                  ? "Local Partner Profile"
                  : ""
              }
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
