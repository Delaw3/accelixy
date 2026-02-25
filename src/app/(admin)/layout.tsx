import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { normalizeRole } from "@/lib/auth/guards";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  if (normalizeRole(session.user.role) !== "ADMIN") {
    redirect("/dashboard");
  }

  return <AdminShell username={session.user.username}>{children}</AdminShell>;
}
