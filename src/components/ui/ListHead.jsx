"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ListHead(props) {
  const { Icon, Angle } = props;

  const pathname = usePathname();
  return (
    <li className="mx-2">
      <Link href={props?.to ? props?.to : ""} className="space-y-1">
        <div
          className={`flex gap-x-2 justify-between items-center py-1.5 lg:py-3 px-2 rounded-xl  hover:bg-black hover:text-white duration-200
         ${
           pathname === props.to || props.active
             ? "bg-black text-white"
             : "bg-transparent text-black"
         }`}
          onClick={props.onClick}
        >
          <div className="flex gap-x-2">
            <Icon size={25} />
            <h1 className="font-inter font-medium text-lg sm:text-sm lg:text-base">
              {props?.title}
            </h1>
          </div>

          <button>{Angle && <Angle />}</button>
        </div>
        <hr className="w-full" />
      </Link>
    </li>
  );
}
