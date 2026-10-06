"use client";
import { FileStack } from "lucide-react";
import { PageHead } from "@/components/ui/ui";
import { DocumentsSection } from "@/components/finance/Misc";
export default function Documents() { return <div><PageHead icon={FileStack} title="Documents" sub="Contracts, drawings, approvals — with revision control so nobody builds from an outdated drawing." /><DocumentsSection /></div>; }
