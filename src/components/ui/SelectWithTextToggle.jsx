"use client";
import React, { useState, useEffect } from "react";
import Select from "react-select";
import { InputText } from "primereact/inputtext";

const SelectWithTextToggle = ({
  label,
  options = [],
  value,
  onChange,
  placeholder,
  styles,
  isDisabled,
  isClearable = false,
  className = "",
  error,
}) => {
  const [isTextMode, setIsTextMode] = useState(false);

  // If we have a value but it's not in the options, consider switching to text mode automatically?
  // Or if the value is set but options are empty?
  // For now, we will rely on manual toggle, or maybe initialize based on whether the value exists in options.
  useEffect(() => {
    // Optional: If value is present and not in options, maybe default to text mode?
    // But options might be loaded asynchronously, so be careful.
    // Let's stick to manual toggle for explicit user control as requested.
  }, []);

  const handleModeToggle = () => {
    setIsTextMode((prev) => !prev);
    // We do NOT clear the value here so the user can potentially
    // start with a selected value and then edit it if they switch to text mode (though less useful)
    // or keep the typed value if they switch back (though it might not match an option).
    // Actually, if switching to Select mode and the current text value isn't in options,
    // react-select might just show it as a custom value if we construct the object,
    // or we might want to clear it if it's invalid.
    // For simplicity and data preservation, we keep the value in the parent state.
  };

  return (
    <div className={`flex flex-col gap-y-2 ${className}`}>
      <div className="flex justify-between items-center">
        {label && <label className="font-medium text-sm text-gray-700">{label}</label>}
        <button
          type="button"
          onClick={handleModeToggle}
          disabled={isDisabled}
          className="text-xs text-theme hover:text-themeDark hover:underline focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isTextMode ? "Select from list" : "Enter custom"}
        </button>
      </div>

      {isTextMode ? (
        <InputText
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full p-2 border rounded-lg ${error ? "border-red-500" : "border-gray-300"} focus:border-theme focus:ring-0`}
          placeholder={placeholder || `Enter ${label?.replace("*", "").trim() || "value"}`}
          disabled={isDisabled}
        />
      ) : (
        <Select
          placeholder={placeholder}
          value={value ? { value: value, label: value } : null}
          options={options}
          onChange={(option) => onChange(option ? option.value : "")}
          styles={styles}
          isDisabled={isDisabled}
          isClearable={isClearable}
          classNamePrefix="react-select"
        />
      )}
      {error && <small className="text-red-500 text-xs">{error}</small>}
    </div>
  );
};

export default SelectWithTextToggle;
