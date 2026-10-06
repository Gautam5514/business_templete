"use client";
import { ShoppingCart } from "lucide-react";
import { PageHead } from "@/components/ui/ui";
import { MrTable, PoTable, ProcFlow, ProcStats, SupplierCompare } from "@/components/procurement/Procurement";
export default function Procurement() {
  return (
    <div className="space-y-5">
      <PageHead icon={ShoppingCart} title="Procurement command center" sub="From material request to site store — every request, quote, PO and delivery in one place." />
      <ProcStats /><ProcFlow /><SupplierCompare />
      <div className="grid gap-5 2xl:grid-cols-[1fr_1.3fr]"><MrTable /><PoTable /></div>
    </div>
  );
}
