import Link from "next/link";
import React from "react";

export default function ReportCard(props) {
  const { Icon } = props;
  return (
    <Link
      href={props?.to}
      className={`bg-white flex justify-start items-center border border-tabBorderColor shadow-lg rounded-lg ${
        props?.padding ? props?.padding : "py-10"
      } hover:bg-theme group`}
    >
      <div className="flex items-center gap-x-4 text-xl text-theme group-hover:text-white duration-150 font-chivo font-semibold px-5">
        <Icon size={24} />
        <p>{props?.title}</p>
      </div>
    </Link>
  );
}
