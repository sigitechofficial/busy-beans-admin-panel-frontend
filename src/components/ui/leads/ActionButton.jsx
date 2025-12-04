import React from "react";

/**
 * ActionButton Component
 * Reusable styled button for actions
 */
export default function ActionButton({ 
  children, 
  onClick, 
  variant = "primary", 
  icon: Icon,
  className = "" 
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-[#1E293B] text-white hover:bg-black';
      case 'success':
        return 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50';
      case 'danger':
        return 'bg-red-500 text-white hover:bg-red-600';
      case 'outline':
        return 'bg-white border border-theme text-theme hover:bg-theme hover:text-white';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    }
  };

  return (
    <button 
      onClick={onClick}
      className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${getVariantStyles()} ${className}`}
    >
      {Icon && <Icon />}
      {children}
    </button>
  );
}
