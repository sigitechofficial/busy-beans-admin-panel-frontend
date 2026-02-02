import { useDataContext } from "@/utilities/DataContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ListItems(props) {
  const pathName = usePathname();
  const { setToggle } = useDataContext();

  const handleLinkClick = () => {
    setToggle(false);
  };

  return (
    <Link
      onClick={handleLinkClick}
      data-testid={props["data-testid"]}
      className={`flex gap-x-2 justify-between items-center min-h-[44px] py-3 px-3 rounded-lg font-inter font-medium text-themeLightGray hover:bg-theme hover:text-white active:scale-[0.98] duration-200 touch-manipulation
        md:min-h-0 md:py-2 md:px-2
    ${
      pathName === props.to || props.active
        ? "bg-theme text-white"
        : "bg-transparent text-black"
    }`}
      href={props.to}
    >
      <p>{props.title}</p>
      <span>{props.count || ""}</span>
    </Link>
  );
}
