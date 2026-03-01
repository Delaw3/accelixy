"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import {
  forgotPasswordRequestSchema,
  forgotPasswordResetSchema,
  type ForgotPasswordRequestInput,
  type ForgotPasswordResetInput,
} from "@/lib/validators/password-reset";

const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type AuthMode = "login" | "forgot";
const otpVerifyFormSchema = z.object({
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "OTP must be a 6-digit code"),
});
type OtpVerifyFormValues = z.infer<typeof otpVerifyFormSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetToken, setResetToken] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const {
    register: registerForgotRequest,
    handleSubmit: handleSubmitForgotRequest,
    formState: {
      errors: forgotRequestErrors,
      isSubmitting: isForgotRequestSubmitting,
    },
  } = useForm<ForgotPasswordRequestInput>({
    resolver: zodResolver(forgotPasswordRequestSchema),
    defaultValues: {
      email: "",
    },
  });

  const {
    register: registerForgotVerify,
    handleSubmit: handleSubmitForgotVerify,
    reset: resetForgotVerifyForm,
    formState: {
      errors: forgotVerifyErrors,
      isSubmitting: isForgotVerifySubmitting,
    },
  } = useForm<OtpVerifyFormValues>({
    resolver: zodResolver(otpVerifyFormSchema),
    defaultValues: {
      otp: "",
    },
  });

  const {
    register: registerForgotReset,
    handleSubmit: handleSubmitForgotReset,
    reset: resetForgotResetForm,
    setValue: setForgotResetValue,
    formState: {
      errors: forgotResetErrors,
      isSubmitting: isForgotResetSubmitting,
    },
  } = useForm<ForgotPasswordResetInput>({
    resolver: zodResolver(forgotPasswordResetSchema),
    defaultValues: {
      resetToken: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitError(null);

    const result = await signIn("credentials", {
      redirect: false,
      identifier: values.identifier,
      password: values.password,
    });

    if (!result || result.error) {
      if (result?.code === "account_deactivated") {
        setSubmitError("Your account is temporally deactivated, try contacting support.");
        return;
      }
      setSubmitError("Invalid credentials. Please check your login details.");
      return;
    }

    setSuccessMessage("Login successful. Redirecting...");
    window.setTimeout(async () => {
      const session = await getSession();
      const role = String(session?.user?.role ?? "USER").toUpperCase();
      router.push(role === "ADMIN" ? "/admin" : "/dashboard");
    }, 900);
  };

  const onForgotRequest = async (values: ForgotPasswordRequestInput) => {
    setForgotError(null);
    setForgotMessage(null);

    const response = await fetch("/api/auth/forgot-password/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const payload = (await response.json().catch(() => null)) as
      | { ok?: boolean; message?: string }
      | null;

    if (!response.ok || !payload?.ok) {
      setForgotError(payload?.message ?? "Unable to send OTP right now.");
      return false;
    }

    setForgotEmail(values.email);
    setOtpModalOpen(true);
    setForgotMessage(payload.message ?? "OTP sent successfully.");
    return true;
  };

  const onForgotVerify = async (otp: string) => {
    setForgotError(null);
    setForgotMessage(null);

    if (!forgotEmail) {
      setForgotError("Please restart the password reset flow.");
      return;
    }

    try {
      const response = await fetch("/api/auth/forgot-password/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, otp }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; message?: string; data?: { resetToken?: string } }
        | null;

      if (!response.ok || !payload?.ok || !payload.data?.resetToken) {
        setForgotError(payload?.message ?? "Incorrect OTP. Please try again.");
        return;
      }

      setResetToken(payload.data.resetToken);
      setForgotResetValue("resetToken", payload.data.resetToken, { shouldValidate: true });
      setOtpModalOpen(false);
      setOtpVerified(true);
      setForgotMessage("OTP verified. Set your new password.");
    } catch {
      setForgotError("Unable to verify OTP. Please try again.");
    }
  };

  const onResendOtp = async () => {
    const ok = await onForgotRequest({ email: forgotEmail });
    if (!ok) {
      return;
    }

    // Ensure users type the latest code after resend.
    resetForgotVerifyForm({ otp: "" });
  };

  const onForgotReset = async (values: ForgotPasswordResetInput) => {
    setForgotError(null);
    setForgotMessage(null);

    const response = await fetch("/api/auth/forgot-password/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const payload = (await response.json().catch(() => null)) as
      | { ok?: boolean; message?: string }
      | null;

    if (!response.ok || !payload?.ok) {
      setForgotError(payload?.message ?? "Unable to reset password.");
      return;
    }

    setForgotMessage(payload.message ?? "Password reset successful.");
    setOtpVerified(false);
    setForgotEmail("");
    setResetToken("");
    resetForgotVerifyForm({ otp: "" });
    resetForgotResetForm({ resetToken: "", newPassword: "", confirmPassword: "" });
    setMode("login");
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      {successMessage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-5 text-center shadow-lg">
            <div className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-full bg-background text-primary">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">{successMessage}</p>
          </div>
        </div>
      ) : null}

      <section className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
        <div className="mb-5 flex justify-center">
          <Logo width={132} height={38} />
        </div>
        <h1 className="text-center text-2xl font-semibold">Login</h1>
        <p className="mt-1 text-center text-sm text-muted">
          {mode === "login"
            ? "Sign in to access your account."
            : "Reset your password using the OTP sent to your email."}
        </p>

        {mode === "login" ? (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <label className="block text-sm font-medium text-muted">
              Email or Username
              <input
                type="text"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                placeholder="you@example.com"
                {...register("identifier")}
              />
              {errors.identifier ? (
                <span className="mt-1 block text-xs text-red-400">{errors.identifier.message}</span>
              ) : null}
            </label>

            <label className="block text-sm font-medium text-muted">
              Password
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 pr-11 text-sm text-foreground outline-none focus:border-primary"
                  placeholder="Enter your password"
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-background/80 text-muted transition hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password ? (
                <span className="mt-1 block text-xs text-red-400">{errors.password.message}</span>
              ) : null}
            </label>

            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm font-medium text-primary hover:underline"
                onClick={() => {
                  setSubmitError(null);
                  setForgotError(null);
                  setForgotMessage(null);
                  setMode("forgot");
                }}
              >
                Forgot password?
              </button>
            </div>

            {submitError ? <p className="text-sm text-red-400">{submitError}</p> : null}

            <Button type="submit" variant="gradient" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        ) : (
          <div className="mt-6 space-y-4">
            {!otpVerified ? (
              <form className="space-y-4" onSubmit={handleSubmitForgotRequest((values) => void onForgotRequest(values))}>
                <label className="block text-sm font-medium text-muted">
                  Email
                  <input
                    type="email"
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                    placeholder="you@example.com"
                    {...registerForgotRequest("email")}
                  />
                  {forgotRequestErrors.email ? (
                    <span className="mt-1 block text-xs text-red-400">
                      {forgotRequestErrors.email.message}
                    </span>
                  ) : null}
                </label>

                {forgotError ? <p className="text-sm text-red-400">{forgotError}</p> : null}
                {forgotMessage ? <p className="text-sm text-emerald-400">{forgotMessage}</p> : null}

                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full"
                  disabled={isForgotRequestSubmitting}
                >
                  {isForgotRequestSubmitting ? "Checking..." : "Continue"}
                </Button>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmitForgotReset(onForgotReset)}>
                <input type="hidden" value={resetToken} {...registerForgotReset("resetToken")} />

                <label className="block text-sm font-medium text-muted">
                  New Password
                  <div className="relative mt-1">
                    <input
                      type={showForgotNewPassword ? "text" : "password"}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 pr-11 text-sm text-foreground outline-none focus:border-primary"
                      placeholder="Enter new password"
                      {...registerForgotReset("newPassword")}
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-background/80 text-muted transition hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      onClick={() => setShowForgotNewPassword((prev) => !prev)}
                      aria-label={showForgotNewPassword ? "Hide new password" : "Show new password"}
                      aria-pressed={showForgotNewPassword}
                    >
                      {showForgotNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {forgotResetErrors.newPassword ? (
                    <span className="mt-1 block text-xs text-red-400">
                      {forgotResetErrors.newPassword.message}
                    </span>
                  ) : null}
                </label>

                <label className="block text-sm font-medium text-muted">
                  Confirm Password
                  <div className="relative mt-1">
                    <input
                      type={showForgotConfirmPassword ? "text" : "password"}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 pr-11 text-sm text-foreground outline-none focus:border-primary"
                      placeholder="Confirm new password"
                      {...registerForgotReset("confirmPassword")}
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-background/80 text-muted transition hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      onClick={() => setShowForgotConfirmPassword((prev) => !prev)}
                      aria-label={
                        showForgotConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      aria-pressed={showForgotConfirmPassword}
                    >
                      {showForgotConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {forgotResetErrors.confirmPassword ? (
                    <span className="mt-1 block text-xs text-red-400">
                      {forgotResetErrors.confirmPassword.message}
                    </span>
                  ) : null}
                </label>

                {forgotResetErrors.resetToken ? (
                  <p className="text-sm text-red-400">{forgotResetErrors.resetToken.message}</p>
                ) : null}
                {forgotError ? <p className="text-sm text-red-400">{forgotError}</p> : null}
                {forgotMessage ? <p className="text-sm text-emerald-400">{forgotMessage}</p> : null}

                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full"
                  disabled={isForgotResetSubmitting}
                >
                  {isForgotResetSubmitting ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            )}

            <button
              type="button"
              className="w-full text-sm font-medium text-primary hover:underline"
              onClick={() => {
                setMode("login");
                setForgotError(null);
                setForgotMessage(null);
                setOtpModalOpen(false);
                setOtpVerified(false);
                setForgotEmail("");
                setResetToken("");
                resetForgotVerifyForm({ otp: "" });
                resetForgotResetForm({ resetToken: "", newPassword: "", confirmPassword: "" });
              }}
            >
              Back to login
            </button>
          </div>
        )}

        {otpModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 px-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-lg">
              <h2 className="text-lg font-semibold text-foreground">Enter OTP</h2>
              <p className="mt-1 text-sm text-muted">
                Enter the 6-digit code sent to <span className="font-medium text-foreground">{forgotEmail}</span>.
              </p>

              <form
                className="mt-4 space-y-4"
                onSubmit={handleSubmitForgotVerify((values) => onForgotVerify(values.otp))}
              >
                <label className="block text-sm font-medium text-muted">
                  OTP
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm tracking-[0.3em] text-foreground outline-none focus:border-primary"
                    placeholder="123456"
                    {...registerForgotVerify("otp")}
                  />
                  {forgotVerifyErrors.otp ? (
                    <span className="mt-1 block text-xs text-red-400">
                      {forgotVerifyErrors.otp.message}
                    </span>
                  ) : null}
                </label>

                {forgotError ? <p className="text-sm text-red-400">{forgotError}</p> : null}

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => void onResendOtp()}
                    disabled={isForgotRequestSubmitting || isForgotVerifySubmitting}
                  >
                    {isForgotRequestSubmitting ? "Resending..." : "Resend OTP"}
                  </Button>
                  <Button
                    type="submit"
                    variant="gradient"
                    className="w-full"
                    disabled={isForgotVerifySubmitting}
                  >
                    {isForgotVerifySubmitting ? "Verifying..." : "Verify OTP"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        <p className="mt-5 text-center text-sm text-muted">
          No account yet?{" "}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Create one
          </Link>
        </p>
      </section>
    </main>
  );
}
