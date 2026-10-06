"use client";
import { PackageSearch } from "lucide-react";
import { PageHead } from "@/components/ui/ui";
import { MaterialsSection, MovementTimeline } from "@/components/materials/Materials";
import { Card } from "@/components/ui/ui";
export default function Materials() {
  return (
    <div className="space-y-5">
      <PageHead icon={PackageSearch} title="Materials" sub="What was purchased, what reached site, what was consumed, and what is left — with days of stock remaining." />
      <MaterialsSection />
      <Card title="Latest delivery trace"><MovementTimeline /></Card>
    </div>
  );
}
