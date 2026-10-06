"use client";
import { Activity } from "lucide-react";
import { PageHead } from "@/components/ui/ui";
import { ActivitySection } from "@/components/finance/Misc";
export default function ActivityPage() { return <div><PageHead icon={Activity} title="Activity" sub="Who did what, when — across every project." /><ActivitySection /></div>; }
