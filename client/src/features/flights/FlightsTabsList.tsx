"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { TabItem } from "@/shared/ui/tabItem";

const TABS = [
  { label: "Cheapest", sortBy: "price", sortOrder: "asc" },
  { label: "Fastest", sortBy: "duration", sortOrder: "asc" },
  { label: "Earliest", sortBy: "departure", sortOrder: "asc" },
];

export default function FlightsTabsList({ className }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sortBy") ?? "price";

  const handleSort = (sortBy: string, sortOrder: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    router.push(`/flights?${params.toString()}`);
  };

  return (
    <div
      className={`py-4 px-6 min-h-20 grid grid-cols-3 items-center gap-y-10 gap-x-6 bg-surface rounded-2xl border border-[#D7E2EE] ${className}`}
    >
      {TABS.map((tab, index) => (
        <div
          key={tab.label}
          onClick={() => handleSort(tab.sortBy, tab.sortOrder)}
          className={`cursor-pointer ${index !== TABS.length - 1 ? "pr-6 border-r border-[#D7E2EE]" : ""}`}
        >
          <TabItem label={tab.label} isActive={currentSort === tab.sortBy} />
        </div>
      ))}
    </div>
  );
}
