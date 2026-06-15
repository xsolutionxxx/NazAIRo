"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@features/dashboard/api/adminApi";
import { cn } from "@shared/lib/utils";

const STATUS_OPTIONS = ["", "CONFIRMED", "PENDING", "CANCELLED"];

export default function AdminBookingsPage() {
  const [data, setData]     = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const load = (s = status) => {
    setLoading(true);
    adminApi.getBookings({ status: s || undefined, limit: 100 })
      .then((r) => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bookings</h1>
          <p className="text-foreground-muted text-sm mt-1">{data?.total ?? "—"} bookings total</p>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2">
        {STATUS_OPTIONS.map((s) => (
          <button key={s || "all"} onClick={() => { setStatus(s); load(s); }}
            className={cn("px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all",
              status === s ? "border-primary bg-primary-muted" : "border-[#D7E2EE] hover:border-primary text-foreground-muted")}>
            {s || "All"}
          </button>
        ))}
      </div>

      <div className="bg-surface rounded-2xl border border-[#D7E2EE] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-foreground-muted">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#D7E2EE] bg-background">
                  {["ID", "User", "Type", "Destination", "Total", "Status", "Payment", "Date"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-foreground-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data?.bookings?.map((b: any) => {
                  const dest = b.type === "FLIGHT"
                    ? `${b.flightBooking?.flight?.departureAirport?.iata} → ${b.flightBooking?.flight?.arrivalAirport?.iata}`
                    : b.hotelBooking?.room?.hotel?.name ?? "—";
                  return (
                    <tr key={b.id} className="border-b border-[#D7E2EE] last:border-0 hover:bg-background transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-foreground-muted">{b.id.slice(0, 8)}…</td>
                      <td className="px-4 py-3">{b.user.firstName} {b.user.lastName}<br/><span className="text-xs text-foreground-muted">{b.user.email}</span></td>
                      <td className="px-4 py-3"><TypeBadge type={b.type} /></td>
                      <td className="px-4 py-3 font-medium">{dest}</td>
                      <td className="px-4 py-3 font-semibold">${Number(b.totalPrice).toFixed(2)}</td>
                      <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                      <td className="px-4 py-3">{b.payment ? <StatusBadge status={b.payment.status} /> : <span className="text-xs text-foreground-muted">—</span>}</td>
                      <td className="px-4 py-3 text-foreground-muted whitespace-nowrap">{new Date(b.createdAt).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  return <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", type === "FLIGHT" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700")}>{type === "FLIGHT" ? "✈ Flight" : "🏨 Hotel"}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = { CONFIRMED: "bg-green-50 text-green-700", PENDING: "bg-amber-50 text-amber-700", CANCELLED: "bg-red-50 text-red-700", PAID: "bg-green-50 text-green-700", REFUNDED: "bg-blue-50 text-blue-700", FAILED: "bg-red-50 text-red-700" };
  return <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", map[status] ?? "bg-background text-foreground-muted")}>{status}</span>;
}
