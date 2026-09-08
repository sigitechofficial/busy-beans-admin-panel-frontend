import { useDataContext } from "@/utilities/DataContext";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export default function ListItems(props) {
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const { setToggle } = useDataContext();

  const handleLinkClick = () => {
    setToggle(false);
  };

  const [toPath, toQuery] = String(props.to || "").split("?");
  const toFilter = toQuery ? new URLSearchParams(toQuery).get("filter") : null;
  const currentFilter = searchParams?.get("filter");
  const isActive =
    props.active ||
    (pathName === toPath &&
      (toFilter ? currentFilter === toFilter : !currentFilter || pathName !== "/all-invoices"));

  return (
    <Link
      onClick={handleLinkClick}
      data-testid={props["data-testid"]}
      className={`flex gap-x-2 justify-between items-center min-h-[44px] py-3 px-3 rounded-lg font-inter font-medium text-themeLightGray hover:bg-theme hover:text-white active:scale-[0.98] duration-200 touch-manipulation
        md:min-h-0 md:py-2 md:px-2
    ${
      isActive
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
