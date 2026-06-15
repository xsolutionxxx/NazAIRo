"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { BedDouble } from "lucide-react";
import HotelCard from "@widgets/hotel-card/HotelCard";
import { useAppDispatch, useAppSelector } from "@shared/lib/hooks/redux";
import { searchHotels } from "@features/hotels/model/hotelSlice";
import type { IHotelSearchParams } from "@entities/hotel/types/IHotel";

export default function HotelList() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { hotels, total, nights, loading, error } = useAppSelector((s) => s.hotelReducer);

  const checkIn  = searchParams.get("checkIn")  ?? "";
  const checkOut = searchParams.get("checkOut") ?? "";
  const guests   = Number(searchParams.get("guests") ?? 1);

  useEffect(() => {
    const city = searchParams.get("city");
    if (!city || !checkIn || !checkOut) return;

    const params: IHotelSearchParams = {
      city,
      checkIn,
      checkOut,
      guests,
      stars:    searchParams.get("stars")    ? Number(searchParams.get("stars"))    : undefined,
      maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
      sortBy:   (searchParams.get("sortBy")    as any) ?? "rating",
      sortOrder:(searchParams.get("sortOrder") as any) ?? "desc",
    };
    dispatch(searchHotels(params));
  }, [searchParams.toString()]);

  if (!searchParams.get("city")) return (
    <EmptyState icon="🏨" title="Search for hotels" subtitle="Enter your destination and dates to find available hotels" />
  );
  if (loading) return <HotelListSkeleton />;
  if (error)   return <EmptyState icon="⚠️" title="Something went wrong" subtitle={error} />;
  if (!hotels.length) return (
    <EmptyState icon="🏨" title="No hotels found" subtitle="Try adjusting your dates or filters" />
  );

  return (
    <div>
      <p className="text-sm text-foreground-muted font-medium mb-4">
        {total} hotel{total !== 1 ? "s" : ""} found · {nights} night{nights !== 1 ? "s" : ""}
      </p>
      <div className="grid grid-cols-1 gap-4">
        {hotels.map((hotel) => (
          <HotelCard key={hotel.id} hotel={hotel} checkIn={checkIn} checkOut={checkOut} guests={guests} />
        ))}
      </div>
    </div>
  );
}

function EmptyState({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <span className="text-4xl">{icon}</span>
      <div>
        <p className="font-semibold text-lg">{title}</p>
        <p className="text-sm text-foreground-muted mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

function HotelListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-72 bg-surface rounded-2xl border border-[#D7E2EE] animate-pulse" />
      ))}
    </div>
  );
}
