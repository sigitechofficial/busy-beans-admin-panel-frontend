import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

export default function ZoneEditTab(props) {
  const { name, id } = props;
  return (
    <div className="flex items-start justify-between p-4 bg-themeTab border border-tabBorderColor border-opacity-60 rounded-xl font-inter font-semibold text-xl">
      <p className="break-word">{name}</p>
      <div className="space-x-2 min-w-16 flex justify-end">
        <button onClick={() => props?.handleEditTerritory("edit")}>
          <FaEdit size={24} />
        </button>
        <button
          className="border border-red-400 rounded-md text-red-400"
          onClick={() => props?.handleDeleteCity(id, "deleteTerritory")}
        >
          <MdDelete size={24} />
        </button>
      </div>
    </div>
  );
}
