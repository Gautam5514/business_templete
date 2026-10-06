"use client";
import { Camera } from "lucide-react";
import { PageHead } from "@/components/ui/ui";
import { PhotoGallery, ProgressCompare } from "@/components/site/Photos";
export default function Photos() { return <div className="space-y-5"><PageHead icon={Camera} title="Photo progress" sub="Every site photo tagged by date, tower, floor, activity and contractor." /><ProgressCompare /><PhotoGallery /></div>; }
