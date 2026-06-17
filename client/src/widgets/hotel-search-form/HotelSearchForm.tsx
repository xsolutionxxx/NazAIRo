"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Minus, Plus, Search } from "lucide-react";
import { DatePicker } from "@shared/ui/datePicker";
import { AppButton } from "@shared/ui/appButton";
import { cn } from "@shared/lib/utils";
import { useAppDispatch, useAppSelector } from "@shared/lib/hooks/redux";
import { fetchCities } from "@features/hotels/model/hotelSlice";

export default function HotelSearchForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();
    const { cities, citiesLoading } = useAppSelector((s) => s.hotelReducer);

    const [cityQuery, setCityQuery] = useState("");
    const [cityOpen, setCityOpen] = useState(false);
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [guests, setGuests] = useState(2);
    const [guestsOpen, setGuestsOpen] = useState(false);

    const cityRef = useRef<HTMLDivElement>(null);
    const guestsRef = useRef<HTMLDivElement>(null);
    const debounce = useRef<ReturnType<typeof setTimeout> | undefined>(
        undefined,
    );

    useEffect(() => {
        const sp = searchParams;
        if (sp.get("city")) setCityQuery(sp.get("city")!);
        if (sp.get("checkIn")) setCheckIn(sp.get("checkIn")!);
        if (sp.get("checkOut")) setCheckOut(sp.get("checkOut")!);
        if (sp.get("guests")) setGuests(Number(sp.get("guests")));
    }, []);

    useEffect(() => {
        const handle = (e: MouseEvent) => {
            if (cityRef.current && !cityRef.current.contains(e.target as Node))
                setCityOpen(false);
            if (
                guestsRef.current &&
                !guestsRef.current.contains(e.target as Node)
            )
                setGuestsOpen(false);
        };
        document.addEventListener("mousedown", handle);
        return () => document.removeEventListener("mousedown", handle);
    }, []);

    const handleCityQuery = (val: string) => {
        setCityQuery(val);
        clearTimeout(debounce.current);
        if (val.length >= 2) {
            debounce.current = setTimeout(() => {
                dispatch(fetchCities(val));
                setCityOpen(true);
            }, 250);
        } else {
            setCityOpen(false);
        }
    };

    const handleSubmit = () => {
        if (!cityQuery || !checkIn || !checkOut) return;
        const params = new URLSearchParams({
            city: cityQuery,
            checkIn,
            checkOut,
            guests: String(guests),
        });
        router.push(`/stays?${params.toString()}`);
    };

    const today = new Date().toISOString().split("T")[0];

    return (
        <div className="bg-surface rounded-2xl shadow-sm border border-[#D7E2EE] p-6">
            <div className="grid grid-cols-12 gap-4 items-end">
                {/* City */}
                <div
                    className="col-span-12 md:col-span-4 relative"
                    ref={cityRef}
                >
                    <label className="block text-xs font-medium text-foreground-muted mb-1.5">
                        Destination
                    </label>
                    <div className="relative">
                        <input
                            value={cityQuery}
                            onChange={(e) => handleCityQuery(e.target.value)}
                            onFocus={() =>
                                cityQuery.length >= 2 && setCityOpen(true)
                            }
                            placeholder="City or hotel name"
                            className="w-full h-14 px-4 border-2 border-input-secondary rounded-lg text-sm bg-transparent outline-none transition-all hover:border-primary focus:border-primary"
                        />
                    </div>
                    {cityOpen && cities.length > 0 && (
                        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-surface rounded-xl shadow-lg border border-[#D7E2EE] overflow-hidden">
                            {citiesLoading ? (
                                <div className="p-3 text-sm text-foreground-muted">
                                    Searching...
                                </div>
                            ) : (
                                cities.map((c) => (
                                    <button
                                        key={c.city}
                                        onMouseDown={() => {
                                            setCityQuery(c.city);
                                            setCityOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-background transition-colors text-left cursor-pointer"
                                    >
                                        <span className="text-sm font-medium">
                                            {c.city}
                                        </span>
                                        <span className="text-xs text-foreground-muted ml-auto">
                                            {c.country}
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Check-in */}
                <div className="col-span-12 md:col-span-2">
                    <DatePicker
                        label="Check-in"
                        value={checkIn}
                        onChange={setCheckIn}
                        min={today}
                        placeholder="Check-in"
                    />
                </div>

                {/* Check-out */}
                <div className="col-span-12 md:col-span-2">
                    <DatePicker
                        label="Check-out"
                        value={checkOut}
                        onChange={setCheckOut}
                        min={checkIn || today}
                        placeholder="Check-out"
                    />
                </div>

                {/* Guests */}
                <div
                    className="col-span-12 md:col-span-3 relative"
                    ref={guestsRef}
                >
                    <label className="block text-xs font-medium text-foreground-muted mb-1.5">
                        Guests
                    </label>
                    <button
                        onClick={() => setGuestsOpen((p) => !p)}
                        className="w-full h-14 px-4 border-2 border-input-secondary rounded-lg text-sm bg-transparent outline-none transition-all hover:border-primary flex items-center justify-between cursor-pointer"
                    >
                        <span>
                            {guests} guest{guests > 1 ? "s" : ""}
                        </span>
                        <ChevronDown
                            size={16}
                            strokeWidth={1.5}
                            className={cn(
                                "transition-transform",
                                guestsOpen && "rotate-180",
                            )}
                        />
                    </button>
                    {guestsOpen && (
                        <div className="absolute z-50 mt-1 w-full bg-surface rounded-xl shadow-lg border border-[#D7E2EE] p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                    Guests
                                </span>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() =>
                                            setGuests((p) => Math.max(1, p - 1))
                                        }
                                        className="h-8 w-8 rounded-full border border-input-secondary flex items-center justify-center hover:border-primary transition-all cursor-pointer"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="w-4 text-center font-semibold">
                                        {guests}
                                    </span>
                                    <button
                                        onClick={() =>
                                            setGuests((p) =>
                                                Math.min(20, p + 1),
                                            )
                                        }
                                        className="h-8 w-8 rounded-full border border-input-secondary flex items-center justify-center hover:border-primary transition-all cursor-pointer"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="col-span-12 md:col-span-1">
                    <AppButton
                        onClick={handleSubmit}
                        disabled={!cityQuery || !checkIn || !checkOut}
                        icon={Search}
                        className="w-full h-14 rounded-lg"
                    />
                </div>
            </div>
        </div>
    );
}
