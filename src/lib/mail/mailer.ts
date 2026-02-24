import nodemailer from "nodemailer";
import type { Attachment } from "nodemailer/lib/mailer";

type SendMailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  attachments?: Attachment[];
};

function getMailEnv() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error(
      "Missing email configuration. Please set EMAIL_USER and EMAIL_PASS in .env.local."
    );
  }

  return { user, pass };
}

export async function sendMail({
  to,
  subject,
  html,
  text,
  replyTo,
  attachments,
}: SendMailInput) {
  const { user, pass } = getMailEnv();

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user,
      pass,
    },
  });

  const result = await transporter.sendMail({
    from: `"Accelixy" <${user}>`,
    to,
    subject,
    html,
    text,
    replyTo,
    attachments,
  });

  if (process.env.NODE_ENV === "development") {
    console.info(`[mail] Message sent to ${to} (${result.messageId})`);
  }

  return result;
}
