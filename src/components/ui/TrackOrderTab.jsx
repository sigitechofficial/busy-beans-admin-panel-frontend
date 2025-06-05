import { FaCheck } from "react-icons/fa";

export default function TrackOrderTab(props) {
  const { heading, status, time } = props;
  return (
    <div className="flex flex-col items-center gap-y-2 font-switzer relative z-20">
      <div
        className={`${
          status ? "bg-themeGreen" : "bg-themeGray3"
        } size-8 rounded-full flex items-center justify-center`}
      >
        <FaCheck color="#FFFFFF" size={20} />
      </div>
      <p className="text-center">{heading}</p>
      <p className="text-black text-opacity-40">{time}</p>
    </div>
  );
}
