import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/http/api-error";
import { sendMail } from "@/lib/mail/mailer";
import { contactEmailTemplate } from "@/lib/mail/template/contact-template";
import { contactMailSchema } from "@/lib/validators/mail";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = contactMailSchema.parse(body);

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      throw new Error("Missing ADMIN_EMAIL in environment variables.");
    }

    const template = contactEmailTemplate({
      name: payload.name,
      email: payload.email,
      message: payload.message,
    });

    await sendMail({
      to: adminEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
      attachments: template.attachments,
      replyTo: payload.email,
    });

    return NextResponse.json({ ok: true, message: "Message sent" }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
