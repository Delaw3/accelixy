import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { normalizeRole, requireActiveUser } from "@/lib/auth/guards";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const active = await requireActiveUser();
  if (!active.ok) {
    redirect("/login");
  }
  const session = active.session;

  if (normalizeRole(session.user.role) !== "ADMIN") {
    redirect("/dashboard");
  }

  return <AdminShell username={session.user.username}>{children}</AdminShell>;
}
