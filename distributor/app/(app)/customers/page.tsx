import { Suspense } from "react";
import { CustomersList } from "@/components/customers/CustomersList";
import { PageSkeleton } from "@/components/ui/ui";

export default function Page() {
  return <Suspense fallback={<PageSkeleton />}><CustomersList /></Suspense>;
}
