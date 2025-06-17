export function handleDatesForFilter(data) {
  const today = dayjs();
  if (data === "allTime") {
    return { startDate: "", endDate: "" };
  } else if (data === "currentYear") {
    return {
      startDate: today.startOf("year").format("YYYY-MM-DD"),
      endDate: today.endOf("year").format("YYYY-MM-DD"),
    };
  } else if (data === "currentMonth") {
    return {
      startDate: today.startOf("month").format("YYYY-MM-DD"),
      endDate: today.endOf("month").format("YYYY-MM-DD"),
    };
  } else if (data === "currentWeek") {
    return {
      startDate: today.startOf("week").format("YYYY-MM-DD"),
      endDate: today.endOf("week").format("YYYY-MM-DD"),
    };
  } else if (data === "lastYear") {
    return {
      startDate: today.subtract(1, "year").startOf("year").format("YYYY-MM-DD"),
      endDate: today.subtract(1, "year").endOf("year").format("YYYY-MM-DD"),
    };
  } else if (data === "last90Days") {
    return {
      startDate: today.subtract(90, "days").format("YYYY-MM-DD"),
      endDate: today.format("YYYY-MM-DD"),
    };
  } else if (data === "last14Days") {
    return {
      startDate: today.subtract(14, "days").format("YYYY-MM-DD"),
      endDate: today.format("YYYY-MM-DD"),
    };
  } else if (data === "lastMonth") {
    return {
      startDate: today
        .subtract(1, "month")
        .startOf("month")
        .format("YYYY-MM-DD"),
      endDate: today.subtract(1, "month").endOf("month").format("YYYY-MM-DD"),
    };
  } else if (data === "lastWeek") {
    return {
      startDate: today.subtract(1, "week").startOf("week").format("YYYY-MM-DD"),
      endDate: today.subtract(1, "week").endOf("week").format("YYYY-MM-DD"),
    };
  } else if (data === "previousWeek") {
    return {
      startDate: today.subtract(1, "week").startOf("week").format("YYYY-MM-DD"),
      endDate: today.subtract(1, "week").endOf("week").format("YYYY-MM-DD"),
    };
  }
}