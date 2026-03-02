import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { LiveActivityToasts } from "@/components/landing/LiveActivityToasts";
import { normalizeRole, requireActiveUser } from "@/lib/auth/guards";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const active = await requireActiveUser();
  if (!active.ok) {
    redirect("/login");
  }
  const session = active.session;

  if (normalizeRole(session.user.role) === "ADMIN") {
    redirect("/admin");
  }

  const username = session.user.username;
  const role = normalizeRole(session.user.role);

  return (
    <>
      <DashboardShell username={username} role={role}>{children}</DashboardShell>
      <LiveActivityToasts />
    </>
  );
}
