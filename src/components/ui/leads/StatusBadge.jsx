import React from "react";

/**
 * StatusBadge Component
 * Displays a colored badge based on lead status
 */
export default function StatusBadge({ status, className = "" }) {
  const getStatusStyles = () => {
    switch (status) {
      case 'WON':
        return 'bg-green-500 text-white';
      case 'LOST':
        return 'bg-red-500 text-white';
      case 'New Enquiry':
        return 'bg-blue-500 text-white';
      case 'Contacted':
        return 'bg-purple-500 text-white';
      case 'Quoted':
        return 'bg-yellow-500 text-white';
      case 'Demo/Scheduled':
        return 'bg-indigo-500 text-white';
      case 'Negotiation':
        return 'bg-orange-500 text-white';
      case 'Nurture':
        return 'bg-teal-500 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  return (
    <span className={`px-4 py-1.5 rounded-full text-sm font-medium uppercase tracking-wide ${getStatusStyles()} ${className}`}>
      {status}
    </span>
  );
}
