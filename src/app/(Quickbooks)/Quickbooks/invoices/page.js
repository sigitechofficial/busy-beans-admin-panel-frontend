import { Suspense } from "react";
import Loader from "@/components/ui/Loader";
import InvoicesPage from "./InvoicesPage";

export default function Page() {
  return (
    <Suspense fallback={<Loader />}>
      <InvoicesPage />
    </Suspense>
  );
}
