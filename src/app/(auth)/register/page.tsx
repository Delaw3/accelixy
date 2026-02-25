"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";

const registerSchema = z
  .object({
    firstname: z.string().trim().min(1, "First name is required"),
    lastname: z.string().trim().min(1, "Last name is required"),
    username: z.string().trim().min(3, "Username must be at least 3 characters"),
    email: z.string().trim().email("Invalid email address"),
    country: z.string().trim().min(1, "Country is required"),
    phone: z.string().trim().min(5, "Phone is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
    referralCode: z.string().trim().max(32, "Referral code is too long").optional().or(z.literal("")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;
type UsernameStatus = "idle" | "checking" | "available" | "taken" | "error";

export default function RegisterPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const usernameDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const usernameAbortRef = useRef<AbortController | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      username: "",
      email: "",
      country: "",
      phone: "",
      password: "",
      confirmPassword: "",
      referralCode: "",
    },
  });
  const usernameRegister = register("username");

  useEffect(() => {
    return () => {
      if (usernameDebounceRef.current) {
        clearTimeout(usernameDebounceRef.current);
      }
      usernameAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!submitSuccess) {
      return;
    }

    const timer = setTimeout(() => {
      router.push("/login");
    }, 1200);

    return () => clearTimeout(timer);
  }, [router, submitSuccess]);

  const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
    usernameRegister.onChange(event);
    const normalized = event.target.value.trim().toLowerCase();
    const validPattern = /^[a-zA-Z0-9._-]+$/;

    if (usernameDebounceRef.current) {
      clearTimeout(usernameDebounceRef.current);
    }
    usernameAbortRef.current?.abort();

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
          { signal: controller.signal }
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
    }, 500);
  };

  const onSubmit = async (values: RegisterFormValues) => {
    setSubmitError(null);
    setSubmitSuccess(null);
    if (usernameStatus === "taken") {
      setSubmitError("Username is already taken. Choose another one.");
      return;
    }

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    const payload = (await response.json()) as {
      ok?: boolean;
      message?: string;
    };

    if (!response.ok) {
      setSubmitError(payload.message ?? "Registration failed. Please try again.");
      return;
    }

    reset();
    setSubmitSuccess("Signup successful. Redirecting to login...");
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      {submitSuccess ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-5 text-center shadow-lg">
            <div className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-full bg-background text-primary">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">{submitSuccess}</p>
          </div>
        </div>
      ) : null}

      <section className="w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
        <div className="mb-5 flex justify-center">
          <Logo width={132} height={38} />
        </div>
        <h1 className="text-2xl font-semibold">Register</h1>
        <p className="mt-1 text-sm text-muted">Create your Accelixy account.</p>

        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <FormField label="First Name" error={errors.firstname?.message}>
            <input
              type="text"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              {...register("firstname")}
            />
          </FormField>

          <FormField label="Last Name" error={errors.lastname?.message}>
            <input
              type="text"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              {...register("lastname")}
            />
          </FormField>

          <FormField
            label="Username"
            error={errors.username?.message}
            helper={getUsernameStatusMessage(usernameStatus)}
            helperClassName={getUsernameStatusClassName(usernameStatus)}
          >
            <input
              type="text"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              {...usernameRegister}
              onChange={handleUsernameChange}
            />
          </FormField>

          <FormField label="Email" error={errors.email?.message}>
            <input
              type="email"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              {...register("email")}
            />
          </FormField>

          <FormField label="Country" error={errors.country?.message}>
            <input
              type="text"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              {...register("country")}
            />
          </FormField>

          <FormField label="Phone" error={errors.phone?.message}>
            <input
              type="text"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              {...register("phone")}
            />
          </FormField>

          <FormField label="Password" error={errors.password?.message}>
            <input
              type="password"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              {...register("password")}
            />
          </FormField>

          <FormField label="Confirm Password" error={errors.confirmPassword?.message}>
            <input
              type="password"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              {...register("confirmPassword")}
            />
          </FormField>

          <div className="md:col-span-2">
            <FormField label="Referral Code (Optional)" error={errors.referralCode?.message}>
              <input
                type="text"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm uppercase text-foreground outline-none focus:border-primary"
                placeholder="ACCX-XXXXXX"
                {...register("referralCode")}
              />
            </FormField>
          </div>

          <div className="md:col-span-2">
            {submitError ? <p className="mb-3 text-sm text-red-400">{submitError}</p> : null}
            <Button
              type="submit"
              variant="gradient"
              className="w-full"
              disabled={isSubmitting || usernameStatus === "checking" || Boolean(submitSuccess)}
            >
              {isSubmitting ? "Creating account..." : "Create Account"}
            </Button>
          </div>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}

type FormFieldProps = {
  label: string;
  error?: string;
  helper?: string;
  helperClassName?: string;
  children: React.ReactNode;
};

function FormField({ label, error, helper, helperClassName, children }: FormFieldProps) {
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
