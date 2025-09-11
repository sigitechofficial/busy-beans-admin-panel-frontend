import ReactCountryFlag from "react-country-flag";

export default function ManagementTab({ title, desc, countryCode, ...rest }) {
  return (
    <div
      {...rest}
      className="p-5 space-y-8 font-inter font-medium text-lg bg-themeTab border border-tabBorderColor shadow-tabShadow rounded-xl"
    >
      <ReactCountryFlag
        countryCode={countryCode}
        svg
        style={{
          width: "",
          height: "1.3em",
          borderRadius: "4px",
        }}
        title="US"
      />
      <p>{title}</p>
      <p>{desc}</p>
    </div>
  );
}
