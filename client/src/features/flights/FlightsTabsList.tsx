"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { TabItem } from "@/shared/ui/tabItem";

const TABS = [
  { label: "Cheapest", href: "/cheapest" },
  { label: "Best", href: "/account/best" },
  { label: "Quickest", href: "/account/quickest" },
];

export default function TabsList({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <div
      className={`py-4 px-6 min-h-20 grid grid-cols-3 items-center gap-y-10 gap-x-6 bg-surface rounded-2xl ${className}`}
    >
      {TABS.map((tab, index) => {
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`${index !== TABS.length - 1 && "pr-6 border-r border-[#D7E2EE]"}`}
          >
            <TabItem label={tab.label} isActive={pathname === tab.href} />
          </Link>
        );
      })}
    </div>
  );
}
