"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type UserOption = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
};

type TemplateKey = "custom" | "welcome" | "depositApproved" | "investmentPaid" | "withdrawalUpdate";

export function AdminMailForm() {
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [templateKey, setTemplateKey] = useState<TemplateKey>("custom");
  const [message, setMessage] = useState("");
  const [templateAmount, setTemplateAmount] = useState("");
  const [templatePlan, setTemplatePlan] = useState("");
  const [templateStatus, setTemplateStatus] = useState("PENDING");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      setLoadingUsers(true);
      try {
        const response = await fetch("/api/admin/users");
        const payload = (await response.json()) as {
          ok?: boolean;
          data?: { users?: UserOption[] };
        };
        if (response.ok && payload.ok && payload.data?.users) {
          setUsers(payload.data.users);
        }
      } finally {
        setLoadingUsers(false);
      }
    };

    void loadUsers();
  }, []);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/admin/mail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserId || undefined,
          email: email || undefined,
          subject,
          templateKey,
          templateVars: {
            amount: templateAmount,
            plan: templatePlan,
            status: templateStatus,
            message,
          },
          message: templateKey === "custom" ? message : undefined,
        }),
      });

      const payload = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !payload.ok) {
        setError(payload.message ?? "Unable to send mail.");
        return;
      }

      setSuccess("Mail sent successfully.");
      setMessage("");
      setTemplateAmount("");
      setTemplatePlan("");
      setTemplateStatus("PENDING");
    } catch {
      setError("Unable to send mail.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold md:text-3xl">Send Mail</h1>

      <form className="space-y-4 rounded-xl border border-border bg-card p-5" onSubmit={submit}>
        <label className="block text-sm text-muted">
          Select User
          <select
            value={selectedUserId}
            onChange={(event) => setSelectedUserId(event.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            disabled={loadingUsers}
          >
            <option value="">Select user (optional)</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstname} {user.lastname} - {user.email}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm text-muted">
          Or Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            placeholder="investor@example.com"
          />
        </label>

        <label className="block text-sm text-muted">
          Subject
          <input
            type="text"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            required
          />
        </label>

        <label className="block text-sm text-muted">
          Template
          <select
            value={templateKey}
            onChange={(event) => setTemplateKey(event.target.value as TemplateKey)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          >
            <option value="custom">Custom</option>
            <option value="welcome">Welcome</option>
            <option value="depositApproved">Deposit Approved</option>
            <option value="investmentPaid">Investment Paid</option>
            <option value="withdrawalUpdate">Withdrawal Update</option>
          </select>
        </label>

        {templateKey === "investmentPaid" ? (
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block text-sm text-muted">
              Amount
              <input
                type="text"
                value={templateAmount}
                onChange={(event) => setTemplateAmount(event.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
            </label>
            <label className="block text-sm text-muted">
              Plan
              <input
                type="text"
                value={templatePlan}
                onChange={(event) => setTemplatePlan(event.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
            </label>
          </div>
        ) : null}

        {templateKey === "withdrawalUpdate" ? (
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block text-sm text-muted">
              Amount
              <input
                type="text"
                value={templateAmount}
                onChange={(event) => setTemplateAmount(event.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
            </label>
            <label className="block text-sm text-muted">
              Status
              <select
                value={templateStatus}
                onChange={(event) => setTemplateStatus(event.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </label>
          </div>
        ) : null}

        {templateKey === "depositApproved" ? (
          <label className="block text-sm text-muted">
            Amount
            <input
              type="text"
              value={templateAmount}
              onChange={(event) => setTemplateAmount(event.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
          </label>
        ) : null}

        <label className="block text-sm text-muted">
          Message
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={6}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            placeholder="Type your message..."
          />
        </label>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        {success ? <p className="text-sm text-primary">{success}</p> : null}

        <Button type="submit" variant="gradient" disabled={submitting}>
          {submitting ? "Sending..." : "Send"}
        </Button>
      </form>
    </section>
  );
}
