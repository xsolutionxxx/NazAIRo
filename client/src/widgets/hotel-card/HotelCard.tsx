"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star, MapPin, Wifi, Dumbbell, UtensilsCrossed, Waves } from "lucide-react";
import { AppButton } from "@shared/ui/appButton";
import { cn } from "@shared/lib/utils";
import type { IHotel } from "@entities/hotel/types/IHotel";

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  "Pool":       <Waves      size={13} strokeWidth={1.5} />,
  "Gym":        <Dumbbell   size={13} strokeWidth={1.5} />,
  "Free WiFi":  <Wifi       size={13} strokeWidth={1.5} />,
  "Restaurant": <UtensilsCrossed size={13} strokeWidth={1.5} />,
};

interface Props {
  hotel: IHotel;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}

export default function HotelCard({ hotel, checkIn, checkOut, guests = 1 }: Props) {
  const router = useRouter();

  const handleView = () => {
    const params = new URLSearchParams();
    if (checkIn)  params.set("checkIn",  checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (guests)   params.set("guests",   String(guests));
    router.push(`/stays/${hotel.id}?${params.toString()}`);
  };

  return (
    <div className="bg-surface rounded-2xl border border-[#D7E2EE] overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden bg-background">
        {hotel.imageUrls?.[0] ? (
          <Image
            src={hotel.imageUrls[0]}
            alt={hotel.name}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-foreground-muted text-sm">No image</div>
        )}
        {/* Stars badge */}
        <div className="absolute top-3 left-3 flex items-center gap-0.5 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1">
          {Array.from({ length: hotel.stars }).map((_, i) => (
            <Star key={i} size={10} className="text-yellow-400 fill-yellow-400" />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Name + location */}
        <div>
          <h3 className="font-bold text-base leading-tight line-clamp-1">{hotel.name}</h3>
          <p className="flex items-center gap-1 text-xs text-foreground-muted mt-1">
            <MapPin size={11} strokeWidth={1.5} className="shrink-0" />
            {hotel.city}, {hotel.country}
          </p>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-primary/15 rounded-lg px-2 py-1">
            <Star size={12} className="text-primary fill-primary" />
            <span className="text-sm font-bold text-primary">{Number(hotel.rating).toFixed(1)}</span>
          </div>
          <span className="text-xs text-foreground-muted">
            {hotel.rating >= 4.8 ? "Exceptional" : hotel.rating >= 4.5 ? "Excellent" : hotel.rating >= 4.0 ? "Very Good" : "Good"}
          </span>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1.5">
          {hotel.amenities.slice(0, 4).map((a) => (
            <span key={a} className="flex items-center gap-1 text-[11px] text-foreground-muted px-2 py-1 rounded-full bg-background border border-[#D7E2EE]">
              {AMENITY_ICONS[a] ?? null}
              {a}
            </span>
          ))}
          {hotel.amenities.length > 4 && (
            <span className="text-[11px] text-foreground-muted px-2 py-1 rounded-full bg-background border border-[#D7E2EE]">
              +{hotel.amenities.length - 4} more
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex items-end justify-between mt-auto pt-2 border-t border-[#D7E2EE]">
          <div>
            {hotel.pricePerNight !== null && (
              <>
                <p className="text-xs text-foreground-muted">from</p>
                <p className="text-xl font-bold">${hotel.pricePerNight}<span className="text-sm font-normal text-foreground-muted">/night</span></p>
                {hotel.nights > 1 && hotel.totalPrice && (
                  <p className="text-xs text-foreground-muted">${hotel.totalPrice} total · {hotel.nights} nights</p>
                )}
              </>
            )}
          </div>
          <AppButton onClick={handleView} className="px-5 py-2.5 rounded-xl text-sm">
            View rooms
          </AppButton>
        </div>
      </div>
    </div>
  );
}
