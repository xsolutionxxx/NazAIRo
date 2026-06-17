"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppButton } from "@shared/ui/appButton";
import { cn } from "@shared/lib/utils";
import { Star, Wifi, Waves, Dumbbell, UtensilsCrossed, Car, Coffee, Sparkles } from "lucide-react";
import { useAppSelector } from "@shared/lib/hooks/redux";

const SORT_OPTIONS = [
  { label: "Top rated",   value: "rating", order: "desc" },
  { label: "Price: Low",  value: "price",  order: "asc"  },
  { label: "Price: High", value: "price",  order: "desc" },
  { label: "Stars",       value: "stars",  order: "desc" },
];

const AMENITY_OPTIONS = [
  { label: "Free WiFi",   icon: <Wifi         size={13} strokeWidth={1.5} /> },
  { label: "Pool",        icon: <Waves        size={13} strokeWidth={1.5} /> },
  { label: "Gym",         icon: <Dumbbell     size={13} strokeWidth={1.5} /> },
  { label: "Restaurant",  icon: <UtensilsCrossed size={13} strokeWidth={1.5} /> },
  { label: "Parking",     icon: <Car          size={13} strokeWidth={1.5} /> },
  { label: "Breakfast",   icon: <Coffee       size={13} strokeWidth={1.5} /> },
  { label: "Spa",         icon: <Sparkles     size={13} strokeWidth={1.5} /> },
];

export default function HotelFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { hotels } = useAppSelector((s) => s.hotelReducer);

  const allPrices = hotels.map((h) => h.pricePerNight ?? 0).filter(Boolean);
  const priceMin  = allPrices.length ? Math.floor(Math.min(...allPrices)) : 0;
  const priceMax  = allPrices.length ? Math.ceil(Math.max(...allPrices))  : 1000;

  const [maxPrice,      setMaxPrice]      = useState<number | null>(null);
  const [selectedStars, setSelectedStars] = useState<number[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy,   setSortBy]   = useState(searchParams.get("sortBy")    ?? "rating");
  const [sortOrder,setSortOrder]= useState(searchParams.get("sortOrder") ?? "desc");

  useEffect(() => {
    if (!allPrices.length) return;
    const urlPrice = searchParams.get("maxPrice");
    setMaxPrice(urlPrice ? Number(urlPrice) : priceMax);
  }, [priceMax]);

  useEffect(() => {
    const urlAmenities = searchParams.get("amenities");
    if (urlAmenities) setSelectedAmenities(urlAmenities.split(","));
  }, []);

  const sliderValue = maxPrice ?? priceMax;
  const step = Math.max(1, Math.round((priceMax - priceMin) / 100) * 5);

  const toggleStar    = (s: number) =>
    setSelectedStars((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);
  const toggleAmenity = (a: string) =>
    setSelectedAmenities((p) => p.includes(a) ? p.filter((x) => x !== a) : [...p, a]);

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("maxPrice",  String(sliderValue));
    params.set("sortBy",    sortBy);
    params.set("sortOrder", sortOrder);
    if (selectedStars.length)     params.set("stars",     String(Math.min(...selectedStars)));
    else                          params.delete("stars");
    if (selectedAmenities.length) params.set("amenities", selectedAmenities.join(","));
    else                          params.delete("amenities");
    router.push(`/stays?${params.toString()}`);
  };

  const handleReset = () => {
    setMaxPrice(priceMax); setSelectedStars([]); setSelectedAmenities([]);
    setSortBy("rating"); setSortOrder("desc");
    const params = new URLSearchParams(searchParams.toString());
    ["maxPrice", "stars", "amenities", "sortBy", "sortOrder"].forEach((k) => params.delete(k));
    router.push(`/stays?${params.toString()}`);
  };

  return (
    <div className="bg-surface rounded-2xl border border-[#D7E2EE] p-5 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base">Filters</h3>
        <button onClick={handleReset} className="text-xs text-primary font-medium hover:underline cursor-pointer">
          Reset all
        </button>
      </div>

      {/* Sort */}
      <div>
        <p className="text-sm font-semibold mb-3">Sort by</p>
        <div className="space-y-2">
          {SORT_OPTIONS.map((opt) => (
            <label key={opt.label} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="radio" name="sort"
                checked={sortBy === opt.value && sortOrder === opt.order}
                onChange={() => { setSortBy(opt.value); setSortOrder(opt.order); }}
                className="accent-primary"
              />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Max price */}
      <div>
        <p className="text-sm font-semibold mb-3">Max price / night</p>
        <input
          type="range" min={priceMin} max={priceMax} step={step}
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

      {/* Star rating */}
      <div>
        <p className="text-sm font-semibold mb-3">Star rating</p>
        <div className="flex flex-wrap gap-2">
          {[3, 4, 5].map((s) => (
            <button
              key={s}
              onClick={() => toggleStar(s)}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-full border-2 text-sm font-medium transition-all cursor-pointer",
                selectedStars.includes(s)
                  ? "border-primary bg-primary-muted"
                  : "border-[#D7E2EE] hover:border-primary",
              )}
            >
              {s} <Star size={12} className={cn("fill-current", selectedStars.includes(s) ? "text-primary" : "text-foreground-muted")} />
            </button>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div>
        <p className="text-sm font-semibold mb-3">Facilities</p>
        <div className="space-y-2">
          {AMENITY_OPTIONS.map(({ label, icon }) => (
            <label key={label} className="flex items-center gap-2.5 cursor-pointer group">
              <div
                onClick={() => toggleAmenity(label)}
                className={cn(
                  "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer",
                  selectedAmenities.includes(label)
                    ? "bg-primary border-primary"
                    : "border-[#D7E2EE] group-hover:border-primary",
                )}
              >
                {selectedAmenities.includes(label) && (
                  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                    <path d="M1 3.5L3.5 6L8 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-foreground-static" />
                  </svg>
                )}
              </div>
              <span className="flex items-center gap-1.5 text-sm">
                <span className="text-foreground-muted">{icon}</span>
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <AppButton onClick={handleApply} className="w-full rounded-xl">Apply filters</AppButton>
    </div>
  );
}
