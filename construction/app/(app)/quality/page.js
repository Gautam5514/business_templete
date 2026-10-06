"use client";
import { ClipboardCheck } from "lucide-react";
import { PageHead } from "@/components/ui/ui";
import { QualitySection } from "@/components/quality/Quality";
export default function Quality() { return <div><PageHead icon={ClipboardCheck} title="Quality" sub="Inspections, snags and rework across all sites." /><QualitySection /></div>; }
