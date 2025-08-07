"use client";

import { useDataContext } from "@/utilities/DataContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ListHead(props) {
  const { Icon, Angle, to, onClick, title, active } = props;
  const pathname = usePathname();
  const { setToggle } = useDataContext();

  const handleClick = () => {
    if (window.innerWidth < 768 && to) {
      setToggle(true);
    }

    if (onClick) onClick();
  };

  return (
    <li className="mx-2">
      <Link href={to || "#"} className="space-y-1">
        <div
          className={`flex gap-x-2 justify-between items-center py-1.5 lg:py-3 px-2 rounded-xl hover:bg-black hover:text-white duration-200
         ${
            pathname === to || active 
              ? "bg-black text-white" 
              : "bg-transparent text-black"
          }`}
          onClick={handleClick}
        >
          <div className="flex gap-x-2 items-center">
            <Icon size={25} />
            <h1 className="font-inter font-medium text-lg sm:text-sm lg:text-base">
              {title}
            </h1>
          </div>
          {Angle && <Angle />}
        </div>
        <hr className="w-full" />
      </Link>
    </li>
  );
}
