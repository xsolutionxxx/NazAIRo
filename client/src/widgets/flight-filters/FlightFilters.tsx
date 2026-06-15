"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppCheckbox } from "@shared/ui/appCheckbox";
import { AppButton } from "@shared/ui/appButton";
import { cn } from "@shared/lib/utils";
import { useAppDispatch, useAppSelector } from "@shared/lib/hooks/redux";
import { fetchAirlines } from "@features/flights/model/flightSlice";

const TIME_SLOTS = [
  { label: "Early morning", sub: "00:00 – 06:00", from: 0, to: 5 },
  { label: "Morning", sub: "06:00 – 12:00", from: 6, to: 11 },
  { label: "Afternoon", sub: "12:00 – 18:00", from: 12, to: 17 },
  { label: "Evening", sub: "18:00 – 24:00", from: 18, to: 23 },
];

export default function FlightFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { airlines } = useAppSelector((s) => s.flightReducer);

  const [maxPrice, setMaxPrice] = useState(2000);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchAirlines());
    if (searchParams.get("maxPrice")) setMaxPrice(Number(searchParams.get("maxPrice")));
    if (searchParams.get("airlines")) setSelectedAirlines(searchParams.get("airlines")!.split(","));
  }, []);

  const toggleAirline = (iata: string) => {
    setSelectedAirlines((prev) =>
      prev.includes(iata) ? prev.filter((a) => a !== iata) : [...prev, iata],
    );
  };

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("maxPrice", String(maxPrice));
    if (selectedAirlines.length) params.set("airlines", selectedAirlines.join(","));
    else params.delete("airlines");

    if (selectedTimeSlot !== null) {
      const slot = TIME_SLOTS[selectedTimeSlot];
      params.set("departureTimeFrom", String(slot.from));
      params.set("departureTimeTo", String(slot.to));
    } else {
      params.delete("departureTimeFrom");
      params.delete("departureTimeTo");
    }

    router.push(`/flights?${params.toString()}`);
  };

  const handleReset = () => {
    setMaxPrice(2000);
    setSelectedAirlines([]);
    setSelectedTimeSlot(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("maxPrice");
    params.delete("airlines");
    params.delete("departureTimeFrom");
    params.delete("departureTimeTo");
    router.push(`/flights?${params.toString()}`);
  };

  return (
    <div className="bg-surface rounded-2xl border border-[#D7E2EE] p-5 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base">Filters</h3>
        <button onClick={handleReset} className="text-xs text-primary font-medium hover:underline">
          Reset all
        </button>
      </div>

      {/* Price */}
      <div>
        <p className="text-sm font-semibold mb-3">Max price</p>
        <input
          type="range"
          min={50}
          max={2000}
          step={10}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-foreground-muted">$50</span>
          <span className="text-sm font-semibold text-primary">${maxPrice}</span>
          <span className="text-xs text-foreground-muted">$2000</span>
        </div>
      </div>

      {/* Departure time */}
      <div>
        <p className="text-sm font-semibold mb-3">Departure time</p>
        <div className="grid grid-cols-2 gap-2">
          {TIME_SLOTS.map((slot, i) => (
            <button
              key={slot.label}
              onClick={() => setSelectedTimeSlot(selectedTimeSlot === i ? null : i)}
              className={cn(
                "py-2.5 px-3 rounded-xl border-2 text-left transition-all",
                selectedTimeSlot === i
                  ? "border-primary bg-primary-muted"
                  : "border-[#D7E2EE] hover:border-primary",
              )}
            >
              <p className="text-xs font-semibold">{slot.label}</p>
              <p className="text-[10px] text-foreground-muted">{slot.sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Airlines */}
      {airlines.length > 0 && (
        <div>
          <p className="text-sm font-semibold mb-3">Airlines</p>
          <div className="space-y-2.5">
            {airlines.map((airline) => (
              <AppCheckbox
                key={airline.iata}
                label={airline.name}
                checked={selectedAirlines.includes(airline.iata)}
                onChange={() => toggleAirline(airline.iata)}
              />
            ))}
          </div>
        </div>
      )}

      <AppButton onClick={handleApply} className="w-full rounded-xl">
        Apply filters
      </AppButton>
    </div>
  );
}
