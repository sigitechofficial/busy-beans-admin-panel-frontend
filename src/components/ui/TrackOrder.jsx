import TrackOrderTab from "./TrackOrderTab";

export default function TrackOrder() {
  return (
    <div className="grid grid-cols-4 relative">
      <div className="border-2 border-dashed absolute w-[75%] ml-[12.5%] border-dottedLine/40 top-4 z-10"></div>
      <TrackOrderTab heading="Order Create" status={true} time={"09:30pm"} />
      <TrackOrderTab heading="Order Confirm" status={true} time={"09:30pm"} />
      <TrackOrderTab heading="On the way" status={false} time={"09:30pm"} />
      <TrackOrderTab heading="Delivered" status={false} time={"09:30pm"} />
    </div>
  );
}
