import React from "react";
import { FaEdit } from "react-icons/fa";

export default function ZoneEditTab(props) {
  const { name } = props;
  return (
    <div className="flex items-center justify-between p-4 bg-themeTab border border-tabBorderColor border-opacity-60 rounded-xl font-inter font-semibold text-xl">
      <span>{name}</span>

      <span>
        <FaEdit size={24} />
      </span>
    </div>
  );
}
