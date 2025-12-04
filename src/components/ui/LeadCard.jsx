import React, { useState } from "react";
import { MdAdd, MdEdit, MdArrowForward, MdArrowBack, MdDelete } from "react-icons/md";
import { useRouter } from "next/navigation";
import { leadsAPI } from "@/utilities/LeadsAPI";
import { success_toaster, error_toaster } from "@/utilities/Toaster";
import { Dialog } from "primereact/dialog";

export default function LeadCard({ lead, onStatusChange, onDelete, onEdit }) {
  const router = useRouter();
  const [deleteModal, setDeleteModal] = useState(false);

  // Define the pipeline stages in order
  const pipelineStages = [
    "New Enquiry",
    "Contacted",
    "Quoted",
    "Demo/Scheduled",
    "Negotiation",
    "Nurture",
    "WON",
    "LOST"
  ];

  // Function to move lead to next stage
  const moveToNextStage = async (e) => {
    e.stopPropagation();
    
    // Find current stage index
    const currentIndex = pipelineStages.indexOf(lead.status);
    
    // If already at the last stage, don't proceed
    if (currentIndex === -1 || currentIndex === pipelineStages.length - 1) {
      error_toaster("Lead is already at the final stage");
      return;
    }
    
    // Get next stage
    const nextStage = pipelineStages[currentIndex + 1];
    
    try {
      const response = await leadsAPI.updateLead(lead.id, {
        status: nextStage,
      });
      
      if (response?.data?.success || response?.success) {
        success_toaster(`Lead moved to ${nextStage}`);
        // Notify parent component to refresh data
        if (onStatusChange) {
          onStatusChange();
        }
      } else {
        error_toaster(response?.message || "Failed to move lead");
      }
    } catch (error) {
      error_toaster("Failed to move lead");
    }
  };

  // Function to move lead to previous stage
  const moveToPreviousStage = async (e) => {
    e.stopPropagation();
    
    // Find current stage index
    const currentIndex = pipelineStages.indexOf(lead.status);
    
    // If already at the first stage, don't proceed
    if (currentIndex === -1 || currentIndex === 0) {
      error_toaster("Lead is already at the initial stage");
      return;
    }
    
    // Get previous stage
    const previousStage = pipelineStages[currentIndex - 1];
    
    try {
      const response = await leadsAPI.updateLead(lead.id, {
        status: previousStage,
      });
      
      if (response?.data?.success || response?.success) {
        success_toaster(`Lead moved to ${previousStage}`);
        // Notify parent component to refresh data
        if (onStatusChange) {
          onStatusChange();
        }
      } else {
        error_toaster(response?.message || "Failed to move lead");
      }
    } catch (error) {
      error_toaster("Failed to move lead");
    }
  };

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
        onClick={() => router.push(`/leads/${lead.id}`)}
        className="bg-white p-4 rounded-xl shadow-sm border border-borderColor mb-3 hover:shadow-md transition-all duration-200 group cursor-pointer relative"
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-themeBlue font-bold text-sm hover:underline">
            {lead.machineName}
          </h3>
          <div className="flex space-x-1 text-themeLightGray opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button 
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
            <button 
              className="hover:text-themeDark p-1 rounded hover:bg-themeGray"
              onClick={(e) => { 
                e.stopPropagation();
                setDeleteModal(true);
              }}
            >
              <MdDelete size={16} />
            </button>
            <button
              className="hover:text-themeDark p-1 rounded hover:bg-themeGray"
              onClick={moveToPreviousStage}
            >
              <MdArrowBack size={16} />
            </button>
            <button
              className="hover:text-themeDark p-1 rounded hover:bg-themeGray"
              onClick={moveToNextStage}
            >
              <MdArrowForward size={16} />
            </button>
          </div>
        </div>
        <div className="mb-1">
          <p className="font-semibold text-themeDark text-sm">{lead.company}</p>
          <p className="text-xs text-themeLightGray font-medium">{lead.role}</p>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog
        header="Confirm Delete"
        visible={deleteModal}
        style={{ width: '400px' }}
        onHide={() => setDeleteModal(false)}
        className="font-inter"
      >
        <div className="space-y-4 pt-2">
          <p>Are you sure you want to delete this lead for <strong>{lead.company}</strong>? This action cannot be undone.</p>
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