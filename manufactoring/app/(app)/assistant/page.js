"use client";
import { AskPanel } from "@/components/shell/AskPanel";
import { PageHeader } from "@/components/ui/ui";

export default function Assistant() {
  return (
    <div>
      <PageHeader title="AI Factory Assistant" sub="Ask in plain language — answers are drawn from live production, material, machine, quality and order data." />
      <div className="mx-auto h-[calc(100vh-190px)] min-h-[520px] max-w-[860px] overflow-hidden rounded-[10px] border border-line bg-bg"><AskPanel full /></div>
    </div>
  );
}
