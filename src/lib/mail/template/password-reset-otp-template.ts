import {
  accelixyLogoAttachment,
  escapeHtml,
  wrapBrandedTemplate,
} from "@/lib/mail/template/base-template";

type PasswordResetOtpTemplateInput = {
  name: string;
  otp: string;
};

export function passwordResetOtpTemplate({ name, otp }: PasswordResetOtpTemplateInput) {
  const subject = "Your Accelixy password reset code";
  const safeName = escapeHtml(name);
  const safeOtp = escapeHtml(otp);

  const html = wrapBrandedTemplate({
    title: "Password reset verification",
    subtitle: "Password reset verification",
    content: `
      <p style="margin: 0 0 10px;">Hello ${safeName},</p>
      <p style="margin: 0 0 12px;">Use the one-time code below to reset your password:</p>

      <div style="margin: 12px 0 16px; padding: 14px; border: 1px solid #dbe6f1; border-radius: 10px; background: #f8fbff; text-align: center;">
        <span style="display:inline-block; font-size: 26px; letter-spacing: 6px; font-weight: 800; color: #0b1c2d;">${safeOtp}</span>
      </div>

      <p style="margin: 0 0 6px; color: #334155;">This code expires in 10 minutes.</p>
      <p style="margin: 0; color: #64748b;">If you did not request this, you can ignore this email.</p>
    `,
  });

  const text = [
    `Hello ${name},`,
    "",
    "Use this one-time code to reset your password:",
    otp,
    "",
    "This code expires in 10 minutes.",
    "If you did not request this, you can ignore this email.",
  ].join("\n");

  return {
    subject,
    html,
    text,
    attachments: [accelixyLogoAttachment()],
  };
}
