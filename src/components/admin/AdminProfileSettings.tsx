"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LogOut } from "lucide-react";
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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
          <div className="relative mt-1">
            <input
              type={showCurrentPassword ? "text" : "password"}
              className="w-full rounded-md border border-border bg-background px-3 py-2 pr-11 text-sm text-foreground outline-none focus:border-primary"
              {...register("currentPassword")}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-background/80 text-muted transition hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              onClick={() => setShowCurrentPassword((prev) => !prev)}
              aria-label={showCurrentPassword ? "Hide password" : "Show password"}
              aria-pressed={showCurrentPassword}
            >
              {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.currentPassword ? <span className="mt-1 block text-xs text-red-400">{errors.currentPassword.message}</span> : null}
        </label>

        <label className="block text-sm text-muted">
          New Password
          <div className="relative mt-1">
            <input
              type={showNewPassword ? "text" : "password"}
              className="w-full rounded-md border border-border bg-background px-3 py-2 pr-11 text-sm text-foreground outline-none focus:border-primary"
              {...register("newPassword")}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-background/80 text-muted transition hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              onClick={() => setShowNewPassword((prev) => !prev)}
              aria-label={showNewPassword ? "Hide password" : "Show password"}
              aria-pressed={showNewPassword}
            >
              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.newPassword ? <span className="mt-1 block text-xs text-red-400">{errors.newPassword.message}</span> : null}
        </label>

        <label className="block text-sm text-muted">
          Confirm New Password
          <div className="relative mt-1">
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="w-full rounded-md border border-border bg-background px-3 py-2 pr-11 text-sm text-foreground outline-none focus:border-primary"
              {...register("confirmNewPassword")}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-background/80 text-muted transition hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              aria-pressed={showConfirmPassword}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
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
