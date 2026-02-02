"use client";

import { useDataContext } from "@/utilities/DataContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ListHead(props) {
  const { Icon, Angle, to, onClick, title, active, dataTestId, status } = props;
  const pathname = usePathname();
  const { setToggle } = useDataContext();

  const handleClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768 && to) {
      setToggle(false);
    }

    if (onClick) onClick();
  };

  return (
    <li className="mx-2 md:mx-2">
      <Link href={to || "#"} className="space-y-1 block touch-manipulation">
        <div
          data-testid={dataTestId}
          className={`flex gap-x-3 justify-between items-center min-h-[44px] py-3 px-3 rounded-xl hover:bg-black hover:text-white active:scale-[0.98] duration-200
            md:min-h-0 md:py-1.5 md:px-2 lg:py-3
         ${
           pathname === to || active
             ? "bg-black text-white"
             : "bg-transparent text-black"
         }`}
          onClick={handleClick}
        >
          <div className="flex gap-x-3 items-center md:gap-x-2">
            <Icon size={25} className="flex-shrink-0" />
            <h1 className="font-inter font-medium text-base md:text-sm lg:text-base">
              {title}
            </h1>
          </div>
          {Angle && (
            <Angle
              className={`flex-shrink-0 transition-transform duration-200 ease-in-out ${
                status ? "rotate-90" : "rotate-0"
              }`}
            />
          )}
        </div>
        <hr className="w-full" />
      </Link>
    </li>
  );
}
