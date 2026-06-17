"use client";

import { useEffect, useState } from "react";
import { Plane, Hotel } from "lucide-react";
import { bookingApi } from "@features/flights/api/bookingApi";
import BookingCard from "@widgets/booking-card/BookingCard";
import { cn } from "@shared/lib/utils";
import { AppTitle } from "@/shared/ui/appTitle";

type Tab = "flights" | "stays";

export default function History() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tab, setTab] = useState<Tab>("flights");

    const load = () => {
        setLoading(true);
        bookingApi
            .getUserBookings()
            .then((r) => {
                setBookings(r.data);
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to load bookings");
                setLoading(false);
            });
    };

    useEffect(() => {
        load();
    }, []);

    const flights = bookings.filter((b) => b.type === "FLIGHT");
    const stays = bookings.filter((b) => b.type === "HOTEL");
    const list = tab === "flights" ? flights : stays;

    return (
        <div className="w-full">
            <AppTitle
                as="h1"
                size="lg"
                text="History"
                className="ml-2 mr-12 mb-4"
            />

            <div className="flex gap-1 p-1 bg-background rounded-xl border border-[#D7E2EE] w-full mb-6">
                {(["flights", "stays"] as Tab[]).map((t) => {
                    const Icon = t === "flights" ? Plane : Hotel;
                    const count =
                        t === "flights" ? flights.length : stays.length;
                    return (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all",
                                tab === t
                                    ? "bg-surface shadow-sm text-foreground border border-[#D7E2EE]"
                                    : "text-foreground-muted hover:text-foreground border border-transparent",
                            )}
                        >
                            <Icon size={15} strokeWidth={1.5} />
                            {t === "flights" ? "Flights" : "Stays"}
                            <span
                                className={cn(
                                    "text-xs px-1.5 py-0.5 rounded-full font-semibold",
                                    tab === t
                                        ? "bg-primary/20 text-foreground"
                                        : "bg-[#D7E2EE] text-foreground-muted",
                                )}
                            >
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {loading ? (
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-24 bg-surface rounded-2xl border border-[#D7E2EE] animate-pulse"
                        />
                    ))}
                </div>
            ) : error ? (
                <div className="py-10 text-center text-foreground-muted">
                    {error}
                </div>
            ) : list.length === 0 ? (
                <div className="py-20 flex flex-col items-center gap-3 text-center border border-dashed border-[#D7E2EE] rounded-2xl">
                    <p className="text-sm text-foreground-muted">
                        No {tab === "flights" ? "flight" : "hotel"} bookings yet
                    </p>
                    <a
                        href={tab === "flights" ? "/flights" : "/stays"}
                        className="text-sm font-medium text-primary hover:underline"
                    >
                        {tab === "flights" ? "Find Flights" : "Find Stays"} →
                    </a>
                </div>
            ) : (
                <div className="space-y-4">
                    {list.map((b) => (
                        <BookingCard
                            key={b.id}
                            booking={b}
                            onCancelled={load}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
