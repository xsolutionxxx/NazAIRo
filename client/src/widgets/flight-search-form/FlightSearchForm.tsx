"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftRight, ChevronDown, Minus, Plus, Search } from "lucide-react";
import { AppButton } from "@shared/ui/appButton";
import { cn } from "@shared/lib/utils";
import { DatePicker } from "@shared/ui/datePicker";
import { useAppDispatch, useAppSelector } from "@shared/lib/hooks/redux";
import { fetchAirports } from "@features/flights/model/flightSlice";
import type { CabinClass, IAirport } from "@entities/flight/types/IFlight";

type TripType = "one-way" | "round-trip";

const CABIN_OPTIONS: { value: CabinClass; label: string }[] = [
    { value: "ECONOMY", label: "Economy" },
    { value: "PREMIUM_ECONOMY", label: "Premium Economy" },
    { value: "BUSINESS", label: "Business" },
    { value: "FIRST", label: "First Class" },
];

export default function FlightSearchForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();
    const { airports, airportsLoading } = useAppSelector(
        (s) => s.flightReducer,
    );

    const [tripType, setTripType] = useState<TripType>("one-way");
    const [from, setFrom] = useState<IAirport | null>(null);
    const [to, setTo] = useState<IAirport | null>(null);
    const [fromQuery, setFromQuery] = useState("");
    const [toQuery, setToQuery] = useState("");
    const [fromOpen, setFromOpen] = useState(false);
    const [toOpen, setToOpen] = useState(false);
    const [departureDate, setDepartureDate] = useState("");
    const [returnDate, setReturnDate] = useState("");
    const [passengers, setPassengers] = useState(1);
    const [cabinClass, setCabinClass] = useState<CabinClass>("ECONOMY");
    const [cabinOpen, setCabinOpen] = useState(false);

    const fromRef = useRef<HTMLDivElement>(null);
    const toRef = useRef<HTMLDivElement>(null);
    const cabinRef = useRef<HTMLDivElement>(null);

    // Prefill from URL params
    useEffect(() => {
        const sp = searchParams;
        const fromIata = sp.get("from");
        const toIata   = sp.get("to");
        if (fromIata) setFromQuery(sp.get("fromCity") ? `${sp.get("fromCity")} (${fromIata})` : fromIata);
        if (toIata)   setToQuery(sp.get("toCity")   ? `${sp.get("toCity")} (${toIata})`     : toIata);
        if (sp.get("date")) setDepartureDate(sp.get("date")!);
        if (sp.get("returnDate")) {
            setReturnDate(sp.get("returnDate")!);
            setTripType("round-trip");
        }
        if (sp.get("passengers")) setPassengers(Number(sp.get("passengers")));
        if (sp.get("cabinClass"))
            setCabinClass(sp.get("cabinClass") as CabinClass);
    }, []);

    // Airport autocomplete
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
        undefined,
    );
    const handleFromQuery = (val: string) => {
        setFromQuery(val);
        setFrom(null);
        clearTimeout(searchTimeout.current);
        if (val.length >= 2) {
            searchTimeout.current = setTimeout(() => {
                dispatch(fetchAirports(val));
                setFromOpen(true);
            }, 250);
        } else {
            setFromOpen(false);
        }
    };

    const handleToQuery = (val: string) => {
        setToQuery(val);
        setTo(null);
        clearTimeout(searchTimeout.current);
        if (val.length >= 2) {
            searchTimeout.current = setTimeout(() => {
                dispatch(fetchAirports(val));
                setToOpen(true);
            }, 250);
        } else {
            setToOpen(false);
        }
    };

    const handleSwap = () => {
        const tmpAirport = from;
        const tmpQuery = fromQuery;
        setFrom(to);
        setFromQuery(toQuery);
        setTo(tmpAirport);
        setToQuery(tmpQuery);
    };

    // Close dropdowns on outside click
    useEffect(() => {
        const handle = (e: MouseEvent) => {
            if (fromRef.current && !fromRef.current.contains(e.target as Node))
                setFromOpen(false);
            if (toRef.current && !toRef.current.contains(e.target as Node))
                setToOpen(false);
            if (
                cabinRef.current &&
                !cabinRef.current.contains(e.target as Node)
            )
                setCabinOpen(false);
        };
        document.addEventListener("mousedown", handle);
        return () => document.removeEventListener("mousedown", handle);
    }, []);

    const handleSubmit = () => {
        const fromIata = from?.iata ?? fromQuery.toUpperCase();
        const toIata = to?.iata ?? toQuery.toUpperCase();
        if (!fromIata || !toIata || !departureDate) return;

        const params = new URLSearchParams({
            from: fromIata,
            to: toIata,
            date: departureDate,
            passengers: String(passengers),
            cabinClass,
        });
        if (tripType === "round-trip" && returnDate)
            params.set("returnDate", returnDate);

        router.push(`/flights?${params.toString()}`);
    };

    const today = new Date().toISOString().split("T")[0];

    return (
        <div className="bg-surface rounded-2xl shadow-sm border border-[#D7E2EE] p-6">
            <div className="flex gap-1 mb-6 bg-background rounded-lg p-1 w-fit">
                {(["one-way", "round-trip"] as TripType[]).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTripType(t)}
                        className={cn(
                            "px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize cursor-pointer",
                            tripType === t
                                ? "bg-primary text-foreground-static shadow-sm"
                                : "text-foreground-muted hover:text-foreground",
                        )}
                    >
                        {t === "one-way" ? "One Way" : "Round Trip"}
                    </button>
                ))}
            </div>

            <div
                className={`grid gap-4 items-end ${tripType === "round-trip" ? "grid-cols-11" : "grid-cols-12"}`}
            >
                <div
                    className="col-span-12 md:col-span-3 relative"
                    ref={fromRef}
                >
                    <label className="block text-xs font-medium text-foreground-muted mb-1.5">
                        From
                    </label>
                    <div className="relative">
                        <input
                            value={fromQuery}
                            onChange={(e) => handleFromQuery(e.target.value)}
                            onFocus={() =>
                                fromQuery.length >= 2 && setFromOpen(true)
                            }
                            placeholder="City or airport"
                            className={cn(
                                "w-full h-14 px-4 border-2 border-input-secondary rounded-lg text-sm bg-transparent outline-none transition-all",
                                "hover:border-primary focus:border-primary",
                                from && "border-primary",
                            )}
                        />
                        {from && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-foreground-muted bg-primary-muted px-1.5 py-0.5 rounded font-mono">
                                {from.iata}
                            </span>
                        )}
                    </div>
                    {fromOpen && airports.length > 0 && (
                        <AirportDropdown
                            airports={airports}
                            loading={airportsLoading}
                            onSelect={(a) => {
                                setFrom(a);
                                setFromQuery(`${a.city} (${a.iata})`);
                                setFromOpen(false);
                            }}
                        />
                    )}
                </div>

                <div className="hidden md:flex col-span-12 md:col-span-1 justify-center pb-1">
                    <button
                        onClick={handleSwap}
                        className="h-10 w-10 rounded-full border-2 border-input-secondary hover:border-primary flex items-center justify-center transition-all hover:bg-primary-muted cursor-pointer"
                    >
                        <ArrowLeftRight size={16} strokeWidth={1.5} />
                    </button>
                </div>

                <div className="col-span-12 md:col-span-3 relative" ref={toRef}>
                    <label className="block text-xs font-medium text-foreground-muted mb-1.5">
                        To
                    </label>
                    <div className="relative">
                        <input
                            value={toQuery}
                            onChange={(e) => handleToQuery(e.target.value)}
                            onFocus={() =>
                                toQuery.length >= 2 && setToOpen(true)
                            }
                            placeholder="City or airport"
                            className={cn(
                                "w-full h-14 px-4 border-2 border-input-secondary rounded-lg text-sm bg-transparent outline-none transition-all",
                                "hover:border-primary focus:border-primary",
                                to && "border-primary",
                            )}
                        />
                        {to && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-foreground-muted bg-primary-muted px-1.5 py-0.5 rounded font-mono">
                                {to.iata}
                            </span>
                        )}
                    </div>
                    {toOpen && airports.length > 0 && (
                        <AirportDropdown
                            airports={airports}
                            loading={airportsLoading}
                            onSelect={(a) => {
                                setTo(a);
                                setToQuery(`${a.city} (${a.iata})`);
                                setToOpen(false);
                            }}
                        />
                    )}
                </div>

                <div className="col-span-12 md:col-span-2">
                    <DatePicker
                        label="Departure"
                        value={departureDate}
                        onChange={setDepartureDate}
                        min={today}
                        placeholder="Select Date"
                    />
                </div>

                {tripType === "round-trip" && (
                    <div className="col-span-12 md:col-span-2">
                        <DatePicker
                            label="Return"
                            value={returnDate}
                            onChange={setReturnDate}
                            min={departureDate || today}
                            placeholder="Select Date"
                        />
                    </div>
                )}

                <div className="col-span-12 md:col-span-2" ref={cabinRef}>
                    <label className="block text-xs font-medium text-foreground-muted mb-1.5">
                        Passengers & Class
                    </label>
                    <button
                        onClick={() => setCabinOpen((p) => !p)}
                        className="w-full h-14 px-4 border-2 border-input-secondary rounded-lg text-sm bg-transparent outline-none transition-all hover:border-primary flex items-center justify-between cursor-pointer"
                    >
                        <span>
                            {passengers} pax ·{" "}
                            {
                                CABIN_OPTIONS.find(
                                    (c) => c.value === cabinClass,
                                )?.label
                            }
                        </span>
                        <ChevronDown
                            size={16}
                            strokeWidth={1.5}
                            className={cn(
                                "transition-transform",
                                cabinOpen && "rotate-180",
                            )}
                        />
                    </button>

                    {cabinOpen && (
                        <div className="absolute z-50 mt-1 bg-surface rounded-xl shadow-lg border border-[#D7E2EE] p-4 w-72">
                            <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-3">
                                Passengers
                            </p>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm">Adults</span>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() =>
                                            setPassengers((p) =>
                                                Math.max(1, p - 1),
                                            )
                                        }
                                        className="h-8 w-8 rounded-full border border-input-secondary flex items-center justify-center hover:border-primary transition-all cursor-pointer"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="w-4 text-center font-semibold">
                                        {passengers}
                                    </span>
                                    <button
                                        onClick={() =>
                                            setPassengers((p) =>
                                                Math.min(9, p + 1),
                                            )
                                        }
                                        className="h-8 w-8 rounded-full border border-input-secondary flex items-center justify-center hover:border-primary transition-all cursor-pointer"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>

                            <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-3">
                                Cabin Class
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {CABIN_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => {
                                            setCabinClass(opt.value);
                                            setCabinOpen(false);
                                        }}
                                        className={cn(
                                            "py-2 px-3 rounded-lg text-xs font-medium border-2 transition-all text-left cursor-pointer",
                                            cabinClass === opt.value
                                                ? "border-primary bg-primary-muted text-foreground"
                                                : "border-input-secondary hover:border-primary",
                                        )}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div
                    className={cn(
                        "col-span-12",
                        tripType === "round-trip"
                            ? "md:col-span-1"
                            : "md:col-span-1",
                    )}
                >
                    <AppButton
                        onClick={handleSubmit}
                        disabled={!fromQuery || !toQuery || !departureDate}
                        icon={Search}
                        className="w-full h-14 rounded-lg"
                    />
                </div>
            </div>
        </div>
    );
}

function AirportDropdown({
    airports,
    loading,
    onSelect,
}: {
    airports: {
        id: string;
        iata: string;
        name: string;
        city: string;
        country: string;
    }[];
    loading: boolean;
    onSelect: (a: IAirport) => void;
}) {
    return (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-surface rounded-xl shadow-lg border border-[#D7E2EE] overflow-hidden">
            {loading ? (
                <div className="p-3 text-sm text-foreground-muted">
                    Searching...
                </div>
            ) : (
                airports.map((a) => (
                    <button
                        key={a.id}
                        onMouseDown={() => onSelect(a as IAirport)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-background transition-colors text-left cursor-pointer"
                    >
                        <span className="font-mono font-bold text-sm text-primary w-10 shrink-0">
                            {a.iata}
                        </span>
                        <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                                {a.city}
                            </p>
                            <p className="text-xs text-foreground-muted truncate">
                                {a.name}
                            </p>
                        </div>
                        <span className="ml-auto text-xs text-foreground-muted shrink-0">
                            {a.country}
                        </span>
                    </button>
                ))
            )}
        </div>
    );
}
