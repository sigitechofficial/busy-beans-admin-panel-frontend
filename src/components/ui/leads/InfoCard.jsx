import React from "react";

/**
 * InfoCard Component
 * Reusable card for displaying categorized information
 */
export default function InfoCard({ title, children, action }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        {action && (
          <button 
            onClick={action.onClick}
            className="text-xs text-theme hover:underline"
          >
            {action.label}
          </button>
        )}
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}

/**
 * InfoItem Component
 * Individual info item with icon and text
 */
export function InfoItem({ icon: Icon, label, value, className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {Icon && <div className="text-gray-400"><Icon size={16} /></div>}
      {label ? (
        <div>
          <p className="text-sm font-medium text-gray-900">{label}</p>
          {value && <p className="text-sm text-gray-500">{value}</p>}
        </div>
      ) : (
        <p className="text-sm text-gray-900">{value}</p>
      )}
    </div>
  );
}
