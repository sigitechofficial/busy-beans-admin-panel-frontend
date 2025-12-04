import React from "react";

/**
 * Reusable Lead CTA Buttons Component
 * Provides consistent styling and functionality for lead action buttons
 */
const LeadCTAButtons = ({
  onUpdateStage,
  onMarkWon,
  onMarkLost,
  stageButtonText = "Update Stage",
  wonButtonText = "Mark Won",
  lostButtonText = "Mark Lost",
  className = "",
}) => {
  return (
    <div className={`flex justify-end items-center gap-3 mb-4 ${className}`}>
      <button
        onClick={onUpdateStage}
        className="bg-[#1E293B] text-white px-4 py-2 lg:px-6 lg:py-3 lg:text-sm rounded-lg font-medium text-xs hover:bg-black transition-colors"
      >
        {stageButtonText}
      </button>
      <button
        onClick={onMarkWon}
        className="bg-white border border-gray-300 text-gray-700 px-4 py-2 lg:px-6 lg:py-3 lg:text-sm rounded-lg font-medium text-xs hover:bg-gray-50 transition-colors flex items-center gap-2"
      >
        <span className="text-green-600">✓</span> {wonButtonText}
      </button>
      <button
        onClick={onMarkLost}
        className="bg-red-500 text-white px-4 py-2 lg:px-6 lg:py-3 lg:text-sm rounded-lg font-medium text-xs hover:bg-red-600 transition-colors flex items-center gap-2"
      >
        <span>✕</span> {lostButtonText}
      </button>
    </div>
  );
};

export default LeadCTAButtons;