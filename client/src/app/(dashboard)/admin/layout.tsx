"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Plane, Hotel, BookOpen, Users, LogOut } from "lucide-react";
import { cn } from "@shared/lib/utils";

const NAV = [
  { label: "Dashboard",  href: "/admin",          icon: LayoutDashboard },
  { label: "Flights",    href: "/admin/flights",   icon: Plane },
  { label: "Hotels",     href: "/admin/hotels",    icon: Hotel },
  { label: "Bookings",   href: "/admin/bookings",  icon: BookOpen },
  { label: "Users",      href: "/admin/users",     icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-surface border-r border-[#D7E2EE] flex flex-col">
        <div className="px-6 py-5 border-b border-[#D7E2EE]">
          <p className="text-xs font-semibold text-foreground-muted uppercase tracking-widest mb-0.5">NazAIRo</p>
          <p className="font-bold text-lg">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  active
                    ? "bg-primary text-foreground-static"
                    : "text-foreground-muted hover:bg-background hover:text-foreground",
                )}
              >
                <Icon size={16} strokeWidth={1.5} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#D7E2EE]">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground-muted hover:bg-background hover:text-foreground transition-all">
            <LogOut size={16} strokeWidth={1.5} />
            Back to site
          </Link>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
