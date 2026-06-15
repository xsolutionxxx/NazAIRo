"use client";

import { useEffect, useState } from "react";
import { bookingApi } from "@features/flights/api/bookingApi";
import BookingCard from "@widgets/booking-card/BookingCard";

export default function History() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    bookingApi.getUserBookings()
      .then((r) => { setBookings(r.data); setLoading(false); })
      .catch(() => { setError("Failed to load bookings"); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="py-10 space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-44 bg-surface rounded-2xl border border-[#D7E2EE] animate-pulse" />
      ))}
    </div>
  );

  if (error) return (
    <div className="py-10 text-center text-foreground-muted">{error}</div>
  );

  if (!bookings.length) return (
    <div className="py-20 flex flex-col items-center gap-4 text-center">
      <span className="text-5xl">🗂️</span>
      <p className="text-lg font-semibold">No bookings yet</p>
      <p className="text-sm text-foreground-muted">Your flight and hotel bookings will appear here</p>
      <div className="flex gap-3 mt-2">
        <a href="/flights" className="px-5 py-2.5 bg-primary text-foreground-static rounded-xl text-sm font-medium hover:bg-[#9BE0C8] transition-all">Find Flights</a>
        <a href="/stays"   className="px-5 py-2.5 border border-[#D7E2EE] rounded-xl text-sm font-medium hover:border-primary transition-all">Find Stays</a>
      </div>
    </div>
  );

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">My Bookings</h2>
        <span className="text-sm text-foreground-muted">{bookings.length} booking{bookings.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="space-y-4">
        {bookings.map((b) => (
          <BookingCard key={b.id} booking={b} onCancelled={load} />
        ))}
      </div>
    </div>
  );
}
