"use client";
import { CalendarRange } from "lucide-react";
import { Card, PageHead } from "@/components/ui/ui";
import { CriticalPath, Gantt, MilestoneTimeline } from "@/components/projects/Timeline";
export default function Planning() {
  return (
    <div className="space-y-5">
      <PageHead icon={CalendarRange} title="Planning" sub="Project → phase → milestone → activity → task. Critical-path activities are in red; dependencies show how one delay flows into the next." eyebrow="Skyline Residency" />
      <Card title="Milestones"><MilestoneTimeline /></Card>
      <Gantt />
      <CriticalPath />
    </div>
  );
}
