"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Search, RefreshCw } from "lucide-react";
import { adminApi } from "@features/dashboard/api/adminApi";
import { AppButton } from "@shared/ui/appButton";
import { AppInput } from "@shared/ui/appInput";
import { cn } from "@shared/lib/utils";

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Flights</h1>
          <p className="text-foreground-muted text-sm mt-1">{data?.total ?? "—"} flights total</p>
        </div>
        <div className="flex gap-3">
          <AppButton intent="outline" icon={RefreshCw} onClick={() => load()} className="rounded-xl px-4">Refresh</AppButton>
          <AppButton icon={Plus} onClick={() => setShowForm(true)} className="rounded-xl px-4">Add Flight</AppButton>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <AppInput
          placeholder="Search by flight №, city, airline..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          iconStart={Search}
          containerClassName="max-w-sm"
        />
        <AppButton intent="outline" onClick={() => load()} className="rounded-xl px-4">Search</AppButton>
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
  const [form, setForm] = useState({ flightNumber: "", airlineIata: "", departureIata: "", arrivalIata: "", departureTime: "", arrivalTime: "", price: "", cabinClass: "ECONOMY", availableSeats: "", totalSeats: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      await adminApi.createFlight({
        ...form,
        price: Number(form.price),
        availableSeats: Number(form.availableSeats),
        totalSeats: Number(form.totalSeats),
        departureTime: new Date(form.departureTime).toISOString(),
        arrivalTime: new Date(form.arrivalTime).toISOString(),
      });
      onSuccess();
    } catch (e: any) {
      setError(e.response?.data?.message ?? "Failed to create flight");
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface rounded-2xl border border-[#D7E2EE] p-6">
      <h3 className="font-semibold mb-4">Add New Flight</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AppInput label="Flight №" value={form.flightNumber} onChange={(e) => set("flightNumber", e.target.value)} required />
        <AppInput label="Airline IATA (e.g. LH)" value={form.airlineIata} onChange={(e) => set("airlineIata", e.target.value.toUpperCase())} required maxLength={2} />
        <AppInput label="From IATA (e.g. KBP)" value={form.departureIata} onChange={(e) => set("departureIata", e.target.value.toUpperCase())} required maxLength={3} />
        <AppInput label="To IATA (e.g. FRA)" value={form.arrivalIata} onChange={(e) => set("arrivalIata", e.target.value.toUpperCase())} required maxLength={3} />
        <AppInput label="Departure" type="datetime-local" value={form.departureTime} onChange={(e) => set("departureTime", e.target.value)} required />
        <AppInput label="Arrival" type="datetime-local" value={form.arrivalTime} onChange={(e) => set("arrivalTime", e.target.value)} required />
        <AppInput label="Price ($)" type="number" value={form.price} onChange={(e) => set("price", e.target.value)} required min={1} />
        <div>
          <label className="block text-xs font-medium text-foreground-muted mb-1.5">Cabin Class</label>
          <select value={form.cabinClass} onChange={(e) => set("cabinClass", e.target.value)}
            className="w-full h-14 px-4 border-2 border-input-secondary rounded text-sm bg-transparent outline-none hover:border-primary focus:border-primary">
            <option value="ECONOMY">Economy</option>
            <option value="PREMIUM_ECONOMY">Premium Economy</option>
            <option value="BUSINESS">Business</option>
            <option value="FIRST">First Class</option>
          </select>
        </div>
        <AppInput label="Available Seats" type="number" value={form.availableSeats} onChange={(e) => set("availableSeats", e.target.value)} required min={1} />
        <AppInput label="Total Seats" type="number" value={form.totalSeats} onChange={(e) => set("totalSeats", e.target.value)} required min={1} />
      </div>
      {error && <p className="text-sm text-destructive mt-3">{error}</p>}
      <div className="flex gap-3 mt-5">
        <AppButton type="submit" disabled={saving} className="rounded-xl px-6">{saving ? "Saving..." : "Create Flight"}</AppButton>
        <AppButton type="button" intent="outline" onClick={onCancel} className="rounded-xl px-6">Cancel</AppButton>
      </div>
    </form>
  );
}
