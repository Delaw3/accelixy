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
  const subject = `New Contact Message from ${name}`;
  const safeMessage = message.replace(/\n/g, "<br />");
  const whiteLogoCid = "accelixy-white-logo";

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; background: #f8fafc; padding: 24px; color: #0b1c2d;">
      <div style="max-width: 680px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden;">
        <div style="padding: 18px 22px; background: #0B1C2D; color: #ffffff;">
          <div style="display: flex; align-items: center; justify-content: center; width: 100%;">
            <img src="cid:${whiteLogoCid}" alt="Accelixy" width="170" style="display:block; height:auto; border:0; outline:none; text-decoration:none;" />
          </div>
          <div style="margin-top: 10px; text-align: center; font-size: 13px; color: #a7b7c9;">
            New contact request received from the website form.
          </div>
        </div>

        <div style="padding: 22px;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; width: 88px;">Name</td>
              <td style="padding: 8px 0; font-weight: 600; color: #0b1c2d;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Email</td>
              <td style="padding: 8px 0; font-weight: 600; color: #0b1c2d;">${email}</td>
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
        </div>
      </div>
    </div>
  `;

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
    attachments: [
      {
        filename: "white.png",
        path: `${process.cwd()}\\public\\brand\\white.png`,
        cid: whiteLogoCid,
      },
    ],
  };
}
