"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2, Search, RefreshCw } from "lucide-react";
import { z } from "zod";
import { adminApi } from "@features/dashboard/api/adminApi";
import { AppButton } from "@shared/ui/appButton";
import { AppInput } from "@shared/ui/appInput";
import { DateTimePicker } from "@shared/ui/dateTimePicker";
import { AppSelect } from "@shared/ui/appSelect";
import { cn } from "@shared/lib/utils";

const flightSchema = z.object({
  flightNumber:  z.string().min(2, "Min 2 chars").max(10, "Max 10 chars").regex(/^[A-Z0-9]+$/, "Uppercase letters and digits only"),
  airlineIata:   z.string().length(2, "Must be exactly 2 letters").regex(/^[A-Z]{2}$/, "2 uppercase letters"),
  departureIata: z.string().length(3, "Must be exactly 3 letters").regex(/^[A-Z]{3}$/, "3 uppercase letters"),
  arrivalIata:   z.string().length(3, "Must be exactly 3 letters").regex(/^[A-Z]{3}$/, "3 uppercase letters"),
  departureTime: z.string().min(1, "Required"),
  arrivalTime:   z.string().min(1, "Required"),
  price:         z.number().positive("Must be > 0"),
  cabinClass:    z.enum(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"]),
  availableSeats:z.number().int().positive("Must be > 0"),
  totalSeats:    z.number().int().positive("Must be > 0"),
}).refine((d) => new Date(d.arrivalTime) > new Date(d.departureTime), {
  message: "Arrival must be after departure",
  path: ["arrivalTime"],
}).refine((d) => d.availableSeats <= d.totalSeats, {
  message: "Available seats cannot exceed total seats",
  path: ["availableSeats"],
});

type FlightErrors = Partial<Record<string, string>>;

export default function AdminFlightsPage() {
  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = (s = search) => {
    setLoading(true);
    adminApi.getFlights({ search: s, limit: 50 })
      .then((r) => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this flight?")) return;
    setDeleting(id);
    await adminApi.deleteFlight(id);
    setDeleting(null);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Flights</h1>
          <p className="text-foreground-muted text-sm mt-1">{data?.total ?? "—"} flights total</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <AppButton intent="outline" icon={RefreshCw} onClick={() => load()} className="rounded-2xl px-3">
            <span className="hidden sm:inline">Refresh</span>
          </AppButton>
          <AppButton icon={Plus} onClick={() => setShowForm(true)} className="rounded-2xl px-3">
            <span className="hidden sm:inline">Add Flight</span>
          </AppButton>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <AppInput
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          iconStart={Search}
          containerClassName="flex-1"
          className="rounded-2xl"
        />
        <AppButton intent="outline" onClick={() => load()} className="rounded-2xl px-4 shrink-0">Search</AppButton>
      </div>

      {/* Add flight form */}
      {showForm && <AddFlightForm onSuccess={() => { setShowForm(false); load(); }} onCancel={() => setShowForm(false)} />}

      {/* Table */}
      <div className="bg-surface rounded-2xl border border-[#D7E2EE] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-foreground-muted">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#D7E2EE] bg-background">
                  {["Flight #", "Airline", "Route", "Departure", "Class", "Price", "Seats", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-foreground-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data?.flights?.map((f: any) => (
                  <tr key={f.id} className="border-b border-[#D7E2EE] last:border-0 hover:bg-background transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold">{f.flightNumber}</td>
                    <td className="px-4 py-3">{f.airline.name}</td>
                    <td className="px-4 py-3 font-medium">{f.departure.airport.iata} → {f.arrival.airport.iata}</td>
                    <td className="px-4 py-3 text-foreground-muted whitespace-nowrap">
                      {new Date(f.departure.time).toLocaleDateString()} {new Date(f.departure.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-4 py-3"><CabinBadge cabin={f.cabinClass} /></td>
                    <td className="px-4 py-3 font-semibold">${f.price}</td>
                    <td className="px-4 py-3">
                      <span className={cn(f.availableSeats < 10 ? "text-accent" : "text-foreground-muted")}>
                        {f.availableSeats}/{f.totalSeats}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(f.id)} disabled={deleting === f.id}
                        className="p-1.5 rounded-lg text-foreground-muted hover:text-destructive hover:bg-destructive/10 transition-all disabled:opacity-40">
                        <Trash2 size={15} strokeWidth={1.5} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const fieldCls = (err?: string) =>
  cn(
    "w-full h-14 px-4 border-2 rounded-xl text-sm bg-transparent outline-none transition-colors appearance-none",
    err
      ? "border-destructive hover:border-destructive focus:border-destructive"
      : "border-input-secondary hover:border-primary focus:border-primary",
  );

function AdminField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={cn("text-xs font-medium", error ? "text-destructive" : "text-foreground-muted")}>{label}</label>
      {children}
      {error && <p className="text-xs text-destructive leading-tight">{error}</p>}
    </div>
  );
}

function CabinBadge({ cabin }: { cabin: string }) {
  const map: Record<string, string> = {
    ECONOMY:         "bg-blue-50 text-blue-700",
    PREMIUM_ECONOMY: "bg-purple-50 text-purple-700",
    BUSINESS:        "bg-amber-50 text-amber-700",
    FIRST:           "bg-rose-50 text-rose-700",
  };
  const labels: Record<string, string> = { ECONOMY: "Economy", PREMIUM_ECONOMY: "Prem. Eco", BUSINESS: "Business", FIRST: "First" };
  return <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", map[cabin])}>{labels[cabin]}</span>;
}

function AddFlightForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    flightNumber: "", airlineIata: "", departureIata: "", arrivalIata: "",
    departureTime: "", arrivalTime: "", price: "", cabinClass: "ECONOMY",
    availableSeats: "", totalSeats: "",
  });
  const [errors, setErrors] = useState<FlightErrors>({});
  const [serverError, setServerError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    const parsed = flightSchema.safeParse({
      ...form,
      price:          Number(form.price),
      availableSeats: Number(form.availableSeats),
      totalSeats:     Number(form.totalSeats),
    });

    if (!parsed.success) {
      const fieldErrors: FlightErrors = {};
      parsed.error.issues.forEach((err) => {
        const key = err.path[0] as string;
        if (!fieldErrors[key]) fieldErrors[key] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSaving(true);
    try {
      const d = parsed.data;
      await adminApi.createFlight({
        ...d,
        departureTime: new Date(d.departureTime).toISOString(),
        arrivalTime:   new Date(d.arrivalTime).toISOString(),
      });
      onSuccess();
    } catch (e: any) {
      setServerError(e.response?.data?.message ?? "Failed to create flight");
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface rounded-2xl border border-[#D7E2EE] p-5 sm:p-6">
      <h3 className="font-semibold mb-5">Add New Flight</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-5 pt-2">
        <AdminField label="Flight №" error={errors.flightNumber}>
          <input placeholder="PS201" value={form.flightNumber}
            onChange={(e) => set("flightNumber", e.target.value.toUpperCase())}
            maxLength={10} className={fieldCls(errors.flightNumber)} />
        </AdminField>
        <AdminField label="Airline IATA" error={errors.airlineIata}>
          <input placeholder="PS" value={form.airlineIata}
            onChange={(e) => set("airlineIata", e.target.value.toUpperCase())}
            maxLength={2} className={fieldCls(errors.airlineIata)} />
        </AdminField>
        <AdminField label="From IATA" error={errors.departureIata}>
          <input placeholder="KBP" value={form.departureIata}
            onChange={(e) => set("departureIata", e.target.value.toUpperCase())}
            maxLength={3} className={fieldCls(errors.departureIata)} />
        </AdminField>
        <AdminField label="To IATA" error={errors.arrivalIata}>
          <input placeholder="FRA" value={form.arrivalIata}
            onChange={(e) => set("arrivalIata", e.target.value.toUpperCase())}
            maxLength={3} className={fieldCls(errors.arrivalIata)} />
        </AdminField>
        <DateTimePicker label="Departure" value={form.departureTime}
          onChange={(v) => set("departureTime", v)} error={errors.departureTime} />
        <DateTimePicker label="Arrival" value={form.arrivalTime}
          onChange={(v) => set("arrivalTime", v)} error={errors.arrivalTime}
          min={form.departureTime || undefined} />
        <AdminField label="Price ($)" error={errors.price}>
          <input type="number" placeholder="299" value={form.price} min={1}
            onChange={(e) => set("price", e.target.value)}
            className={fieldCls(errors.price)} />
        </AdminField>
        <AppSelect
          label="Cabin Class"
          value={form.cabinClass}
          onChange={(v) => set("cabinClass", v)}
          error={errors.cabinClass}
          options={[
            { value: "ECONOMY", label: "Economy" },
            { value: "PREMIUM_ECONOMY", label: "Premium Economy" },
            { value: "BUSINESS", label: "Business" },
            { value: "FIRST", label: "First Class" },
          ]}
        />
        <AdminField label="Available Seats" error={errors.availableSeats}>
          <input type="number" placeholder="180" value={form.availableSeats} min={1}
            onChange={(e) => set("availableSeats", e.target.value)}
            className={fieldCls(errors.availableSeats)} />
        </AdminField>
        <AdminField label="Total Seats" error={errors.totalSeats}>
          <input type="number" placeholder="180" value={form.totalSeats} min={1}
            onChange={(e) => set("totalSeats", e.target.value)}
            className={fieldCls(errors.totalSeats)} />
        </AdminField>
      </div>
      {serverError && <p className="text-sm text-destructive mt-3">{serverError}</p>}
      <div className="flex gap-3 mt-5">
        <AppButton type="submit" disabled={saving} className="rounded-xl px-6">{saving ? "Saving…" : "Create Flight"}</AppButton>
        <AppButton type="button" intent="outline" onClick={onCancel} className="rounded-xl px-6">Cancel</AppButton>
      </div>
    </form>
  );
}
