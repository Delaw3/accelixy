import { auth } from "@/auth";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/models/user.model";

export function normalizeRole(role: unknown): "USER" | "ADMIN" {
  const value = String(role ?? "").trim().toUpperCase();
  return value === "ADMIN" ? "ADMIN" : "USER";
}

export async function requireAuthedUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false as const, status: 401, message: "Unauthorized" };
  }

  return { ok: true as const, session };
}

export async function requireAdminUser() {
  const active = await requireActiveUser();
  if (!active.ok) {
    return active;
  }

  const role = normalizeRole(active.dbUser.role ?? active.session.user.role);
  if (role !== "ADMIN") {
    return { ok: false as const, status: 403, message: "Forbidden" };
  }

  return { ok: true as const, session: active.session };
}

export async function requireActiveUser() {
  const authed = await requireAuthedUser();
  if (!authed.ok) {
    return authed;
  }

  await connectDB();
  const dbUser = await User.findById(authed.session.user.id)
    .select("role isActive")
    .lean<{ role?: string; isActive?: boolean } | null>();

  if (!dbUser || dbUser.isActive === false) {
    return {
      ok: false as const,
      status: 403,
      message: "Your account is temporally deactivated, try contacting support.",
    };
  }

  return { ok: true as const, session: authed.session, dbUser };
}
