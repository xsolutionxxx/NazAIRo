"use client";

import { useState } from "react";
import { AirlineLogo } from "@/shared/ui/airlineLogo";
import BoardingPassCard from "./BoardingPassCard";
import HotelVoucherCard from "./HotelVoucherCard";
import {
  Plane, Hotel, ArrowRight, CalendarDays, Users,
  Clock, CheckCircle, XCircle, ChevronDown, Ban, CreditCard,
} from "lucide-react";
import { bookingApi } from "@features/flights/api/bookingApi";
import { AppButton } from "@shared/ui/appButton";
import { cn } from "@shared/lib/utils";

interface Props {
  booking: any;
  onCancelled: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.FC<any> }> = {
  CONFIRMED: { label: "Confirmed", color: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300", icon: CheckCircle },
  PENDING:   { label: "Pending",   color: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300", icon: Clock },
  CANCELLED: { label: "Cancelled", color: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",         icon: XCircle },
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default function BookingCard({ booking, onCancelled }: Props) {
  if (booking.status === "PENDING") return null; // filtered server-side, but defensive
  const [expanded,      setExpanded]     = useState(false);
  const [cancelling,    setCancelling]   = useState(false);
  const [confirmOpen,   setConfirmOpen]  = useState(false);

  const status = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.PENDING;
  const StatusIcon = status.icon;
  const isFlight   = booking.type === "FLIGHT";
  const isPending  = booking.status === "PENDING";
  const canCancel  = booking.status === "CONFIRMED" || booking.status === "PENDING";

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await bookingApi.cancelBooking(booking.id);
      onCancelled();
    } catch {
      setCancelling(false);
    }
    setConfirmOpen(false);
  };


  return (
    <div className="bg-surface rounded-2xl border border-[#D7E2EE] overflow-hidden">
      {/* Main row */}
      <div className="p-4 sm:p-5">
        {/* Row 1: icon + title */}
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0",
            isFlight ? "bg-blue-50" : "bg-amber-50",
          )}>
            {isFlight
              ? <Plane size={18} className="text-blue-500"  strokeWidth={1.5} />
              : <Hotel size={18} className="text-amber-500" strokeWidth={1.5} />}
          </div>

          <div className="flex-1 min-w-0">
            {isFlight
              ? <FlightSummary booking={booking} />
              : <HotelSummary  booking={booking} />}
          </div>

          {/* Price — hidden on mobile, shown on sm+ */}
          <div className="hidden sm:block text-right shrink-0 ml-2">
            <p className="text-xl font-bold">${Number(booking.totalPrice).toFixed(2)}</p>
            <p className="text-xs text-foreground-muted">total</p>
          </div>
        </div>

        {/* Row 2: meta + actions */}
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 mt-3 pl-[52px] sm:pl-[60px]">
          {/* Status badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full", status.color)}>
              <StatusIcon size={12} strokeWidth={2} />
              {status.label}
            </span>
            <span className="text-xs text-foreground-muted">
              Booked {fmt(booking.createdAt)}
            </span>
            {booking.payment?.status === "PAID" && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700">✓ Paid</span>
            )}
            {booking.payment?.status === "REFUNDED" && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">↩ Refunded</span>
            )}
            {/* Price — mobile only, inline with badges */}
            <span className="sm:hidden font-bold text-sm">${Number(booking.totalPrice).toFixed(2)}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {isPending && (
              <a
                href={`/bookings/resume/${booking.id}`}
                className="flex items-center gap-1 text-xs text-amber-600 font-medium hover:underline px-2 py-1"
              >
                <CreditCard size={13} strokeWidth={1.5} />
                Complete
              </a>
            )}
            {canCancel && !confirmOpen && !isPending && (
              <button
                onClick={() => setConfirmOpen(true)}
                className="flex items-center gap-1 text-xs text-foreground-muted hover:text-destructive transition-colors px-2 py-1"
              >
                <Ban size={13} strokeWidth={1.5} />
                Cancel
              </button>
            )}
            <button
              onClick={() => setExpanded((p) => !p)}
              className="flex items-center gap-1 text-xs text-primary font-medium hover:underline px-2 py-1"
            >
              Details
              <ChevronDown size={13} className={cn("transition-transform", expanded && "rotate-180")} />
            </button>
          </div>
        </div>

        {/* Cancel confirm (confirmed bookings) */}
        {confirmOpen && (
          <div className="mt-4 p-4 bg-destructive/5 border border-destructive/20 rounded-xl flex items-center justify-between gap-4">
            <p className="text-sm font-medium">
              Are you sure you want to cancel this booking?
              {booking.payment?.status === "PAID" && " You will receive a full refund."}
            </p>
            <div className="flex gap-2 shrink-0">
              <AppButton
                onClick={handleCancel}
                disabled={cancelling}
                className="px-4 py-2 text-sm rounded-xl bg-destructive hover:bg-destructive/80 text-white"
              >
                {cancelling ? "Cancelling…" : "Yes, cancel"}
              </AppButton>
              <AppButton
                intent="outline"
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 text-sm rounded-xl"
              >
                Keep booking
              </AppButton>
            </div>
          </div>
        )}

      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-[#D7E2EE] bg-background px-5 py-4">
          {isFlight && booking.status === "CONFIRMED" ? (
            <BoardingPassCard booking={booking} showDownload />
          ) : !isFlight && booking.status === "CONFIRMED" ? (
            <HotelVoucherCard booking={booking} showDownload />
          ) : isFlight ? (
            <FlightDetails booking={booking} />
          ) : (
            <HotelDetails booking={booking} />
          )}

          {!(booking.status === "CONFIRMED") && (
            <div className="mt-3 pt-3 border-t border-[#D7E2EE] flex items-center justify-between text-xs text-foreground-muted">
              <span className="font-mono">ID: {booking.id}</span>
              {booking.stripePaymentIntentId && (
                <span className="font-mono">Stripe: {booking.stripePaymentIntentId.slice(0, 20)}…</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Flight summary (collapsed) ───────────────────────────────────────────────

function FlightSummary({ booking }: { booking: any }) {
  const fb = booking.flightBooking;
  if (!fb) return null;
  const { flight } = fb;
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <AirlineLogo iata={flight.airline.iata} name={flight.airline.name} className="h-5 w-10" />
        <span className="font-bold text-base">
          {flight.departureAirport.city}
          <span className="mx-1.5 text-foreground-muted">→</span>
          {flight.arrivalAirport.city}
        </span>
        <span className="text-sm font-mono text-foreground-muted">{flight.flightNumber}</span>
      </div>
      <p className="text-sm text-foreground-muted">
        {fmt(flight.departureTime)} · {fmtTime(flight.departureTime)} → {fmtTime(flight.arrivalTime)}
        &nbsp;·&nbsp;{fb.seatCount} passenger{fb.seatCount !== 1 ? "s" : ""}
        &nbsp;·&nbsp;{fb.cabinClass}
        {fb.passengers?.some((p: any) => p.seatNumber) && (
          <span className="ml-1 text-primary">· {fb.passengers.map((p: any) => p.seatNumber).filter(Boolean).join(", ")}</span>
        )}
      </p>
    </div>
  );
}

// ─── Hotel summary (collapsed) ────────────────────────────────────────────────

function HotelSummary({ booking }: { booking: any }) {
  const hb = booking.hotelBooking;
  if (!hb) return null;
  return (
    <div>
      <p className="font-bold text-base mb-1">{hb.room.hotel.name}</p>
      <p className="text-sm text-foreground-muted">
        {hb.room.type} · Room {hb.room.roomNumber}
        &nbsp;·&nbsp;{fmt(hb.checkIn)} → {fmt(hb.checkOut)}
        &nbsp;·&nbsp;{hb.guestCount} guest{hb.guestCount !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

// ─── Flight expanded details ──────────────────────────────────────────────────

function FlightDetails({ booking }: { booking: any }) {
  const fb = booking.flightBooking;
  if (!fb) return null;
  const { flight } = fb;
  return (
    <div className="space-y-4">
      {/* Route visual */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 bg-surface rounded-xl p-4">
        <div>
          <p className="text-2xl font-bold">{fmtTime(flight.departureTime)}</p>
          <p className="text-sm font-semibold text-primary">{flight.departureAirport.iata}</p>
          <p className="text-xs text-foreground-muted">{flight.departureAirport.name}</p>
          <p className="text-xs text-foreground-muted mt-0.5">{fmt(flight.departureTime)}</p>
        </div>
        <div className="flex flex-col items-center gap-1 px-3">
          <span className="text-xs text-foreground-muted">{flight.duration?.formatted ?? "—"}</span>
          <ArrowRight size={16} strokeWidth={1.5} className="text-foreground-muted" />
          <span className="text-[10px] text-foreground-muted">Non-stop</span>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{fmtTime(flight.arrivalTime)}</p>
          <p className="text-sm font-semibold text-primary">{flight.arrivalAirport.iata}</p>
          <p className="text-xs text-foreground-muted">{flight.arrivalAirport.name}</p>
          <p className="text-xs text-foreground-muted mt-0.5">{fmt(flight.arrivalTime)}</p>
        </div>
      </div>

      {/* Passengers */}
      {fb.passengers?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-2">Passengers</p>
          <div className="grid grid-cols-2 gap-2">
            {fb.passengers.map((p: any, i: number) => (
              <div key={p.id} className="bg-surface rounded-lg px-3 py-2 text-sm">
                <p className="font-medium">{i + 1}. {p.firstName} {p.lastName}
                  {p.seatNumber && <span className="ml-1.5 text-xs text-primary font-semibold">· {p.seatNumber}</span>}
                </p>
                <p className="text-xs text-foreground-muted">{p.passportNumber} · {p.nationality}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Hotel expanded details ───────────────────────────────────────────────────

function HotelDetails({ booking }: { booking: any }) {
  const hb = booking.hotelBooking;
  if (!hb) return null;
  const nights = Math.ceil((new Date(hb.checkOut).getTime() - new Date(hb.checkIn).getTime()) / (1000 * 60 * 60 * 24));
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 bg-surface rounded-xl p-4">
        <div className="flex items-center gap-2">
          <CalendarDays size={14} strokeWidth={1.5} className="text-primary shrink-0" />
          <div>
            <p className="text-xs text-foreground-muted">Check-in</p>
            <p className="text-sm font-semibold">{fmt(hb.checkIn)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays size={14} strokeWidth={1.5} className="text-primary shrink-0" />
          <div>
            <p className="text-xs text-foreground-muted">Check-out</p>
            <p className="text-sm font-semibold">{fmt(hb.checkOut)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={14} strokeWidth={1.5} className="text-primary shrink-0" />
          <div>
            <p className="text-xs text-foreground-muted">Duration</p>
            <p className="text-sm font-semibold">{nights} night{nights !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Users size={14} strokeWidth={1.5} className="text-primary shrink-0" />
          <div>
            <p className="text-xs text-foreground-muted">Guests</p>
            <p className="text-sm font-semibold">{hb.guestCount}</p>
          </div>
        </div>
      </div>

      {/* Hotel info */}
      <div className="bg-surface rounded-xl p-4">
        <p className="font-semibold">{hb.room.hotel.name}</p>
        <p className="text-sm text-foreground-muted">{hb.room.hotel.address}, {hb.room.hotel.city}</p>
        <p className="text-sm mt-1">{hb.room.type} · Room {hb.room.roomNumber}</p>
      </div>

      {/* Guests */}
      {hb.guests?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-2">Guests</p>
          <div className="grid grid-cols-2 gap-2">
            {hb.guests.map((g: any, i: number) => (
              <div key={g.id} className="bg-surface rounded-lg px-3 py-2 text-sm">
                <p className="font-medium">{i + 1}. {g.firstName} {g.lastName}</p>
                {(g.passportNumber || g.nationality) && (
                  <p className="text-xs text-foreground-muted">
                    {[g.nationality, g.passportNumber].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
