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
  initialFilters = { userType: null, salesRepIds: null },
  allowMultiSelect = true, // Default to true for backward compatibility
  enableEmployeeOption = false,
}) {
  const [selectedUserType, setSelectedUserType] = useState(initialFilters.userType);
  const [selectedSalesReps, setSelectedSalesReps] = useState(() => {
    if (allowMultiSelect) {
      if (initialFilters.salesRepIds === null && initialFilters.userType === "salesRep") {
        // "ALL" is selected (null means all sales reps) - only for multi-select
        return [{ value: "all", label: "ALL" }];
      }
      if (Array.isArray(initialFilters.salesRepIds) && initialFilters.salesRepIds.length > 0) {
        // Map IDs to options (will be populated when sales rep data loads)
        return initialFilters.salesRepIds.map(id => ({ value: id, label: `Sales Rep ${id}` }));
      }
      return [];
    } else {
      // Single select mode
      if (Array.isArray(initialFilters.salesRepIds) && initialFilters.salesRepIds.length > 0) {
        // For single select, take the first ID
        return { value: initialFilters.salesRepIds[0], label: `Sales Rep ${initialFilters.salesRepIds[0]}` };
      }
      return null;
    }
  });
  const [showSalesRepDropdown, setShowSalesRepDropdown] = useState(initialFilters.userType === "salesRep");
  const [selectedEmployees, setSelectedEmployees] = useState(() => {
    if (Array.isArray(initialFilters.employeeIds) && initialFilters.employeeIds.length > 0) {
      return { value: initialFilters.employeeIds[0], label: `Employee ${initialFilters.employeeIds[0]}` };
    }
    return null;
  });
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(initialFilters.userType === "employee");

  // Fetch sales reps list
  const { data: salesRepData } = GetAPI("api/v1/admin/sales-rep");
  const { data: employeeData } = GetAPI(enableEmployeeOption ? "api/v1/admin/employees" : "");

  const salesRepOptions = allowMultiSelect
    ? [
        { value: "all", label: "ALL" },
        ...(salesRepData?.data?.data
          ? salesRepData.data.data.map((rep) => ({
              value: rep.id,
              label: rep.srName || rep.name,
            }))
          : []),
      ]
    : (salesRepData?.data?.data
        ? salesRepData.data.data.map((rep) => ({
            value: rep.id,
            label: rep.srName || rep.name,
          }))
        : []);

  const employeeOptions = employeeData?.data?.data
    ? employeeData.data.data.map((emp) => ({
        value: emp.id,
        label: emp.name || emp.employeeName || `Employee ${emp.id}`,
      }))
    : [];

  // Update selectedSalesReps labels when data loads (for cases where data loads after modal opens)
  useEffect(() => {
    if (visible && salesRepData?.data?.data) {
      if (allowMultiSelect) {
        if (selectedSalesReps.length > 0) {
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
      } else {
        // Single select mode
        if (selectedSalesReps && selectedSalesReps.value) {
          const rep = salesRepData.data.data.find(r => r.id === selectedSalesReps.value);
          if (rep && (rep.srName || rep.name) !== selectedSalesReps.label) {
            setSelectedSalesReps({ value: rep.id, label: rep.srName || rep.name });
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salesRepData, visible, allowMultiSelect]);

  // Sync with initialFilters when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedUserType(initialFilters.userType);
      if (initialFilters.userType === "salesRep") {
        setShowSalesRepDropdown(true);
        setShowEmployeeDropdown(false);
        if (allowMultiSelect) {
          if (initialFilters.salesRepIds === null) {
            // "ALL" is selected (null means all sales reps) - only for multi-select
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
          // Single select mode
          if (Array.isArray(initialFilters.salesRepIds) && initialFilters.salesRepIds.length > 0) {
            const firstId = initialFilters.salesRepIds[0];
            if (salesRepData?.data?.data) {
              const rep = salesRepData.data.data.find(r => r.id === firstId);
              setSelectedSalesReps(rep 
                ? { value: rep.id, label: rep.srName || rep.name }
                : { value: firstId, label: `Sales Rep ${firstId}` });
            } else {
              setSelectedSalesReps({ value: firstId, label: `Loading...` });
            }
          } else {
            setSelectedSalesReps(null);
          }
        }
      } else if (initialFilters.userType === "employee") {
        setShowSalesRepDropdown(false);
        setShowEmployeeDropdown(true);
        if (Array.isArray(initialFilters.employeeIds) && initialFilters.employeeIds.length > 0) {
          const firstId = initialFilters.employeeIds[0];
          if (employeeData?.data?.data) {
            const emp = employeeData.data.data.find((e) => e.id === firstId);
            setSelectedEmployees(
              emp
                ? { value: emp.id, label: emp.name || emp.employeeName || `Employee ${emp.id}` }
                : { value: firstId, label: `Employee ${firstId}` }
            );
          } else {
            setSelectedEmployees({ value: firstId, label: `Employee ${firstId}` });
          }
        } else {
          setSelectedEmployees(null);
        }
      } else {
        setShowSalesRepDropdown(false);
        setShowEmployeeDropdown(false);
        setSelectedSalesReps(allowMultiSelect ? [] : null);
        setSelectedEmployees(null);
      }
    }
  }, [visible, initialFilters, salesRepData, employeeData, allowMultiSelect]);

  useEffect(() => {
    if (selectedUserType === "salesRep") {
      setShowSalesRepDropdown(true);
      setShowEmployeeDropdown(false);
      setSelectedEmployees(null);
    } else if (selectedUserType === "employee") {
      setShowSalesRepDropdown(false);
      setShowEmployeeDropdown(true);
      setSelectedSalesReps(allowMultiSelect ? [] : null);
    } else {
      setShowSalesRepDropdown(false);
      setShowEmployeeDropdown(false);
      setSelectedSalesReps(allowMultiSelect ? [] : null);
      setSelectedEmployees(null);
    }
  }, [selectedUserType, allowMultiSelect]);

  const handleUserTypeChange = (option) => {
    setSelectedUserType(option?.value || null);
    if (option?.value !== "salesRep") {
      setSelectedSalesReps(allowMultiSelect ? [] : null);
    }
    if (option?.value !== "employee") {
      setSelectedEmployees(null);
    }
  };

  const handleSalesRepChange = (selectedOptions) => {
    if (allowMultiSelect) {
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
    } else {
      // Single select mode - selectedOptions is a single object or null
      setSelectedSalesReps(selectedOptions || null);
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
      if (allowMultiSelect) {
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
      } else {
        // Single select mode
        if (!selectedSalesReps || !selectedSalesReps.value) {
          // No selection - don't apply filter (user must select one)
          return;
        } else {
          filters = {
            userType: "salesRep",
            salesRepIds: [selectedSalesReps.value],
          };
        }
      }
    } else if (selectedUserType === "employee") {
      if (!selectedEmployees || !selectedEmployees.value) return;
      filters = {
        userType: "employee",
        salesRepIds: null,
        employeeIds: [selectedEmployees.value],
      };
    }

    onApply(filters);
    onHide();
  };

  const handleReset = () => {
    setSelectedUserType(null);
    setSelectedSalesReps(allowMultiSelect ? [] : null);
    setSelectedEmployees(null);
    setShowSalesRepDropdown(false);
    setShowEmployeeDropdown(false);
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
                ? { value: selectedUserType, label: selectedUserType === "admin" ? "Admin" : selectedUserType === "salesRep" ? "Local Partner" : selectedUserType === "employee" ? "Employee" : "All" }
                : null
            }
            onChange={handleUserTypeChange}
            options={[
              { value: "all", label: "All" },
              { value: "admin", label: "Admin" },
              { value: "salesRep", label: "Local Partner" },
              ...(enableEmployeeOption ? [{ value: "employee", label: "Employee" }] : []),
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
              placeholder={allowMultiSelect ? "Select Local Partner(s)" : "Select Local Partner"}
              value={selectedSalesReps}
              onChange={handleSalesRepChange}
              options={salesRepOptions}
              isMulti={allowMultiSelect}
              isClearable
              menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
            />
            <p className="text-xs text-gray-500 mt-1">
              {allowMultiSelect 
                ? "Select one or more local partners. You can select multiple partners."
                : "Select a local partner."}
            </p>
          </div>
        )}

        {showEmployeeDropdown && (
          <div>
            <label className="block text-sm font-workSans font-semibold text-labelColor mb-2">
              Employee
            </label>
            <Select
              styles={{
                ...drawerSelectStyles,
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              }}
              placeholder="Select Employee"
              value={selectedEmployees}
              onChange={(selectedOption) => setSelectedEmployees(selectedOption || null)}
              options={employeeOptions}
              isClearable
              menuPortalTarget={typeof document !== "undefined" ? document.body : null}
            />
            <p className="text-xs text-gray-500 mt-1">Select an employee.</p>
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
