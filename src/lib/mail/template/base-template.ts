import type { Attachment } from "nodemailer/lib/mailer";

export const ACCELIXY_WHITE_LOGO_CID = "accelixy-white-logo";

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function withLineBreaks(value: string) {
  return escapeHtml(value).replace(/\n/g, "<br />");
}

export function accelixyLogoAttachment(): Attachment {
  return {
    filename: "white.png",
    path: `${process.cwd()}\\public\\brand\\white.png`,
    cid: ACCELIXY_WHITE_LOGO_CID,
  };
}

type BrandedTemplateInput = {
  title: string;
  subtitle: string;
  content: string;
};

export function wrapBrandedTemplate({
  title,
  subtitle,
  content,
}: BrandedTemplateInput) {
  const safeTitle = escapeHtml(title);
  const safeSubtitle = escapeHtml(subtitle);

  return `
    <div style="font-family: Arial, Helvetica, sans-serif; background: #f8fafc; padding: 24px; color: #0b1c2d;">
      <div style="max-width: 680px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden;">
        <div style="padding: 18px 22px; background: #0B1C2D; color: #ffffff;">
          <div style="display: flex; align-items: center; justify-content: center; width: 100%;">
            <img src="cid:${ACCELIXY_WHITE_LOGO_CID}" alt="Accelixy" width="170" style="display:block; height:auto; border:0; outline:none; text-decoration:none;" />
          </div>
          <div style="margin-top: 10px; text-align: center; font-size: 13px; color: #a7b7c9;">
            ${safeSubtitle}
          </div>
        </div>

        <div style="padding: 22px; line-height: 1.65; font-size: 14px;">
          <h2 style="margin: 0 0 12px; font-size: 18px; color: #0b1c2d;">${safeTitle}</h2>
          ${content}
        </div>
      </div>
    </div>
  `;
}
