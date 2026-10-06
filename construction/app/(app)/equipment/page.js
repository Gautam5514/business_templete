"use client";
import { Truck } from "lucide-react";
import { PageHead } from "@/components/ui/ui";
import { EquipmentSection } from "@/components/site/Equipment";
export default function Equipment() { return <div><PageHead icon={Truck} title="Equipment" sub="Cranes, excavators, mixers, DG sets and vehicles — live status, runtime and cost." /><EquipmentSection /></div>; }
