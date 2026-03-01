"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Container } from "@shared/ui/container";
import { TabItem } from "@/shared/ui/tabItem";

const TABS = [
  { label: "Account", href: "/account" },
  { label: "History", href: "/account/history" },
  { label: "Payment methods", href: "/account/payments" },
];

export default function TabsList({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <Container>
      <div
        className={`relative py-4 px-6 h-20 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-6 bg-surface rounded-2xl ${className}`}
      >
        {TABS.map((tab) => {
          return (
            <>
              <Link key={tab.href} href={tab.href}>
                <TabItem label={tab.label} isActive={pathname === tab.href} />
              </Link>
              <div className="w-px h-full bg-[#D7E2EE] last:hidden" />
            </>
          );
        })}
      </div>
    </Container>
  );
}
