"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { CiMenuBurger } from "react-icons/ci";
import { useDataContext } from "@/utilities/DataContext";
import {
  MdArrowBack,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdTrendingUp,
  MdCalendarToday,
  MdPerson,
  MdCheck,
  MdClose,
  MdHistory,
  MdDescription,
  MdEvent,
  MdFeedback,
  MdBusiness,
} from "react-icons/md";
import { FaExternalLinkAlt, FaWhatsapp } from "react-icons/fa";
import { MdOutlinePhonelinkRing } from "react-icons/md";

import { Dialog } from "primereact/dialog";
import { Calendar } from "primereact/calendar";
import Select from "react-select";
import selectStyles from "@/utilities/SelectStyle";

import GetAPI from "@/utilities/GetAPI";
import { leadsAPI } from "@/utilities/LeadsAPI";
import { success_toaster, error_toaster } from "@/utilities/Toaster";
import Loader from "@/components/ui/Loader";
import LeadCTAButtons from "@/components/ui/LeadCTAButtons";
import { formatDateTimeISO, formatUSD } from "@/utilities/constants";

// Helper to generate pipeline based on status
const generatePipeline = (currentStatus) => {
  const pipelineSteps = [
    { id: 1, label: "New Enquiry" },
    { id: 2, label: "Contacted" },
    { id: 3, label: "Quoted" },
    { id: 4, label: "Demo/Scheduled" },
    { id: 5, label: "Negotiation" },
    { id: 6, label: "Nurture" },
    { id: 7, label: "WON" },
    { id: 8, label: "LOST" },
  ];

  const currentIndex = pipelineSteps.findIndex(
    (s) => s.label === currentStatus
  );

  return pipelineSteps.map((step, index) => ({
    ...step,
    status:
      index < currentIndex
        ? "completed"
        : index === currentIndex
          ? "current"
          : "upcoming",
  }));
};

