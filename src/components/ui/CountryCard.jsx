import ReactCountryFlag from "react-country-flag";

export default function CountryCard(props) {
  const { countryName, countryCode } = props;
  return (
    <div className="p-4 space-y-6 rounded-xl border border-tabBorderColor border-opacity-60 shadow-tabShadow bg-themeTab font-inter">
      <div className="flex items-center gap-x-2">
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
        <p className="font-semibold text-xl">{countryName}</p>
      </div>
      <p className="flex items-center justify-between font-normal">
        <span>Cities</span> <span>12</span>
      </p>
    </div>
  );
}
