"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitError(null);

    const result = await signIn("credentials", {
      redirect: false,
      identifier: values.identifier,
      password: values.password,
    });

    if (!result || result.error) {
      setSubmitError("Invalid credentials. Please check your login details.");
      return;
    }

    setSuccessMessage("Login successful. Redirecting...");
    window.setTimeout(() => {
      router.push("/dashboard");
    }, 900);
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
        <div className="mb-5 flex justify-center">
          <Logo width={132} height={38} />
        </div>
        <h1 className="text-2xl font-semibold">Login</h1>
        <p className="mt-1 text-sm text-muted">Sign in to access your account.</p>

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
            <input
              type="password"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              placeholder="Enter your password"
              {...register("password")}
            />
            {errors.password ? (
              <span className="mt-1 block text-xs text-red-400">{errors.password.message}</span>
            ) : null}
          </label>

          {submitError ? <p className="text-sm text-red-400">{submitError}</p> : null}

          <Button type="submit" variant="gradient" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>

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
