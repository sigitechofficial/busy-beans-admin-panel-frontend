import TrackOrderTab from "./TrackOrderTab";

export default function TrackOrder() {
  return (
    <div className="flex justify-between flex-nowrap gap-x-4 relative">
      <div className="border-2 border-dashed absolute w-[85%] ml-[8%] border-dottedLine/40 top-4 z-10"></div>
      <TrackOrderTab heading="Order Placed" status={true} time={"09:30pm"} />
      <TrackOrderTab heading="Order Confirmed" status={false} time={"09:30pm"} />
      <TrackOrderTab heading="Supplier Acknowledged" status={false} time={"09:30pm"} />
      <TrackOrderTab heading="Dispatched Orders" status={false} time={"09:30pm"} />
      <TrackOrderTab heading="Delivered Order" status={false} time={"09:30pm"} />
      <TrackOrderTab heading="Cancelled Order" status={false} time={"09:30pm"} />
    </div>
  );
}
