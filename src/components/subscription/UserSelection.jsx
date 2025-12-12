import React, { useState, useEffect } from "react";
import Select from "react-select";
import GetAPI from "@/utilities/GetAPI";
import { useRouter } from "next/navigation";
import { FaPlus } from "react-icons/fa";

export default function UserSelection({ onSelect, selectedUser, onAddNewUser }) {
  const router = useRouter();
  // Assuming there's an API to get all users. 
  // If not, we might need to rely on what's available or ask for an endpoint.
  // Using a generic endpoint for now based on assumption.
  const { data, isLoading, reFetch } = GetAPI("api/v1/admin/customer-management/customer-list/all");

  const [options, setOptions] = useState([]);

  useEffect(() => {
    // Check if data exists and is an array (handling potential variations in response structure)
    const users = data?.data?.data || data?.data || [];

    if (Array.isArray(users)) {
      const userOptions = users.map(u => ({
        label: `${u.name} (${u.email})`,
        value: u.id,
        email: u.email,
        name: u.name,
        ...u // spread other user props just in case
      }));
      setOptions(userOptions);
    }
  }, [data]);

  // Listen for storage event to handle user creation from another page
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'newCustomerCreated' && e.newValue) {
        try {
          const newCustomer = JSON.parse(e.newValue);
          // Refresh user list
          reFetch && reFetch();
          // Auto-select the new customer
          const userOption = {
            label: `${newCustomer.name} (${newCustomer.email})`,
            value: newCustomer.id,
            email: newCustomer.email,
            name: newCustomer.name,
            ...newCustomer
          };
          onSelect(userOption);
          // Clear the storage
          localStorage.removeItem('newCustomerCreated');
        } catch (error) {
          console.error('Error parsing new customer data:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Also check if value already exists (in case we're on the same page)
    const existingCustomer = localStorage.getItem('newCustomerCreated');
    if (existingCustomer) {
      handleStorageChange({ key: 'newCustomerCreated', newValue: existingCustomer });
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [onSelect, reFetch]);

  const handleAddNewUser = () => {
    if (onAddNewUser) {
      onAddNewUser();
    } else {
      // Default navigation
      router.push("/customers/add?returnTo=subscription");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="font-bold text-lg">Select User</label>
        <button
          onClick={handleAddNewUser}
          className="flex items-center gap-2 px-4 py-2 bg-theme text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
        >
          <FaPlus size={14} />
          Add New User
        </button>
      </div>
      <Select
        isLoading={isLoading}
        options={options}
        value={selectedUser ? { label: `${selectedUser.name || selectedUser.label} (${selectedUser.email})`, value: selectedUser.value || selectedUser.id } : null}
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
