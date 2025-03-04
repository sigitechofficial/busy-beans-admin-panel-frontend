export default function HomeCards(props) {
  const { Icon } = props;
  return (
    <div
      title={props?.description}
      className={`${props.bgColor} p-3 2xl:p-5 shadow-textShadow rounded-xl border border-white`}
    >
      <div className="flex flex-col gap-y-4">
        <div
          className={`flex justify-center items-center ${props.iconBg} h-12 w-12 rounded-xl`}
        >
          <Icon size={24} color={props.iconColor} />
        </div>
        <h2 className="text-secondary font-inter">{props.title}</h2>
        <p className="text-dark text-xl 2xl:text-3xl font-inter font-semibold">
          {props?.title?.toLowerCase()?.includes("revenue")
            ? `${props?.currecncyunit ? props?.currecncyunit:'£'}${(parseFloat(props?.total))?.toFixed(2)}`
            : props?.total}
        </p>
      </div>
    </div>
  );
}
