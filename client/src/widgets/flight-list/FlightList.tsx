"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Plane } from "lucide-react";
import FlightCard from "@widgets/flight-card/FlightCard";
import { useAppDispatch, useAppSelector } from "@shared/lib/hooks/redux";
import { searchFlights } from "@features/flights/model/flightSlice";
import type { IFlightSearchParams } from "@entities/flight/types/IFlight";

export default function FlightList() {
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();
    const { flights, returnFlights, total, loading, error } = useAppSelector(
        (s) => s.flightReducer,
    );

    const passengers = Number(searchParams.get("passengers") ?? 1);

    useEffect(() => {
        const from = searchParams.get("from");
        const to = searchParams.get("to");
        const date = searchParams.get("date");
        if (!from || !to || !date) return;

        const params: IFlightSearchParams = {
            from,
            to,
            date,
            passengers,
            returnDate: searchParams.get("returnDate") ?? undefined,
            cabinClass: (searchParams.get("cabinClass") as any) ?? undefined,
            maxPrice: searchParams.get("maxPrice")
                ? Number(searchParams.get("maxPrice"))
                : undefined,
            airlines: searchParams.get("airlines") ?? undefined,
            departureTimeFrom: searchParams.get("departureTimeFrom")
                ? Number(searchParams.get("departureTimeFrom"))
                : undefined,
            departureTimeTo: searchParams.get("departureTimeTo")
                ? Number(searchParams.get("departureTimeTo"))
                : undefined,
            sortBy: (searchParams.get("sortBy") as any) ?? "price",
            sortOrder: (searchParams.get("sortOrder") as any) ?? "asc",
        };

        dispatch(searchFlights(params));
    }, [searchParams.toString()]);

    if (!searchParams.get("from")) {
        return (
            <EmptyState
                icon={
                    <Plane size={40} strokeWidth={1} className="text-primary" />
                }
                title="Search for flights"
                subtitle="Enter your departure and arrival cities to find available flights"
            />
        );
    }

    if (loading) return <FlightListSkeleton />;

    if (error) {
        return (
            <EmptyState
                icon={<span className="text-4xl">⚠️</span>}
                title="Something went wrong"
                subtitle={error}
            />
        );
    }

    if (!flights.length) {
        return (
            <EmptyState
                icon={
                    <Plane
                        size={40}
                        strokeWidth={1}
                        className="text-foreground-muted"
                    />
                }
                title="No flights found"
                subtitle="Try adjusting your dates or filters"
            />
        );
    }

    return (
        <div className="mt-8 space-y-4">
            <p className="text-sm text-foreground-muted font-medium">
                {total} flight{total !== 1 ? "s" : ""} found
            </p>

            {returnFlights && (
                <p className="text-sm font-semibold text-primary">
                    Outbound flights
                </p>
            )}

            <div className="space-y-3">
                {flights.map((flight) => (
                    <FlightCard
                        key={flight.id}
                        flight={flight}
                        passengers={passengers}
                    />
                ))}
            </div>

            {returnFlights && returnFlights.length > 0 && (
                <>
                    <p className="text-sm font-semibold text-primary mt-6 pt-4 border-t border-[#D7E2EE]">
                        Return flights
                    </p>
                    <div className="space-y-3">
                        {returnFlights.map((flight) => (
                            <FlightCard
                                key={flight.id}
                                flight={flight}
                                passengers={passengers}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

function EmptyState({
    icon,
    title,
    subtitle,
}: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            {icon}
            <div>
                <p className="font-semibold text-lg">{title}</p>
                <p className="text-sm text-foreground-muted mt-1">{subtitle}</p>
            </div>
        </div>
    );
}

function FlightListSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
                <div
                    key={i}
                    className="h-36 bg-surface rounded-2xl border border-[#D7E2EE] animate-pulse"
                />
            ))}
        </div>
    );
}
