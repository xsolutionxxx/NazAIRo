"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2, Search, RefreshCw, Star } from "lucide-react";
import { z } from "zod";
import { adminApi } from "@features/dashboard/api/adminApi";
import { AppButton } from "@shared/ui/appButton";
import { AppInput } from "@shared/ui/appInput";
import { cn } from "@shared/lib/utils";

const hotelSchema = z.object({
  name:        z.string().min(2, "Min 2 characters").max(100, "Max 100 characters"),
  city:        z.string().min(2, "Min 2 characters").max(60, "Max 60 characters"),
  country:     z.string().min(2, "Min 2 characters").max(60, "Max 60 characters"),
  address:     z.string().min(5, "Min 5 characters").max(200, "Max 200 characters"),
  stars:       z.number().int().min(1, "Min 1 star").max(5, "Max 5 stars"),
  rating:      z.number().min(0, "Min 0").max(5, "Max 5"),
  description: z.string().max(500, "Max 500 characters").optional(),
});

type HotelErrors = Partial<Record<string, string>>;

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
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Hotels</h1>
          <p className="text-foreground-muted text-sm mt-1">{data?.total ?? "—"} hotels total</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <AppButton intent="outline" icon={RefreshCw} onClick={() => load()} className="rounded-2xl px-3">
            <span className="hidden sm:inline">Refresh</span>
          </AppButton>
          <AppButton icon={Plus} onClick={() => setShowForm(true)} className="rounded-2xl px-3">
            <span className="hidden sm:inline">Add Hotel</span>
          </AppButton>
        </div>
      </div>

      <div className="flex gap-2">
        <AppInput placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()} iconStart={Search} containerClassName="flex-1" className="rounded-2xl" />
        <AppButton intent="outline" onClick={() => load()} className="rounded-2xl px-4 shrink-0">Search</AppButton>
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

const hFieldCls = (err?: string) =>
  cn(
    "w-full h-14 px-4 border-2 rounded-xl text-sm bg-transparent outline-none transition-colors appearance-none",
    err
      ? "border-destructive hover:border-destructive focus:border-destructive"
      : "border-input-secondary hover:border-primary focus:border-primary",
  );

function HotelField({ label, error, children, className }: { label: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className={cn("text-xs font-medium", error ? "text-destructive" : "text-foreground-muted")}>{label}</label>
      {children}
      {error && <p className="text-xs text-destructive leading-tight">{error}</p>}
    </div>
  );
}

function AddHotelForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({ name: "", city: "", country: "", address: "", stars: "4", rating: "4.5", description: "" });
  const [errors, setErrors] = useState<HotelErrors>({});
  const [serverError, setServerError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    const parsed = hotelSchema.safeParse({
      ...form,
      stars:  Number(form.stars),
      rating: Number(form.rating),
    });

    if (!parsed.success) {
      const fieldErrors: HotelErrors = {};
      parsed.error.issues.forEach((err) => {
        const key = err.path[0] as string;
        if (!fieldErrors[key]) fieldErrors[key] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSaving(true);
    try {
      await adminApi.createHotel({ ...parsed.data, imageUrls: [], amenities: [] });
      onSuccess();
    } catch (e: any) {
      setServerError(e.response?.data?.message ?? "Failed to create hotel");
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface rounded-2xl border border-[#D7E2EE] p-5 sm:p-6">
      <h3 className="font-semibold mb-5">Add New Hotel</h3>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-5">
        <HotelField label="Hotel Name" error={errors.name} className="col-span-2 lg:col-span-1">
          <input placeholder="Fairmont Grand Hotel Kyiv" value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className={hFieldCls(errors.name)} />
        </HotelField>
        <HotelField label="City" error={errors.city}>
          <input placeholder="Kyiv" value={form.city}
            onChange={(e) => set("city", e.target.value)}
            className={hFieldCls(errors.city)} />
        </HotelField>
        <HotelField label="Country" error={errors.country}>
          <input placeholder="Ukraine" value={form.country}
            onChange={(e) => set("country", e.target.value)}
            className={hFieldCls(errors.country)} />
        </HotelField>
        <HotelField label="Address" error={errors.address} className="col-span-2">
          <input placeholder="1 Naberezhno-Khreshchatytska St" value={form.address}
            onChange={(e) => set("address", e.target.value)}
            className={hFieldCls(errors.address)} />
        </HotelField>
        <HotelField label="Stars (1–5)" error={errors.stars}>
          <input type="number" placeholder="4" min={1} max={5} value={form.stars}
            onChange={(e) => set("stars", e.target.value)}
            className={hFieldCls(errors.stars)} />
        </HotelField>
        <HotelField label="Rating (0–5)" error={errors.rating}>
          <input type="number" placeholder="4.5" min={0} max={5} step={0.1} value={form.rating}
            onChange={(e) => set("rating", e.target.value)}
            className={hFieldCls(errors.rating)} />
        </HotelField>
        <HotelField label="Description (optional)" error={errors.description} className="col-span-2 lg:col-span-3">
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
            placeholder="Brief description of the hotel…" rows={2}
            className={cn(hFieldCls(errors.description), "h-auto py-3 resize-none")} />
        </HotelField>
      </div>
      {serverError && <p className="text-sm text-destructive mt-3">{serverError}</p>}
      <div className="flex gap-3 mt-5">
        <AppButton type="submit" disabled={saving} className="rounded-xl px-6">{saving ? "Saving…" : "Create Hotel"}</AppButton>
        <AppButton type="button" intent="outline" onClick={onCancel} className="rounded-xl px-6">Cancel</AppButton>
      </div>
    </form>
  );
}
