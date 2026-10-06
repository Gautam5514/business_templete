"use client";
import { useState } from "react";
import { ListChecks } from "lucide-react";
import { PageHead, Seg } from "@/components/ui/ui";
import { PROJECTS } from "@/data/core";
import { BoqSection } from "@/components/boq/Boq";
import { BudgetSection, Profitability } from "@/components/finance/Budget";
export default function Boq() {
  const [tab, setTab] = useState("boq"), [pid, setPid] = useState("skyline");
  return (
    <div className="space-y-5">
      <PageHead icon={ListChecks} title="BOQ & Budget" sub="What was planned, what was executed, what was billed — and what it costs." actions={<>
        <select value={pid} onChange={(e) => setPid(e.target.value)} className="h-8 rounded-[6px] border border-line-strong bg-surface px-2 text-[12.5px]">{PROJECTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
        <Seg options={[{ key: "boq", label: "BOQ" }, { key: "budget", label: "Budget control" }, { key: "profit", label: "Profitability" }]} value={tab} onChange={setTab} /></>} />
      {tab === "boq" && <BoqSection pid={pid} />}{tab === "budget" && <BudgetSection pid={pid} />}{tab === "profit" && <Profitability pid={pid} />}
    </div>
  );
}
