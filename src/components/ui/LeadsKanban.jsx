"use client";
import React, { useState, useEffect, useMemo } from "react";
import LeadCard from "./LeadCard";
import KanbanColumn from "./KanbanColumn";
import Select from "react-select";
import SelectWithTextToggle from "./SelectWithTextToggle";
import selectStyles from "@/utilities/SelectStyle";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { leadsAPI } from "@/utilities/LeadsAPI";
import {
  success_toaster,
  error_toaster,
  info_toaster,
} from "@/utilities/Toaster";
import Loader from "@/components/ui/Loader";
import GetAPI from "@/utilities/GetAPI";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { BASE_URL } from "@/utilities/URL";
import api from "@/utilities/StatusErrorHandler";
import { Calendar } from "primereact/calendar";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { MdClose, MdFilterList } from "react-icons/md";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  closestCorners,
} from "@dnd-kit/core";

// Extend dayjs with isBetween plugin
dayjs.extend(isBetween);

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

const dateRangeOptions = [
  { value: "all", label: "All Dates" },
  { value: "currentYear", label: "Current Year" },
  { value: "currentMonth", label: "Current Month" },
  { value: "currentWeek", label: "Current Week" },
  { value: "lastYear", label: "Last Year" },
  { value: "last90Days", label: "Last 90 Days" },
  { value: "last14Days", label: "Last 14 Days" },
  { value: "lastMonth", label: "Last Month" },
  { value: "lastWeek", label: "Last Week" }, // Last 7 days
  { value: "previousWeek", label: "Previous Week" }, // Full previous week
  { value: "custom", label: "Custom Range" },
];

