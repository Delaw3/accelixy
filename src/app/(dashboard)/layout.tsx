import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { LiveActivityToasts } from "@/components/landing/LiveActivityToasts";
import { normalizeRole } from "@/lib/auth/guards";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  if (normalizeRole(session.user.role) === "ADMIN") {
    redirect("/admin");
  }

  const username = session.user.username;

  return (
    <>
      <DashboardShell username={username}>{children}</DashboardShell>
      <LiveActivityToasts />
    </>
  );
}
