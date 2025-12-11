import React, { useState, useEffect } from "react";
import Select from "react-select";
import GetAPI from "@/utilities/GetAPI";

export default function UserSelection({ onSelect, selectedUser }) {
  // Assuming there's an API to get all users. 
  // If not, we might need to rely on what's available or ask for an endpoint.
  // Using a generic endpoint for now based on assumption.
  const { data, isLoading } = GetAPI("api/v1/admin/customer-management/customer-list/all");

  const [options, setOptions] = useState([]);

  useEffect(() => {
    // Check if data exists and is an array (handling potential variations in response structure)
    const users = data?.data?.data || data?.data || [];

    if (Array.isArray(users)) {
      const userOptions = users.map(u => ({
        label: `${u.name} (${u.email})`,
        value: u.id,
        email: u.email,
        ...u // spread other user props just in case
      }));
      setOptions(userOptions);
    }
  }, [data]);

  return (
    <div className="space-y-2">
      <label className="font-bold text-lg">Select User</label>
      <Select
        isLoading={isLoading}
        options={options}
        value={selectedUser ? { label: `${selectedUser.name} (${selectedUser.email})`, value: selectedUser.id } : null}
        onChange={(opt) => onSelect(opt)} // Pass full user object
        placeholder="Search for a user..."
        className="basic-multi-select"
        classNamePrefix="select"
        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          control: (base) => ({ ...base, minHeight: '45px' })
        }}
      />
    </div>
  );
}