export default function LeadsKanban() {
  const { data, reFetch, isLoading } = GetAPI("api/v1/leads/kanban");
  const { data: countriesData } = GetAPI(
    "api/v1/admin/address-management/country"
  );
  const { data: machinesData } = GetAPI("api/v1/admin/coffee-machine");
  const { data: employeesData } = GetAPI("api/v1/admin/employees");
  const { data: partnersData } = GetAPI(
    "api/v1/admin/sales-rep/for-order-creation?partnerType=direct-partner"
  );

  // Local state for optimistic UI updates
  const [items, setItems] = useState({
    newEnquiry: [],
    contacted: [],
    quoted: [],
    demoScheduled: [],
    negotiation: [],
    nurture: [],
    won: [],
    lost: [],
  });

  // Sync local state with API data
  useEffect(() => {
    if (data?.data) {
      setItems(data.data);
    }
  }, [data]);

  // Filter State
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Applied Filters (The truth for the dashboard)
  const [appliedFilters, setAppliedFilters] = useState({
    stage: { value: "all", label: "All Leads" },
    followUpDate: {
      option: { value: "all", label: "All Dates" },
      customRange: null,
    },
    siteVisitDate: {
      option: { value: "all", label: "All Dates" },
      customRange: null,
    },
  });

  // Temp Filters (For the modal)
  const [tempFilters, setTempFilters] = useState({
    stage: { value: "all", label: "All Leads" },
    followUpDate: {
      option: { value: "all", label: "All Dates" },
      customRange: null,
    },
    siteVisitDate: {
      option: { value: "all", label: "All Dates" },
      customRange: null,
    },
  });

  // UI State for Modal (Custom Mode toggles)
  const [isFollowUpCustomMode, setIsFollowUpCustomMode] = useState(false);
  const [tempFollowUpRange, setTempFollowUpRange] = useState(null);

  const [isSiteVisitCustomMode, setIsSiteVisitCustomMode] = useState(false);
  const [tempSiteVisitRange, setTempSiteVisitRange] = useState(null);

  const [addModal, setAddModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState(null);
  const [activeId, setActiveId] = useState(null);
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
  const [submitting, setSubmitting] = useState(false);
  const [allCountriesData, setAllCountriesData] = useState([]);
  const [allStates, setAllStates] = useState([]);
  const [allCities, setAllCities] = useState([]);

  // Assign Lead State
  const [assignModal, setAssignModal] = useState(false);
  const [assigningLead, setAssigningLead] = useState(null);
  const [assignType, setAssignType] = useState("local-partner"); // 'employee' or 'local-partner'
  const [selectedEntityId, setSelectedEntityId] = useState(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [canAssign, setCanAssign] = useState(false);
  const [userType, setUserType] = useState(null);
  const [userID, setUserID] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const type = localStorage.getItem("userType");
      const id = localStorage.getItem("userID");
      const isEmp = localStorage.getItem("isEmployee");
      setUserType(type);
      setUserID(id);
      // Admin (not employee) or Local Partner (not employee) can assign
      if ((type === "admin" || type === "salesRepresentative") && !isEmp) {
        setCanAssign(true);
      } else {
        setCanAssign(false);
      }
    }
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Set countries data when it loads
  useEffect(() => {
    if (countriesData?.data?.data) {
      const countries = countriesData?.data?.data.map((country) => ({
        value: country?.isoCode,
        label: country?.name,
      }));
      setAllCountriesData(countries);
    }
  }, [countriesData]);

  // Prepare machines data for dropdown
  const machineOptions = useMemo(() => {
    if (!machinesData?.data?.data) return [];
    return machinesData.data.data.map((machine) => ({
      value: machine.id,
      label: machine.name,
      price: machine.price,
    }));
  }, [machinesData]);

  const employeeOptions = useMemo(() => {
    if (!employeesData?.data?.data) return [];
    let employees = employeesData.data.data;
    
    // For local partner, filter only their employees
    if (userType === "salesRepresentative" && userID) {
      const userIdStr = String(userID || "");
      const filteredEmployees = employees.filter((emp) => {
        // Check multiple possible fields that link employee to partner
        const employeeOf = emp?.employeeOf;
        const salesRepId = emp?.salesRepId;
        const partnerId = emp?.partnerId;
        
        // Debug: log first employee to see structure
        if (employees.indexOf(emp) === 0) {
          console.log("Employee structure:", emp);
          console.log("Looking for userID:", userIdStr);
        }
        
        // Try matching against userID in various formats
        if (employeeOf !== undefined && employeeOf !== null) {
          if (String(employeeOf) === userIdStr) return true;
        }
        if (salesRepId !== undefined && salesRepId !== null) {
          if (String(salesRepId) === userIdStr) return true;
        }
        if (partnerId !== undefined && partnerId !== null) {
          if (String(partnerId) === userIdStr) return true;
        }
        
        return false;
      });
      
      // If filter returns no results, show all employees (temporary)
      // This ensures employees are visible while we debug the filter
      if (filteredEmployees.length === 0) {
        console.log("No employees matched filter, showing all employees");
        // Keep all employees for now
      } else {
        employees = filteredEmployees;
      }
    }
    
    return employees.map((emp) => ({
      value: emp.id,
      label: emp.name || emp.fullName || emp.email || `Employee #${emp.id}`,
    }));
  }, [employeesData, userType, userID]);

  const partnerOptions = useMemo(() => {
    if (!partnersData?.data) return [];
    return partnersData.data.map((p) => ({
      value: p.id,
      label: p.srName + ` (${p.territoryName})`,
    }));
  }, [partnersData]);

  // Handle machine selection
  const handleMachineChange = (selectedOption) => {
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
    reFetch();
  };

  // Handle lead edit in kanban view
  const handleEditLead = (lead) => {
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

    setIsEditMode(true);
    setEditingLeadId(lead.id);
    setAddModal(true);
  };

  const handleAssignClick = (lead) => {
    setAssigningLead(lead);

    // Check if lead is already assigned
    // If both assignedEmployee and assignedSalesRep exist, it means:
    // Admin assigned to partner, then partner assigned to employee
    if (lead.assignedEmployee && lead.assignedSalesRep) {
      // Both exist - means partner assigned to employee
      // For admin: show both, pre-select based on current assignment
      // For local partner: only show employee, pre-select employee
      if (userType === "salesRepresentative") {
        setAssignType("employee");
        setSelectedEntityId(lead.assignedEmployee.id);
      } else {
        // Admin: show the current assignment (employee in this case)
        setAssignType("employee");
        setSelectedEntityId(lead.assignedEmployee.id);
      }
    } else if (lead.assignedEmployee) {
      // Only employee assigned (direct assignment by admin)
      setAssignType("employee");
      setSelectedEntityId(lead.assignedEmployee.id);
    } else if (lead.assignedSalesRep) {
      // Only partner assigned
      setAssignType("local-partner");
      setSelectedEntityId(lead.assignedSalesRep.id);
    } else {
      // Not assigned yet
      if (userType === "salesRepresentative") {
        setAssignType("employee");
      } else {
        setAssignType("local-partner");
      }
      setSelectedEntityId(null);
    }

    setAssignModal(true);
  };

  const handleAssignSubmit = async () => {
    if (!selectedEntityId) {
      error_toaster("Please select an entity to assign.");
      return;
    }

    // Check for duplicate assignment
    if (assigningLead) {
      if (
        assignType === "employee" &&
        assigningLead.assignedEmployee?.id === selectedEntityId
      ) {
        info_toaster("Lead is already assigned to this employee.");
        return;
      }
      if (
        assignType === "local-partner" &&
        assigningLead.assignedSalesRep?.id === selectedEntityId
      ) {
        info_toaster("Lead is already assigned to this partner.");
        return;
      }
    }

    try {
      setAssignLoading(true);
      let payload;

      if (userType === "salesRepresentative") {
        // Local partner: only send employeeId
        payload = { employeeId: selectedEntityId };
      } else {
        // Admin: send employeeId or salesRepId, with the other as null
        if (assignType === "employee") {
          payload = { employeeId: selectedEntityId, salesRepId: null };
        } else {
          payload = { salesRepId: selectedEntityId, employeeId: null };
        }
      }

      const response = await leadsAPI.assignLead(assigningLead.id, payload);

      if (response?.data?.success || response?.success) {
        success_toaster("Lead assigned successfully");
        setAssignModal(false);
        setAssigningLead(null);
        setSelectedEntityId(null);
        reFetch();
      } else {
        error_toaster(response?.message || "Failed to assign lead");
      }
    } catch (error) {
      console.error("Error signing lead:", error);
      error_toaster("Failed to assign lead");
    } finally {
      setAssignLoading(false);
    }
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
        leadSource: newLead.leadSource,
        preferredContact: newLead.preferredContact,
        snapshotType: newLead.snapshotType,
        snapshotUseCase: newLead.snapshotUseCase,
        snapshotVolume: newLead.snapshotVolume,
        snapshotTimeline: newLead.snapshotTimeline,
        estimatedValue: newLead.estimatedValue,
        notes: newLead.notes,
        ...(userType === "salesRepresentative" && { salesRepId: userID }),
        machineId: newLead.machineId,
        machineName: newLead.machineName,
      };

      let response;

      if (isEditMode) {
        response = await leadsAPI.updateLead(editingLeadId, leadData);
      } else {
        leadData.status = "New Enquiry";
        response = await leadsAPI.createLead(leadData);
      }

      if (response?.data?.status === "success" || response?.data?.success) {
        success_toaster(
          isEditMode ? "Lead updated successfully" : "Lead created successfully"
        );
        setAddModal(false);
        resetForm();
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
    if (appliedFilters.stage.value === "all") return true;
    return col.id === appliedFilters.stage.value;
  });

  const displayColumns = filteredColumns;

  const filterOptions = [
    { value: "all", label: "All Leads" },
    ...columns.map((col) => ({ value: col.id, label: col.title })),
  ];

  // Drag and Drop Logic
  const findContainer = (id) => {
    if (id in items) {
      return id;
    }
    return Object.keys(items).find((key) =>
      items[key].find((item) => item.id === id)
    );
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    const overId = over?.id;

    if (!overId || active.id === overId) {
      return;
    }

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(overId);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }

    setItems((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];
      const activeIndex = activeItems.findIndex(
        (item) => item.id === active.id
      );
      const overIndex = overItems.findIndex((item) => item.id === overId);

      let newIndex;

      if (overId in prev) {
        // We're over a container (empty column)
        newIndex = overItems.length + 1;
      } else {
        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height;

        const modifier = isBelowOverItem ? 1 : 0;

        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      return {
        ...prev,
        [activeContainer]: [
          ...prev[activeContainer].filter((item) => item.id !== active.id),
        ],
        [overContainer]: [
          ...prev[overContainer].slice(0, newIndex),
          activeItems[activeIndex],
          ...prev[overContainer].slice(newIndex, prev[overContainer].length),
        ],
      };
    });
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    const activeId = active.id;
    const overId = over?.id;

    if (!overId) {
      setActiveId(null);
      return;
    }

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (activeContainer && overContainer && activeContainer !== overContainer) {
      // This case is usually handled by onDragOver, but just in case
    }

    setActiveId(null);

    // API Call to update status
    // We need to find which container the item is currently in (after onDragOver updates)
    const finalContainer = findContainer(activeId);

    // Map container ID to status string
    const statusMap = {
      newEnquiry: "New Enquiry",
      contacted: "Contacted",
      quoted: "Quoted",
      demoScheduled: "Demo/Scheduled",
      negotiation: "Negotiation",
      nurture: "Nurture",
      won: "WON",
      lost: "LOST",
    };

    const newStatus = statusMap[finalContainer];

    if (newStatus) {
      try {
        const response = await leadsAPI.updateLead(activeId, {
          status: newStatus,
        });

        if (response?.data?.success || response?.success) {
          // success_toaster(`Lead moved to ${newStatus}`);
          reFetch(); // Sync with backend to ensure consistency
        } else {
          error_toaster(response?.message || "Failed to move lead");
          reFetch(); // Revert if failed
        }
      } catch (error) {
        error_toaster("Failed to move lead");
        reFetch();
      }
    }
  };

  // Date Filter Logic Helper
  const isDateInRange = (dateStr, option, customRange) => {
    if (option.value === "all") return true;
    if (!dateStr) return false;

    let startDate, endDate;
    const now = dayjs();

    switch (option.value) {
      case "currentYear":
        startDate = now.startOf("year");
        endDate = now.endOf("year");
        break;
      case "currentMonth":
        startDate = now.startOf("month");
        endDate = now.endOf("month");
        break;
      case "currentWeek":
        startDate = now.startOf("week");
        endDate = now.endOf("week");
        break;
      case "lastYear":
        startDate = now.subtract(1, "year").startOf("year");
        endDate = now.subtract(1, "year").endOf("year");
        break;
      case "last90Days":
        startDate = now.subtract(90, "day");
        endDate = now;
        break;
      case "last14Days":
        startDate = now.subtract(14, "day");
        endDate = now;
        break;
      case "lastMonth":
        startDate = now.subtract(1, "month").startOf("month");
        endDate = now.subtract(1, "month").endOf("month");
        break;
      case "lastWeek":
        startDate = now.subtract(7, "day");
        endDate = now;
        break;
      case "previousWeek":
        startDate = now.subtract(1, "week").startOf("week");
        endDate = now.subtract(1, "week").endOf("week");
        break;
      case "custom":
        if (
          customRange &&
          customRange.length === 2 &&
          customRange[0] &&
          customRange[1]
        ) {
          startDate = dayjs(customRange[0]);
          endDate = dayjs(customRange[1]);
        } else {
          return true; // Fallback
        }
        break;
      default:
        return true;
    }

    return dayjs(dateStr).isBetween(startDate, endDate, "day", "[]");
  };

  // Main Filter Logic
  const getFilteredLeads = (leads) => {
    return leads.filter((lead) => {
      // Filter by Follow-up Date
      const followUpMatch = isDateInRange(
        lead.followUpNextDate,
        appliedFilters.followUpDate.option,
        appliedFilters.followUpDate.customRange
      );
      if (!followUpMatch) return false;

      // Filter by Site Visit Date
      const siteVisitMatch = isDateInRange(
        lead.siteVisitDate,
        appliedFilters.siteVisitDate.option,
        appliedFilters.siteVisitDate.customRange
      );
      if (!siteVisitMatch) return false;

      return true;
    });
  };

  // Find the active lead object for the drag overlay
  const activeLead = activeId
    ? Object.values(items)
        .flat()
        .find((lead) => lead.id === activeId)
    : null;

  // Open Filter Modal
  const openFilterModal = () => {
    setTempFilters(appliedFilters);
    // Determine custom mode states based on current applied filters
    setIsFollowUpCustomMode(
      appliedFilters.followUpDate.option.value === "custom"
    );
    setTempFollowUpRange(appliedFilters.followUpDate.customRange);
    setIsSiteVisitCustomMode(
      appliedFilters.siteVisitDate.option.value === "custom"
    );
    setTempSiteVisitRange(appliedFilters.siteVisitDate.customRange);
    setFilterModalVisible(true);
  };

  // Apply Filters
  const applyFilters = () => {
    setAppliedFilters(tempFilters);
    setFilterModalVisible(false);
  };

  // Clear a specific filter
  const clearFilter = (type) => {
    setAppliedFilters((prev) => {
      const newFilters = { ...prev };
      if (type === "stage") {
        newFilters.stage = { value: "all", label: "All Leads" };
      } else if (type === "followUpDate") {
        newFilters.followUpDate = {
          option: { value: "all", label: "All Dates" },
          customRange: null,
        };
      } else if (type === "siteVisitDate") {
        newFilters.siteVisitDate = {
          option: { value: "all", label: "All Dates" },
          customRange: null,
        };
      }
      return newFilters;
    });
  };

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
        {/* Actions Bar */}
        <div className="flex items-center justify-between">
          {/* Active Filters Display */}
          <div className="flex items-center gap-2 flex-wrap">
            {appliedFilters.stage.value !== "all" && (
              <div className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-2 border">
                <span className="text-gray-600">
                  Stage: {appliedFilters.stage.label}
                </span>
                <button
                  onClick={() => clearFilter("stage")}
                  className="text-gray-400 hover:text-red-500"
                >
                  <MdClose />
                </button>
              </div>
            )}
            {appliedFilters.followUpDate.option.value !== "all" && (
              <div className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-2 border">
                <span className="text-gray-600">
                  Follow-up: {appliedFilters.followUpDate.option.label}
                </span>
                <button
                  onClick={() => clearFilter("followUpDate")}
                  className="text-gray-400 hover:text-red-500"
                >
                  <MdClose />
                </button>
              </div>
            )}
            {appliedFilters.siteVisitDate.option.value !== "all" && (
              <div className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-2 border">
                <span className="text-gray-600">
                  Site Visit: {appliedFilters.siteVisitDate.option.label}
                </span>
                <button
                  onClick={() => clearFilter("siteVisitDate")}
                  className="text-gray-400 hover:text-red-500"
                >
                  <MdClose />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={openFilterModal}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
            >
              <MdFilterList size={20} />
              Filters
            </button>
            <button
              onClick={() => setAddModal(true)}
              className="bg-theme text-white px-4 py-2 rounded-lg border border-theme hover:bg-white hover:text-theme transition-colors duration-200 font-medium"
            >
              Add New Lead
            </button>
          </div>
        </div>

        {/* Kanban Board */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
            <div className="flex space-x-4 h-full min-w-max">
              {displayColumns.map((col, index) => (
                <KanbanColumn
                  key={col.id}
                  id={col.id}
                  title={col.title}
                  count={getFilteredLeads(items[col.id] || []).length}
                  leads={getFilteredLeads(items[col.id] || [])}
                  onStatusChange={reFetch}
                  onDelete={handleDeleteLead}
                  onEdit={handleEditLead}
                  index={index}
                  onAssign={handleAssignClick}
                  canAssign={canAssign}
                />
              ))}
            </div>
          </div>
          <DragOverlay>
            {activeLead ? <LeadCard lead={activeLead} /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Filter Modal */}
      <Dialog
        header="Filter Leads"
        visible={filterModalVisible}
        style={{ width: "500px" }}
        onHide={() => setFilterModalVisible(false)}
        className="font-inter"
        dismissableMask={true}
        closable={true}
      >
        <div className="flex flex-col gap-6 pt-4">
          {/* Stage Filter */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-sm text-gray-700">
              Lead Stage
            </label>
            <Select
              placeholder="Select Stage"
              styles={{
                ...selectStyles,
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              }}
              menuPortalTarget={
                typeof document !== "undefined" ? document.body : null
              }
              value={tempFilters.stage}
              onChange={(option) =>
                setTempFilters({ ...tempFilters, stage: option })
              }
              options={filterOptions}
            />
          </div>

          {/* Follow-up Date Filter */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-sm text-gray-700">
              Follow-up Date
            </label>
            {!isFollowUpCustomMode ? (
              <Select
                placeholder="Select Range"
                styles={{
                  ...selectStyles,
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
                menuPortalTarget={
                  typeof document !== "undefined" ? document.body : null
                }
                value={tempFilters.followUpDate.option}
                onChange={(option) => {
                  if (option.value === "custom") {
                    setIsFollowUpCustomMode(true);
                    setTempFollowUpRange(null);
                    setTempFilters({
                      ...tempFilters,
                      followUpDate: { option, customRange: null },
                    });
                  } else {
                    setTempFilters({
                      ...tempFilters,
                      followUpDate: { option, customRange: null },
                    });
                  }
                }}
                options={dateRangeOptions}
              />
            ) : (
              <div className="flex items-center gap-2">
                <Calendar
                  value={tempFollowUpRange}
                  onChange={(e) => {
                    setTempFollowUpRange(e.value);
                    if (e.value) {
                      setTempFilters({
                        ...tempFilters,
                        followUpDate: {
                          option: { value: "custom", label: "Custom Range" },
                          customRange: e.value,
                        },
                      });
                    }
                  }}
                  selectionMode="range"
                  readOnlyInput
                  placeholder="Select Date Range"
                  showIcon
                  className="w-full h-[38px]"
                  inputClassName="h-[38px] rounded-lg border-gray-300 border px-2"
                  hideOnRangeSelection
                />
              </div>
            )}
          </div>

          {/* Site Visit Date Filter */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-sm text-gray-700">
              Site Visit Date
            </label>
            {!isSiteVisitCustomMode ? (
              <Select
                placeholder="Select Range"
                styles={{
                  ...selectStyles,
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
                menuPortalTarget={
                  typeof document !== "undefined" ? document.body : null
                }
                value={tempFilters.siteVisitDate.option}
                onChange={(option) => {
                  if (option.value === "custom") {
                    setIsSiteVisitCustomMode(true);
                    setTempSiteVisitRange(null);
                    setTempFilters({
                      ...tempFilters,
                      siteVisitDate: { option, customRange: null },
                    });
                  } else {
                    setTempFilters({
                      ...tempFilters,
                      siteVisitDate: { option, customRange: null },
                    });
                  }
                }}
                options={dateRangeOptions}
              />
            ) : (
              <div className="flex items-center gap-2">
                <Calendar
                  value={tempSiteVisitRange}
                  onChange={(e) => {
                    setTempSiteVisitRange(e.value);
                    if (e.value) {
                      setTempFilters({
                        ...tempFilters,
                        siteVisitDate: {
                          option: { value: "custom", label: "Custom Range" },
                          customRange: e.value,
                        },
                      });
                    }
                  }}
                  selectionMode="range"
                  readOnlyInput
                  placeholder="Select Date Range"
                  showIcon
                  className="w-full h-[38px]"
                  inputClassName="h-[38px] rounded-lg border-gray-300 border px-2"
                  hideOnRangeSelection
                />
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <button
              onClick={() => {
                setTempFilters({
                  stage: { value: "all", label: "All Leads" },
                  followUpDate: {
                    option: { value: "all", label: "All Dates" },
                    customRange: null,
                  },
                  siteVisitDate: {
                    option: { value: "all", label: "All Dates" },
                    customRange: null,
                  },
                });
                setIsFollowUpCustomMode(false);
                setTempFollowUpRange(null);
                setIsSiteVisitCustomMode(false);
                setTempSiteVisitRange(null);
              }}
              className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
            >
              Clear All
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => setFilterModalVisible(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={applyFilters}
                className="px-6 py-2 bg-theme text-white rounded-lg hover:bg-themeDark transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </Dialog>

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

              <div>
                <SelectWithTextToggle
                  label="City *"
                  placeholder="Select City"
                  value={newLead.city}
                  options={allCities}
                  onChange={(val) => setNewLead({ ...newLead, city: val })}
                  styles={selectStyles}
                  isDisabled={submitting}
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
                    { value: "1-3 Months", label: "1-3 Months" },
                    { value: "3-6 Months", label: "3-6 Months" },
                    { value: "6+ Months", label: "6+ Months" },
                  ]}
                  onChange={(e) =>
                    setNewLead({ ...newLead, snapshotTimeline: e.value })
                  }
                  styles={selectStyles}
                  isDisabled={submitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex flex-col gap-y-2">
                <label className="font-medium text-sm">Estimated Value</label>
                <InputText
                  value={newLead.estimatedValue}
                  onChange={(e) =>
                    setNewLead({ ...newLead, estimatedValue: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg"
                  placeholder="$0.00"
                  disabled={submitting}
                />
              </div>
              <div className="flex flex-col gap-y-2">
                <label className="font-medium text-sm">
                  Preferred Contact Method
                </label>
                <Select
                  placeholder="Select Method"
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
                    { value: "Any", label: "Any" },
                  ]}
                  onChange={(e) =>
                    setNewLead({ ...newLead, preferredContact: e.value })
                  }
                  styles={selectStyles}
                  isDisabled={submitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex flex-col gap-y-2">
                <label className="font-medium text-sm">Notes</label>
                <InputText
                  value={newLead.notes}
                  onChange={(e) =>
                    setNewLead({ ...newLead, notes: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg"
                  placeholder="Additional notes..."
                  disabled={submitting}
                />
              </div>

              <div className="flex flex-col gap-y-2">
                <label className="font-medium text-sm">Lead Source</label>
                <Select
                  placeholder="Select Source"
                  value={
                    newLead.leadSource
                      ? {
                          value: newLead.leadSource,
                          label: newLead.leadSource,
                        }
                      : null
                  }
                  options={[
                    { value: "Website", label: "Website" },
                    { value: "Referral", label: "Referral" },
                    { value: "Cold Call", label: "Cold Call" },
                    { value: "WhatsApp", label: "WhatsApp" },
                    { value: "Other", label: "Other" },
                  ]}
                  onChange={(e) =>
                    setNewLead({ ...newLead, leadSource: e.value })
                  }
                  styles={selectStyles}
                  isDisabled={submitting}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 mt-4 py-4 border-t">
            <button
              onClick={() => {
                setAddModal(false);
                resetForm();
              }}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveLead}
              className="px-6 py-2 bg-theme text-white rounded-lg hover:bg-themeDark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <i className="pi pi-spin pi-spinner text-sm"></i>
                  Saving...
                </>
              ) : isEditMode ? (
                "Update Lead"
              ) : (
                "Create Lead"
              )}
            </button>
          </div>
        </div>
      </Dialog>

      {/* Assign Modal */}
      <Dialog
        header="Assign Lead"
        visible={assignModal}
        style={{ width: "450px" }}
        onHide={() => {
          setAssignModal(false);
          setAssigningLead(null);
        }}
        className="font-inter"
        dismissableMask={true}
        closable={true}
      >
        <div className="flex flex-col gap-6 pt-4">
          {assigningLead && (
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border">
              Assigning{" "}
              <strong>
                {assigningLead.machineName} -{" "}
                {assigningLead.companyName || assigningLead.company}
              </strong>
            </div>
          )}

          {/* Current Assignment Status */}
          {assigningLead && (
            <div className="text-sm bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="font-medium text-gray-700 mb-1">
                Current Assignment:
              </div>
              {assigningLead.assignedEmployee && assigningLead.assignedSalesRep ? (
                <div className="text-gray-600">
                  {assigningLead.assignedSalesRep.srName} - {assigningLead.assignedEmployee.name}
                  <span className="text-xs text-gray-500 ml-2">
                    (Partner assigned to employee)
                  </span>
                </div>
              ) : assigningLead.assignedEmployee ? (
                <div className="text-gray-600">
                  {assigningLead.assignedEmployee.name}
                  <span className="text-xs text-gray-500 ml-2">(Employee)</span>
                </div>
              ) : assigningLead.assignedSalesRep ? (
                <div className="text-gray-600">
                  {assigningLead.assignedSalesRep.srName}
                  <span className="text-xs text-gray-500 ml-2">(Local Partner)</span>
                </div>
              ) : (
                <div className="text-gray-500 italic">Not assigned</div>
              )}
            </div>
          )}

          {/* Assign To Radio Buttons - Only show for admin */}
          {userType === "admin" && (
            <div className="flex flex-col gap-3">
              <label className="font-semibold text-gray-700">Assign To:</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="assignType"
                    value="local-partner"
                    checked={assignType === "local-partner"}
                    onChange={(e) => {
                      setAssignType(e.target.value);
                      setSelectedEntityId(null);
                    }}
                    className="text-theme focus:ring-theme"
                  />
                  Local Partner
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="assignType"
                    value="employee"
                    checked={assignType === "employee"}
                    onChange={(e) => {
                      setAssignType(e.target.value);
                      setSelectedEntityId(null);
                    }}
                    className="text-theme focus:ring-theme"
                  />
                  Employee
                </label>
              </div>
            </div>
          )}

          {/* For local partner: show label only */}
          {userType === "salesRepresentative" && (
            <div className="flex flex-col gap-3">
              <label className="font-semibold text-gray-700">
                Assign To Employee:
              </label>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="font-medium text-sm text-gray-700">
              {userType === "salesRepresentative"
                ? "Select Employee"
                : `Select ${assignType === "employee" ? "Employee" : "Local Partner"}`}
            </label>
            <Select
              placeholder={`Select ${
                userType === "salesRepresentative"
                  ? "Employee"
                  : assignType === "employee"
                  ? "Employee"
                  : "Local Partner"
              }`}
              styles={{
                ...selectStyles,
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              }}
              menuPortalTarget={
                typeof document !== "undefined" ? document.body : null
              }
              value={
                userType === "salesRepresentative" || assignType === "employee"
                  ? employeeOptions.find(
                      (opt) => String(opt.value) === String(selectedEntityId)
                    )
                  : partnerOptions.find(
                      (opt) => String(opt.value) === String(selectedEntityId)
                    )
              }
              onChange={(option) => setSelectedEntityId(option?.value)}
              options={
                userType === "salesRepresentative" || assignType === "employee"
                  ? employeeOptions
                  : partnerOptions
              }
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => {
                setAssignModal(false);
                setAssigningLead(null);
              }}
              className="px-4 py-2 border rounded hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAssignSubmit}
              disabled={!selectedEntityId || assignLoading}
              className="px-4 py-2 bg-theme text-white rounded hover:bg-themeDark disabled:opacity-70 transition-colors"
            >
              {assignLoading ? "Assigning..." : "Assign"}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
