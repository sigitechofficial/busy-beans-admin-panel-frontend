import { MdDelete } from "react-icons/md";

export default function CityCard(props) {
  const { name, id } = props;
  return (
    <div
      className={`${
        props?.delete ? "flex items-center justify-between px-4 py-4" : "p-4"
      } border border-tabBorderColor rounded-lg font-inter font-semibold text-xl`}
    >
      {name}
      {props?.delete && (
        <button
          className="border border-red-400 rounded-md p-2 text-red-400"
          onClick={() => props?.handleDeleteCity(id, "delete")}
        >
          <MdDelete size={24} />
        </button>
      )}
    </div>
  );
}
