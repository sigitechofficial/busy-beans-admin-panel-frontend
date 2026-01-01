import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import axios from "axios";
import { BASE_URL } from "@/utilities/URL";
import { useRouter } from "next/navigation";
import { FaPlus } from "react-icons/fa";

export default function UserSelection({ onSelect, selectedUser, onAddNewUser }) {
  const router = useRouter();
  
  // Pagination state for customers
  const [options, setOptions] = useState([]);
  const [customerPage, setCustomerPage] = useState(1);
  const [customerLimit] = useState(30);
  const [customerHasMore, setCustomerHasMore] = useState(true);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [allCustomers, setAllCustomers] = useState([]); // Store all fetched customers
  const [customerSearchQuery, setCustomerSearchQuery] = useState(""); // Search query for customers

  const getCustomerListEndpoint = (page, limit, search = "") => {
    const base = "api/v1/admin/customer-management/customer-list/all";
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", limit.toString());
    if (search.trim()) {
      params.set("search", search.trim());
    }
    return `${base}?${params.toString()}`;
  };

  // Fetch customers with pagination and search
  const fetchCustomers = async (page, append = false, searchQuery = customerSearchQuery) => {
    if (customerLoading) return;
    
    setCustomerLoading(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      const endpoint = getCustomerListEndpoint(page, customerLimit, searchQuery);
      
      const res = await axios.get(`${BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          feature: "customer",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res?.data?.status === "success") {
        const customers = res?.data?.data?.data || res?.data?.data || [];
        const totalItems = res?.data?.pagination?.totalItems || res?.data?.data?.pagination?.totalItems || customers.length;
        const totalPages = res?.data?.pagination?.totalPages || res?.data?.data?.pagination?.totalPages || Math.ceil(totalItems / customerLimit);
        
        const newOptions = customers.map((user) => ({
          label: `${user.name} (${user.email})`,
          value: user.id,
          email: user.email,
          name: user.name,
          ...user // spread other user props just in case
        }));

        if (append) {
          setOptions((prev) => [...prev, ...newOptions]);
          setAllCustomers((prev) => [...prev, ...customers]);
        } else {
          setOptions(newOptions);
          setAllCustomers(customers);
        }

        setCustomerHasMore(page < totalPages);
        setCustomerPage(page);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setCustomerLoading(false);
    }
  };

  // Search timeout ref for debouncing
  const customerSearchTimeoutRef = useRef(null);

  // Handle search input change with debounce
  const handleCustomerSearchChange = (inputValue) => {
    // Clear previous timeout
    if (customerSearchTimeoutRef.current) {
      clearTimeout(customerSearchTimeoutRef.current);
    }

    // Reset to page 1 and fetch with new search query after debounce
    customerSearchTimeoutRef.current = setTimeout(() => {
      setCustomerSearchQuery(inputValue);
      setCustomerPage(1);
      setOptions([]);
      setAllCustomers([]);
      fetchCustomers(1, false, inputValue);
    }, 500); // 500ms debounce
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (customerSearchTimeoutRef.current) {
        clearTimeout(customerSearchTimeoutRef.current);
      }
    };
  }, []);

  // Load initial customers
  useEffect(() => {
    fetchCustomers(1, false, customerSearchQuery);
  }, []);

  // Load more customers on scroll
  const handleMenuScrollToBottom = () => {
    if (!customerLoading && customerHasMore) {
      fetchCustomers(customerPage + 1, true, customerSearchQuery);
    }
  };

  // Alternative scroll handler for menuListProps
  const handleMenuScroll = (event) => {
    const { target } = event;
    if (!target) return;
    
    const { scrollTop, scrollHeight, clientHeight } = target;
    // Check if scrolled near bottom (within 50px)
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      if (!customerLoading && customerHasMore) {
        fetchCustomers(customerPage + 1, true, customerSearchQuery);
      }
    }
  };

  // Re-fetch function for external use (like localStorage listener)
  const reFetch = () => {
    setCustomerPage(1);
    setOptions([]);
    setAllCustomers([]);
    fetchCustomers(1, false, customerSearchQuery);
  };

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
  }, [onSelect]);

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
        isLoading={customerLoading}
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
        onInputChange={handleCustomerSearchChange}
        onMenuScrollToBottom={handleMenuScrollToBottom}
        menuListProps={{
          onScroll: handleMenuScroll,
        }}
        isSearchable={true}
        filterOption={() => true} // Disable client-side filtering, use server-side search
        loadingMessage={() => "Loading customers..."}
      />
    </div>
  );
}
