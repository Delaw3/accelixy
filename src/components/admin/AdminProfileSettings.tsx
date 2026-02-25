"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmNewPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

type FormValues = z.infer<typeof schema>;

export function AdminProfileSettings() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    setSuccess(null);
    const response = await fetch("/api/user/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        oldPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmNewPassword,
      }),
    });
    const payload = (await response.json()) as { ok?: boolean; message?: string };
    if (!response.ok || !payload.ok) {
      setError(payload.message ?? "Unable to change password.");
      return;
    }
    setSuccess("Password changed successfully.");
    reset();
  };

  const logout = () => {
    void signOut({ callbackUrl: "/login" });
  };

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold md:text-3xl">Profile Settings</h1>

      <form className="space-y-4 rounded-xl border border-border bg-card p-5" onSubmit={handleSubmit(onSubmit)}>
        <label className="block text-sm text-muted">
          Current Password
          <input
            type="password"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            {...register("currentPassword")}
          />
          {errors.currentPassword ? <span className="mt-1 block text-xs text-red-400">{errors.currentPassword.message}</span> : null}
        </label>

        <label className="block text-sm text-muted">
          New Password
          <input
            type="password"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            {...register("newPassword")}
          />
          {errors.newPassword ? <span className="mt-1 block text-xs text-red-400">{errors.newPassword.message}</span> : null}
        </label>

        <label className="block text-sm text-muted">
          Confirm New Password
          <input
            type="password"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            {...register("confirmNewPassword")}
          />
          {errors.confirmNewPassword ? <span className="mt-1 block text-xs text-red-400">{errors.confirmNewPassword.message}</span> : null}
        </label>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        {success ? <p className="text-sm text-primary">{success}</p> : null}

        <Button type="submit" variant="gradient" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </form>

      <div className="rounded-xl border border-border bg-card p-5">
        <Button variant="ghost" className="gap-2" onClick={() => setLogoutConfirm(true)}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      {logoutConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-lg">
            <h4 className="text-lg font-semibold">Confirm Logout</h4>
            <p className="mt-2 text-sm text-muted">Are you sure you want to logout?</p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setLogoutConfirm(false)}>
                Cancel
              </Button>
              <Button variant="gradient" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
