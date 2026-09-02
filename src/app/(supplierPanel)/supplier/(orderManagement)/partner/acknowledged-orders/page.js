import { redirect } from "next/navigation";

export default function PartnerAcknowledgedOrdersRedirect() {
  redirect("/supplier/acknowledge-orders");
}
