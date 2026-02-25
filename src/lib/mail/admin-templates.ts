type InvestmentPaidTemplateInput = {
  name: string;
  amount: string;
  plan: string;
};

type WithdrawalUpdateTemplateInput = {
  name: string;
  status: string;
  amount: string;
};

type GeneralNoticeTemplateInput = {
  name: string;
  subject: string;
  message: string;
};

type WelcomeTemplateInput = {
  name: string;
};

type DepositApprovedTemplateInput = {
  name: string;
  amount: string;
};

function wrapTemplate(title: string, content: string) {
  return `
    <div style="font-family: Arial, Helvetica, sans-serif; background: #f8fafc; padding: 24px; color: #0b1c2d;">
      <div style="max-width: 680px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden;">
        <div style="padding: 16px 22px; background: #0B1C2D; color: #ffffff; text-align: center;">
          <div style="font-weight: 700; font-size: 18px;">Accelixy</div>
          <div style="margin-top: 4px; font-size: 12px; color: #a7b7c9;">${title}</div>
        </div>
        <div style="padding: 20px 22px; line-height: 1.65; font-size: 14px;">
          ${content}
        </div>
      </div>
    </div>
  `;
}

export function investmentPaidTemplate({ name, amount, plan }: InvestmentPaidTemplateInput) {
  const subject = "Investment payout processed";
  const html = wrapTemplate(
    subject,
    `<p>Hello ${name},</p>
     <p>Your investment payout has been processed successfully.</p>
     <p><strong>Plan:</strong> ${plan}<br />
     <strong>Amount credited:</strong> ${amount}</p>
     <p>Thank you for investing with Accelixy.</p>`
  );
  const text = `Hello ${name},\nYour investment payout has been processed.\nPlan: ${plan}\nAmount credited: ${amount}\n`;
  return { subject, html, text };
}

export function withdrawalUpdateTemplate({ name, status, amount }: WithdrawalUpdateTemplateInput) {
  const subject = "Withdrawal request update";
  const html = wrapTemplate(
    subject,
    `<p>Hello ${name},</p>
     <p>Your withdrawal request has been updated.</p>
     <p><strong>Status:</strong> ${status}<br />
     <strong>Amount:</strong> ${amount}</p>
     <p>Please contact support if you need help.</p>`
  );
  const text = `Hello ${name},\nYour withdrawal request is now ${status}.\nAmount: ${amount}\n`;
  return { subject, html, text };
}

export function generalNoticeTemplate({ name, subject, message }: GeneralNoticeTemplateInput) {
  const safeMessage = message.replace(/\n/g, "<br />");
  const html = wrapTemplate(
    subject,
    `<p>Hello ${name},</p>
     <p>${safeMessage}</p>`
  );
  const text = `Hello ${name},\n${message}`;
  return { subject, html, text };
}

export function welcomeTemplate({ name }: WelcomeTemplateInput) {
  const subject = "Welcome to Accelixy";
  const html = wrapTemplate(
    subject,
    `<p>Hello ${name},</p>
     <p>Welcome to Accelixy. Your account is now active and ready.</p>
     <p>Log in anytime to manage deposits, investments, and withdrawals.</p>`
  );
  const text = `Hello ${name},\nWelcome to Accelixy. Your account is now active and ready.\n`;
  return { subject, html, text };
}

export function depositApprovedTemplate({ name, amount }: DepositApprovedTemplateInput) {
  const subject = "Deposit approved";
  const html = wrapTemplate(
    subject,
    `<p>Hello ${name},</p>
     <p>Your deposit has been approved and credited.</p>
     <p><strong>Amount:</strong> ${amount}</p>`
  );
  const text = `Hello ${name},\nYour deposit has been approved and credited.\nAmount: ${amount}\n`;
  return { subject, html, text };
}
