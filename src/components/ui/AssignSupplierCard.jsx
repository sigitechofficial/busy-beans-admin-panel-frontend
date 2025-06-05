import { BASE_URL } from "@/utilities/URL";
import { useState } from "react";

export default function AssignSupplierCard(props) {
  const { id, setSupplierID, checked, defaultChecked, image, name, email, phoneNo } = props;

  const handleChange = (e) => {
    setSupplierID(+e.target.value)
  }

  return (
    <div key={id} className="flex justify-between items-center">
      <div className="flex gap-x-4">
        <img
          src={BASE_URL + image}
          alt={name}
          className="bg-profilePhoto size-16 rounded-full"
        />
        <div className="font-inter space-y-0.5">
          <p className="font-medium text-black">{name}</p>
          <p className="font-normal text-black/50 text-sm">{email}</p>
          <p className="font-normal text-black/50 text-sm">{phoneNo}</p>
        </div>
      </div>
      <div>
        <input type="radio" onChange={handleChange} value={id} checked={checked} className="size-6" />
      </div>
    </div>
  );
}
