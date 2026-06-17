"use client";

import { useEffect, useState } from "react";
import { Plane, Hotel, BookOpen, Users, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";
import { adminApi } from "@features/dashboard/api/adminApi";
import { cn } from "@shared/lib/utils";

interface Stats {
  users: number; flights: number; hotels: number;
  bookings: { total: number; confirmed: number; pending: number; cancelled: number };
  revenue: number;
  recentBookings: any[];
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getStats()
      .then((r) => { setStats(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-4">{Array.from({length:4}).map((_,i)=><div key={i} className="h-28 bg-surface rounded-2xl animate-pulse"/>)}</div>;
  if (!stats)  return null;

  const cards = [
    { label: "Total Users",    value: stats.users,            icon: Users,    color: "text-blue-500",   bg: "bg-blue-50 dark:bg-blue-950"   },
    { label: "Total Flights",  value: stats.flights,          icon: Plane,    color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950"},
    { label: "Total Hotels",   value: stats.hotels,           icon: Hotel,    color: "text-amber-500",  bg: "bg-amber-50 dark:bg-amber-950"  },
    { label: "Total Bookings", value: stats.bookings.total,   icon: BookOpen, color: "text-primary",    bg: "bg-primary-muted"               },
    { label: "Revenue",        value: `$${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-foreground-muted text-sm mt-1">Overview of your platform</p>
      </div>

      {/* Stat cards — 2 cols mobile, last card full-width if odd */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {cards.map(({ label, value, icon: Icon, color, bg }, i) => (
          <div
            key={label}
            className={cn(
              "bg-surface rounded-2xl border border-[#D7E2EE] p-4 overflow-hidden",
              i === cards.length - 1 && cards.length % 2 !== 0 && "col-span-2 lg:col-span-1",
            )}
          >
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3 shrink-0", bg)}>
              <Icon size={18} className={color} strokeWidth={1.5} />
            </div>
            <p className="text-2xl font-bold truncate">{value}</p>
            <p className="text-xs text-foreground-muted mt-0.5 truncate">{label}</p>
          </div>
        ))}
      </div>

      {/* Booking status */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Confirmed", value: stats.bookings.confirmed, icon: CheckCircle, color: "text-green-500",   bg: "bg-green-50" },
          { label: "Pending",   value: stats.bookings.pending,   icon: Clock,       color: "text-amber-500",   bg: "bg-amber-50" },
          { label: "Cancelled", value: stats.bookings.cancelled, icon: XCircle,     color: "text-destructive", bg: "bg-red-50"   },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-surface rounded-2xl border border-[#D7E2EE] p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <Icon size={20} className={cn(color, "shrink-0 mb-1 sm:mb-0 sm:w-7 sm:h-7")} strokeWidth={1.5} />
            <div>
              <p className="text-lg sm:text-xl font-bold leading-tight">{value}</p>
              <p className="text-[11px] sm:text-sm text-foreground-muted leading-tight">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent bookings */}
      <div className="bg-surface rounded-2xl border border-[#D7E2EE]">
        <div className="px-6 py-4 border-b border-[#D7E2EE]">
          <h2 className="font-semibold">Recent Bookings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#D7E2EE]">
                {["User", "Type", "Destination", "Total", "Status", "Date"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-foreground-muted uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.recentBookings.map((b) => {
                const dest = b.type === "FLIGHT"
                  ? `${b.flightBooking?.flight?.departureAirport?.iata} → ${b.flightBooking?.flight?.arrivalAirport?.iata}`
                  : b.hotelBooking?.room?.hotel?.name ?? "—";
                return (
                  <tr key={b.id} className="border-b border-[#D7E2EE] last:border-0 hover:bg-background transition-colors">
                    <td className="px-6 py-4">{b.user.firstName} {b.user.lastName}</td>
                    <td className="px-6 py-4"><TypeBadge type={b.type} /></td>
                    <td className="px-6 py-4 font-medium">{dest}</td>
                    <td className="px-6 py-4 font-semibold">${Number(b.totalPrice).toFixed(2)}</td>
                    <td className="px-6 py-4"><StatusBadge status={b.status} /></td>
                    <td className="px-6 py-4 text-foreground-muted">{new Date(b.createdAt).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium px-2.5 py-1 rounded-full", type === "FLIGHT" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700")}>
      {type === "FLIGHT" ? "✈ Flight" : "🏨 Hotel"}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    CONFIRMED: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
    PENDING:   "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    CANCELLED: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  };
  return <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", map[status])}>{status}</span>;
}
