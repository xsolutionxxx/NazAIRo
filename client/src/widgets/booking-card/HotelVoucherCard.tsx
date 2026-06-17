"use client";

import { Download, MapPin, CalendarDays, Moon, Users } from "lucide-react";
import { useState } from "react";
import { cn } from "@shared/lib/utils";

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

interface Props {
  booking: any;
  showDownload?: boolean;
}

export default function HotelVoucherCard({ booking, showDownload = false }: Props) {
  const [downloading, setDownloading] = useState(false);
  const hb         = booking.hotelBooking;
  const hotel      = hb?.room?.hotel;
  if (!hb || !hotel) return null;

  const bookingRef = booking.id.slice(0, 8).toUpperCase();
  const nights     = Math.ceil(
    (new Date(hb.checkOut).getTime() - new Date(hb.checkIn).getTime()) / (1000 * 60 * 60 * 24),
  );
  const bars = [2,1,3,1,2,1,1,3,2,1,2,3,1,2,1,3,2,1,2,1,3,1,2,3,1];

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
      a.download = `golobe-voucher-${bookingRef}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* silent */ }
    setDownloading(false);
  };

  return (
    <div className="rounded-2xl overflow-hidden shadow-md border border-[#D7E2EE] bg-white select-none">
      {/* Top accent */}
      <div className="h-1.5 bg-amber-400" />

      {/* ── Hotel hero ────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-4 sm:px-5 bg-white border-b border-dashed border-[#D7E2EE]">
        <div className="flex-1 min-w-0">
          <p className="text-xl font-bold text-[#112211] leading-tight line-clamp-1">{hotel.name}</p>
          <p className="flex items-center gap-1 text-xs text-gray-400 mt-1">
            <MapPin size={11} strokeWidth={1.5} className="shrink-0" />
            {hotel.address}, {hotel.city}
          </p>
          <p className="text-sm font-medium text-gray-600 mt-2">
            {hb.room.type} · Room {hb.room.roomNumber}
          </p>
        </div>

        {/* Barcode strip */}
        <div className="hidden sm:flex bg-[#112211] flex-col items-center justify-between py-3 px-2.5 rounded-xl ml-3 self-stretch min-w-[64px]">
          <p
            className="text-[8px] font-bold tracking-[0.2em] text-amber-400/70 uppercase"
            style={{ writingMode: "vertical-rl" }}
          >
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

      {/* ── Barcode (mobile) ─────────────────────────────── */}
      <div className="sm:hidden flex items-center gap-3 bg-[#112211] px-4 py-2.5">
        <p className="text-[9px] font-bold tracking-[0.15em] text-amber-400/70 uppercase shrink-0">Golobe</p>
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

      {/* ── Stay details ──────────────────────────────────── */}
      <div className="bg-amber-50 px-4 py-3 sm:px-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-3">
          {[
            { icon: <CalendarDays size={12} strokeWidth={1.5} />, label: "Check-in",  value: fmt(hb.checkIn)  },
            { icon: <CalendarDays size={12} strokeWidth={1.5} />, label: "Check-out", value: fmt(hb.checkOut) },
            { icon: <Moon        size={12} strokeWidth={1.5} />, label: "Nights",    value: String(nights)   },
            { icon: <Users       size={12} strokeWidth={1.5} />, label: "Guests",    value: String(hb.guestCount) },
          ].map(({ icon, label, value }) => (
            <div key={label}>
              <p className="flex items-center gap-1 text-[9px] text-gray-400 uppercase tracking-wide mb-0.5">
                {icon}{label}
              </p>
              <p className="text-xs font-semibold text-[#112211]">{value}</p>
            </div>
          ))}
        </div>

        {/* Guests list */}
        {hb.guests?.length > 0 && (
          <div className="mt-3 pt-3 border-t border-amber-200">
            <p className="text-[9px] text-gray-400 uppercase tracking-wide mb-2">Guests</p>
            <div className="flex flex-wrap gap-2">
              {hb.guests.map((g: any, i: number) => {
                const initials = `${g.firstName?.[0] ?? ""}${g.lastName?.[0] ?? ""}`;
                return (
                  <div key={g.id ?? i} className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-white font-bold text-[10px] shrink-0">
                      {initials}
                    </div>
                    <span className="text-xs font-medium text-[#112211]">{g.firstName} {g.lastName}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom bar ────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 bg-[#f8fafc] border-t border-[#D7E2EE]">
        <p className="text-[10px] font-mono text-gray-400 truncate mr-2">#{booking.id.toUpperCase()}</p>
        {showDownload && (
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1.5 text-xs font-medium text-amber-600 hover:text-amber-500 transition-colors disabled:opacity-50 shrink-0"
          >
            <Download size={13} strokeWidth={2} />
            {downloading ? "Generating…" : "Download Voucher"}
          </button>
        )}
      </div>

      {/* Bottom accent */}
      <div className="h-1 bg-amber-400" />
    </div>
  );
}
