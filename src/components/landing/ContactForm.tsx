"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { contactMailSchema, type ContactMailInput } from "@/lib/validators/mail";

export function ContactForm() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactMailInput>({
    resolver: zodResolver(contactMailSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = async (values: ContactMailInput) => {
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const response = await fetch("/api/mail/contact", {
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
        setSubmitError(payload.message ?? "Could not send message.");
        return;
      }

      setSubmitSuccess("Message sent successfully.");
      reset();
    } catch {
      setSubmitError("Network error. Please try again.");
    }
  };

  return (
    <form className="mt-6 grid gap-4 rounded-xl border border-border bg-card p-6 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
      <label className="text-sm font-medium text-muted">
        Full Name
        <input
          type="text"
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-foreground outline-none ring-0 focus:border-primary"
          placeholder="Your name"
          {...register("name")}
        />
        {errors.name ? <span className="mt-1 block text-xs text-red-400">{errors.name.message}</span> : null}
      </label>

      <label className="text-sm font-medium text-muted">
        Email
        <input
          type="email"
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-foreground outline-none ring-0 focus:border-primary"
          placeholder="you@example.com"
          {...register("email")}
        />
        {errors.email ? <span className="mt-1 block text-xs text-red-400">{errors.email.message}</span> : null}
      </label>

      <label className="text-sm font-medium text-muted md:col-span-2">
        Message
        <textarea
          rows={4}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-foreground outline-none ring-0 focus:border-primary"
          placeholder="How can we help?"
          {...register("message")}
        />
        {errors.message ? (
          <span className="mt-1 block text-xs text-red-400">{errors.message.message}</span>
        ) : null}
      </label>

      <div className="md:col-span-2">
        {submitError ? <p className="mb-3 text-sm text-red-400">{submitError}</p> : null}
        {submitSuccess ? <p className="mb-3 text-sm text-primary">{submitSuccess}</p> : null}
        <Button variant="gradient" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send Message"}
        </Button>
      </div>
    </form>
  );
}
