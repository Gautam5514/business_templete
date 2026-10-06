"use client";
import { useState } from "react";
import { BookOpenCheck } from "lucide-react";
import { PageHead } from "@/components/ui/ui";
import { PROJECTS } from "@/data/core";
import { DprSection } from "@/components/site/Dpr";
export default function Progress() {
  const [pid, setPid] = useState("skyline");
  return (
    <div>
      <PageHead icon={BookOpenCheck} title="Daily progress" sub="The site engineer’s DPR, turned into a story the owner can read in 30 seconds." actions={<select value={pid} onChange={(e) => setPid(e.target.value)} className="h-8 rounded-[6px] border border-line-strong bg-surface px-2 text-[12.5px]">{PROJECTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>} />
      <DprSection key={pid} pid={pid} />
    </div>
  );
}
