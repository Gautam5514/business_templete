import { Suspense } from "react";
import { Reports } from "@/components/reports/Reports";
import { PageSkeleton } from "@/components/ui/ui";

export default function Page() {
  return <Suspense fallback={<PageSkeleton />}><Reports /></Suspense>;
}
