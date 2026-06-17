"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { cn } from "@shared/lib/utils";

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}
function cabinLabel(c: string) {
  const m: Record<string, string> = {
    ECONOMY: "Economy", PREMIUM_ECONOMY: "Prem. Economy", BUSINESS: "Business", FIRST: "First Class",
  };
  return m[c] ?? c;
}

interface Props {
  booking: any;
  showDownload?: boolean;
}

export default function BoardingPassCard({ booking, showDownload = false }: Props) {
  const [downloading, setDownloading] = useState(false);
  const fb        = booking.flightBooking;
  const flight    = fb?.flight;
  const passenger = fb?.passengers?.[0];

  if (!fb || !flight) return null;

  const initials   = `${passenger?.firstName?.[0] ?? ""}${passenger?.lastName?.[0] ?? ""}`;
  const bookingRef = booking.id.slice(0, 8).toUpperCase();

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
      const res = await fetch(`${API}/bookings/${booking.id}/ticket`, { credentials: "include" });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url;
      a.download = `golobe-ticket-${bookingRef}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* silent */ }
    setDownloading(false);
  };

  const bars = [2,1,3,1,2,1,1,3,2,1,2,3,1,2,1,3,2,1,2,1,3,1,2,3,1];

  return (
    <div className="rounded-2xl overflow-hidden shadow-md border border-[#D7E2EE] bg-white select-none">
      {/* Top accent */}
      <div className="h-1.5 bg-primary" />

      {/* ── Route hero (mobile: stacked, desktop: row) ─── */}
      <div className="flex items-center gap-3 px-4 py-4 sm:px-5 bg-white border-b border-dashed border-[#D7E2EE]">
        {/* Departure */}
        <div className="flex-1 min-w-0">
          <p className="text-2xl font-bold text-[#112211] leading-none">{fmtTime(flight.departureTime)}</p>
          <p className="text-sm font-semibold text-primary mt-0.5">{flight.departureAirport.iata}</p>
          <p className="text-xs text-gray-400">{flight.departureAirport.city}</p>
        </div>

        {/* Connector */}
        <div className="flex flex-col items-center gap-1 shrink-0 px-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#D7E2EE]" />
          <div className="w-px h-6 bg-[#D7E2EE]" />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-gray-400">
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="currentColor"/>
          </svg>
          <div className="w-px h-6 bg-[#D7E2EE]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#D7E2EE]" />
        </div>

        {/* Arrival */}
        <div className="flex-1 min-w-0 text-right">
          <p className="text-2xl font-bold text-[#112211] leading-none">{fmtTime(flight.arrivalTime)}</p>
          <p className="text-sm font-semibold text-primary mt-0.5">{flight.arrivalAirport.iata}</p>
          <p className="text-xs text-gray-400">{flight.arrivalAirport.city}</p>
        </div>

        {/* Barcode strip — vertical on sm+, hidden on mobile (shown below) */}
        <div className="hidden sm:flex bg-[#112211] flex-col items-center justify-between py-3 px-2.5 rounded-xl ml-3 self-stretch min-w-[64px]">
          <p className="text-[8px] font-bold tracking-[0.2em] text-primary/70 uppercase"
            style={{ writingMode: "vertical-rl" }}>
            Golobe
          </p>
          <div className="flex items-end gap-px h-12">
            {bars.map((w, i) => (
              <div
                key={i}
                className={cn("bg-white/80 rounded-[1px]", i % 3 === 0 ? "h-full" : i % 2 === 0 ? "h-3/4" : "h-1/2")}
                style={{ width: w }}
              />
            ))}
          </div>
          <p className="text-[7px] font-mono text-white/30">{bookingRef}</p>
        </div>
      </div>

      {/* ── Barcode (mobile only, horizontal) ───────────── */}
      <div className="sm:hidden flex items-center gap-3 bg-[#112211] px-4 py-2.5">
        <p className="text-[9px] font-bold tracking-[0.15em] text-primary/70 uppercase shrink-0">Golobe</p>
        <div className="flex items-end gap-px h-8 flex-1">
          {bars.map((w, i) => (
            <div
              key={i}
              className={cn("bg-white/70 rounded-[1px]", i % 3 === 0 ? "h-full" : i % 2 === 0 ? "h-3/4" : "h-1/2")}
              style={{ width: w + 1 }}
            />
          ))}
        </div>
        <p className="text-[8px] font-mono text-white/30 shrink-0">{bookingRef}</p>
      </div>

      {/* ── Passenger + details ───────────────────────────── */}
      <div className="bg-primary/10 px-4 py-3 sm:px-5">
        {/* Passenger row */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-[#112211] text-sm leading-tight truncate">
              {passenger?.firstName} {passenger?.lastName}
            </p>
            <p className="text-[11px] text-gray-500">Boarding Pass · {cabinLabel(fb.cabinClass)}</p>
          </div>
          {passenger?.seatNumber && (
            <div className="text-right shrink-0">
              <p className="text-[9px] text-gray-500 uppercase tracking-wide">Seat</p>
              <p className="font-bold text-primary text-base leading-none">{passenger.seatNumber}</p>
            </div>
          )}
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-3 gap-x-2 gap-y-2 mt-3">
          {[
            { label: "Date",    value: fmt(flight.departureTime) },
            { label: "Flight",  value: flight.flightNumber },
            { label: "Gate",    value: "—" },
            { label: "Airline", value: (flight.airline?.name ?? "—").slice(0, 16) },
            { label: "Class",   value: cabinLabel(fb.cabinClass) },
            { label: "Pax",     value: String(fb.seatCount) },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[9px] text-gray-400 uppercase tracking-wide">{label}</p>
              <p className="text-xs font-semibold text-[#112211] truncate">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom bar ────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 bg-[#f8fafc] border-t border-[#D7E2EE]">
        <p className="text-[10px] font-mono text-gray-400 truncate mr-2">#{booking.id.toUpperCase()}</p>
        {showDownload && (
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50 shrink-0"
          >
            <Download size={13} strokeWidth={2} />
            {downloading ? "Generating…" : "Download PDF"}
          </button>
        )}
      </div>

      {/* Bottom accent */}
      <div className="h-1 bg-primary" />
    </div>
  );
}
