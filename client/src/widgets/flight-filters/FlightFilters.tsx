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

    const { flights } = useAppSelector((s) => s.flightReducer);

    const allPrices = flights.map((f) => f.price);
    const priceMin = allPrices.length ? Math.floor(Math.min(...allPrices)) : 0;
    const priceMax = allPrices.length ? Math.ceil(Math.max(...allPrices))  : 2000;

    const [maxPrice, setMaxPrice] = useState<number | null>(null);
    const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<number | null>(null);

    // initialise from URL once
    useEffect(() => {
        dispatch(fetchAirlines());
        if (searchParams.get("airlines"))
            setSelectedAirlines(searchParams.get("airlines")!.split(","));
    }, []);

    // when flights load, set slider to URL value or priceMax
    useEffect(() => {
        if (!allPrices.length) return;
        const urlPrice = searchParams.get("maxPrice");
        setMaxPrice(urlPrice ? Number(urlPrice) : priceMax);
    }, [priceMax]);

    const sliderValue = maxPrice ?? priceMax;

    const toggleAirline = (iata: string) => {
        setSelectedAirlines((prev) =>
            prev.includes(iata)
                ? prev.filter((a) => a !== iata)
                : [...prev, iata],
        );
    };

    const handleApply = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("maxPrice", String(sliderValue));
        if (selectedAirlines.length)
            params.set("airlines", selectedAirlines.join(","));
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
        setMaxPrice(priceMax);
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
                <button
                    onClick={handleReset}
                    className="text-xs text-primary font-medium hover:underline cursor-pointer"
                >
                    Reset all
                </button>
            </div>

            <div>
                <p className="text-sm font-semibold mb-3">Max price</p>
                <input
                    type="range"
                    min={priceMin}
                    max={priceMax}
                    step={Math.max(1, Math.round((priceMax - priceMin) / 100) * 5)}
                    value={sliderValue}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    disabled={!allPrices.length}
                    className="w-full accent-primary cursor-pointer disabled:opacity-40"
                />
                <div className="flex justify-between mt-1.5">
                    <span className="text-xs text-foreground-muted">${priceMin}</span>
                    <span className="text-sm font-semibold text-primary">${sliderValue}</span>
                    <span className="text-xs text-foreground-muted">${priceMax}</span>
                </div>
            </div>

            <div>
                <p className="text-sm font-semibold mb-3">Departure time</p>
                <div className="grid grid-cols-2 gap-2">
                    {TIME_SLOTS.map((slot, i) => (
                        <button
                            key={slot.label}
                            onClick={() =>
                                setSelectedTimeSlot(
                                    selectedTimeSlot === i ? null : i,
                                )
                            }
                            className={cn(
                                "flex flex-col items-start py-2.5 px-3 rounded-xl border-2 text-left transition-all cursor-pointer",
                                selectedTimeSlot === i
                                    ? "border-primary bg-primary-muted"
                                    : "border-[#D7E2EE] hover:border-primary",
                            )}
                        >
                            <p className="text-xs font-semibold">
                                {slot.label}
                            </p>
                            <p className="text-[10px] text-foreground-muted">
                                {slot.sub}
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            {airlines.length > 0 && (
                <div>
                    <p className="text-sm font-semibold mb-3">Airlines</p>
                    <div className="space-y-2.5">
                        {airlines.map((airline) => (
                            <AppCheckbox
                                key={airline.iata}
                                label={airline.name}
                                checked={selectedAirlines.includes(
                                    airline.iata,
                                )}
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
