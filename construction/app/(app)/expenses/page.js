"use client";
import { Wallet } from "lucide-react";
import { PageHead } from "@/components/ui/ui";
import { ExpensesSection } from "@/components/finance/Misc";
export default function Expenses() { return <div><PageHead icon={Wallet} title="Expenses & petty cash" sub="Site expenses with receipts, and site-wise petty cash balances." /><ExpensesSection /></div>; }
