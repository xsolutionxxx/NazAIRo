"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star, MapPin, Wifi, Dumbbell, UtensilsCrossed, Waves, Car, Coffee, Sparkles } from "lucide-react";
import { AppButton } from "@shared/ui/appButton";
import { cn } from "@shared/lib/utils";
import type { IHotel } from "@entities/hotel/types/IHotel";

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  "Free WiFi":  <Wifi            size={12} strokeWidth={1.5} />,
  "Pool":        <Waves          size={12} strokeWidth={1.5} />,
  "Gym":         <Dumbbell       size={12} strokeWidth={1.5} />,
  "Restaurant":  <UtensilsCrossed size={12} strokeWidth={1.5} />,
  "Parking":     <Car            size={12} strokeWidth={1.5} />,
  "Breakfast":   <Coffee         size={12} strokeWidth={1.5} />,
  "Spa":         <Sparkles       size={12} strokeWidth={1.5} />,
};

function ratingLabel(r: number) {
  if (r >= 4.8) return "Exceptional";
  if (r >= 4.5) return "Excellent";
  if (r >= 4.0) return "Very good";
  if (r >= 3.5) return "Good";
  return "Pleasant";
}

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

  const hasWifi        = hotel.amenities.some((a) => a.toLowerCase().includes("wifi"));
  const hasBreakfast   = hotel.amenities.some((a) => a.toLowerCase().includes("breakfast"));
  const scarcity       = hotel.availableRooms > 0 && hotel.availableRooms <= 3;

  return (
    <div className="bg-surface rounded-2xl border border-[#D7E2EE] overflow-hidden hover:shadow-lg transition-shadow duration-200 flex flex-col">
      {/* ── Image ── */}
      <div className="relative h-52 w-full overflow-hidden bg-background shrink-0">
        {hotel.imageUrls?.[0] ? (
          <Image
            src={hotel.imageUrls[0]}
            alt={hotel.name}
            fill
            className="object-cover hover:scale-105 transition-transform duration-500"
            unoptimized
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-foreground-muted text-sm">No image</div>
        )}

        {/* Stars badge */}
        <div className="absolute top-3 left-3 flex items-center gap-0.5 bg-black/55 backdrop-blur-sm rounded-full px-2.5 py-1">
          {Array.from({ length: hotel.stars }).map((_, i) => (
            <Star key={i} size={10} className="text-yellow-400 fill-yellow-400" />
          ))}
        </div>

        {/* Scarcity badge */}
        {scarcity && (
          <div className="absolute top-3 right-3 bg-accent text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
            Only {hotel.availableRooms} left!
          </div>
        )}

        {/* Photo count */}
        {hotel.imageUrls.length > 1 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5">
            <span className="text-white text-[10px]">{hotel.imageUrls.length} photos</span>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Name + location */}
        <div>
          <h3 className="font-bold text-base leading-tight line-clamp-1">{hotel.name}</h3>
          <p className="flex items-center gap-1 text-xs text-foreground-muted mt-1">
            <MapPin size={11} strokeWidth={1.5} className="shrink-0" />
            {hotel.city}, {hotel.country}
          </p>
        </div>

        {/* Rating row */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-foreground-static leading-none">{Number(hotel.rating).toFixed(1)}</span>
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">{ratingLabel(hotel.rating)}</p>
            {hotel.reviewCount && (
              <p className="text-xs text-foreground-muted">{hotel.reviewCount.toLocaleString()} reviews</p>
            )}
          </div>
        </div>

        {/* Amenity tags */}
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

        {/* Perks */}
        {(hasWifi || hasBreakfast) && (
          <div className="flex flex-wrap gap-1.5">
            {hasBreakfast && (
              <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400">
                Breakfast included
              </span>
            )}
            {hasWifi && (
              <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400">
                Free cancellation
              </span>
            )}
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-end justify-between mt-auto pt-3 border-t border-[#D7E2EE]">
          <div>
            {hotel.pricePerNight !== null ? (
              <>
                <p className="text-[11px] text-foreground-muted">from</p>
                <p className="text-xl font-bold leading-tight">
                  ${hotel.pricePerNight}
                  <span className="text-sm font-normal text-foreground-muted"> /night</span>
                </p>
                {hotel.nights > 1 && hotel.totalPrice && (
                  <p className="text-xs text-foreground-muted">
                    ${hotel.totalPrice} total · {hotel.nights} night{hotel.nights !== 1 ? "s" : ""}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-foreground-muted">Price on request</p>
            )}
          </div>
          <AppButton onClick={handleView} className="px-5 py-2.5 rounded-xl text-sm shrink-0">
            See rooms
          </AppButton>
        </div>
      </div>
    </div>
  );
}