export default function LeadDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { toggle, setToggle } = useDataContext();

  const { data, reFetch, isLoading } = GetAPI(id ? `api/v1/leads/${id}` : null);
  const [lead, setLead] = useState(null);
  const [isEditingTag, setIsEditingTag] = useState(false);
  const [editedTag, setEditedTag] = useState("");

  const [modal, setModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  const [stageNote, setStageNote] = useState("");

  // New modals
  const [followUpModal, setFollowUpModal] = useState(false);
  const [quotationModal, setQuotationModal] = useState(false);
  const [siteVisitModal, setSiteVisitModal] = useState(false);
  const [lostModal, setLostModal] = useState(false);

  // Form states
  const [followUpDate, setFollowUpDate] = useState(null);
  const [followUpFeedback, setFollowUpFeedback] = useState("");
  const [quotationAmount, setQuotationAmount] = useState("");
  const [siteVisitDate, setSiteVisitDate] = useState(null);
  const [siteVisitNotes, setSiteVisitNotes] = useState("");
  const [lostReason, setLostReason] = useState(null);
  const [customerFeedback, setCustomerFeedback] = useState("");

  useEffect(() => {
    if (data?.data) {
      const apiLead = data.data || [];

      setLead({
        id: apiLead.id,
        leadId: `L${String(apiLead.id).padStart(4, "0")}`,
        company: apiLead.company,
        createdOn: apiLead.createdAt
          ? formatDateTimeISO(apiLead.createdAt)
          : "-",
        status: apiLead.status,
        tag: apiLead.tag || "Hot Lead",
        leadSource: apiLead.leadSource,
        leadDate: apiLead.leadDate
          ? formatDateTimeISO(apiLead.leadDate)
          : "-",
        preferredContact: apiLead.preferredContact,
        business: {
          type: apiLead.businessType || "-",
          location:
            apiLead.businessLocation ||
            apiLead.city ||
            "-" + ", " + apiLead.state ||
            "-" + ", " + apiLead.country ||
            "-",
        },
        contact: {
          name: apiLead.contactName,
          phone: apiLead.contactPhone,
          email: apiLead.contactEmail,
        },
        commercial: {
          estValue: apiLead.estimatedValue || "-",
          owner: apiLead.role || "-",
        },
        followUp: {
          nextDate: apiLead.followUpNextDate
            ? formatDateTimeISO(apiLead.followUpNextDate)
            : null,
          needed: apiLead.followUpNeeded,
          feedback: apiLead.followUpFeedback,
        },
        customerStatus: apiLead.customerStatus || "Interested",
        quotation: {
          sent: apiLead.quotationSent,
          amount: apiLead.quotationAmount,
          dateSent: apiLead.quotationDateSent
            ? formatDateTimeISO(apiLead.quotationDateSent)
            : null,
        },
        siteVisit: {
          scheduled: apiLead.siteVisitScheduled,
          date: apiLead.siteVisitDate
            ? formatDateTimeISO(apiLead.siteVisitDate)
            : null,
          completed: apiLead.siteVisitCompleted,
          notes: apiLead.siteVisitNotes,
        },
        snapshot: {
          type: apiLead.snapshotType || "-",
          useCase: apiLead.snapshotUseCase || "-",
          volume: apiLead.snapshotVolume || "-",
          timeline: apiLead.snapshotTimeline || "-",
        },
        notes: apiLead.notes || "-",
        lostReason: apiLead.lostReason,
        customerFeedback: apiLead.customerFeedback,
        logs:
          apiLead.LeadLogs?.map((log, i) => ({
            id: log.id,
            type: log.type,
            msg: log.message,
            user: log.User?.name || i === 0 ? "Customer" : "Administrator",
            date: formatDateTimeISO(log.createdAt),
          })) || [],
        pipeline: generatePipeline(apiLead.status),
        assignedEmployee: apiLead.assignedEmployee,
        assignedSalesRep: apiLead.assignedSalesRep,
      });
      setEditedTag(apiLead.tag || "Hot Lead");
    }
  }, [data]);

  if (isLoading) return <Loader />;
  if (!lead) return <div className="p-10 text-center">Lead not found</div>;

  const handleMarkWon = async () => {
    try {
      const response = await leadsAPI.markAsWon(lead.id);
      if (response?.data?.success || response?.success) {
        success_toaster("Lead marked as WON");
        reFetch();
      } else {
        error_toaster(response?.message || "Failed to mark as won");
      }
    } catch (error) {
      error_toaster("Failed to mark as won");
    }
  };

  const handleMarkLost = () => {
    setLostModal(true);
  };

  const confirmMarkLost = async () => {
    if (!lostReason) return;

    try {
      const response = await leadsAPI.markAsLost(lead.id, {
        reason: lostReason.value,
        feedback: customerFeedback,
      });

      if (response?.data?.success || response?.success) {
        success_toaster("Lead marked as LOST");
        setLostModal(false);
        setLostReason(null);
        setCustomerFeedback("");
        reFetch();
      } else {
        error_toaster(response?.message || "Failed to mark as lost");
      }
    } catch (error) {
      error_toaster("Failed to mark as lost");
    }
  };

  const handleUpdateStage = async () => {
    if (!selectedStage) return;

    try {
      const response = await leadsAPI.updateLead(lead.id, {
        status: selectedStage.value,
        stageNote,
      });

      if (response?.data?.success || response?.success) {
        success_toaster("Stage updated successfully");
        setModal(false);
        setSelectedStage(null);
        setStageNote("");
        reFetch();
      } else {
        error_toaster(response?.message || "Failed to update stage");
      }
    } catch (error) {
      error_toaster("Failed to update stage");
    }
  };

  const handleScheduleFollowUp = async () => {
    if (!followUpDate) return;

    try {
      const response = await leadsAPI.scheduleFollowUp(lead.id, {
        date: followUpDate,
        notes: followUpFeedback,
      });

      if (response?.data?.success || response?.success) {
        success_toaster("Follow-up scheduled successfully");
        setFollowUpModal(false);
        setFollowUpDate(null);
        setFollowUpFeedback("");
        reFetch();
      } else {
        error_toaster(response?.message || "Failed to schedule follow-up");
      }
    } catch (error) {
      error_toaster("Failed to schedule follow-up");
    }
  };

  const handleSendQuotation = async () => {
    if (!quotationAmount) return;

    try {
      const response = await leadsAPI.sendQuotation(lead.id, {
        amount: quotationAmount,
        date: new Date(),
      });

      if (response?.data?.success || response?.success) {
        success_toaster("Quotation sent successfully");
        setQuotationModal(false);
        setQuotationAmount("");
        reFetch();
      } else {
        error_toaster(response?.message || "Failed to send quotation");
      }
    } catch (error) {
      error_toaster("Failed to send quotation");
    }
  };

  const handleScheduleSiteVisit = async () => {
    if (!siteVisitDate) return;

    try {
      const response = await leadsAPI.scheduleSiteVisit(lead.id, {
        date: siteVisitDate,
        notes: siteVisitNotes,
      });

      if (response?.data?.success || response?.success) {
        success_toaster("Site visit scheduled successfully");
        setSiteVisitModal(false);
        setSiteVisitDate(null);
        setSiteVisitNotes("");
        reFetch();
      } else {
        error_toaster(response?.message || "Failed to schedule site visit");
      }
    } catch (error) {
      error_toaster("Failed to schedule site visit");
    }
  };

  const updateCustomerStatus = async (newStatus) => {
    try {
      const response = await leadsAPI.updateLead(lead.id, {
        customerStatus: newStatus.value,
      });

      if (response?.data?.success || response?.success) {
        success_toaster("Customer status updated");
        reFetch();
      } else {
        error_toaster(response?.message || "Failed to update status");
      }
    } catch (error) {
      error_toaster("Failed to update status");
    }
  };

  const updateLeadTag = async (newTag) => {
    try {
      const response = await leadsAPI.updateLead(lead.id, {
        tag: newTag,
      });

      if (response?.data?.success || response?.success) {
        success_toaster("Lead tag updated");
        setLead((prev) => ({ ...prev, tag: newTag }));
        setEditedTag(newTag);
        setIsEditingTag(false);
        reFetch();
      } else {
        error_toaster(response?.message || "Failed to update tag");
      }
    } catch (error) {
      error_toaster("Failed to update tag");
    }
  };

  const stageOptions = lead.pipeline.map((p) => ({
    value: p.label,
    label: p.label,
  }));

  return (
    <div className="w-full font-inter bg-gray-50 min-h-screen">
      {/* Fixed Global Header */}
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-20 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed top-0 right-0">
        <div className="text-xl font-semibold flex items-center gap-2">
          <button
            onClick={() => setToggle(!toggle)}
            className="cursor-pointer md:hidden"
          >
            <CiMenuBurger size={20} />
          </button>
          <button
            onClick={() => router.back()}
            className="mr-2 hover:bg-gray-100 p-1 rounded-full transition-colors"
          >
            <MdArrowBack size={24} />
          </button>
          <span
            onClick={() => router.push("/leads")}
            className="cursor-pointer hover:text-theme transition-colors text-gray-500"
          >
            Leads
          </span>
          <span className="text-gray-400">/</span>
          <span className="text-themeDark">{lead.company}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full pt-28 2xl:pt-32 px-6 2xl:px-12 pb-10 space-y-6">
        {/* 1. Hero Card */}
        {/* Action Buttons */}
        <LeadCTAButtons
          onUpdateStage={() => setModal(true)}
          onMarkWon={handleMarkWon}
          onMarkLost={handleMarkLost}
        />

        {/* 1. Hero Card */}
        <div className="bg-[#2C2C2C] text-white rounded-2xl p-6 shadow-md flex flex-col gap-5 lg:flex-row justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-1 max-lg:text-center">
              {lead.company}
            </h1>
            <p className="text-gray-400 text-sm">
              Lead ID: {lead.leadId} • Created {lead.createdOn} • Source:{" "}
              {lead.leadSource}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-4 py-1.5 rounded-full text-sm font-medium uppercase tracking-wide text-center ${lead.status === "WON"
                ? "bg-green-500 text-white"
                : lead.status === "LOST"
                  ? "bg-red-500 text-white"
                  : "bg-gray-600 text-white"
                }`}
            >
              {lead.status}
            </span>
            {isEditingTag ? (
              <div className="flex items-center gap-2">
                <Select
                  value={{ value: editedTag, label: editedTag }}
                  onChange={(selectedOption) =>
                    setEditedTag(selectedOption.value)
                  }
                  options={[
                    { value: "Hot Lead", label: "Hot Lead" },
                    { value: "Warm Lead", label: "Warm Lead" },
                    { value: "Cold Lead", label: "Cold Lead" },
                  ]}
                  styles={{
                    ...selectStyles,
                    container: (provided) => ({
                      ...provided,
                      width: "150px",
                    }),
                    control: (provided) => ({
                      ...provided,
                      minHeight: "36px",
                      fontSize: "14px",
                    }),
                    menu: (provided) => ({
                      ...provided,
                      zIndex: 9999,
                    }),
                    menuPortal: (provided) => ({
                      ...provided,
                      zIndex: 9999,
                    }),
                  }}
                  menuPortalTarget={
                    typeof document !== "undefined" ? document.body : null
                  }
                  menuPosition="fixed"
                />
                <button
                  onClick={() => updateLeadTag(editedTag)}
                  className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600"
                >
                  <MdCheck size={16} />
                </button>
                <button
                  onClick={() => setIsEditingTag(false)}
                  className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                >
                  <MdClose size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingTag(true)}
                className="bg-white text-themeDark px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-1 hover:bg-gray-100 transition-colors"
              >
                <MdTrendingUp /> {lead.tag}
              </button>
            )}
          </div>
        </div>

        {/* 2. Pipeline Stepper */}
        <div className="bg-white rounded-2xl p-6 shadow-sm overflow-x-auto">
          <div className="relative flex justify-between items-center min-w-[800px] px-4">
            <div className="absolute top-4 left-0 w-full h-[2px] bg-gray-200 -z-0" />

            {lead.pipeline
              .filter((step) => {
                if (lead.status === "LOST") return step.label !== "WON";
                return step.label !== "LOST";
              })
              .map((step) => (
                <div
                  key={step.id}
                  className="flex flex-col items-center relative z-10 bg-white px-2"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-2 transition-colors border-2 ${step.status === "completed"
                      ? "bg-green-500 border-green-500 text-white"
                      : step.status === "current"
                        ? "bg-black border-black text-white"
                        : "bg-white border-gray-200 text-gray-500"
                      }`}
                  >
                    {step.status === "completed" ? (
                      <MdCheck size={16} />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium whitespace-nowrap ${step.status === "current"
                      ? "text-black font-bold"
                      : "text-gray-500"
                      }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* 3. Info Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Business Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-gray-500 text-sm font-medium mb-4">Business</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-1 text-gray-400">
                  <MdLocationOn />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Type: {lead.business.type}
                  </p>
                  <p className="text-sm text-gray-500">
                    {lead.business.location}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-gray-400">
                  <FaExternalLinkAlt size={14} />
                </div>
                <p className="text-sm text-gray-900">
                  Source: {lead.leadSource}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-gray-400">
                  <MdCalendarToday />
                </div>
                <p className="text-sm text-gray-900">
                  Lead Date: {lead.leadDate}
                </p>
              </div>
            </div>
          </div>

          {/* Primary Contact */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-gray-500 text-sm font-medium mb-4">
              Primary Contact
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="text-gray-400">
                  <MdPerson />
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {lead.contact.name}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-gray-400">
                  <MdPhone />
                </div>
                <p className="text-sm text-gray-900">{lead.contact.phone}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-gray-400">
                  <MdEmail />
                </div>
                <p className="text-sm text-gray-900">{lead.contact.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-gray-400">
                  <MdOutlinePhonelinkRing />
                </div>
                <p className="text-sm text-gray-900">
                  Preferred: {lead.preferredContact}
                </p>
              </div>
            </div>
          </div>

          {/* Commercial */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-gray-500 text-sm font-medium mb-4">
              Commercial
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="text-gray-400">
                  <MdTrendingUp />
                </div>
                <p className="text-sm font-medium text-gray-900">
                  Est. Value: {formatUSD(lead.commercial.estValue)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-gray-400">
                  <MdPerson />
                </div>
                <p className="text-sm text-gray-900">
                  Role: {lead.commercial.owner}
                </p>
              </div>

              {(lead.assignedEmployee || lead.assignedSalesRep) && (
                <div className="flex items-center gap-3">
                  <div className="text-gray-400">
                    <MdPerson />
                  </div>
                  <p className="text-sm text-gray-900">
                    Assigned To:{" "}
                    {lead.assignedEmployee && lead.assignedSalesRep
                      ? `${lead.assignedSalesRep.srName} - ${lead.assignedEmployee.name}`
                      : lead.assignedEmployee
                        ? lead.assignedEmployee.name
                        : lead.assignedSalesRep
                          ? lead.assignedSalesRep.srName
                          : "-"}
                  </p>
                </div>
              )}

              {lead.assignedEmployee && lead.assignedEmployee.employeeOf && (
                <div className="flex items-center gap-3">
                  <div className="text-gray-400">
                    <MdBusiness />
                  </div>
                  <p className="text-sm text-gray-900">
                    Employee of: {lead.assignedEmployee.employeeOf}
                  </p>
                </div>
              )}

              {lead.assignedSalesRep && !lead.assignedEmployee && (
                <div className="flex items-center gap-3">
                  <div className="text-gray-400">
                    <MdBusiness />
                  </div>
                  <p className="text-sm text-gray-900">
                    Type: Local Partner
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4. Follow-up & Customer Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Follow-up */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-900 text-sm font-bold">Follow-up</h3>
              <button
                onClick={() => setFollowUpModal(true)}
                className="text-xs text-theme hover:underline"
              >
                Schedule
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MdCalendarToday className="text-gray-400" size={16} />
                <p className="text-sm text-gray-900">
                  Next: {lead.followUp.nextDate || "Not scheduled"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <MdCheck
                  className={
                    lead.followUp.needed ? "text-green-500" : "text-gray-400"
                  }
                  size={16}
                />
                <p className="text-sm text-gray-900">
                  Needed: {lead.followUp.needed ? "Yes" : "No"}
                </p>
              </div>
              {lead.followUp.feedback && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                  {lead.followUp.feedback}
                </div>
              )}
            </div>
          </div>

          {/* Customer Status */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-gray-900 text-sm font-bold mb-4">
              Customer Status
            </h3>
            <Select
              value={{ value: lead.customerStatus, label: lead.customerStatus }}
              onChange={updateCustomerStatus}
              options={[
                { value: "Interested", label: "Interested" },
                { value: "In Future", label: "In Future" },
                { value: "Not Interested", label: "Not Interested" },
              ]}
              styles={selectStyles}
            />
          </div>
        </div>

        {/* 5. Quotation & Site Visit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quotation */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-900 text-sm font-bold">Quotation</h3>
              <button
                onClick={() => setQuotationModal(true)}
                className="text-xs text-theme hover:underline"
              >
                Send Quotation
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MdDescription
                  className={
                    lead.quotation.sent ? "text-green-500" : "text-gray-400"
                  }
                  size={16}
                />
                <p className="text-sm text-gray-900">
                  Sent: {lead.quotation.sent ? "Yes" : "No"}
                </p>
              </div>
              {lead.quotation.sent && (
                <>
                  <div className="flex items-center gap-2">
                    <MdTrendingUp className="text-gray-400" size={16} />
                    <p className="text-sm text-gray-900">
                      Amount: ${lead.quotation.amount}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <MdCalendarToday className="text-gray-400" size={16} />
                    <p className="text-sm text-gray-900">
                      Date: {lead.quotation.dateSent}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Site Visit */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-900 text-sm font-bold">Site Visit</h3>
              <button
                onClick={() => setSiteVisitModal(true)}
                className="text-xs text-theme hover:underline"
              >
                Schedule Visit
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MdEvent
                  className={
                    lead.siteVisit.scheduled
                      ? "text-green-500"
                      : "text-gray-400"
                  }
                  size={16}
                />
                <p className="text-sm text-gray-900">
                  Scheduled: {lead.siteVisit.scheduled ? "Yes" : "No"}
                </p>
              </div>
              {lead.siteVisit.scheduled && (
                <>
                  <div className="flex items-center gap-2">
                    <MdCalendarToday className="text-gray-400" size={16} />
                    <p className="text-sm text-gray-900">
                      Date: {lead.siteVisit.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <MdCheck
                      className={
                        lead.siteVisit.completed
                          ? "text-green-500"
                          : "text-gray-400"
                      }
                      size={16}
                    />
                    <p className="text-sm text-gray-900">
                      Completed: {lead.siteVisit.completed ? "Yes" : "No"}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 6. Requirement Snapshot */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium mb-4">
            Requirement Snapshot
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-gray-400 mb-1">Type</p>
              <p className="text-sm font-semibold text-gray-900">
                {lead.snapshot.type}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Use Case</p>
              <p className="text-sm font-semibold text-gray-900">
                {lead.snapshot.useCase}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Volume</p>
              <p className="text-sm font-semibold text-gray-900">
                {lead.snapshot.volume}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Timeline</p>
              <p className="text-sm font-semibold text-gray-900">
                {lead.snapshot.timeline}
              </p>
            </div>
          </div>

          {lead.notes && lead.notes !== "-" && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-2">Additional Notes</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {lead.notes}
              </p>
            </div>
          )}
        </div>

        {/* 7. Lost Lead Info (if applicable) */}
        {lead.status === "LOST" && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <h3 className="text-red-900 text-sm font-bold mb-4 flex items-center gap-2">
              <MdClose /> Lost Lead Information
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-red-600 mb-1">Lost Reason</p>
                <p className="text-sm font-semibold text-red-900">
                  {lead.lostReason}
                </p>
              </div>
              {lead.customerFeedback && (
                <div>
                  <p className="text-xs text-red-600 mb-1">Customer Feedback</p>
                  <p className="text-sm text-red-900">
                    {lead.customerFeedback}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 9. Logs Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-gray-900 text-lg font-bold mb-6 flex items-center gap-2">
            <MdHistory /> Activity Logs
          </h3>
          <div className="relative border-l-2 border-gray-100 ml-2 space-y-8">
            {lead.logs.map((log) => (
              <div key={log.id} className="ml-6 relative">
                <div
                  className={`absolute -left-[33px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${log.type === "status"
                    ? "bg-blue-500"
                    : log.type === "call"
                      ? "bg-purple-500"
                      : "bg-gray-400"
                    }`}
                ></div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {log.msg}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">by {log.user}</p>
                  </div>
                  <span className="text-xs text-gray-400 mt-1 sm:mt-0">
                    {log.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Update Stage Modal */}
      <Dialog
        header="Update Pipeline Stage"
        visible={modal}
        style={{ width: "400px" }}
        onHide={() => setModal(false)}
        className="font-inter"
      >
        <div className="space-y-4 pt-2">
          <label className="block text-sm font-medium text-gray-700">
            Select New Stage
          </label>
          <Select
            options={stageOptions}
            value={selectedStage}
            onChange={setSelectedStage}
            styles={{
              ...selectStyles,
              menuPortal: (base) => ({ ...base, zIndex: 999999 }),
            }}
            menuPortalTarget={
              typeof document !== "undefined" ? document.body : null
            }
            menuPosition="fixed"
            placeholder="Choose stage..."
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">
              Note (Optional)
            </label>
            <textarea
              value={stageNote}
              onChange={(e) => setStageNote(e.target.value)}
              className="w-full p-2 border rounded-lg resize-none"
              rows={3}
              placeholder="Add a note about this stage update..."
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setModal(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateStage}
              className="px-4 py-2 text-sm text-white bg-theme hover:bg-themeDark rounded-lg"
            >
              Update
            </button>
          </div>
        </div>
      </Dialog>

      {/* Follow-up Modal */}
      <Dialog
        header="Schedule Follow-up"
        visible={followUpModal}
        style={{ width: "400px" }}
        onHide={() => setFollowUpModal(false)}
        className="font-inter"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Follow-up Date
            </label>
            <Calendar
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.value)}
              showIcon
              className="w-full"
              inputClassName="w-full p-2 border rounded-lg"
              dateFormat="dd M yy"
              placeholder="Select date..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Feedback/Notes
            </label>
            <textarea
              value={followUpFeedback}
              onChange={(e) => setFollowUpFeedback(e.target.value)}
              className="w-full p-2 border rounded-lg resize-none"
              rows={3}
              placeholder="Add notes or feedback..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setFollowUpModal(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleScheduleFollowUp}
              className="px-4 py-2 text-sm text-white bg-theme hover:bg-themeDark rounded-lg"
            >
              Schedule
            </button>
          </div>
        </div>
      </Dialog>

      {/* Quotation Modal */}
      <Dialog
        header="Send Quotation"
        visible={quotationModal}
        style={{ width: "400px" }}
        onHide={() => setQuotationModal(false)}
        className="font-inter"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quotation Amount
            </label>
            <input
              type="text"
              value={quotationAmount}
              onChange={(e) => setQuotationAmount(e.target.value)}
              className="w-full p-2 border rounded-lg"
              placeholder="e.g. $3,20,000"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setQuotationModal(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSendQuotation}
              className="px-4 py-2 text-sm text-white bg-theme hover:bg-themeDark rounded-lg"
            >
              Send
            </button>
          </div>
        </div>
      </Dialog>

      {/* Site Visit Modal */}
      <Dialog
        header="Schedule Site Visit"
        visible={siteVisitModal}
        style={{ width: "400px" }}
        onHide={() => setSiteVisitModal(false)}
        className="font-inter"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Visit Date
            </label>
            <Calendar
              value={siteVisitDate}
              onChange={(e) => setSiteVisitDate(e.value)}
              showIcon
              className="w-full"
              inputClassName="w-full p-2 border rounded-lg"
              dateFormat="dd M yy"
              placeholder="Select date..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={siteVisitNotes}
              onChange={(e) => setSiteVisitNotes(e.target.value)}
              className="w-full p-2 border rounded-lg resize-none"
              rows={3}
              placeholder="Add visit notes..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setSiteVisitModal(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleScheduleSiteVisit}
              className="px-4 py-2 text-sm text-white bg-theme hover:bg-themeDark rounded-lg"
            >
              Schedule
            </button>
          </div>
        </div>
      </Dialog>

      {/* Lost Reason Modal */}
      <Dialog
        header="Mark Lead as Lost"
        visible={lostModal}
        style={{ width: "400px" }}
        onHide={() => setLostModal(false)}
        className="font-inter"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lost Reason *
            </label>
            <Select
              value={lostReason}
              onChange={setLostReason}
              options={[
                { value: "Price Too High", label: "Price Too High" },
                { value: "Timeline Mismatch", label: "Timeline Mismatch" },
                { value: "Chose Competitor", label: "Chose Competitor" },
                { value: "Not Interested", label: "Not Interested" },
                { value: "Budget Constraints", label: "Budget Constraints" },
                { value: "Other", label: "Other" },
              ]}
              styles={{
                ...selectStyles,
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              }}
              menuPortalTarget={
                typeof document !== "undefined" ? document.body : null
              }
              menuPosition="fixed"
              placeholder="Select reason..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Feedback
            </label>
            <textarea
              value={customerFeedback}
              onChange={(e) => setCustomerFeedback(e.target.value)}
              className="w-full p-2 border rounded-lg resize-none"
              rows={3}
              placeholder="Add customer feedback..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setLostModal(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={confirmMarkLost}
              className="px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg"
            >
              Mark as Lost
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
