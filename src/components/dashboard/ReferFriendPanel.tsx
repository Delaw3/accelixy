"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type ReferralUser = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  referralRewardPaid: boolean;
  referralBonusPaid: number;
  createdAt?: string;
};

export function ReferFriendPanel() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [referredUsers, setReferredUsers] = useState<ReferralUser[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/referrals/me");
        const payload = (await response.json()) as {
          ok?: boolean;
          data?: {
            referralCode?: string;
            referredUsers?: ReferralUser[];
          };
          message?: string;
        };

        if (!response.ok || !payload.ok || !payload.data) {
          setError(payload.message ?? "Unable to load referral data.");
          return;
        }

        setReferralCode(payload.data.referralCode ?? "");
        setReferredUsers(payload.data.referredUsers ?? []);
      } catch {
        setError("Unable to load referral data.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const copyCode = async () => {
    if (!referralCode) {
      return;
    }
    await navigator.clipboard.writeText(referralCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="space-y-5">
      <h3 className="text-2xl font-semibold md:text-3xl">Refer a Friend</h3>
      <p className="text-sm text-muted">
        Refer a friend and get instant 6% on their first deposit.
      </p>

      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-xs text-muted">Your Referral Code</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <p className="rounded-md border border-border bg-background px-3 py-2 text-lg font-semibold">
            {referralCode || "-"}
          </p>
          <Button type="button" variant="gradient" onClick={() => void copyCode()}>
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h4 className="text-lg font-semibold">Referred Users</h4>

        {loading ? <p className="mt-3 text-sm text-muted">Loading...</p> : null}
        {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}

        {!loading && !error && referredUsers.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No referrals yet</p>
        ) : null}

        {!loading && !error && referredUsers.length > 0 ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Referral Reward Paid</th>
                  <th className="px-3 py-2">Bonus Paid</th>
                </tr>
              </thead>
              <tbody>
                {referredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border/60">
                    <td className="px-3 py-2">{`${user.firstname} ${user.lastname}`}</td>
                    <td className="px-3 py-2">{user.email}</td>
                    <td className="px-3 py-2">
                      {user.referralRewardPaid ? "Yes" : "No"}
                    </td>
                    <td className="px-3 py-2">${user.referralBonusPaid.toFixed(2)}</td>
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
