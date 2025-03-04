const selectStyles = {
  control: (provided, state) => ({
    ...provided,
    background: "transparent",
    outline: "none",
    boxShadow: state.isFocused ? `0 0 0 1px lightGray` : "none",
    cursor: "pointer",
    border: "1px solid #E2E8F0",
    borderRadius: "6px",
    paddingTop: "3px",
    paddingBottom: "3px",
    outerWidth: "300px",
    "&:hover": {
      border: "1px solid #E2E8F0",
    },
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    color: state.isFocused ? "lightGray" : "lightGray",
    "&:hover": {
      color: "lightGray",
    },
  }),
};

export const selectStyles2 = {
  control: (provided, state) => ({
    ...provided,
    background: "transparent",
    outline: "none",
    boxShadow: state.isFocused ? `0 0 0 1px lightGray` : "none",
    cursor: "pointer",
    border: "1px solid #E2E8F0",
    borderRadius: "4px",
    paddingTop: "0.375rem",
    paddingBottom: "0.375rem",
    color: "#64748B",
    "&:hover": {
      border: "1px solid #E2E8F0",
    },
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#64748B",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#64748B",
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    color: state.isFocused ? "lightGray" : "lightGray",
    "&:hover": {
      color: "lightGray",
    },
  }),
};

export default selectStyles;
