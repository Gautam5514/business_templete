"use client";
import { Banknote } from "lucide-react";
import { PageHead } from "@/components/ui/ui";
import { PaymentsSection } from "@/components/finance/Billing";
export default function Payments() { return <div><PageHead icon={Banknote} title="Payments" sub="Money received from clients and paid to vendors." /><PaymentsSection /></div>; }
