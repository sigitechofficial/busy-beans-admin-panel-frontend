"use client";
import { Dialog } from "primereact/dialog";
import { useState, useEffect } from "react";
import Select from "react-select";
import { drawerSelectStyles } from "@/utilities/SelectStyle";
import GetAPI from "@/utilities/GetAPI";
import { MdFilterAlt } from "react-icons/md";

export default function UserTypeFilterModal({ 
  visible, 
  onHide, 
  onApply, 
  initialFilters = { userType: null, salesRepIds: null } 
}) {
  const [selectedUserType, setSelectedUserType] = useState(initialFilters.userType);
  const [selectedSalesReps, setSelectedSalesReps] = useState(() => {
    if (initialFilters.salesRepIds === null && initialFilters.userType === "salesRep") {
      // "ALL" is selected (null means all sales reps)
      return [{ value: "all", label: "ALL" }];
    }
    if (Array.isArray(initialFilters.salesRepIds) && initialFilters.salesRepIds.length > 0) {
      // Map IDs to options (will be populated when sales rep data loads)
      return initialFilters.salesRepIds.map(id => ({ value: id, label: `Sales Rep ${id}` }));
    }
    return [];
  });
  const [showSalesRepDropdown, setShowSalesRepDropdown] = useState(initialFilters.userType === "salesRep");

  // Fetch sales reps list
  const { data: salesRepData } = GetAPI("api/v1/admin/sales-rep");

  const salesRepOptions = [
    { value: "all", label: "ALL" },
    ...(salesRepData?.data?.data
      ? salesRepData.data.data.map((rep) => ({
          value: rep.id,
          label: rep.srName || rep.name,
        }))
      : []),
  ];

  // Update selectedSalesReps labels when data loads (for cases where data loads after modal opens)
  useEffect(() => {
    if (visible && salesRepData?.data?.data && selectedSalesReps.length > 0) {
      // Skip if "All" is selected
      if (selectedSalesReps[0].value === "all") return;
      
      // Check if any label is "Loading..." or needs update
      const needsUpdate = selectedSalesReps.some(selected => 
        selected.label === "Loading..." || 
        !salesRepData.data.data.find(r => r.id === selected.value && (r.srName || r.name) === selected.label)
      );
      
      if (needsUpdate) {
        const updated = selectedSalesReps.map(selected => {
          if (selected.value === "all") return selected;
          const rep = salesRepData.data.data.find(r => r.id === selected.value);
          if (rep) {
            return { value: rep.id, label: rep.srName || rep.name };
          }
          return selected;
        });
        setSelectedSalesReps(updated);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salesRepData, visible]);

  // Sync with initialFilters when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedUserType(initialFilters.userType);
      if (initialFilters.userType === "salesRep") {
        setShowSalesRepDropdown(true);
        if (initialFilters.salesRepIds === null) {
          // "ALL" is selected (null means all sales reps)
          setSelectedSalesReps([{ value: "all", label: "ALL" }]);
        } else if (Array.isArray(initialFilters.salesRepIds) && initialFilters.salesRepIds.length > 0) {
          // Map IDs to options with proper labels if data is available
          if (salesRepData?.data?.data) {
            const mapped = initialFilters.salesRepIds.map(id => {
              const rep = salesRepData.data.data.find(r => r.id === id);
              return rep 
                ? { value: rep.id, label: rep.srName || rep.name }
                : { value: id, label: `Sales Rep ${id}` };
            });
            setSelectedSalesReps(mapped);
          } else {
            // Data not loaded yet, will be updated in next effect
            setSelectedSalesReps(initialFilters.salesRepIds.map(id => ({ value: id, label: `Loading...` })));
          }
        } else {
          setSelectedSalesReps([]);
        }
      } else {
        setShowSalesRepDropdown(false);
        setSelectedSalesReps([]);
      }
    }
  }, [visible, initialFilters, salesRepData]);

  useEffect(() => {
    if (selectedUserType === "salesRep") {
      setShowSalesRepDropdown(true);
    } else {
      setShowSalesRepDropdown(false);
      setSelectedSalesReps([]);
    }
  }, [selectedUserType]);

  const handleUserTypeChange = (option) => {
    setSelectedUserType(option?.value || null);
    if (option?.value !== "salesRep") {
      setSelectedSalesReps([]);
    }
  };

  const handleSalesRepChange = (selectedOptions) => {
    if (!selectedOptions) {
      setSelectedSalesReps([]);
      return;
    }

    // Handle both single selection (object) and multi-selection (array)
    const optionsArray = Array.isArray(selectedOptions) ? selectedOptions : [selectedOptions];
    
    // Check if "ALL" is in the new selection
    const hasAllOption = optionsArray.some(opt => opt.value === "all");
    
    if (hasAllOption) {
      // If "ALL" is selected, only keep "ALL" option and remove others
      setSelectedSalesReps([{ value: "all", label: "ALL" }]);
    } else {
      // If specific partners are selected (without "ALL"), keep the selection
      setSelectedSalesReps(optionsArray);
    }
  };

  const handleApply = () => {
    let filters = {
      userType: null,
      salesRepIds: null,
    };

    if (selectedUserType === "all") {
      // All option selected - clear all filters
      filters = { userType: null, salesRepIds: null };
    } else if (selectedUserType === "admin") {
      // Admin selected
      filters = { userType: "admin", salesRepIds: null };
    } else if (selectedUserType === "salesRep") {
      // Sales rep selected
      if (selectedSalesReps.length === 0) {
        // No selection - don't apply filter (user must select at least one)
        return;
      } else {
        // Check if "ALL" is selected
        const hasAllOption = selectedSalesReps.some(rep => rep.value === "all");
        
        if (hasAllOption) {
          // "ALL" selected - set salesRepIds to null (API will handle as "All" sales reps)
          filters = {
            userType: "salesRep",
            salesRepIds: null,
          };
        } else {
          // Specific sales reps selected (can be single or multiple)
          filters = {
            userType: "salesRep",
            salesRepIds: selectedSalesReps.map((rep) => rep.value),
          };
        }
      }
    }

    onApply(filters);
    onHide();
  };

  const handleReset = () => {
    setSelectedUserType(null);
    setSelectedSalesReps([]);
    setShowSalesRepDropdown(false);
  };

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Filters"
      style={{ width: "90vw", maxWidth: "500px" }}
      className="font-inter"
      contentStyle={{ overflow: "visible" }}
    >
      <div className="space-y-6 py-4">
        {/* Select Option */}
        <div>
          <label className="block text-sm font-workSans font-semibold text-labelColor mb-2">
            Select
          </label>
          <Select
            styles={drawerSelectStyles}
            placeholder="Select Filter Type"
            value={
              selectedUserType
                ? { value: selectedUserType, label: selectedUserType === "admin" ? "Admin" : selectedUserType === "salesRep" ? "Local Partner" : "All" }
                : null
            }
            onChange={handleUserTypeChange}
            options={[
              { value: "all", label: "All" },
              { value: "admin", label: "Admin" },
              { value: "salesRep", label: "Local Partner" },
            ]}
            isClearable
          />
        </div>

        {/* Sales Rep Dropdown (only shown when Sales Rep is selected) */}
        {showSalesRepDropdown && (
          <div>
            <label className="block text-sm font-workSans font-semibold text-labelColor mb-2">
              Local Partner
            </label>
            <Select
              styles={{
                ...drawerSelectStyles,
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              }}
              placeholder="Select Local Partner(s)"
              value={selectedSalesReps}
              onChange={handleSalesRepChange}
              options={salesRepOptions}
              isMulti
              isClearable
              menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
            />
            <p className="text-xs text-gray-500 mt-1">
              Select one or more local partners. You can select multiple partners.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 font-workSans font-medium hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 rounded-md bg-theme text-white font-workSans font-medium hover:bg-theme/90 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </Dialog>
  );
}
