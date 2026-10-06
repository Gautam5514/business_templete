import { Suspense } from "react";
import { OrdersList } from "@/components/orders/OrdersList";
import { PageSkeleton } from "@/components/ui/ui";

export default function Page() {
  return <Suspense fallback={<PageSkeleton />}><OrdersList /></Suspense>;
}
