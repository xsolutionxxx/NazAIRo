"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppButton } from "@shared/ui/appButton";
import { AppCheckbox } from "@shared/ui/appCheckbox";
import { cn } from "@shared/lib/utils";
import { Star } from "lucide-react";

const SORT_OPTIONS = [
  { label: "Top rated",   value: "rating",  order: "desc" },
  { label: "Price: Low",  value: "price",   order: "asc"  },
  { label: "Price: High", value: "price",   order: "desc" },
  { label: "Stars",       value: "stars",   order: "desc" },
];

export default function HotelFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [maxPrice, setMaxPrice] = useState(Number(searchParams.get("maxPrice") ?? 1000));
  const [selectedStars, setSelectedStars] = useState<number[]>([]);
  const [sortBy, setSortBy]   = useState(searchParams.get("sortBy")    ?? "rating");
  const [sortOrder, setSortOrder] = useState(searchParams.get("sortOrder") ?? "desc");

  const toggleStar = (s: number) =>
    setSelectedStars((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("maxPrice",  String(maxPrice));
    params.set("sortBy",    sortBy);
    params.set("sortOrder", sortOrder);
    if (selectedStars.length) params.set("stars", String(Math.min(...selectedStars)));
    else params.delete("stars");
    router.push(`/stays?${params.toString()}`);
  };

  const handleReset = () => {
    setMaxPrice(1000); setSelectedStars([]); setSortBy("rating"); setSortOrder("desc");
    const params = new URLSearchParams(searchParams.toString());
    ["maxPrice", "stars", "sortBy", "sortOrder"].forEach((k) => params.delete(k));
    router.push(`/stays?${params.toString()}`);
  };

  return (
    <div className="bg-surface rounded-2xl border border-[#D7E2EE] p-5 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base">Filters</h3>
        <button onClick={handleReset} className="text-xs text-primary font-medium hover:underline">Reset all</button>
      </div>

      {/* Sort */}
      <div>
        <p className="text-sm font-semibold mb-3">Sort by</p>
        <div className="space-y-2">
          {SORT_OPTIONS.map((opt) => (
            <label key={opt.label} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="radio"
                name="sort"
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
        <p className="text-sm font-semibold mb-3">Max price/night</p>
        <input type="range" min={30} max={1000} step={10} value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-foreground-muted">$30</span>
          <span className="text-sm font-semibold text-primary">${maxPrice}</span>
          <span className="text-xs text-foreground-muted">$1000</span>
        </div>
      </div>

      {/* Stars */}
      <div>
        <p className="text-sm font-semibold mb-3">Star rating</p>
        <div className="flex flex-wrap gap-2">
          {[3, 4, 5].map((s) => (
            <button
              key={s}
              onClick={() => toggleStar(s)}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-full border-2 text-sm font-medium transition-all",
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

      <AppButton onClick={handleApply} className="w-full rounded-xl">Apply filters</AppButton>
    </div>
  );
}
