import React, { useState } from "react";
import { MdEdit, MdDelete, MdPriorityHigh, MdPersonAdd } from "react-icons/md";
import { useRouter } from "next/navigation";
import { leadsAPI } from "@/utilities/LeadsAPI";
import { success_toaster, error_toaster } from "@/utilities/Toaster";
import { Dialog } from "primereact/dialog";
import { formatDateTimeISO } from "@/utilities/constants";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import dayjs from "dayjs";

export default function LeadCard({
  lead,
  onStatusChange,
  onDelete,
  onEdit,
  onAssign,
  canAssign,
}) {
  const router = useRouter();
  const [deleteModal, setDeleteModal] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Check if follow-up date is today
  const isFollowUpToday = () => {
    if (!lead.followUpNextDate) return false;
    const today = dayjs().format("YYYY-MM-DD");
    const followUpDate = dayjs(lead.followUpNextDate).format("YYYY-MM-DD");
    return today === followUpDate;
  };

  // Check if site visit date is today
  const isSiteVisitToday = () => {
    if (!lead.siteVisitDate) return false;
    const today = dayjs().format("YYYY-MM-DD");
    const siteVisitDate = dayjs(lead.siteVisitDate).format("YYYY-MM-DD");
    return today === siteVisitDate;
  };

  const todaysAlert = isSiteVisitToday() || isFollowUpToday();

  // Determine card background style
  const isAssigned = lead.assignedEmployee || lead.assignedSalesRep;

  // Function to handle lead deletion
  const handleDelete = async () => {
    try {
      const response = await leadsAPI.deleteLead(lead.id);

      if (response?.data?.success || response?.success) {
        success_toaster("Lead deleted successfully");
        setDeleteModal(false);
        // Notify parent component to refresh data
        if (onDelete) {
          onDelete(lead.id);
        }
      } else {
        error_toaster(response?.message || "Failed to delete lead");
      }
    } catch (error) {
      error_toaster("Failed to delete lead");
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        onClick={() => router.push(`/leads/${lead.id}`)}
        className={`${
          todaysAlert ? "bg-[#FFD3D5]" : "bg-white"
        } p-4 rounded-xl shadow-sm border border-borderColor mb-3 hover:shadow-md transition-all duration-200 group cursor-grab active:cursor-grabbing relative touch-none`}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-themeBlue font-bold text-sm hover:underline">
            {lead.machineName}
          </h3>
          <div className="flex space-x-1 text-themeLightGray opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              title="Edit"
              className="hover:text-themeDark p-1 rounded hover:bg-themeGray"
              onClick={(e) => {
                e.stopPropagation();
                // Pass lead data to parent for editing
                if (onEdit) {
                  onEdit(lead);
                }
              }}
            >
              <MdEdit size={16} />
            </button>
            {canAssign && (
              <button
                title="Assign"
                className={`hover:text-themeDark p-1 rounded hover:bg-themeGray`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onAssign) {
                    onAssign(lead);
                  }
                }}
              >
                <MdPersonAdd size={16} />
              </button>
            )}
            <button
              title="Delete"
              className="hover:text-themeDark p-1 rounded hover:bg-themeGray"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteModal(true);
              }}
            >
              <MdDelete size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div className="mb-1">
            <p className="font-semibold text-themeDark text-sm">
              {lead.company}
            </p>
            <p className="text-xs text-themeLightGray font-medium">
              {lead.role}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1">
            {lead.siteVisitDate && (
              <div className="flex items-center gap-1">
                {isSiteVisitToday() && (
                  <div
                    title="Site visit today"
                    className="text-red-500 bg-red-50 p-0.5 rounded-full"
                  >
                    <MdPriorityHigh size={14} />
                  </div>
                )}
                <p className="text-xs text-themeLightGray font-medium">
                  V:{formatDateTimeISO(lead.siteVisitDate, "date") || ""}
                </p>
              </div>
            )}

            {lead.followUpNextDate && (
              <div className="flex items-center gap-1">
                {isFollowUpToday() && (
                  <div
                    title="Follow-up due today"
                    className="text-red-500 bg-red-50 p-0.5 rounded-full"
                  >
                    <MdPriorityHigh size={14} />
                  </div>
                )}
                <p className="text-xs text-themeLightGray font-medium">
                  F:{formatDateTimeISO(lead.followUpNextDate, "date") || ""}
                </p>
              </div>
            )}
          </div>
        </div>

        {isAssigned && (
          <p className="text-xs text-white absolute -bottom-0 left-1/2 -translate-x-1/2 bg-green-500 rounded-t-md overflow-hidden px-2">
            Assigned
          </p>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog
        header="Confirm Delete"
        visible={deleteModal}
        style={{ width: "400px" }}
        onHide={() => setDeleteModal(false)}
        className="font-inter"
      >
        <div className="space-y-4 pt-2">
          <p>
            Are you sure you want to delete this lead for{" "}
            <strong>{lead.company}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setDeleteModal(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg"
            >
              Delete
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
