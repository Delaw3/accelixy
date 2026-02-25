"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type AdminUser = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  country: string;
  createdAt?: string;
  isActive: boolean;
};

type Stats = {
  totalUsers: number;
  pendingWithdrawals: number;
  activeInvestments: number;
};

const EMPTY_STATS: Stats = {
  totalUsers: 0,
  pendingWithdrawals: 0,
  activeInvestments: 0,
};

export function AdminUsersDashboard() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/users");
      const payload = (await response.json()) as {
        ok?: boolean;
        message?: string;
        data?: { users?: AdminUser[]; stats?: Stats };
      };

      if (!response.ok || !payload.ok || !payload.data) {
        setError(payload.message ?? "Unable to load admin dashboard.");
        return;
      }

      setUsers(payload.data.users ?? []);
      setStats(payload.data.stats ?? EMPTY_STATS);
    } catch {
      setError("Unable to load admin dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const toggleUserStatus = async (user: AdminUser) => {
    setBusyUserId(user.id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/users/${user.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });

      const payload = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !payload.ok) {
        setError(payload.message ?? "Unable to update user status.");
        return;
      }

      setUsers((prev) =>
        prev.map((item) => (item.id === user.id ? { ...item, isActive: !item.isActive } : item)),
      );
    } catch {
      setError("Unable to update user status.");
    } finally {
      setBusyUserId(null);
    }
  };

  const statCards = useMemo(
    () => [
      { label: "Total Users", value: stats.totalUsers },
      { label: "Pending Withdrawals", value: stats.pendingWithdrawals },
      { label: "Active Investments", value: stats.activeInvestments },
    ],
    [stats],
  );

  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-semibold md:text-3xl">Admin Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-3">
        {statCards.map((item) => (
          <article key={item.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold">{item.value}</p>
          </article>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Users</h2>
          <Button variant="ghost" onClick={() => void load()} disabled={loading}>
            Refresh
          </Button>
        </div>

        {loading ? <p className="text-sm text-muted">Loading users...</p> : null}
        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        {!loading && !error ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Country</th>
                  <th className="px-3 py-2">Created At</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-border/60">
                    <td className="px-3 py-2">{`${user.firstname} ${user.lastname}`}</td>
                    <td className="px-3 py-2">{user.email}</td>
                    <td className="px-3 py-2">{user.country}</td>
                    <td className="px-3 py-2">
                      {user.createdAt ? new Date(user.createdAt).toLocaleString() : "-"}
                    </td>
                    <td className="px-3 py-2">{user.isActive ? "ACTIVE" : "DEACTIVATED"}</td>
                    <td className="px-3 py-2">
                      <Button
                        variant={user.isActive ? "ghost" : "gradient"}
                        onClick={() => void toggleUserStatus(user)}
                        disabled={busyUserId === user.id}
                      >
                        {busyUserId === user.id
                          ? "Saving..."
                          : user.isActive
                            ? "Deactivate"
                            : "Activate"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </section>
  );
}
