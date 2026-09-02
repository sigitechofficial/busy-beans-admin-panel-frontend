/** Merge customer + partner orders assigned to one supplier, keeping original IDs. */

export function partnerDetailBaseForStatus(statusId) {
  const id = Number(statusId);
  if (id === 2) return "/supplier/partner/new-orders";
  if (id === 3) return "/supplier/partner/acknowledged-orders";
  return "/supplier/partner/shipped-orders";
}

export function mergeSupplierOrders(
  customerOrders,
  partnerOrders,
  partnerDetailBase
) {
  const customerRows = (customerOrders || []).map((detail) => ({
    rowKey: `customer-${detail?.id}`,
    id: detail?.id,
    type: "Customer",
    companyName: detail?.companyName || detail?.customerName || "",
    noOfItems: detail?.totalQuantity ?? detail?.items?.length ?? 0,
    orderCurrentStatus: detail?.orderCurrentStatus,
    createdAt: detail?.createdAt,
    detailPath: `/supplier/order-detail/${detail?.id}`,
  }));

  const partnerRows = (partnerOrders || []).map((detail) => {
    const base =
      typeof partnerDetailBase === "function"
        ? partnerDetailBase(detail)
        : partnerDetailBase || partnerDetailBaseForStatus(detail?.statusId);
    return {
      rowKey: `partner-${detail?.id}`,
      id: detail?.id,
      type: "Partner",
      companyName: detail?.salesRepName || detail?.companyName || "",
      noOfItems: detail?.totalQuantity ?? detail?.items?.length ?? 0,
      orderCurrentStatus: detail?.orderCurrentStatus,
      createdAt: detail?.createdAt,
      detailPath: `${base}/${detail?.id}`,
    };
  });

  return [...customerRows, ...partnerRows].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (dateB !== dateA) return dateB - dateA;
    return Number(b.id) - Number(a.id);
  });
}

export function supplierNavCount(customerCounts, partnerCounts, statusIndex) {
  const customer = Number(customerCounts?.[statusIndex]?.count) || 0;
  const partner = Number(partnerCounts?.[statusIndex]?.count) || 0;
  const total = customer + partner;
  return total || "";
}

export function supplierNavTotal(customerCounts, partnerCounts) {
  const sum = (rows) =>
    (rows || []).reduce((acc, row) => acc + (Number(row?.count) || 0), 0);
  const total = sum(customerCounts) + sum(partnerCounts);
  return total || "";
}
