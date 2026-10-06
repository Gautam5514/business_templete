import { Suspense } from "react";
import { Employees } from "@/components/company/Employees";
import { PageSkeleton } from "@/components/ui/ui";

export default function Page() {
  return <Suspense fallback={<PageSkeleton />}><Employees /></Suspense>;
}
