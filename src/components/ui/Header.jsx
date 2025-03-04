'use client'
import Link from "next/link";
import { GiHamburgerMenu } from "react-icons/gi";
import { PiUserBold } from "react-icons/pi";

export default function Header(props) {
  return (
    <header className="w-full bg-themeTab shadow-tabShadow fixed border-b-2 border-tabBorderColor border-opacity-60 z-50 max-h-[94px]">
      <nav className="flex justify-between items-center max-md:px-6 py-3 sm:w-11/12 mx-auto">
        <Link href="/" className="flex items-center font-bold text-4xl min-h-[70px] max-h-[71px]">
          Busy Bean
          {/* <img src="/images/logo.png" alt="logo" className="max-w-16 max-h-[70px]" /> */}
        </Link>

        <div className="flex items-center gap-x-3 max-sm:hidden">
          {/* <div>
          <FaRegBell size={26} />
        </div> */}
          <div className="w-12 max-w-[50px] h-12 max-h-[50px] bg-black rounded-full flex items-center justify-center">
            <PiUserBold max={28} size={28} color="white" />
          </div>
          <div>
            <h2 className="font-rubik font-semibold">
              {/* {localStorage.getItem("userName")} */}
              Zeeshan Nawaz
            </h2>
            <p className="text-lightGray text-sm font-normal font-workSans">
              {/* {localStorage.getItem("userType")} */}
              Admin
            </p>
          </div>
        </div>
        <div
          className="sm:hidden"
          onClick={() => props?.setNavbarVis(!props?.navbarVis)}
        >
          <GiHamburgerMenu size="25px" />
        </div>
      </nav>
    </header>
  );
}
