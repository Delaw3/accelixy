"use client";

import { X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "error";

type AdminUser = {
  id: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  country: string;
  createdAt?: string;
  isActive: boolean;
  walletBalance: number;
  bitcoinBTC: string;
  usdtTRC20: string;
  usdtBEP20: string;
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
  const [busyStatusUserId, setBusyStatusUserId] = useState<string | null>(null);
  const [busySaveUserId, setBusySaveUserId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const usernameDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const usernameAbortRef = useRef<AbortController | null>(null);
  const [editValues, setEditValues] = useState({
    firstname: "",
    lastname: "",
    username: "",
    walletBalance: "0",
    bitcoinBTC: "",
    usdtTRC20: "",
    usdtBEP20: "",
  });

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

  useEffect(() => {
    return () => {
      if (usernameDebounceRef.current) {
        clearTimeout(usernameDebounceRef.current);
      }
      usernameAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!editingUser) {
      return;
    }

    const normalized = editValues.username.trim().toLowerCase();
    const original = editingUser.username.trim().toLowerCase();
    const validPattern = /^[a-zA-Z0-9._-]+$/;

    if (usernameDebounceRef.current) {
      clearTimeout(usernameDebounceRef.current);
    }
    usernameAbortRef.current?.abort();

    if (!normalized || normalized === original) {
      setUsernameStatus("idle");
      return;
    }

    if (normalized.length < 3 || !validPattern.test(normalized)) {
      setUsernameStatus("idle");
      return;
    }

    setUsernameStatus("checking");
    usernameDebounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      usernameAbortRef.current = controller;
      try {
        const response = await fetch(
          `/api/auth/check-username?username=${encodeURIComponent(normalized)}`,
          { signal: controller.signal },
        );
        if (!response.ok) {
          setUsernameStatus("error");
          return;
        }
        const payload = (await response.json()) as { available?: boolean };
        setUsernameStatus(payload.available ? "available" : "taken");
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === "AbortError") {
          return;
        }
        setUsernameStatus("error");
      }
    }, 450);
  }, [editValues.username, editingUser]);

  const toggleUserStatus = async (user: AdminUser) => {
    setBusyStatusUserId(user.id);
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
      setBusyStatusUserId(null);
    }
  };

  const openEditModal = (user: AdminUser) => {
    setEditingUser(user);
    setEditError(null);
    setEditValues({
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      walletBalance: user.walletBalance.toString(),
      bitcoinBTC: user.bitcoinBTC,
      usdtTRC20: user.usdtTRC20,
      usdtBEP20: user.usdtBEP20,
    });
    setUsernameStatus("idle");
  };

  const saveUserUpdates = async () => {
    if (!editingUser) {
      return;
    }

    const walletBalance = Number(editValues.walletBalance);
    if (Number.isNaN(walletBalance) || walletBalance < 0) {
      setEditError("Wallet balance must be a number greater than or equal to 0.");
      return;
    }

    setBusySaveUserId(editingUser.id);
    setEditError(null);
    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstname: editValues.firstname,
          lastname: editValues.lastname,
          username: editValues.username,
          walletBalance,
          bitcoinBTC: editValues.bitcoinBTC,
          usdtTRC20: editValues.usdtTRC20,
          usdtBEP20: editValues.usdtBEP20,
        }),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        message?: string;
        data?: {
          id: string;
          firstname: string;
          lastname: string;
          username: string;
          walletBalance: number;
          bitcoinBTC: string;
          usdtTRC20: string;
          usdtBEP20: string;
        };
      };

      if (!response.ok || !payload.ok || !payload.data) {
        if (typeof payload.data?.walletBalance === "number") {
          setEditValues((prev) => ({
            ...prev,
            walletBalance: payload.data?.walletBalance.toString() ?? prev.walletBalance,
          }));
        }
        setEditError(payload.message ?? "Unable to update user.");
        return;
      }

      setUsers((prev) =>
        prev.map((item) =>
          item.id === editingUser.id
            ? {
                ...item,
                firstname: payload.data?.firstname ?? item.firstname,
                lastname: payload.data?.lastname ?? item.lastname,
                username: payload.data?.username ?? item.username,
                walletBalance: payload.data?.walletBalance ?? item.walletBalance,
                bitcoinBTC: payload.data?.bitcoinBTC ?? item.bitcoinBTC,
                usdtTRC20: payload.data?.usdtTRC20 ?? item.usdtTRC20,
                usdtBEP20: payload.data?.usdtBEP20 ?? item.usdtBEP20,
              }
            : item,
        ),
      );
      setEditingUser(null);
    } catch {
      setEditError("Unable to update user.");
    } finally {
      setBusySaveUserId(null);
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
                  <th className="px-3 py-2">Username</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Country</th>
                  <th className="px-3 py-2">Wallet Balance</th>
                  <th className="px-3 py-2">Created At</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-border/60">
                    <td className="px-3 py-2">{`${user.firstname} ${user.lastname}`}</td>
                    <td className="px-3 py-2">{user.username}</td>
                    <td className="px-3 py-2">{user.email}</td>
                    <td className="px-3 py-2">{user.country}</td>
                    <td className="px-3 py-2">${user.walletBalance.toFixed(2)}</td>
                    <td className="px-3 py-2">
                      {user.createdAt ? new Date(user.createdAt).toLocaleString() : "-"}
                    </td>
                    <td className="px-3 py-2">{user.isActive ? "ACTIVE" : "DEACTIVATED"}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="gradient"
                          onClick={() => openEditModal(user)}
                        >
                          Update
                        </Button>
                        <Button
                          variant={user.isActive ? "ghost" : "gradient"}
                          className={user.isActive ? "text-red-400 hover:text-red-300" : undefined}
                          onClick={() => void toggleUserStatus(user)}
                          disabled={busyStatusUserId === user.id}
                        >
                          {busyStatusUserId === user.id
                            ? "Saving..."
                            : user.isActive
                              ? "Deactivate"
                              : "Activate"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      {editingUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-xl border border-border bg-card p-5 shadow-lg">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">Update User</h3>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted transition hover:text-foreground"
                onClick={() => setEditingUser(null)}
                aria-label="Close update user modal"
                disabled={busySaveUserId === editingUser.id}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="block text-sm text-muted">
                First Name
                <input
                  type="text"
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  value={editValues.firstname}
                  onChange={(event) =>
                    setEditValues((prev) => ({ ...prev, firstname: event.target.value }))
                  }
                />
              </label>

              <label className="block text-sm text-muted">
                Last Name
                <input
                  type="text"
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  value={editValues.lastname}
                  onChange={(event) =>
                    setEditValues((prev) => ({ ...prev, lastname: event.target.value }))
                  }
                />
              </label>

              <label className="block text-sm text-muted md:col-span-2">
                Username
                <input
                  type="text"
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  value={editValues.username}
                  onChange={(event) =>
                    setEditValues((prev) => ({ ...prev, username: event.target.value }))
                  }
                />
                <span className={`mt-1 block text-xs ${getUsernameStatusClassName(usernameStatus)}`}>
                  {getUsernameStatusMessage(usernameStatus)}
                </span>
              </label>

              <label className="block text-sm text-muted md:col-span-2">
                Wallet Balance (USD)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  value={editValues.walletBalance}
                  onChange={(event) =>
                    setEditValues((prev) => ({ ...prev, walletBalance: event.target.value }))
                  }
                />
              </label>

              <label className="block text-sm text-muted md:col-span-2">
                Bitcoin BTC Wallet
                <input
                  type="text"
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  value={editValues.bitcoinBTC}
                  onChange={(event) =>
                    setEditValues((prev) => ({ ...prev, bitcoinBTC: event.target.value }))
                  }
                />
              </label>

              <label className="block text-sm text-muted md:col-span-2">
                USDT TRC20 Wallet
                <input
                  type="text"
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  value={editValues.usdtTRC20}
                  onChange={(event) =>
                    setEditValues((prev) => ({ ...prev, usdtTRC20: event.target.value }))
                  }
                />
              </label>

              <label className="block text-sm text-muted md:col-span-2">
                USDT BEP20 Wallet
                <input
                  type="text"
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  value={editValues.usdtBEP20}
                  onChange={(event) =>
                    setEditValues((prev) => ({ ...prev, usdtBEP20: event.target.value }))
                  }
                />
              </label>
            </div>

            {editError ? <p className="mt-3 text-sm text-red-400">{editError}</p> : null}

            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditingUser(null)}
                disabled={busySaveUserId === editingUser.id}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="gradient"
                onClick={() => void saveUserUpdates()}
                disabled={
                  busySaveUserId === editingUser.id ||
                  usernameStatus === "checking" ||
                  usernameStatus === "taken"
                }
              >
                {busySaveUserId === editingUser.id ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function getUsernameStatusMessage(status: UsernameStatus) {
  if (status === "checking") {
    return "Checking username availability...";
  }
  if (status === "available") {
    return "Username is available.";
  }
  if (status === "taken") {
    return "Username is already taken.";
  }
  if (status === "error") {
    return "Unable to verify username right now.";
  }
  return "";
}

function getUsernameStatusClassName(status: UsernameStatus) {
  if (status === "available") {
    return "text-primary";
  }
  if (status === "taken" || status === "error") {
    return "text-red-400";
  }
  return "text-muted";
}
