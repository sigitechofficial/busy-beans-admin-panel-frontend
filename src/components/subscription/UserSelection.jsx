import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import axios from "axios";
import { BASE_URL } from "@/utilities/URL";
import { useRouter } from "next/navigation";
import { FaPlus } from "react-icons/fa";
import GetAPI from "@/utilities/GetAPI";

export default function UserSelection({
  onSelect,
  selectedUser,
  onAddNewUser,
  selectedPartnerId,
  onPartnerChange,
  isSalesRepresentativeUser = false,
}) {
  const router = useRouter();
  const localSalesRepId =
    typeof window !== "undefined" ? localStorage.getItem("userID") : "";

  // Partner options: Admin (null) + list of partners
  const { data: salesRepData } = GetAPI("api/v1/admin/sales-rep");
  const partnerOptions = [
    { value: null, label: "Admin customers" },
    ...(salesRepData?.data?.data || []).map((p) => ({
      value: p?.id,
      label: `${p?.srName || p?.name || "Partner"} (${p?.territoryName || ""})`.trim(),
    })),
  ];

  // Pagination state for customers
  const [options, setOptions] = useState([]);
  const [customerPage, setCustomerPage] = useState(1);
  const [customerLimit] = useState(30);
  const [customerHasMore, setCustomerHasMore] = useState(true);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [allCustomers, setAllCustomers] = useState([]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");

  const getCustomerListEndpoint = (page, limit, search = "", partnerId = selectedPartnerId) => {
    const base = isSalesRepresentativeUser
      ? `api/v1/admin/customer-management/customer-list/sale-rep-id/${localSalesRepId}`
      : partnerId != null && partnerId !== ""
        ? `api/v1/admin/customer-management/customer-list/sale-rep-id/${partnerId}`
        : "api/v1/admin/customer-management/customer-list/not-assigned";
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

  // Load initial customers and refetch when partner changes
  useEffect(() => {
    setOptions([]);
    setAllCustomers([]);
    setCustomerPage(1);
    fetchCustomers(1, false, customerSearchQuery);
  }, [selectedPartnerId]);

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

  const currentPartnerOption =
    selectedPartnerId != null
      ? partnerOptions.find((o) => o.value === selectedPartnerId)
      : partnerOptions[0];

  const selectStyles = {
    control: (base) => ({
      ...base,
      minHeight: "44px",
      borderRadius: "8px",
      borderColor: "#e5e7eb",
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  };

  return (
    <div className="space-y-6">
      {!isSalesRepresentativeUser && (
        <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
          <label className="text-sm font-semibold text-gray-700 block mb-1">
            Show customers for
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Admin customers or pick a partner to see their customers
          </p>
          <Select
            options={partnerOptions}
            value={currentPartnerOption || partnerOptions[0]}
            onChange={(opt) => {
              const newId = opt?.value ?? null;
              onPartnerChange?.(newId);
              onSelect(null);
            }}
            classNamePrefix="select"
            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
            styles={selectStyles}
          />
        </div>
      )}

      {/* Customer selection */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <label className="text-sm font-semibold text-gray-700 block">
              Select customer
            </label>
            <p className="text-xs text-gray-500 mt-0.5">
              Search by name or email
            </p>
          </div>
          {!isSalesRepresentativeUser && (
            <button
              type="button"
              onClick={handleAddNewUser}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-theme border border-theme rounded-lg hover:bg-theme/5 transition-colors shrink-0"
            >
              <FaPlus size={12} />
              Add New User
            </button>
          )}
        </div>
        <Select
          isLoading={customerLoading}
          options={options}
          value={
            selectedUser
              ? {
                  label: `${selectedUser.name || selectedUser.label} (${selectedUser.email})`,
                  value: selectedUser.value || selectedUser.id,
                }
              : null
          }
          onChange={(opt) => onSelect(opt)}
          placeholder="Search for a user..."
          classNamePrefix="select"
          menuPortalTarget={typeof document !== "undefined" ? document.body : null}
          styles={selectStyles}
          onInputChange={handleCustomerSearchChange}
          onMenuScrollToBottom={handleMenuScrollToBottom}
          menuListProps={{ onScroll: handleMenuScroll }}
          isSearchable
          filterOption={() => true}
          loadingMessage={() => "Loading customers..."}
        />
      </div>
    </div>
  );
}
