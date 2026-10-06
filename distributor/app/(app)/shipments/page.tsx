import { Suspense } from "react";
import { ShipmentsList } from "@/components/dispatch/Shipments";
import { PageSkeleton } from "@/components/ui/ui";

export default function Page() {
  return <Suspense fallback={<PageSkeleton />}><ShipmentsList /></Suspense>;
}
