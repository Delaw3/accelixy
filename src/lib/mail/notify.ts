import type { Attachment } from "nodemailer/lib/mailer";
import { sendMail } from "@/lib/mail/mailer";

type SafeMailInput = {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  attachments?: Attachment[];
};

export function getAdminNotificationEmail() {
  const value = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return value && value.length > 0 ? value : null;
}

export async function sendMailSafely(input: SafeMailInput, context: string) {
  try {
    await sendMail(input);
    return true;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error(`[mail] Failed to send ${context}`, error);
    }
    return false;
  }
}

export function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(value);
}
