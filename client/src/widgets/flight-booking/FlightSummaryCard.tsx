import { AirlineLogo } from "@/shared/ui/airlineLogo";
import { ArrowRight, Clock, Users, Armchair } from "lucide-react";
import type { IFlight } from "@entities/flight/types/IFlight";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
}

const CABIN_LABELS: Record<string, string> = {
  ECONOMY: "Economy",
  PREMIUM_ECONOMY: "Premium Economy",
  BUSINESS: "Business",
  FIRST: "First Class",
};

interface Props {
  flight: IFlight;
  passengersCount: number;
  totalPrice?: number;
  selectedSeats?: string[];
}

export default function FlightSummaryCard({ flight, passengersCount, totalPrice, selectedSeats }: Props) {
  return (
    <div className="bg-surface rounded-2xl border border-[#D7E2EE] p-6 sticky top-6 space-y-5">
      <h3 className="font-bold text-base">Booking summary</h3>

      {/* Airline */}
      <div className="flex items-center gap-3">
        <AirlineLogo iata={flight.airline.iata} name={flight.airline.name} />
        <div>
          <p className="font-semibold text-sm">{flight.airline.name}</p>
          <p className="text-xs text-foreground-muted">{flight.flightNumber}</p>
        </div>
      </div>

      {/* Route */}
      <div className="bg-background rounded-xl p-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div>
            <p className="text-xl font-bold">{formatTime(flight.departure.time)}</p>
            <p className="text-sm font-semibold text-primary">{flight.departure.airport.iata}</p>
            <p className="text-xs text-foreground-muted">{flight.departure.airport.city}</p>
          </div>
          <div className="flex flex-col items-center gap-1 px-2">
            <span className="text-xs text-foreground-muted">{flight.duration.formatted}</span>
            <ArrowRight size={14} strokeWidth={1.5} className="text-foreground-muted" />
            <span className="text-[10px] text-foreground-muted">Non-stop</span>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold">{formatTime(flight.arrival.time)}</p>
            <p className="text-sm font-semibold text-primary">{flight.arrival.airport.iata}</p>
            <p className="text-xs text-foreground-muted">{flight.arrival.airport.city}</p>
          </div>
        </div>
        <p className="text-xs text-foreground-muted mt-3">{formatDate(flight.departure.time)}</p>
      </div>

      {/* Details */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-foreground-muted">
            <Users size={14} strokeWidth={1.5} />Passengers
          </span>
          <span className="font-medium">{passengersCount}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-foreground-muted">
            <Armchair size={14} strokeWidth={1.5} />Class
          </span>
          <span className="font-medium">{CABIN_LABELS[flight.cabinClass]}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-foreground-muted">
            <Clock size={14} strokeWidth={1.5} />Duration
          </span>
          <span className="font-medium">{flight.duration.formatted}</span>
        </div>
        {selectedSeats && selectedSeats.length > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground-muted">Seats</span>
            <span className="font-medium text-primary">{selectedSeats.join(", ")}</span>
          </div>
        )}
      </div>

      {/* Price breakdown */}
      <div className="border-t border-[#D7E2EE] pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-foreground-muted">${flight.price} × {passengersCount} passenger{passengersCount > 1 ? "s" : ""}</span>
          <span>${flight.price * passengersCount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-foreground-muted">Taxes & fees</span>
          <span>Included</span>
        </div>
        <div className="flex justify-between font-bold text-base pt-2 border-t border-[#D7E2EE]">
          <span>Total</span>
          <span className="text-primary">${totalPrice ?? flight.price * passengersCount}</span>
        </div>
      </div>
    </div>
  );
}
