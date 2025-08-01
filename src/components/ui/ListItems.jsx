import { useDataContext } from "@/utilities/DataContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ListItems(props) {
  const pathName = usePathname();
  const { toggle, setToggle } = useDataContext();
  return (
    <Link
      // onClick={() => setToggle(!toggle)}
      className={`flex gap-x-2 justify-between items-center py-2 px-2 rounded-lg font-inter font-medium text-themeLightGray hover:bg-theme hover:text-white duration-200
    ${
      pathName === props.to || props.active
        ? "bg-theme text-white"
        : "bg-transparent text-black"
    }`}
      href={props.to}
    >
      <p>{props.title}</p>
      <span>{props.count}</span>
    </Link>
  );
}
