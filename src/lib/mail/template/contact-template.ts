import {
  accelixyLogoAttachment,
  escapeHtml,
  withLineBreaks,
  wrapBrandedTemplate,
} from "@/lib/mail/template/base-template";

type ContactEmailTemplateInput = {
  name: string;
  email: string;
  message: string;
};

export function contactEmailTemplate({
  name,
  email,
  message,
}: ContactEmailTemplateInput) {
  const displayName = name.trim() || "Unknown";
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const subject = `New Contact Message from ${displayName}`;
  const safeMessage = withLineBreaks(message);

  const html = wrapBrandedTemplate({
    title: "New contact message",
    subtitle: "New contact request received from the website form.",
    content: `
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px;">
        <tr>
          <td style="padding: 8px 0; color: #64748b; width: 88px;">Name</td>
          <td style="padding: 8px 0; font-weight: 600; color: #0b1c2d;">${safeName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Email</td>
          <td style="padding: 8px 0; font-weight: 600; color: #0b1c2d;">${safeEmail}</td>
        </tr>
      </table>

      <div style="border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
        <div style="padding: 10px 14px; background: linear-gradient(90deg, #00C896 0%, #009E74 100%); color: #0b1c2d; font-weight: 700; font-size: 13px;">
          Message
        </div>
        <div style="padding: 14px; color: #0b1c2d; line-height: 1.65; font-size: 14px;">
          ${safeMessage}
        </div>
      </div>
    `,
  });

  const text = [
    "ACCELIXY - Contact Message",
    `Name: ${name}`,
    `Email: ${email}`,
    "Message:",
    message,
  ].join("\n");

  return {
    subject,
    html,
    text,
    attachments: [accelixyLogoAttachment()],
  };
}
