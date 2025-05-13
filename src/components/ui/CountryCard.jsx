import Link from "next/link";
import ReactCountryFlag from "react-country-flag";
import { MdDelete } from "react-icons/md";

export default function CountryCard(props) {
  const { countryName, countryCode, setModal, setCountryID, id } = props;
  return (
    <div
      className=" p-4 space-y-6 rounded-xl border border-tabBorderColor border-opacity-60 shadow-tabShadow bg-themeTab font-inter"
    >
      <Link href={`/countries/${id}/state`}>
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
        
      </Link>
      
      <div className="flex justify-end">
          <button
            className="border border-red-400 rounded-md p-2 text-red-400"
            onClick={() => {
              setModal("delete");
              setCountryID(id);
            }}
          >
            <MdDelete size={24} />
          </button>
        </div>
    </div>
  );
}
