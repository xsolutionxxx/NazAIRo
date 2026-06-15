"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Search, RefreshCw, Star } from "lucide-react";
import { adminApi } from "@features/dashboard/api/adminApi";
import { AppButton } from "@shared/ui/appButton";
import { AppInput } from "@shared/ui/appInput";

export default function AdminHotelsPage() {
  const [data, setData]     = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = (s = search) => {
    setLoading(true);
    adminApi.getHotels({ search: s, limit: 50 })
      .then((r) => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this hotel and all its rooms?")) return;
    setDeleting(id);
    await adminApi.deleteHotel(id);
    setDeleting(null);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hotels</h1>
          <p className="text-foreground-muted text-sm mt-1">{data?.total ?? "—"} hotels total</p>
        </div>
        <div className="flex gap-3">
          <AppButton intent="outline" icon={RefreshCw} onClick={() => load()} className="rounded-xl px-4">Refresh</AppButton>
          <AppButton icon={Plus} onClick={() => setShowForm(true)} className="rounded-xl px-4">Add Hotel</AppButton>
        </div>
      </div>

      <div className="flex gap-3">
        <AppInput placeholder="Search by name, city..." value={search} onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()} iconStart={Search} containerClassName="max-w-sm" />
        <AppButton intent="outline" onClick={() => load()} className="rounded-xl px-4">Search</AppButton>
      </div>

      {showForm && <AddHotelForm onSuccess={() => { setShowForm(false); load(); }} onCancel={() => setShowForm(false)} />}

      <div className="bg-surface rounded-2xl border border-[#D7E2EE] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-foreground-muted">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#D7E2EE] bg-background">
                  {["Name", "City", "Country", "Stars", "Rating", "Rooms", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-foreground-muted uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data?.hotels?.map((h: any) => (
                  <tr key={h.id} className="border-b border-[#D7E2EE] last:border-0 hover:bg-background transition-colors">
                    <td className="px-4 py-3 font-semibold">{h.name}</td>
                    <td className="px-4 py-3">{h.city}</td>
                    <td className="px-4 py-3 text-foreground-muted">{h.country}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-0.5">{Array.from({length: h.stars}).map((_,i) => <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />)}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-primary">{Number(h.rating).toFixed(1)}</td>
                    <td className="px-4 py-3 text-foreground-muted">{h.rooms?.length ?? 0}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(h.id)} disabled={deleting === h.id}
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

function AddHotelForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({ name: "", city: "", country: "", address: "", stars: "4", rating: "4.5", description: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      await adminApi.createHotel({ ...form, stars: Number(form.stars), rating: Number(form.rating), imageUrls: [], amenities: [] });
      onSuccess();
    } catch (e: any) { setError(e.response?.data?.message ?? "Failed"); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface rounded-2xl border border-[#D7E2EE] p-6">
      <h3 className="font-semibold mb-4">Add New Hotel</h3>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <AppInput label="Hotel Name" value={form.name} onChange={(e) => set("name", e.target.value)} required containerClassName="col-span-2 lg:col-span-1" />
        <AppInput label="City" value={form.city} onChange={(e) => set("city", e.target.value)} required />
        <AppInput label="Country" value={form.country} onChange={(e) => set("country", e.target.value)} required />
        <AppInput label="Address" value={form.address} onChange={(e) => set("address", e.target.value)} required containerClassName="col-span-2" />
        <AppInput label="Stars (1-5)" type="number" min={1} max={5} value={form.stars} onChange={(e) => set("stars", e.target.value)} required />
        <AppInput label="Rating (0-5)" type="number" min={0} max={5} step={0.1} value={form.rating} onChange={(e) => set("rating", e.target.value)} required />
      </div>
      {error && <p className="text-sm text-destructive mt-3">{error}</p>}
      <div className="flex gap-3 mt-5">
        <AppButton type="submit" disabled={saving} className="rounded-xl px-6">{saving ? "Saving..." : "Create Hotel"}</AppButton>
        <AppButton type="button" intent="outline" onClick={onCancel} className="rounded-xl px-6">Cancel</AppButton>
      </div>
    </form>
  );
}
