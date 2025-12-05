"use client";
import React, { useState } from "react";
import LeadCard from "./LeadCard";
import Select from "react-select";
import selectStyles from "@/utilities/SelectStyle";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { leadsAPI } from "@/utilities/LeadsAPI";
import { success_toaster, error_toaster } from "@/utilities/Toaster";
import Loader from "@/components/ui/Loader";
import GetAPI from "@/utilities/GetAPI";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { BASE_URL } from "@/utilities/URL";
import api from "@/utilities/StatusErrorHandler";

const columns = [
  { id: "newEnquiry", title: "New Enquiry" },
  { id: "contacted", title: "Contacted" },
  { id: "quoted", title: "Quoted" },
  { id: "demoScheduled", title: "Demo/Scheduled" },
  { id: "negotiation", title: "Negotiation" },
  { id: "nurture", title: "Nurture" },
  { id: "won", title: "Won" },
  { id: "lost", title: "Lost" },
];

export default function LeadsKanban() {
  const { data, reFetch, isLoading } = GetAPI("api/v1/leads/kanban");
  const { data: countriesData } = GetAPI(
    "api/v1/admin/address-management/country"
  );
  const { data: machinesData } = GetAPI("api/v1/admin/coffee-machine");

  const kanbanData = data?.data || {
    newEnquiry: [],
    contacted: [],
    quoted: [],
    demoScheduled: [],
    negotiation: [],
    nurture: [],
    won: [],
    lost: [],
  };

  const [filter, setFilter] = useState({ value: "all", label: "All Leads" });
  const [addModal, setAddModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState(null);
  const [newLead, setNewLead] = useState({
    name: "",
    companyName: "",
    role: "",
    addressLineOne: "",
    addressLineTwo: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    email: "",
    contactPhone: "",
    businessType: "",
    numberOfLocations: "",
    leadSource: "",
    preferredContact: "",
    snapshotType: "",
    snapshotUseCase: "",
    snapshotVolume: "",
    snapshotTimeline: "",
    estimatedValue: "",
    notes: "",
    machineId: "",
    machineName: "",
  });
  console.log("🚀 ~ LeadsKanban ~ newLead:", newLead);
  const [submitting, setSubmitting] = useState(false);
  const [allCountriesData, setAllCountriesData] = useState([]);
  const [allStates, setAllStates] = useState([]);
  const [allCities, setAllCities] = useState([]);

  // Set countries data when it loads
  React.useEffect(() => {
    if (countriesData?.data?.data) {
      const countries = countriesData?.data?.data.map((country) => ({
        value: country?.isoCode,
        label: country?.name,
      }));
      setAllCountriesData(countries);
    }
  }, [countriesData]);

  // Prepare machines data for dropdown
  const machineOptions = React.useMemo(() => {
    if (!machinesData?.data?.data) return [];
    return machinesData.data.data.map((machine) => ({
      value: machine.id,
      label: machine.name,
      price: machine.price,
    }));
  }, [machinesData]);

  // Handle machine selection
  const handleMachineChange = (selectedOption) => {
    console.log("🚀 ~ handleMachineChange ~ selectedOption:", selectedOption);
    setNewLead({
      ...newLead,
      machineId: selectedOption?.value || "",
      machineName: selectedOption?.label || "",
      estimatedValue: selectedOption?.price || "",
    });
  };

  // Handle country selection and load states
  const handleCountryChange = async (selectedOption) => {
    const countryName = selectedOption?.label || "";
    setNewLead({ ...newLead, country: countryName, state: "", city: "" });
    setAllStates([]);
    setAllCities([]);

    if (countryName) {
      const selectedCountry = countriesData?.data?.data.find(
        (country) => country?.name === countryName
      );

      if (selectedCountry) {
        try {
          const res = await api.get(
            `${BASE_URL}api/v1/admin/address-management/state?countryInSystemId=${selectedCountry?.id}`
          );
          if (res?.data?.status === "success") {
            const states = res?.data?.data?.data.map((state) => ({
              value: state?.id,
              label: state?.name,
            }));
            setAllStates(states);
          }
        } catch (error) {
          console.error(error);
        }
      }
    }
  };

  // Handle state selection and load cities
  const handleStateChange = async (selectedOption) => {
    const stateName = selectedOption?.label || "";
    const stateId = selectedOption?.value || "";
    setNewLead({ ...newLead, state: stateName, city: "" });
    setAllCities([]);

    if (stateId) {
      try {
        const res = await api.get(
          `${BASE_URL}api/v1/admin/address-management/city?stateInSystemId=${stateId}`
        );
        if (res?.data?.status === "success") {
          const cities = res?.data?.data?.data.map((city) => ({
            value: city?.name,
            label: city?.name,
          }));
          setAllCities(cities);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  // Handle lead deletion in kanban view
  const handleDeleteLead = (leadId) => {
    // Refresh the data to reflect the deletion
    reFetch();
  };

  // Handle lead edit in kanban view
  const handleEditLead = (lead) => {
    // Populate the form with lead data
    setNewLead({
      name: lead.contactName || "",
      companyName: lead.company || "",
      role: lead.role || "",
      addressLineOne: lead.addressLineOne || "",
      addressLineTwo: lead.addressLineTwo || "",
      city: lead.city || "",
      state: lead.state || "",
      country: lead.country || "",
      zipCode: lead.zipCode || "",
      email: lead.contactEmail || "",
      contactPhone: lead.contactPhone || "",
      businessType: lead.businessType || "",
      numberOfLocations: "",
      leadSource: lead.leadSource || "",
      preferredContact: lead.preferredContact || "",
      snapshotType: lead.snapshotType || "",
      snapshotUseCase: lead.snapshotUseCase || "",
      snapshotVolume: lead.snapshotVolume || "",
      snapshotTimeline: lead.snapshotTimeline || "",
      estimatedValue: lead.estimatedValue || "",
      notes: lead.notes || "",
      machineId: lead.machineId || "",
      machineName: lead.machineName || "",
    });

    // Set edit mode and lead ID
    setIsEditMode(true);
    setEditingLeadId(lead.id);
    setAddModal(true);
  };

  // Modify handleAddLead to also handle updates
  const handleSaveLead = async () => {
    // REQUIRED FIELDS VALIDATION
    const requiredFields = [
      { key: "name", label: "Name" },
      { key: "companyName", label: "Company Name" },
      { key: "role", label: "Role" },
      { key: "addressLineOne", label: "Address Line 1" },
      { key: "email", label: "Business Email" },
      { key: "contactPhone", label: "Phone Number" },
      { key: "country", label: "Country" },
      { key: "state", label: "State" },
      { key: "snapshotType", label: "Order Type" },
      { key: "city", label: "City" },
      { key: "preferredContact", label: "Preferred Contact Method" },
    ];

    for (let field of requiredFields) {
      if (!newLead[field.key] || String(newLead[field.key]).trim() === "") {
        error_toaster(`${field.label} is required`);
        return;
      }
    }

    // EMAIL FORMAT VALIDATION
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(newLead.email)) {
      error_toaster("Please enter a valid email address");
      return;
    }

    // PHONE LENGTH VALIDATION
    if (String(newLead.contactPhone).length < 7) {
      error_toaster("Please enter a valid phone number");
      return;
    }

    try {
      setSubmitting(true);

      // Prepare data for API
      const leadData = {
        contactName: newLead.name,
        company: newLead.companyName,
        role: newLead.role,
        contactEmail: newLead.email,
        contactPhone: newLead.contactPhone?.includes("+")
          ? newLead.contactPhone
          : "+" + newLead.contactPhone,
        addressLineOne: newLead.addressLineOne,
        addressLineTwo: newLead.addressLineTwo,
        city: newLead.city,
        state: newLead.state,
        country: newLead.country,
        zipCode: newLead.zipCode,
        businessType: newLead.businessType,
        leadSource: newLead.leadSource || "Admin Panel",
        preferredContact: newLead.preferredContact,
        snapshotType: newLead.snapshotType,
        snapshotUseCase: newLead.snapshotUseCase,
        snapshotVolume: newLead.snapshotVolume,
        snapshotTimeline: newLead.snapshotTimeline,
        estimatedValue: newLead.estimatedValue,
        notes: newLead.notes,
        machineId: newLead.machineId,
        machineName: newLead.machineName,
      };

      let response;

      if (isEditMode) {
        // Update existing lead
        response = await leadsAPI.updateLead(editingLeadId, leadData);
      } else {
        // Create new lead
        leadData.status = "New Enquiry";
        response = await leadsAPI.createLead(leadData);
      }

      if (response?.data?.status === "success" || response?.data?.success) {
        success_toaster(
          isEditMode ? "Lead updated successfully" : "Lead created successfully"
        );
        setAddModal(false);
        resetForm();
        // Refresh data
        reFetch();
      } else {
        error_toaster(
          response?.data?.message ||
            (isEditMode ? "Failed to update lead" : "Failed to create lead")
        );
      }
    } catch (error) {
      console.error("Error saving lead:", error);
      error_toaster(
        isEditMode ? "Failed to update lead" : "Failed to create lead"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setNewLead({
      name: "",
      companyName: "",
      role: "",
      addressLineOne: "",
      addressLineTwo: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
      email: "",
      contactPhone: "",
      businessType: "",
      numberOfLocations: "",
      leadSource: "",
      preferredContact: "",
      snapshotType: "",
      snapshotUseCase: "",
      snapshotVolume: "",
      snapshotTimeline: "",
      estimatedValue: "",
      notes: "",
      machineId: "",
      machineName: "",
    });
    setAllStates([]);
    setAllCities([]);
    setIsEditMode(false);
    setEditingLeadId(null);
  };

  const filteredColumns = columns.filter((col) => {
    if (filter.value === "all") return true;
    return col.id === filter.value;
  });

  const displayColumns = filteredColumns;

  const filterOptions = [
    { value: "all", label: "All Leads" },
    ...columns.map((col) => ({ value: col.id, label: col.title })),
  ];

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="w-full font-inter bg-white min-h-screen">
      {/* Fixed Header */}
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed top-0 right-0">
        <h2 className="text-xl font-semibold text-themeDark">
          Lead Management
        </h2>
      </div>

      {/* Content Container */}
      <div className="space-y-8 pb-10 pt-28 2xl:pt-32 px-6 2xl:px-12 h-full flex flex-col">
        {/* Filters and Actions */}
        <div className="flex items-center gap-4 justify-end">
          <Select
            placeholder="Filters"
            styles={selectStyles}
            className="w-48"
            value={filter}
            onChange={setFilter}
            options={filterOptions}
          />
          <button
            onClick={() => setAddModal(true)}
            className="bg-theme text-white px-4 py-2 rounded-lg border border-theme hover:bg-white hover:text-theme transition-colors duration-200 font-medium"
          >
            Add New Lead
          </button>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
          <div className="flex space-x-4 h-full min-w-max">
            {displayColumns.map((col, index) => (
              <div key={col.id} className="w-80 flex flex-col h-full">
                {/* Column Header - Breadcrumb Style */}
                <div
                  className="bg-theme text-white h-12 flex items-center justify-center relative mb-2"
                  style={{
                    clipPath:
                      index === 0
                        ? "polygon(0 0, calc(100% - 15px) 0, 100% 50%, calc(100% - 15px) 100%, 0 100%)"
                        : "polygon(0 0, calc(100% - 15px) 0, 100% 50%, calc(100% - 15px) 100%, 0 100%, 15px 50%)",
                  }}
                >
                  <h2 className="text-themeDark font-medium text-sm flex items-center gap-1">
                    <p className="text-white">{col.title}</p>
                    <span className="text-blue-300">
                      ({kanbanData[col.id]?.length || 0})
                    </span>
                  </h2>
                </div>

                {/* Column Content */}
                <div className="bg-white p-2 flex-1 overflow-y-auto border border-borderColor rounded-b-xl scrollbar-thin scrollbar-thumb-gray-300">
                  {kanbanData[col.id]?.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onStatusChange={reFetch}
                      onDelete={handleDeleteLead}
                      onEdit={handleEditLead}
                    />
                  ))}
                  {kanbanData[col.id]?.length === 0 && (
                    <div className="text-center text-gray-400 text-sm mt-4">
                      No leads
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Lead Modal */}
      <Dialog
        header={isEditMode ? "Edit Lead" : "Add New Lead"}
        visible={addModal}
        style={{ width: "800px" }}
        onHide={() => {
          setAddModal(false);
          resetForm();
        }}
        className="font-inter overflow-auto"
        dismissableMask={true}
        closable={true}
        // baseZIndex={10000}
      >
        <div className="flex flex-col gap-4 pt-2 max-h-[70vh]">
          {/* Contact Information Section */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              Contact Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-y-2">
                <label className="font-medium text-sm">Name *</label>
                <InputText
                  value={newLead.name}
                  onChange={(e) =>
                    setNewLead({ ...newLead, name: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg"
                  placeholder="John Doe"
                  disabled={submitting}
                />
              </div>

              <div className="flex flex-col gap-y-2">
                <label className="font-medium text-sm">Company Name *</label>
                <InputText
                  value={newLead.companyName}
                  onChange={(e) =>
                    setNewLead({ ...newLead, companyName: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg"
                  placeholder="Brew Corner Café"
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex flex-col gap-y-2">
                <label className="font-medium text-sm">Role *</label>
                <Select
                  placeholder="Select Role"
                  value={
                    newLead.role
                      ? { value: newLead.role, label: newLead.role }
                      : null
                  }
                  options={[
                    { value: "Owner", label: "Owner" },
                    { value: "Manager", label: "Manager" },
                    { value: "Director", label: "Director" },
                    { value: "Procurement", label: "Procurement" },
                    { value: "Other", label: "Other" },
                  ]}
                  onChange={(e) => setNewLead({ ...newLead, role: e.value })}
                  styles={selectStyles}
                  isDisabled={submitting}
                />
              </div>

              <div className="flex flex-col gap-y-2">
                <label className="font-medium text-sm">Business Type</label>
                <Select
                  placeholder="Select Business Type"
                  value={
                    newLead.businessType
                      ? {
                          value: newLead.businessType,
                          label: newLead.businessType,
                        }
                      : null
                  }
                  options={[
                    { value: "Café", label: "Café" },
                    { value: "Restaurant", label: "Restaurant" },
                    { value: "Office", label: "Office" },
                    { value: "Hotel", label: "Hotel" },
                    { value: "Retail", label: "Retail" },
                    { value: "Other", label: "Other" },
                  ]}
                  onChange={(e) =>
                    setNewLead({ ...newLead, businessType: e.value })
                  }
                  styles={selectStyles}
                  isDisabled={submitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex flex-col gap-y-2">
                <label className="font-medium text-sm">Business Email *</label>
                <InputText
                  type="email"
                  value={newLead.email}
                  onChange={(e) =>
                    setNewLead({ ...newLead, email: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg"
                  placeholder="example@company.com"
                  disabled={submitting}
                />
              </div>

              <div className="flex flex-col gap-y-2">
                <label className="font-medium text-sm">Phone Number *</label>
                <PhoneInput
                  country={"us"}
                  value={newLead.contactPhone}
                  onChange={(value, country, e, formattedValue) => {
                    setNewLead({
                      ...newLead,
                      contactPhone: value,
                      // countryCode: country.dialCode,
                    });
                  }}
                  inputClass="!w-full !rounded-lg"
                  disabled={submitting}
                  inputProps={{
                    name: "phoneNumber",
                    required: true,
                    autoFocus: true,
                  }}
                  inputStyle={{
                    width: "90px",
                    height: "42px",
                    borderRadius: "4px",
                    border: "1px solid #00000033",
                    backgroundColor: "#ffffff",
                    color: "#6f4e37",
                    opacity: "20",
                  }}
                  containerStyle={{
                    borderRadius: "12px",
                  }}
                  dropdownStyle={{
                    backgroundColor: "#86644C",
                    borderRadius: "8px",
                  }}
                  disableCountryCode={false}
                  disableCountryGuess={false}
                />
              </div>
            </div>

            {/* Machine Selection */}
            <div className="mt-4">
              <label className="font-medium text-sm">Machine *</label>
              <Select
                placeholder="Select Machine"
                value={
                  newLead.machineId
                    ? { value: newLead.machineId, label: newLead.machineName }
                    : null
                }
                options={machineOptions}
                onChange={handleMachineChange}
                styles={selectStyles}
                isDisabled={submitting}
                isClearable={true}
              />
            </div>
          </div>

          {/* Address Information Section */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              Address Information
            </h3>

            <div className="flex flex-col gap-y-2 mb-4">
              <label className="font-medium text-sm">Address Line 1 *</label>
              <InputText
                value={newLead.addressLineOne}
                onChange={(e) =>
                  setNewLead({ ...newLead, addressLineOne: e.target.value })
                }
                className="w-full p-2 border rounded-lg"
                placeholder="Street address"
                disabled={submitting}
              />
            </div>

            <div className="flex flex-col gap-y-2 mb-4">
              <label className="font-medium text-sm">Address Line 2</label>
              <InputText
                value={newLead.addressLineTwo}
                onChange={(e) =>
                  setNewLead({ ...newLead, addressLineTwo: e.target.value })
                }
                className="w-full p-2 border rounded-lg"
                placeholder="Apartment, suite, etc."
                disabled={submitting}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-y-2">
                <label className="font-medium text-sm">Country *</label>
                <Select
                  placeholder="Select Country"
                  value={
                    newLead.country
                      ? { value: newLead.country, label: newLead.country }
                      : null
                  }
                  options={allCountriesData}
                  onChange={handleCountryChange}
                  styles={selectStyles}
                  isDisabled={submitting}
                />
              </div>

              <div className="flex flex-col gap-y-2">
                <label className="font-medium text-sm">State *</label>
                <Select
                  placeholder="Select State"
                  value={
                    newLead.state
                      ? { value: newLead.state, label: newLead.state }
                      : null
                  }
                  options={allStates}
                  onChange={handleStateChange}
                  styles={selectStyles}
                  isDisabled={submitting || allStates.length === 0}
                />
              </div>

              <div className="flex flex-col gap-y-2">
                <label className="font-medium text-sm">City *</label>
                <Select
                  placeholder="Select City"
                  value={
                    newLead.city
                      ? { value: newLead.city, label: newLead.city }
                      : null
                  }
                  options={allCities}
                  onChange={(e) => setNewLead({ ...newLead, city: e.value })}
                  styles={selectStyles}
                  isDisabled={submitting || allCities.length === 0}
                />
              </div>
            </div>

            <div className="flex flex-col gap-y-2 mt-4">
              <label className="font-medium text-sm">ZIP/Postal Code</label>
              <InputText
                value={newLead.zipCode}
                onChange={(e) =>
                  setNewLead({ ...newLead, zipCode: e.target.value })
                }
                className="w-full p-2 border rounded-lg"
                placeholder="12345"
                disabled={submitting}
              />
            </div>
          </div>

          {/* Requirement Snapshot Section */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              Requirement Snapshot
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-y-2">
                <label className="font-medium text-sm">Order Type *</label>
                <Select
                  placeholder="Select Order Type"
                  value={
                    newLead.snapshotType
                      ? {
                          value: newLead.snapshotType,
                          label: newLead.snapshotType,
                        }
                      : null
                  }
                  options={[
                    { value: "Machine + Beans", label: "Machine + Beans" },
                    { value: "Beans Only", label: "Beans Only" },
                    { value: "Machine Only", label: "Machine Only" },
                  ]}
                  onChange={(e) =>
                    setNewLead({ ...newLead, snapshotType: e.value })
                  }
                  styles={selectStyles}
                  isDisabled={submitting}
                />
              </div>

              <div className="flex flex-col gap-y-2">
                <label className="font-medium text-sm">Use Case</label>
                <Select
                  placeholder="Select Use Case"
                  value={
                    newLead.snapshotUseCase
                      ? {
                          value: newLead.snapshotUseCase,
                          label: newLead.snapshotUseCase,
                        }
                      : null
                  }
                  options={[
                    { value: "Small Café", label: "Small Café" },
                    { value: "Medium Café", label: "Medium Café" },
                    { value: "Large Café", label: "Large Café" },
                    { value: "Office", label: "Office" },
                    { value: "Restaurant", label: "Restaurant" },
                  ]}
                  onChange={(e) =>
                    setNewLead({ ...newLead, snapshotUseCase: e.value })
                  }
                  styles={selectStyles}
                  isDisabled={submitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex flex-col gap-y-2">
                <label className="font-medium text-sm">Estimated Volume</label>
                <Select
                  placeholder="Select Volume"
                  value={
                    newLead.snapshotVolume
                      ? {
                          value: newLead.snapshotVolume,
                          label: newLead.snapshotVolume,
                        }
                      : null
                  }
                  options={[
                    { value: "50-80 cups/day", label: "50-80 cups/day" },
                    { value: "80-100 cups/day", label: "80-100 cups/day" },
                    { value: "100-200 cups/day", label: "100-200 cups/day" },
                    { value: "200+ cups/day", label: "200+ cups/day" },
                  ]}
                  onChange={(e) =>
                    setNewLead({ ...newLead, snapshotVolume: e.value })
                  }
                  styles={selectStyles}
                  isDisabled={submitting}
                />
              </div>

              <div className="flex flex-col gap-y-2">
                <label className="font-medium text-sm">Timeline</label>
                <Select
                  placeholder="Select Timeline"
                  value={
                    newLead.snapshotTimeline
                      ? {
                          value: newLead.snapshotTimeline,
                          label: newLead.snapshotTimeline,
                        }
                      : null
                  }
                  options={[
                    { value: "Immediate", label: "Immediate" },
                    { value: "1-2 Weeks", label: "1-2 Weeks" },
                    { value: "2-4 Weeks", label: "2-4 Weeks" },
                    { value: "1-2 Months", label: "1-2 Months" },
                    { value: "Flexible", label: "Flexible" },
                  ]}
                  onChange={(e) =>
                    setNewLead({ ...newLead, snapshotTimeline: e.value })
                  }
                  styles={selectStyles}
                  isDisabled={submitting}
                />
              </div>
            </div>

            <div className="flex flex-col gap-y-2 mt-4">
              <label className="font-medium text-sm">Estimated Value ($)</label>
              <InputText
                type="number"
                value={newLead.estimatedValue}
                onChange={(e) =>
                  setNewLead({ ...newLead, estimatedValue: e.target.value })
                }
                className="w-full p-2 border rounded-lg"
                placeholder="e.g. 5000"
                disabled={submitting}
              />
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              Additional Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-y-2">
                <label className="font-medium text-sm">Lead Source</label>
                <Select
                  placeholder="Select Lead Source"
                  value={
                    newLead.leadSource
                      ? { value: newLead.leadSource, label: newLead.leadSource }
                      : null
                  }
                  options={[
                    { value: "Website", label: "Website" },
                    { value: "Referral", label: "Referral" },
                    { value: "Trade Show", label: "Trade Show" },
                    { value: "Social Media", label: "Social Media" },
                    { value: "Direct Call", label: "Direct Call" },
                    { value: "Email Campaign", label: "Email Campaign" },
                  ]}
                  onChange={(e) =>
                    setNewLead({ ...newLead, leadSource: e.value })
                  }
                  styles={selectStyles}
                  isDisabled={submitting}
                />
              </div>

              <div className="flex flex-col gap-y-2">
                <label className="font-medium text-sm">
                  Preferred Contact Method *
                </label>
                <Select
                  placeholder="Select Contact Method"
                  value={
                    newLead.preferredContact
                      ? {
                          value: newLead.preferredContact,
                          label: newLead.preferredContact,
                        }
                      : null
                  }
                  options={[
                    { value: "Email", label: "Email" },
                    { value: "Phone", label: "Phone" },
                    { value: "WhatsApp", label: "WhatsApp" },
                  ]}
                  onChange={(e) =>
                    setNewLead({ ...newLead, preferredContact: e.value })
                  }
                  styles={selectStyles}
                  isDisabled={submitting}
                />
              </div>
            </div>

            <div className="flex flex-col gap-y-2 mt-4">
              <label className="font-medium text-sm">Additional Notes</label>
              <textarea
                value={newLead.notes}
                onChange={(e) =>
                  setNewLead({ ...newLead, notes: e.target.value })
                }
                className="w-full p-2 border rounded-lg resize-none"
                rows={3}
                placeholder="Any additional information about this lead..."
                disabled={submitting}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-2 pb-6">
            <button
              onClick={() => {
                setAddModal(false);
                resetForm();
              }}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveLead}
              className="px-4 py-2 bg-theme text-white rounded-lg hover:bg-themeDark disabled:opacity-50"
              disabled={submitting}
            >
              {submitting
                ? isEditMode
                  ? "Updating..."
                  : "Adding..."
                : isEditMode
                ? "Update Lead"
                : "Add Lead"}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
