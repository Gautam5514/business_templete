import { Suspense } from "react";
import { DispatchList } from "@/components/dispatch/Dispatch";
import { PageSkeleton } from "@/components/ui/ui";

export default function Page() {
  return <Suspense fallback={<PageSkeleton />}><DispatchList /></Suspense>;
}
