"use client";
import { Warehouse } from "lucide-react";
import { PageHead } from "@/components/ui/ui";
import { GateEntry, InventorySection } from "@/components/materials/Inventory";
export default function Inventory() { return <div className="space-y-5"><PageHead icon={Warehouse} title="Site inventory" sub="Store ledgers and gate entries for every site." /><InventorySection /><GateEntry /></div>; }
