import dayjs from "dayjs";
import TrackOrderTab from "./TrackOrderTab";

export default function TrackOrder({ statusId, orderHistories }) {
  const handleTrackOrderTab = (statusId) => {
    const result = orderHistories?.find(
      (history) => history?.statusId === statusId
    );
    return {
      status: !!result,
      date: result ? dayjs(result.on)?.format("DD/MM/YYYY HH:mm") : null,
    };
  };
  return (
    <div className="flex justify-between flex-nowrap gap-x-4 relative">
      <div className="border-2 border-dashed absolute w-[85%] ml-[8%] border-dottedLine/40 top-4 z-10"></div>
      <TrackOrderTab
        heading="Order Placed"
        status={handleTrackOrderTab(1)?.status}
        time={handleTrackOrderTab(1)?.date}
      />
      <TrackOrderTab
        heading="Order Confirmed"
        status={handleTrackOrderTab(2)?.status}
        time={handleTrackOrderTab(2)?.date}
      />
      <TrackOrderTab
        heading="Supplier Acknowledged"
        status={handleTrackOrderTab(3)?.status}
        time={handleTrackOrderTab(3)?.date}
      />
      <TrackOrderTab
        heading="Dispatched Orders"
        status={handleTrackOrderTab(4)?.status}
        time={handleTrackOrderTab(4)?.date}
      />
      <TrackOrderTab
        heading="Delivered Order"
        status={handleTrackOrderTab(5)?.status}
        time={handleTrackOrderTab(5)?.date}
      />
      <TrackOrderTab
        heading="Cancelled Order"
        status={handleTrackOrderTab(6)?.status}
        time={handleTrackOrderTab(6)?.date}
      />
    </div>
  );
}
