"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  ChevronDown,
  House,
  KeyRound,
  LogOut,
  Menu,
  UserCog,
  WalletCards,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SiteTranslator } from "@/components/layout/SiteTranslator";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";

type DashboardTopbarProps = {
  username: string;
  onMenuClick: () => void;
};

type ProfilePayload = {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  country: string;
  phone: string;
  referralCode: string;
};

type WalletPayload = {
  bitcoinBTC: string;
  usdtTRC20: string;
  usdtBEP20: string;
};

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "error";

const profileSchema = z.object({
  firstname: z.string().trim().min(1, "First name is required"),
  lastname: z.string().trim().min(1, "Last name is required"),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-zA-Z0-9._-]+$/, "Username contains invalid characters"),
  country: z.string().trim().min(1, "Country is required"),
  phone: z.string().trim().min(5, "Phone is required"),
});

const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const walletSchema = z.object({
  bitcoinBTC: z.string().max(200).optional().or(z.literal("")),
  usdtTRC20: z.string().max(200).optional().or(z.literal("")),
  usdtBEP20: z.string().max(200).optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;
type WalletFormValues = z.infer<typeof walletSchema>;

export function DashboardTopbar({ username, onMenuClick }: DashboardTopbarProps) {
  const { update } = useSession();
  const [displayUsername, setDisplayUsername] = useState(username);
  const [profileData, setProfileData] = useState<ProfilePayload | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [logoutSource, setLogoutSource] = useState<"home" | "menu">("menu");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isWalletLoading, setIsWalletLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const usernameDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const usernameAbortRef = useRef<AbortController | null>(null);

  const initial = displayUsername?.trim().charAt(0).toUpperCase() || "U";

  useEffect(() => {
    setDisplayUsername(username);
  }, [username]);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    watch: watchProfile,
    formState: { errors: profileFormErrors, isSubmitting: isProfileSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      username: "",
      country: "",
      phone: "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordFormErrors, isSubmitting: isPasswordSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const {
    register: registerWallet,
    handleSubmit: handleWalletSubmit,
    reset: resetWallet,
    formState: { errors: walletFormErrors, isSubmitting: isWalletSubmitting },
  } = useForm<WalletFormValues>({
    resolver: zodResolver(walletSchema),
    defaultValues: {
      bitcoinBTC: "",
      usdtTRC20: "",
      usdtBEP20: "",
    },
  });

  const watchedUsername = watchProfile("username");
  const currentUsername = useMemo(
    () => profileData?.username?.trim().toLowerCase() ?? "",
    [profileData?.username],
  );

  useEffect(() => {
    if (!isProfileModalOpen) {
      return;
    }

    const normalized = (watchedUsername ?? "").trim().toLowerCase();
    const validPattern = /^[a-zA-Z0-9._-]+$/;

    if (usernameDebounceRef.current) {
      clearTimeout(usernameDebounceRef.current);
    }
    usernameAbortRef.current?.abort();

    if (!normalized || normalized === currentUsername) {
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
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setUsernameStatus("error");
      }
    }, 450);
  }, [currentUsername, isProfileModalOpen, watchedUsername]);

  useEffect(() => {
    return () => {
      if (usernameDebounceRef.current) {
        clearTimeout(usernameDebounceRef.current);
      }
      usernameAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timer = setTimeout(() => {
      setSuccessMessage(null);
    }, 2200);

    return () => clearTimeout(timer);
  }, [successMessage]);

  const handleLogout = () => {
    void signOut({ callbackUrl: "/" });
  };

  const askLogoutConfirmation = (source: "home" | "menu") => {
    setIsProfileMenuOpen(false);
    setLogoutSource(source);
    setIsLogoutConfirmOpen(true);
  };

  const openProfileModal = async () => {
    setIsProfileMenuOpen(false);
    setProfileError(null);
    setIsProfileLoading(true);
    setUsernameStatus("idle");

    try {
      const response = await fetch("/api/user/profile");
      const payload = (await response.json()) as {
        ok?: boolean;
        data?: ProfilePayload;
        message?: string;
      };

      if (!response.ok || !payload.ok || !payload.data) {
        setProfileError(payload.message ?? "Unable to load profile.");
        return;
      }

      setProfileData(payload.data);
      setDisplayUsername(payload.data.username);
      resetProfile({
        firstname: payload.data.firstname,
        lastname: payload.data.lastname,
        username: payload.data.username,
        country: payload.data.country,
        phone: payload.data.phone,
      });
      setIsProfileModalOpen(true);
    } catch {
      setProfileError("Unable to load profile.");
      setIsProfileModalOpen(true);
    } finally {
      setIsProfileLoading(false);
    }
  };

  const openPasswordModal = () => {
    setIsProfileMenuOpen(false);
    setPasswordError(null);
    resetPassword({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsPasswordModalOpen(true);
  };

  const openWalletModal = async () => {
    setIsProfileMenuOpen(false);
    setWalletError(null);
    setIsWalletLoading(true);

    try {
      const response = await fetch("/api/user/wallets");
      const payload = (await response.json()) as {
        ok?: boolean;
        data?: { wallets?: WalletPayload };
        message?: string;
      };

      if (!response.ok || !payload.ok) {
        setWalletError(payload.message ?? "Unable to load wallet addresses.");
      } else {
        const nextWallets = {
          bitcoinBTC: payload.data?.wallets?.bitcoinBTC ?? "",
          usdtTRC20: payload.data?.wallets?.usdtTRC20 ?? "",
          usdtBEP20: payload.data?.wallets?.usdtBEP20 ?? "",
        };
        resetWallet(nextWallets);
      }

      setIsWalletModalOpen(true);
    } catch {
      setWalletError("Unable to load wallet addresses.");
      setIsWalletModalOpen(true);
    } finally {
      setIsWalletLoading(false);
    }
  };

  const onSubmitProfile = async (values: ProfileFormValues) => {
    setProfileError(null);

    if (usernameStatus === "taken") {
      setProfileError("Username is already taken.");
      return;
    }

    const response = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const payload = (await response.json()) as {
      ok?: boolean;
      message?: string;
      data?: ProfilePayload;
    };

    if (!response.ok || !payload.ok || !payload.data) {
      setProfileError(payload.message ?? "Unable to update profile.");
      return;
    }

    setProfileData(payload.data);
    setDisplayUsername(payload.data.username);
    await update({
      user: {
        firstname: payload.data.firstname,
        lastname: payload.data.lastname,
        username: payload.data.username,
        country: payload.data.country,
        phone: payload.data.phone,
      },
    });
    setIsProfileModalOpen(false);
    setSuccessMessage("Profile updated successfully.");
  };

  const onSubmitPassword = async (values: PasswordFormValues) => {
    setPasswordError(null);

    const response = await fetch("/api/user/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const payload = (await response.json()) as {
      ok?: boolean;
      message?: string;
    };

    if (!response.ok || !payload.ok) {
      setPasswordError(payload.message ?? "Unable to reset password.");
      return;
    }

    setIsPasswordModalOpen(false);
    setSuccessMessage("Password reset successful.");
  };

  const onSubmitWallet = async (values: WalletFormValues) => {
    setWalletError(null);

    if (!values.bitcoinBTC?.trim() && !values.usdtTRC20?.trim() && !values.usdtBEP20?.trim()) {
      setWalletError("Add at least one wallet address.");
      return;
    }

    const response = await fetch("/api/user/wallets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const payload = (await response.json()) as {
      ok?: boolean;
      message?: string;
      data?: { wallets?: WalletPayload };
    };

    if (!response.ok || !payload.ok) {
      setWalletError(payload.message ?? "Unable to update wallet addresses.");
      return;
    }

    setIsWalletModalOpen(false);
    setSuccessMessage("Wallet addresses updated successfully.");
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="flex items-center gap-3 px-4 py-3 md:px-6">
          <button
            type="button"
            onClick={() => askLogoutConfirmation("home")}
            className="hidden items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground transition hover:border-primary hover:text-primary sm:inline-flex"
          >
            <House className="h-4 w-4" />
            Go Back
          </button>

          <button
            type="button"
            onClick={() => askLogoutConfirmation("home")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground sm:hidden"
            aria-label="Go back home"
          >
            <House className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground md:hidden"
            aria-label="Open dashboard menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="ml-auto flex items-center gap-2">
            <SiteTranslator />
            <ThemeToggle />
            <div className="relative">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border-2 border-primary/50 bg-card px-2 py-2 sm:rounded-lg sm:border sm:border-border sm:px-3"
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                aria-label="Open profile menu"
              >
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-background text-xs font-semibold text-primary ring-2 ring-primary/40">
                  {initial}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold leading-tight">{displayUsername}</p>
                  <p className="text-[11px] uppercase leading-tight text-muted">User</p>
                </div>
                <ChevronDown className="hidden h-4 w-4 text-muted sm:block" />
              </button>

              {isProfileMenuOpen ? (
                <div className="absolute right-0 z-50 mt-2 w-56 rounded-lg border border-border bg-card p-1 shadow-lg">
                  <div className="mb-1 flex items-center gap-2 rounded-md border-b border-border px-3 py-3">
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-background text-xs font-semibold text-primary ring-2 ring-primary/40">
                      {initial}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold leading-tight">{displayUsername}</p>
                      <p className="text-[11px] uppercase leading-tight text-muted">User</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-background"
                    onClick={() => void openProfileModal()}
                  >
                    <UserCog className="h-4 w-4" />
                    Profile
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-background"
                    onClick={openPasswordModal}
                  >
                    <KeyRound className="h-4 w-4" />
                    Reset Password
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-background"
                    onClick={() => void openWalletModal()}
                  >
                    <WalletCards className="h-4 w-4" />
                    Update Wallet Address
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-background"
                    onClick={() => askLogoutConfirmation("menu")}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {isLogoutConfirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-lg">
            <h4 className="text-lg font-semibold">Confirm Logout</h4>
            <p className="mt-2 text-sm text-muted">
              {logoutSource === "home"
                ? "You need to log out before going back to the home page. Are you sure you want to logout?"
                : "Are you sure you want to logout?"}
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:border-primary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-secondary hover:opacity-90"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isProfileModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-lg">
            <h4 className="text-lg font-semibold">Profile</h4>
            {isProfileLoading ? <p className="mt-3 text-sm text-muted">Loading profile...</p> : null}
            <form
              className="mt-4 grid gap-4 md:grid-cols-2"
              onSubmit={handleProfileSubmit(onSubmitProfile)}
            >
              <Field label="First Name" error={profileFormErrors.firstname?.message}>
                <input
                  type="text"
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  {...registerProfile("firstname")}
                />
              </Field>
              <Field label="Last Name" error={profileFormErrors.lastname?.message}>
                <input
                  type="text"
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  {...registerProfile("lastname")}
                />
              </Field>
              <Field
                label="Username"
                error={profileFormErrors.username?.message}
                helper={getUsernameStatusMessage(usernameStatus)}
                helperClassName={getUsernameStatusClassName(usernameStatus)}
              >
                <input
                  type="text"
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  {...registerProfile("username")}
                />
              </Field>
              <Field label="Phone" error={profileFormErrors.phone?.message}>
                <input
                  type="text"
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  {...registerProfile("phone")}
                />
              </Field>
              <Field label="Country" error={profileFormErrors.country?.message}>
                <input
                  type="text"
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  {...registerProfile("country")}
                />
              </Field>
              <Field label="Referral Code">
                <input
                  type="text"
                  value={profileData?.referralCode ?? ""}
                  readOnly
                  className="mt-1 w-full cursor-not-allowed rounded-md border border-border bg-background px-3 py-2 text-sm uppercase text-muted"
                />
              </Field>

              {profileError ? <p className="md:col-span-2 text-sm text-red-400">{profileError}</p> : null}

              <div className="md:col-span-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsProfileModalOpen(false)}
                  disabled={isProfileSubmitting}
                >
                  Close
                </Button>
                <Button
                  type="submit"
                  variant="gradient"
                  disabled={isProfileSubmitting || usernameStatus === "checking" || usernameStatus === "taken"}
                >
                  {isProfileSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isPasswordModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg">
            <h4 className="text-lg font-semibold">Reset Password</h4>
            <form
              className="mt-4 space-y-3"
              onSubmit={handlePasswordSubmit(onSubmitPassword)}
            >
              <Field label="Old Password" error={passwordFormErrors.oldPassword?.message}>
                <input
                  type="password"
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  {...registerPassword("oldPassword")}
                />
              </Field>
              <Field label="New Password" error={passwordFormErrors.newPassword?.message}>
                <input
                  type="password"
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  {...registerPassword("newPassword")}
                />
              </Field>
              <Field label="Confirm Password" error={passwordFormErrors.confirmPassword?.message}>
                <input
                  type="password"
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  {...registerPassword("confirmPassword")}
                />
              </Field>

              {passwordError ? <p className="text-sm text-red-400">{passwordError}</p> : null}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsPasswordModalOpen(false)}
                  disabled={isPasswordSubmitting}
                >
                  Close
                </Button>
                <Button type="submit" variant="gradient" disabled={isPasswordSubmitting}>
                  {isPasswordSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isWalletModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg">
            <h4 className="text-lg font-semibold">Update Wallet Address</h4>
            {isWalletLoading ? <p className="mt-3 text-sm text-muted">Loading wallet addresses...</p> : null}
            <form
              className="mt-4 space-y-3"
              onSubmit={handleWalletSubmit(onSubmitWallet)}
            >
              <Field label="Bitcoin BTC" error={walletFormErrors.bitcoinBTC?.message}>
                <input
                  type="text"
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  {...registerWallet("bitcoinBTC")}
                />
              </Field>
              <Field label="USDT TRC20" error={walletFormErrors.usdtTRC20?.message}>
                <input
                  type="text"
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  {...registerWallet("usdtTRC20")}
                />
              </Field>
              <Field label="USDT BEP20" error={walletFormErrors.usdtBEP20?.message}>
                <input
                  type="text"
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  {...registerWallet("usdtBEP20")}
                />
              </Field>

              {walletError ? <p className="text-sm text-red-400">{walletError}</p> : null}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsWalletModalOpen(false)}
                  disabled={isWalletSubmitting}
                >
                  Close
                </Button>
                <Button type="submit" variant="gradient" disabled={isWalletSubmitting}>
                  {isWalletSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {successMessage ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-5 text-center shadow-lg">
            <div className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-full bg-background text-primary">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="mt-3 text-sm font-semibold text-primary">{successMessage}</p>
          </div>
        </div>
      ) : null}
    </>
  );
}

type FieldProps = {
  label: string;
  error?: string;
  helper?: string;
  helperClassName?: string;
  children: React.ReactNode;
};

function Field({ label, error, helper, helperClassName, children }: FieldProps) {
  return (
    <label className="block text-sm font-medium text-muted">
      {label}
      {children}
      {error ? <span className="mt-1 block text-xs text-red-400">{error}</span> : null}
      {!error && helper ? <span className={`mt-1 block text-xs ${helperClassName}`}>{helper}</span> : null}
    </label>
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
