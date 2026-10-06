"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Receipt } from "lucide-react";
import { Card, Flow, PageHead } from "@/components/ui/ui";
import { ChangeOrders, MeasurementBook, RaDashboard, RaTable } from "@/components/finance/Billing";
import { CashWaterfall } from "@/components/dashboard/parts";
import { RA_FLOW } from "@/data/ops";

function Body() {
  const bill = useSearchParams().get("bill");
  return (
    <div className="space-y-5">
      <PageHead icon={Receipt} title="Client billing" sub="RA bills from measurement to payment — and what is still unbilled." />
      <RaDashboard />
      <Card title="RA bill workflow"><Flow steps={RA_FLOW} current={5} /></Card>
      <RaTable openId={bill} />
      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]"><Card title="Work done vs money received"><CashWaterfall /></Card><ChangeOrders /></div>
      <MeasurementBook />
    </div>
  );
}
export default function Billing() { return <Suspense><Body /></Suspense>; }
