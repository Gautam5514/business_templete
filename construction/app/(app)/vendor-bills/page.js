"use client";
import { FileSignature } from "lucide-react";
import { PageHead } from "@/components/ui/ui";
import { VendorBillsSection } from "@/components/finance/Billing";
import { ContractorBills } from "@/components/site/Contractors";
export default function VendorBills() { return <div className="space-y-5"><PageHead icon={FileSignature} title="Vendor bills" sub="What we owe suppliers and contractors — due this week, overdue and retention." /><VendorBillsSection /><ContractorBills /></div>; }
