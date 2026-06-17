"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plane, BedDouble, Search, MapPin, ArrowLeftRight } from "lucide-react";
import { cn } from "@shared/lib/utils";
import { DatePicker } from "@shared/ui/datePicker";
import $api from "@shared/api";

type Tab      = "flights" | "stays";
type TripType = "one-way" | "round-trip";

interface Airport { id: string; iata: string; name: string; city: string; country: string; }
interface City    { city: string; country: string; }

// ── Field label wrapper ───────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <span className="text-[10px] font-semibold text-foreground-muted uppercase tracking-widest pl-1">
        {label}
      </span>
      {children}
    </div>
  );
}

const inputCls =
  "w-full h-12 px-4 rounded-xl bg-background/80 border border-[#D7E2EE] text-sm text-foreground " +
  "placeholder:text-foreground-muted/60 outline-none hover:border-primary focus:border-primary " +
  "focus:bg-background transition-all";

// ── Dropdown list ─────────────────────────────────────────────────────────────

function Dropdown({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute top-full mt-1.5 left-0 right-0 bg-surface border border-[#D7E2EE] rounded-2xl shadow-xl z-[99999] overflow-hidden py-1">
      {children}
    </div>
  );
}

function DropdownItem({ onClick, primary, secondary }: { onClick: () => void; primary: string; secondary: string }) {
  return (
    <button
      onMouseDown={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-primary-muted text-left text-sm transition-colors cursor-pointer group"
    >
      <MapPin size={13} className="text-foreground-muted shrink-0 group-hover:text-primary transition-colors" />
      <span className="font-medium truncate">{primary}</span>
      <span className="text-xs text-foreground-muted ml-auto shrink-0">{secondary}</span>
    </button>
  );
}

// ── Counter field ─────────────────────────────────────────────────────────────

function Counter({ value, onDec, onInc, label }: { value: number; onDec: () => void; onInc: () => void; label: string }) {
  return (
    <Field label={label}>
      <div className="flex items-center h-12 rounded-xl bg-background/80 border border-[#D7E2EE] hover:border-primary transition-all overflow-hidden">
        <button onClick={onDec} className="h-full px-3 text-foreground-muted hover:text-primary hover:bg-primary-muted transition-colors cursor-pointer text-base leading-none shrink-0">
          −
        </button>
        <span className="flex-1 text-center text-sm font-semibold">{value}</span>
        <button onClick={onInc} className="h-full px-3 text-foreground-muted hover:text-primary hover:bg-primary-muted transition-colors cursor-pointer text-base leading-none shrink-0">
          +
        </button>
      </div>
    </Field>
  );
}

// ── Search button ─────────────────────────────────────────────────────────────

function SearchBtn({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="h-12 px-6 rounded-xl bg-primary text-foreground-static font-semibold text-sm flex items-center gap-2 shrink-0 disabled:opacity-40 hover:bg-[#9BE0C8] active:scale-95 transition-all cursor-pointer self-end"
    >
      <Search size={15} strokeWidth={2.5} />
      Search
    </button>
  );
}

// ── Trip-type toggle ──────────────────────────────────────────────────────────

function TripToggle({ value, onChange }: { value: TripType; onChange: (v: TripType) => void }) {
  return (
    <div className="flex gap-1 mb-3 bg-background/60 rounded-lg p-1 w-fit border border-[#D7E2EE]/60">
      {(["one-way", "round-trip"] as TripType[]).map(t => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={cn(
            "px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer capitalize",
            value === t
              ? "bg-primary text-foreground-static shadow-sm"
              : "text-foreground-muted hover:text-foreground"
          )}
        >
          {t === "one-way" ? "One Way" : "Round Trip"}
        </button>
      ))}
    </div>
  );
}

// ── Flight form ───────────────────────────────────────────────────────────────

function FlightForm() {
  const router = useRouter();
  const [tripType, setTripType]   = useState<TripType>("one-way");
  const [from, setFrom]           = useState<Airport | null>(null);
  const [to, setTo]               = useState<Airport | null>(null);
  const [fromQ, setFromQ]         = useState("");
  const [toQ, setToQ]             = useState("");
  const [fromOpts, setFromOpts]   = useState<Airport[]>([]);
  const [toOpts, setToOpts]       = useState<Airport[]>([]);
  const [fromOpen, setFromOpen]   = useState(false);
  const [toOpen, setToOpen]       = useState(false);
  const [departure, setDeparture] = useState("");
  const [returnDate, setReturn]   = useState("");
  const [pax, setPax]             = useState(1);

  const fromRef = useRef<HTMLDivElement>(null);
  const toRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (fromRef.current && !fromRef.current.contains(e.target as Node)) setFromOpen(false);
      if (toRef.current   && !toRef.current.contains(e.target as Node))   setToOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const fetchAirports = async (q: string, set: (a: Airport[]) => void, setOpen: (b: boolean) => void) => {
    if (q.length < 2) { set([]); return; }
    try {
      const r = await $api.get<Airport[]>("/flights/airports", { params: { search: q } });
      set(r.data ?? []);
      if ((r.data ?? []).length > 0) setOpen(true);
    } catch { set([]); }
  };

  const swap = () => {
    setFrom(to); setTo(from);
    setFromQ(toQ); setToQ(fromQ);
  };

  const submit = () => {
    if (!from || !to) return;
    const p = new URLSearchParams({ from: from.iata, to: to.iata, fromCity: from.city, toCity: to.city });
    if (departure)  p.set("date", departure);
    if (pax > 1)    p.set("passengers", String(pax));
    if (tripType === "round-trip" && returnDate) p.set("returnDate", returnDate);
    router.push(`/flights?${p}`);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      <TripToggle value={tripType} onChange={setTripType} />

      <div className="flex items-end gap-2">
        {/* From */}
        <div className="relative flex-1 min-w-0" ref={fromRef}>
          <Field label="From">
            <input
              value={fromQ}
              onChange={e => { setFromQ(e.target.value); setFrom(null); fetchAirports(e.target.value, setFromOpts, setFromOpen); }}
              onFocus={() => fromOpts.length > 0 && setFromOpen(true)}
              placeholder="City or airport"
              className={inputCls}
            />
          </Field>
          {fromOpen && fromOpts.length > 0 && (
            <Dropdown>
              {fromOpts.slice(0, 6).map(a => (
                <DropdownItem key={a.id} primary={`${a.city}, ${a.country}`} secondary={a.iata}
                  onClick={() => { setFrom(a); setFromQ(`${a.city} (${a.iata})`); setFromOpen(false); }} />
              ))}
            </Dropdown>
          )}
        </div>

        {/* Swap */}
        <button onClick={swap}
          className="h-12 w-11 shrink-0 flex items-center justify-center rounded-xl border border-[#D7E2EE] bg-background/80 hover:border-primary hover:bg-primary-muted transition-all cursor-pointer self-end">
          <ArrowLeftRight size={14} strokeWidth={1.5} className="text-foreground-muted" />
        </button>

        {/* To */}
        <div className="relative flex-1 min-w-0" ref={toRef}>
          <Field label="To">
            <input
              value={toQ}
              onChange={e => { setToQ(e.target.value); setTo(null); fetchAirports(e.target.value, setToOpts, setToOpen); }}
              onFocus={() => toOpts.length > 0 && setToOpen(true)}
              placeholder="City or airport"
              className={inputCls}
            />
          </Field>
          {toOpen && toOpts.length > 0 && (
            <Dropdown>
              {toOpts.slice(0, 6).map(a => (
                <DropdownItem key={a.id} primary={`${a.city}, ${a.country}`} secondary={a.iata}
                  onClick={() => { setTo(a); setToQ(`${a.city} (${a.iata})`); setToOpen(false); }} />
              ))}
            </Dropdown>
          )}
        </div>

        {/* Date block — expands to fit return when round-trip */}
        <div className={cn("shrink-0 flex items-end gap-px", tripType === "round-trip" ? "w-72" : "w-40")}>
          <div className="flex-1 min-w-0 flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold text-foreground-muted uppercase tracking-widest pl-1">
              Departure
            </span>
            <DatePicker
              value={departure}
              onChange={setDeparture}
              min={today}
              placeholder="Departure"
              className="gap-0"
              triggerClassName={cn(
                "h-12 bg-background/80 border border-[#D7E2EE] hover:border-primary text-sm pr-8",
                tripType === "round-trip" ? "rounded-l-xl rounded-r-none border-r-0" : "rounded-xl"
              )}
            />
          </div>
          {tripType === "round-trip" && (
            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold text-foreground-muted uppercase tracking-widest pl-1">
                Return
              </span>
              <DatePicker
                value={returnDate}
                onChange={setReturn}
                min={departure || today}
                placeholder="Return"
                className="gap-0"
                triggerClassName="h-12 bg-background/80 border border-[#D7E2EE] hover:border-primary rounded-l-none rounded-r-xl text-sm pr-8"
              />
            </div>
          )}
        </div>

        {/* Passengers */}
        <div className="w-28 shrink-0">
          <Counter label="Passengers" value={pax} onDec={() => setPax(p => Math.max(1, p - 1))} onInc={() => setPax(p => Math.min(9, p + 1))} />
        </div>

        <SearchBtn onClick={submit} disabled={!from || !to} />
      </div>
    </div>
  );
}

// ── Stay form ─────────────────────────────────────────────────────────────────

function StayForm() {
  const router = useRouter();
  const [cityQ, setCityQ]       = useState("");
  const [cityOpts, setCityOpts] = useState<City[]>([]);
  const [cityOpen, setCityOpen] = useState(false);
  const [checkIn, setCheckIn]   = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests]     = useState(2);

  const cityRef = useRef<HTMLDivElement>(null);
  const debRef  = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) setCityOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleCity = (val: string) => {
    setCityQ(val);
    clearTimeout(debRef.current);
    if (val.length >= 2) {
      debRef.current = setTimeout(async () => {
        try {
          const r = await $api.get<City[]>("/hotels/cities", { params: { search: val } });
          setCityOpts(r.data ?? []);
          if ((r.data ?? []).length > 0) setCityOpen(true);
        } catch { setCityOpts([]); }
      }, 250);
    } else {
      setCityOpen(false);
    }
  };

  const submit = () => {
    if (!cityQ || !checkIn || !checkOut) return;
    const p = new URLSearchParams({ city: cityQ, checkIn, checkOut, guests: String(guests) });
    router.push(`/stays?${p}`);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      <div className="flex items-end gap-2">
        {/* Destination */}
        <div className="relative flex-1 min-w-0" ref={cityRef}>
          <Field label="Destination">
            <input
              value={cityQ}
              onChange={e => handleCity(e.target.value)}
              onFocus={() => cityOpts.length > 0 && setCityOpen(true)}
              placeholder="City or hotel name"
              className={inputCls}
            />
          </Field>
          {cityOpen && cityOpts.length > 0 && (
            <Dropdown>
              {cityOpts.slice(0, 6).map(c => (
                <DropdownItem key={c.city} primary={c.city} secondary={c.country}
                  onClick={() => { setCityQ(c.city); setCityOpen(false); }} />
              ))}
            </Dropdown>
          )}
        </div>

        {/* Check-in */}
        <div className="w-38 shrink-0">
          <DatePicker label="Check-in" value={checkIn} onChange={setCheckIn} min={today} placeholder="Check-in" triggerClassName="h-12 border bg-background/80 border-[#D7E2EE] hover:border-primary rounded-xl text-sm" />
        </div>

        {/* Check-out */}
        <div className="w-38 shrink-0">
          <DatePicker label="Check-out" value={checkOut} onChange={setCheckOut} min={checkIn || today} placeholder="Check-out" triggerClassName="h-12 border bg-background/80 border-[#D7E2EE] hover:border-primary rounded-xl text-sm" />
        </div>

        {/* Guests */}
        <div className="w-28 shrink-0">
          <Counter label="Guests" value={guests} onDec={() => setGuests(p => Math.max(1, p - 1))} onInc={() => setGuests(p => Math.min(20, p + 1))} />
        </div>

        <SearchBtn onClick={submit} disabled={!cityQ || !checkIn || !checkOut} />
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function HeroSearch() {
  const [tab, setTab] = useState<Tab>("stays");

  return (
    <div
      className="absolute bottom-[calc(5rem+20px)] left-1/2 -translate-x-1/2 w-full max-w-6xl px-6 hidden lg:block"
      style={{ zIndex: 99999 }}
    >
      {/* Tab buttons */}
      <div className="flex gap-1">
        {(["flights", "stays"] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-t-xl transition-all cursor-pointer select-none",
              tab === t
                ? "bg-surface/95 text-foreground backdrop-blur-md"
                : "bg-black/25 text-white/85 hover:bg-black/35 backdrop-blur-sm"
            )}
          >
            {t === "flights"
              ? <Plane size={14} strokeWidth={1.5} />
              : <BedDouble size={14} strokeWidth={1.5} />}
            {t === "flights" ? "Find Flight" : "Find Stays"}
          </button>
        ))}
      </div>

      {/* Panel */}
      <div className="bg-surface/95 backdrop-blur-md rounded-b-2xl rounded-tr-2xl border border-[#D7E2EE]/60 shadow-2xl px-5 pt-4 pb-5">
        <div key={tab} className="hero-form-animate">
          {tab === "flights" ? <FlightForm /> : <StayForm />}
        </div>
      </div>
    </div>
  );
}
