"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Armchair, Wifi, Utensils, Zap, ChevronDown, ArrowRight } from "lucide-react";
import { AppButton } from "@shared/ui/appButton";
import { cn } from "@shared/lib/utils";
import type { IFlight } from "@entities/flight/types/IFlight";
import { useState } from "react";

interface FlightCardProps {
  flight: IFlight;
  passengers?: number;
}

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  "Wi-Fi": <Wifi size={13} strokeWidth={1.5} />,
  "Meal included": <Utensils size={13} strokeWidth={1.5} />,
  "USB charging": <Zap size={13} strokeWidth={1.5} />,
};

const CABIN_COLORS: Record<string, string> = {
  ECONOMY: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  PREMIUM_ECONOMY: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  BUSINESS: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  FIRST: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
};

const CABIN_LABELS: Record<string, string> = {
  ECONOMY: "Economy",
  PREMIUM_ECONOMY: "Premium Economy",
  BUSINESS: "Business",
  FIRST: "First Class",
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export default function FlightCard({ flight, passengers = 1 }: FlightCardProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  const seatsLeft = flight.availableSeats;
  const lowSeats = seatsLeft <= 10;
  const totalPrice = flight.price * passengers;

  const handleBook = () => {
    router.push(`/flights/${flight.id}?passengers=${passengers}`);
  };

  return (
    <div className="bg-surface rounded-2xl border border-[#D7E2EE] hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-5">
        <div className="flex items-center gap-4">

          {/* Airline */}
          <div className="flex flex-col items-center gap-1.5 w-20 shrink-0">
            {flight.airline.logoUrl ? (
              <div className="relative h-8 w-16">
                <Image
                  src={flight.airline.logoUrl}
                  alt={flight.airline.name}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            ) : (
              <div className="h-8 w-16 bg-primary-muted rounded flex items-center justify-center text-xs font-bold text-primary">
                {flight.airline.iata}
              </div>
            )}
            <span className="text-[10px] text-foreground-muted text-center leading-tight">
              {flight.flightNumber}
            </span>
          </div>

          {/* Route */}
          <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            {/* Departure */}
            <div className="text-left">
              <p className="text-2xl font-bold tracking-tight">{formatTime(flight.departure.time)}</p>
              <p className="text-sm font-semibold text-primary">{flight.departure.airport.iata}</p>
              <p className="text-xs text-foreground-muted">{flight.departure.airport.city}</p>
              <p className="text-xs text-foreground-muted">{formatDate(flight.departure.time)}</p>
            </div>

            {/* Duration line */}
            <div className="flex flex-col items-center gap-1 px-2 min-w-[100px]">
              <span className="text-xs text-foreground-muted font-medium">{flight.duration.formatted}</span>
              <div className="flex items-center w-full gap-1">
                <div className="h-[2px] flex-1 bg-[#D7E2EE]" />
                <ArrowRight size={14} className="text-foreground-muted shrink-0" strokeWidth={1.5} />
              </div>
              <span className="text-[10px] text-foreground-muted">Non-stop</span>
            </div>

            {/* Arrival */}
            <div className="text-right">
              <p className="text-2xl font-bold tracking-tight">{formatTime(flight.arrival.time)}</p>
              <p className="text-sm font-semibold text-primary">{flight.arrival.airport.iata}</p>
              <p className="text-xs text-foreground-muted">{flight.arrival.airport.city}</p>
              <p className="text-xs text-foreground-muted">{formatDate(flight.arrival.time)}</p>
            </div>
          </div>

          {/* Price + Book */}
          <div className="flex flex-col items-end gap-3 ml-4 shrink-0">
            <div className="text-right">
              {passengers > 1 && (
                <p className="text-xs text-foreground-muted">${flight.price} × {passengers}</p>
              )}
              <p className="text-2xl font-bold text-foreground">${totalPrice}</p>
              <p className="text-xs text-foreground-muted">per booking</p>
            </div>
            <AppButton onClick={handleBook} className="px-6 py-2.5 text-sm rounded-lg">
              Book
            </AppButton>
          </div>
        </div>

        {/* Tags row */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", CABIN_COLORS[flight.cabinClass])}>
            {CABIN_LABELS[flight.cabinClass]}
          </span>

          {lowSeats && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-accent/10 text-accent">
              Only {seatsLeft} seats left!
            </span>
          )}

          {flight.amenities.slice(0, 3).map((a) => (
            <span key={a} className="flex items-center gap-1 text-xs text-foreground-muted px-2.5 py-1 rounded-full bg-background border border-[#D7E2EE]">
              {AMENITY_ICONS[a] ?? null}
              {a}
            </span>
          ))}

          <button
            onClick={() => setExpanded((p) => !p)}
            className="ml-auto flex items-center gap-1 text-xs text-primary font-medium hover:underline"
          >
            Details
            <ChevronDown size={13} className={cn("transition-transform", expanded && "rotate-180")} />
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-[#D7E2EE] bg-background px-5 py-4 grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs text-foreground-muted mb-1">Aircraft</p>
            <p className="font-medium">{flight.airline.name}</p>
          </div>
          <div>
            <p className="text-xs text-foreground-muted mb-1">Seats available</p>
            <p className={cn("font-medium", lowSeats && "text-accent")}>{seatsLeft} / {flight.totalSeats}</p>
          </div>
          <div>
            <p className="text-xs text-foreground-muted mb-1">All amenities</p>
            <p className="font-medium">{flight.amenities.join(", ") || "—"}</p>
          </div>
        </div>
      )}
    </div>
  );
}
