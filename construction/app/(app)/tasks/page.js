"use client";
import { CheckSquare } from "lucide-react";
import { PageHead } from "@/components/ui/ui";
import { TasksSection } from "@/components/finance/Misc";
export default function Tasks() { return <div><PageHead icon={CheckSquare} title="Tasks" sub="Assigned work across all sites — switch between list and board." /><TasksSection /></div>; }
