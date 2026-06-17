"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Plane,
    Hotel,
    BookOpen,
    Users,
    LogOut,
} from "lucide-react";
import { useAppSelector } from "@shared/lib/hooks/redux";
import { cn } from "@shared/lib/utils";

const NAV = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Flights", href: "/admin/flights", icon: Plane },
    { label: "Hotels", href: "/admin/hotels", icon: Hotel },
    { label: "Bookings", href: "/admin/bookings", icon: BookOpen },
    { label: "Users", href: "/admin/users", icon: Users },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const user = useAppSelector((state) => state.authReducer.user);

    useEffect(() => {
        if (user && user.role !== "ADMIN") {
            router.replace("/");
        }
    }, [user, router]);

    const isActive = (href: string) =>
        pathname === href || (href !== "/admin" && pathname.startsWith(href));

    return (
        <div className="flex min-h-screen bg-background">
            {/* ── Desktop sidebar ──────────────────────────────── */}
            <aside className="hidden md:flex w-60 shrink-0 bg-surface border-r border-[#D7E2EE] flex-col">
                <div className="px-6 py-5 border-b border-[#D7E2EE]">
                    <p className="text-xs font-semibold text-foreground-muted uppercase tracking-widest mb-0.5">
                        Golobe
                    </p>
                    <p className="font-bold text-lg">Admin Panel</p>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {NAV.map(({ label, href, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                                isActive(href)
                                    ? "bg-primary text-foreground-static"
                                    : "text-foreground-muted hover:bg-background hover:text-foreground",
                            )}
                        >
                            <Icon size={16} strokeWidth={1.5} />
                            {label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-[#D7E2EE]">
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground-muted hover:bg-red-50 hover:text-destructive transition-all"
                    >
                        <LogOut size={16} strokeWidth={1.5} />
                        Back to site
                    </Link>
                </div>
            </aside>

            {/* ── Content ──────────────────────────────────────── */}
            <main className="flex-1 overflow-auto pb-20 md:pb-0">
                <div className="py-6 md:pl-8">{children}</div>
            </main>

            {/* ── Mobile bottom nav ────────────────────────────── */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-[#D7E2EE] flex items-center">
                {NAV.map(({ label, href, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className={cn(
                            "flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors",
                            isActive(href)
                                ? "text-foreground bg-primary/10"
                                : "text-foreground-muted",
                        )}
                    >
                        <Icon
                            size={20}
                            strokeWidth={1.5}
                            className={isActive(href) ? "text-primary" : ""}
                        />
                        {label}
                    </Link>
                ))}
                <Link
                    href="/"
                    className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium text-foreground-muted"
                >
                    <LogOut size={20} strokeWidth={1.5} />
                    Exit
                </Link>
            </nav>
        </div>
    );
}
