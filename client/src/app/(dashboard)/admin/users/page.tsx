"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@features/dashboard/api/adminApi";
import { cn } from "@shared/lib/utils";
import { UserAvatar } from "@shared/ui/userAvatar";

export default function AdminUsersPage() {
  const [users, setUsers]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getUsers()
      .then((r) => { setUsers(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-foreground-muted text-sm mt-1">{users.length} users total</p>
      </div>

      <div className="bg-surface rounded-2xl border border-[#D7E2EE] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-foreground-muted">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#D7E2EE] bg-background">
                  {["User", "Email", "Phone", "Role", "Status", "Joined"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-foreground-muted uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u: any) => (
                  <tr key={u.id} className="border-b border-[#D7E2EE] last:border-0 hover:bg-background transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar src={u.avatarUrl} alt={u.firstName} className="h-8 w-8 text-xs shrink-0" />
                        <span className="font-medium">{u.firstName} {u.lastName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground-muted">{u.email}</td>
                    <td className="px-4 py-3 text-foreground-muted">{u.phone ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", u.role === "ADMIN" ? "bg-rose-50 text-rose-700" : "bg-blue-50 text-blue-700")}>
                        {u.role ?? "CLIENT"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", u.isActivated ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700")}>
                        {u.isActivated ? "Active" : "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
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
