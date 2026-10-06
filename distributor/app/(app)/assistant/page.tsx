"use client";
import { AskPanel } from "@/components/ai/AskPanel";
import { PageHeader } from "@/components/ui/ui";

export default function Page() {
  return (
    <div className="space-y-4">
      <PageHeader title="AI Business Assistant" sub="Ask your business — answers come straight from live orders, stock, dispatches and payments." />
      <div className="h-[calc(100vh-190px)] min-h-[480px] overflow-hidden rounded-[8px] border border-line bg-bg"><AskPanel full /></div>
    </div>
  );
}
