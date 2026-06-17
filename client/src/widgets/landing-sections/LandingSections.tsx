"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
  Zap,
  Clock,
  LucideIcon,
} from "lucide-react";
import { Container } from "@shared/ui/container";
import $api from "@shared/api";

// ─── Scroll-reveal hook ───────────────────────────────────────────────────────

function useReveal(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setTimeout(() => el.classList.add("sr-visible"), delay);
          obs.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return ref;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const destinations = [
  { city: "London",    country: "United Kingdom", code: "GB", to: "LHR", minPrice: 79,  duration: "3h 30m",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=700&auto=format&fit=crop&q=80" },
  { city: "Frankfurt", country: "Germany",        code: "DE", to: "FRA", minPrice: 189, duration: "3h",
    image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=700&auto=format&fit=crop&q=80" },
  { city: "Istanbul",  country: "Turkey",         code: "TR", to: "IST", minPrice: 155, duration: "2h 30m",
    image: "https://images.unsplash.com/photo-1527838832700-5059252407fa?w=700&auto=format&fit=crop&q=80" },
  { city: "Dubai",     country: "UAE",            code: "AE", to: "DXB", minPrice: 420, duration: "5h 30m",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=700&auto=format&fit=crop&q=80" },
  { city: "Vienna",    country: "Austria",        code: "AT", to: "VIE", minPrice: 135, duration: "2h",
    image: "https://images.unsplash.com/photo-1609856878074-cf31e21ccb6b?w=700&auto=format&fit=crop&q=80" },
  { city: "Barcelona", country: "Spain",          code: "ES", to: "BCN", minPrice: 179, duration: "4h",
    image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=700&auto=format&fit=crop&q=80" },
];

type Destination = typeof destinations[0];

const features: { icon: LucideIcon; gradient: string; num: string; title: string; desc: string }[] = [
  { icon: ShieldCheck,    gradient: "from-emerald-400 to-teal-600",   num: "01", title: "Secure booking",       desc: "Stripe payments with full fraud protection on every transaction." },
  { icon: Zap,            gradient: "from-amber-400  to-orange-500",  num: "02", title: "Real-time prices",     desc: "Live fares from 15+ airlines, no hidden fees ever." },
  { icon: HeartHandshake, gradient: "from-rose-400   to-pink-600",    num: "03", title: "Easy management",      desc: "Cancel or change bookings anytime from your dashboard." },
  { icon: Clock,          gradient: "from-blue-400   to-indigo-600",  num: "04", title: "Instant confirmation", desc: "Tickets and receipts arrive in seconds via email." },
];

interface Hotel {
  id: string; name: string; city: string; country: string;
  stars: number; rating: number; imageUrls: string[];
  rooms?: { pricePerNight: number }[];
}

// ─── Sub-components (each owns its reveal hook) ───────────────────────────────

function DestCard({ d, index }: { d: Destination; index: number }) {
  const ref = useReveal(index * 70);
  return (
    <div ref={ref} className="sr">
      <Link
        href={`/flights?from=KBP&to=${d.to}`}
        className="relative overflow-hidden rounded-2xl group cursor-pointer min-h-[150px] md:min-h-[170px] flex flex-col justify-between"
      >
        <Image
          src={d.image}
          alt={d.city}
          fill
          unoptimized
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/15" />

        <div className="relative z-10 flex items-start justify-between p-4">
          <span className="text-[11px] font-bold text-white tracking-widest uppercase bg-white/15 backdrop-blur-sm rounded-md px-2 py-1 border border-white/20">
            {d.code}
          </span>
          <span className="text-[10px] text-white/90 font-semibold bg-black/35 backdrop-blur-sm rounded-full px-2.5 py-1">
            {d.duration}
          </span>
        </div>

        <div className="relative z-10 p-4">
          <p className="text-white font-bold text-xl leading-tight">{d.city}</p>
          <p className="text-white/60 text-xs mb-2">{d.country}</p>
          <p className="text-primary font-bold text-sm">from ${d.minPrice}</p>
        </div>

        <ArrowRight
          size={15}
          className="absolute right-4 bottom-4 z-10 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all duration-300"
        />
      </Link>
    </div>
  );
}

function FeatureCard({ f, index }: { f: typeof features[0]; index: number }) {
  const ref = useReveal(index * 90);
  const { icon: Icon, gradient, num, title, desc } = f;
  return (
    <div
      ref={ref}
      className="sr relative flex flex-col gap-4 p-6 rounded-2xl border border-[#D7E2EE] bg-background overflow-hidden group hover:border-primary/40 hover:shadow-lg transition-all duration-300"
    >
      <span className="absolute -right-1 -top-3 text-[72px] font-black text-foreground/4 select-none leading-none group-hover:text-foreground/7 transition-colors pointer-events-none">
        {num}
      </span>
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}>
        <Icon size={22} className="text-white" strokeWidth={1.8} />
      </div>
      <div>
        <p className="font-bold text-sm mb-1.5">{title}</p>
        <p className="text-foreground-muted text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function HotelCard({ h, index }: { h: Hotel; index: number }) {
  const ref = useReveal(index * 90);
  const minPrice = h.rooms?.[0]?.pricePerNight ?? 0;
  const img = h.imageUrls?.[0];
  return (
    <div ref={ref} className="sr">
      <Link
        href={`/stays/${h.id}`}
        className="group rounded-2xl border border-[#D7E2EE] bg-surface overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
      >
        <div className="relative h-48 bg-gradient-to-br from-[#293a38] to-[#578582] overflow-hidden shrink-0">
          {img && (
            <Image
              src={img}
              alt={h.name}
              fill
              unoptimized
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}
          <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1">
            <span className="text-amber-400 text-xs">
              {"★".repeat(h.stars)}{"☆".repeat(5 - h.stars)}
            </span>
          </div>
        </div>
        <div className="p-4">
          <p className="font-semibold text-sm truncate">{h.name}</p>
          <p className="text-xs text-foreground-muted mt-0.5 mb-3">{h.city}, {h.country}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-primary bg-primary-muted rounded-full px-2.5 py-1">
              ★ {Number(h.rating).toFixed(1)}
            </span>
            {minPrice > 0 && (
              <span className="text-sm font-bold">
                ${minPrice}<span className="text-xs font-normal text-foreground-muted"> / night</span>
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function LandingSections() {
  const [hotels, setHotels]    = useState<Hotel[]>([]);
  const [hotelsLoading, setHL] = useState(true);

  const destHeader  = useReveal(0);
  const whyHeader   = useReveal(0);
  const hotelHeader = useReveal(0);

  useEffect(() => {
    const d      = new Date();
    const fmt    = (dt: Date) => dt.toISOString().split("T")[0];
    const checkIn  = fmt(new Date(d.getTime() + 86_400_000));
    const checkOut = fmt(new Date(d.getTime() + 3 * 86_400_000));

    $api
      .get<{ hotels: Hotel[] } | Hotel[]>("/hotels/search", {
        params: { guests: 2, page: 1, limit: 3, sortBy: "rating", checkIn, checkOut },
      })
      .then((r) => {
        const data = r.data;
        setHotels(Array.isArray(data) ? data : (data as { hotels: Hotel[] }).hotels ?? []);
      })
      .catch(() => {})
      .finally(() => setHL(false));
  }, []);

  return (
    <>
      {/* ── Popular Destinations ── */}
      <section className="py-16 md:py-20">
        <Container>
          <div ref={destHeader} className="sr flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-2">Direct from Kyiv</p>
              <h2 className="text-2xl md:text-3xl font-bold">Popular destinations</h2>
            </div>
            <Link href="/flights" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
              All flights <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {destinations.map((d, i) => <DestCard key={d.city} d={d} index={i} />)}
          </div>

          <div className="flex justify-center mt-6 sm:hidden">
            <Link href="/flights" className="text-sm font-medium text-primary hover:underline flex items-center gap-1.5">
              All flights <ArrowRight size={14} />
            </Link>
          </div>
        </Container>
      </section>

      {/* ── Why Golobe ── */}
      <section className="py-16 md:py-20 bg-surface">
        <Container>
          <div ref={whyHeader} className="sr text-center mb-12">
            <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-2">Why us</p>
            <h2 className="text-2xl md:text-3xl font-bold">Everything you need, in one place</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((f, i) => <FeatureCard key={f.title} f={f} index={i} />)}
          </div>
        </Container>
      </section>

      {/* ── Featured Hotels ── */}
      <section className="py-16 md:py-20">
        <Container>
          <div ref={hotelHeader} className="sr flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-2">Top-rated</p>
              <h2 className="text-2xl md:text-3xl font-bold">Featured hotels</h2>
            </div>
            <Link href="/stays" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
              All hotels <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {hotelsLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-[#D7E2EE] bg-surface overflow-hidden animate-pulse">
                    <div className="h-48 bg-primary-muted" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-primary-muted rounded w-3/4" />
                      <div className="h-3 bg-primary-muted rounded w-1/2" />
                    </div>
                  </div>
                ))
              : hotels.length > 0
                ? hotels.map((h, i) => <HotelCard key={h.id} h={h} index={i} />)
                : (
                    <p className="col-span-3 text-center text-sm text-foreground-muted py-10">
                      No featured hotels available right now.
                    </p>
                  )}
          </div>

          <div className="flex justify-center mt-6 sm:hidden">
            <Link href="/stays" className="text-sm font-medium text-primary hover:underline flex items-center gap-1.5">
              All hotels <ArrowRight size={14} />
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
