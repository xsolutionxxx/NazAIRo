"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@features/dashboard/api/adminApi";
import { cn } from "@shared/lib/utils";
import { UserAvatar } from "@shared/ui/userAvatar";
import { AppSelect } from "@shared/ui/appSelect";
import { Shield, ShieldOff, Ban, CheckCircle } from "lucide-react";

const SERVER_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ?? "http://localhost:5000";
const avatarSrc = (url?: string | null) => url ? `${SERVER_URL}${url}` : null;

export default function AdminUsersPage() {
  const [users, setUsers]       = useState<any[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [roleFilter, setRole]   = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    adminApi.getUsers({ search: search || undefined, role: roleFilter || undefined })
      .then((r) => {
        const data = r.data;
        setUsers(Array.isArray(data) ? data : data.users ?? []);
        setTotal(data.total ?? (Array.isArray(data) ? data.length : 0));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, roleFilter]);

  const handleBlock = async (id: string, block: boolean) => {
    setActionId(id);
    try {
      await adminApi.blockUser(id, block);
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, isBlocked: block } : u));
    } finally { setActionId(null); }
  };

  const handleRole = async (id: string, currentRole: string) => {
    const next = currentRole === "ADMIN" ? "CLIENT" : "ADMIN";
    if (!confirm(`Change role to ${next}?`)) return;
    setActionId(id);
    try {
      await adminApi.setUserRole(id, next);
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role: next } : u));
    } finally { setActionId(null); }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-foreground-muted text-sm mt-0.5">{total} users total</p>
      </div>
      <div className="flex gap-2">
        <input
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 text-sm bg-background border border-[#D7E2EE] rounded-2xl outline-none focus:border-primary transition-colors"
        />
        <AppSelect
          value={roleFilter}
          onChange={setRole}
          options={[
            { value: "", label: "All roles" },
            { value: "CLIENT", label: "CLIENT" },
            { value: "ADMIN", label: "ADMIN" },
          ]}
          className="w-32 shrink-0"
        />
      </div>

      {loading ? (
        <div className="p-8 text-center text-foreground-muted">Loading...</div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-surface rounded-2xl border border-[#D7E2EE] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#D7E2EE] bg-background">
                    {["User", "Email", "Role", "Status", "Joined", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-foreground-muted uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className={cn("border-b border-[#D7E2EE] last:border-0 hover:bg-background transition-colors", u.isBlocked && "opacity-60")}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <UserAvatar src={avatarSrc(u.avatarUrl)} alt={u.firstName} className="h-8 w-8 text-xs shrink-0" />
                          <span className="font-medium">{u.firstName} {u.lastName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-foreground-muted">{u.email}</td>
                      <td className="px-4 py-3">
                        <RoleBadge role={u.role} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge u={u} />
                      </td>
                      <td className="px-4 py-3 text-foreground-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <Actions u={u} actionId={actionId} onBlock={handleBlock} onRole={handleRole} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {users.map((u) => (
              <div key={u.id} className={cn("bg-surface rounded-2xl border border-[#D7E2EE] p-4 space-y-3", u.isBlocked && "opacity-60")}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <UserAvatar src={avatarSrc(u.avatarUrl)} alt={u.firstName} className="h-9 w-9 text-xs shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-foreground-muted truncate">{u.email}</p>
                    </div>
                  </div>
                  <Actions u={u} actionId={actionId} onBlock={handleBlock} onRole={handleRole} />
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <RoleBadge role={u.role} />
                  <StatusBadge u={u} />
                  <span className="text-foreground-muted">{new Date(u.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full",
      role === "ADMIN" ? "bg-rose-50 text-rose-700" : "bg-blue-50 text-blue-700")}>
      {role ?? "CLIENT"}
    </span>
  );
}

function StatusBadge({ u }: { u: any }) {
  return (
    <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full",
      u.isBlocked ? "bg-red-50 text-red-700"
        : u.isActivated ? "bg-green-50 text-green-700"
        : "bg-amber-50 text-amber-700")}>
      {u.isBlocked ? "Blocked" : u.isActivated ? "Verified" : "Unverified"}
    </span>
  );
}

function Actions({ u, actionId, onBlock, onRole }: {
  u: any; actionId: string | null;
  onBlock: (id: string, block: boolean) => void;
  onRole: (id: string, role: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 shrink-0">
      <button
        onClick={() => onBlock(u.id, !u.isBlocked)}
        disabled={actionId === u.id}
        title={u.isBlocked ? "Unblock" : "Block"}
        className={cn("p-1.5 rounded-lg transition-colors disabled:opacity-40",
          u.isBlocked ? "hover:bg-green-50 text-green-600" : "hover:bg-red-50 text-red-500")}
      >
        {u.isBlocked ? <CheckCircle size={16} /> : <Ban size={16} />}
      </button>
      <button
        onClick={() => onRole(u.id, u.role)}
        disabled={actionId === u.id}
        title={u.role === "ADMIN" ? "Demote to CLIENT" : "Promote to ADMIN"}
        className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors disabled:opacity-40"
      >
        {u.role === "ADMIN" ? <ShieldOff size={16} /> : <Shield size={16} />}
      </button>
    </div>
  );
}
