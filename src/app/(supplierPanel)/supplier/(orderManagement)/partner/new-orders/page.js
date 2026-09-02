import { redirect } from "next/navigation";

export default function PartnerNewOrdersRedirect() {
  redirect("/supplier/assigned-orders");
}
