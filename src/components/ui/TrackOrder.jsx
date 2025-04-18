import TrackOrderTab from "./TrackOrderTab";

export default function TrackOrder({statusId, orderHistories}) {
  console.log("🚀 ~ TrackOrder ~ statusId:", statusId)

  
  const handleTrackOrderTab = (statusId) => {
    const result = orderHistories?.find((history) => history?.statusId === statusId)
    return result ? true:false
  }

  return (
    <div className="flex justify-between flex-nowrap gap-x-4 relative">
      <div className="border-2 border-dashed absolute w-[85%] ml-[8%] border-dottedLine/40 top-4 z-10"></div>
      <TrackOrderTab heading="Order Placed" status={handleTrackOrderTab(1)} time={"09:30pm"} />
      <TrackOrderTab heading="Order Confirmed" status={handleTrackOrderTab(2)} time={"09:30pm"} />
      <TrackOrderTab heading="Supplier Acknowledged" status={handleTrackOrderTab(3)} time={"09:30pm"} />
      <TrackOrderTab heading="Dispatched Orders" status={handleTrackOrderTab(4)} time={"09:30pm"} />
      <TrackOrderTab heading="Delivered Order" status={handleTrackOrderTab(5)} time={"09:30pm"} />
      <TrackOrderTab heading="Cancelled Order" status={handleTrackOrderTab(6)} time={"09:30pm"} />
    </div>
  );
}
