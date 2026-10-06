"use client";
import { Hammer } from "lucide-react";
import { PageHead, Card, Flow } from "@/components/ui/ui";
import { ContractorBills, ContractorsSection, WorkOrder } from "@/components/site/Contractors";
import { CBILL_FLOW } from "@/data/ops";
export default function Contractors() {
  return (
    <div className="space-y-5">
      <PageHead icon={Hammer} title="Contractors" sub="64 subcontractors · who is working where, what they have executed, and what we owe them." />
      <ContractorsSection />
      <Card title="Contractor bill approval flow"><Flow steps={CBILL_FLOW} current={4} /></Card>
      <ContractorBills />
      <Card title="Sample work order"><WorkOrder /></Card>
    </div>
  );
}
