export default function HomeMiniCards(props) {
  const { Icon } = props;
  return (
    <div
      title={props?.description}
      className="border border-tabBorderColor border-opacity-60 bg-homeCards p-2.5 2xl:p-5 shadow-tabShadow rounded-xl"
    >
      <div className="flex justify-between items-start gap-y-4">
        {/* <div className="flex justify-center items-center gap-x-2"> */}
        {/* <Icon size={24} className="text-dark" /> */}
        <h2 className="text-dark font-inter font-semibold 2xl:text-lg">
          {props.title}
        </h2>
        {/* </div> */}
        <div className="text-theme 2xl:text-lg font-inter font-semibold">
          {props.total}
        </div>
      </div>
    </div>
  );
}
