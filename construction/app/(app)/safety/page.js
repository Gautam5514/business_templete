"use client";
import { ShieldCheck } from "lucide-react";
import { PageHead } from "@/components/ui/ui";
import { SafetySection } from "@/components/quality/Quality";
export default function Safety() { return <div><PageHead icon={ShieldCheck} title="Safety" sub="Inspections, near misses and incidents — with root cause and corrective action." /><SafetySection /></div>; }
