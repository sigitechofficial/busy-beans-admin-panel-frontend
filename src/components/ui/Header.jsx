"use client";
import { useDataContext } from "@/utilities/DataContext";
import { usePathname } from "next/navigation";
import { CiMenuBurger } from "react-icons/ci";
import { PiUserBold } from "react-icons/pi";

export default function Header(props) {
  if (typeof window !== "undefined") {
    var userName = localStorage.getItem("userName") ?? "User Name";
    var userType = localStorage.getItem("userType");
  }
  const pathname = usePathname();
  const { toggle, setToggle } = useDataContext();

  return (
    pathname === "/" && (
      <header className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-themeTab shadow-tabShadow fixed right-0 border-b-2 border-tabBorderColor border-opacity-60 z-50 h-full max-h-[70px] 2xl:max-h-[94px]">
        <nav className="flex justify-between items-center h-full max-md:px-6 py-3 md:w-11/12 mx-auto">
          {/* <Link
          href="/"
          className="flex items-center font-bold text-4xl min-h-[70px] max-h-[71px]"
        >
          <img
            src="/images/logocoffee.png"
            alt="logo"
            className="max-h-[70px]"
          />
        </Link> */}

          <div className="flex items-center gap-x-3 max-md:hidden ml-auto">
            {/* <div>
          <FaRegBell size={26} />
        </div> */}
            <div className="size-10 2xl:size-12 bg-black rounded-full flex items-center justify-center">
              <PiUserBold max={28} size={28} color="white" />
            </div>
            <div>
              <h2 className="font-rubik font-semibold text-sm 2xl:text-base">
                {userName}
                {/* Zeeshan Nawaz */}
              </h2>
              <p className="text-lightGray text-xs  2xl:text-sm font-normal font-workSans">
                {/* {localStorage.getItem("userType")} */}
                {userType === "admin"
                  ? "Admin"
                  : userType === "salesRepresentative"
                  ? "Local Partner"
                  : "Supplier"}
              </p>
            </div>
          </div>
          <div
            className="md:hidden cursor-pointer"
            onClick={() => setToggle(!toggle)}
          >
            <CiMenuBurger color="black" size={20} />
          </div>
        </nav>
      </header>
    )
  );
}
