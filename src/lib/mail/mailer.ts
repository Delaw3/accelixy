import nodemailer from "nodemailer";
import type { Attachment } from "nodemailer/lib/mailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

type SendMailInput = {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  attachments?: Attachment[];
};

function getMailEnv() {
  const gmailUser = process.env.EMAIL_USER;
  const gmailPass = process.env.EMAIL_PASS;
  const from = process.env.EMAIL_FROM ?? gmailUser;
  const fromName = process.env.EMAIL_FROM_NAME ?? "Accelixy";

  if (!gmailUser || !gmailPass) {
    throw new Error(
      "Missing email configuration. Please set EMAIL_USER and EMAIL_PASS in .env.local."
    );
  }

  return { gmailUser, gmailPass, from, fromName };
}

let transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo> | null =
  null;

function getTransporter() {
  if (!transporter) {
    const { gmailUser, gmailPass } = getMailEnv();

    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });
  }

  return transporter;
}

export async function sendMail({
  to,
  subject,
  html,
  text,
  replyTo,
  attachments,
}: SendMailInput) {
  if (!html && !text) {
    throw new Error("sendMail requires at least one of html or text content.");
  }

  const { from, fromName } = getMailEnv();
  const transporter = getTransporter();

  const result = await transporter.sendMail({
    from: `"${fromName}" <${from}>`,
    to,
    subject,
    html,
    text,
    replyTo,
    attachments,
  });

  if (process.env.NODE_ENV !== "production") {
    console.info(`[mail] Message sent to ${to} (${result.messageId})`);
  }

  return result;
}
