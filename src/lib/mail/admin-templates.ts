import type { Attachment } from "nodemailer/lib/mailer";
import {
  accelixyLogoAttachment,
  escapeHtml,
  withLineBreaks,
  wrapBrandedTemplate,
} from "@/lib/mail/template/base-template";

type MailTemplate = {
  subject: string;
  html: string;
  text: string;
  attachments: Attachment[];
};

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

type NewSignupAdminTemplateInput = {
  name: string;
  username: string;
  email: string;
  country: string;
  phone: string;
};

type DepositRequestTemplateInput = {
  name: string;
  amount: string;
  method: string;
  reference: string;
};

type DepositRequestAdminTemplateInput = DepositRequestTemplateInput & {
  email: string;
};

type WithdrawalRequestTemplateInput = {
  name: string;
  amount: string;
  method: string;
  walletAddress: string;
};

type WithdrawalRequestAdminTemplateInput = WithdrawalRequestTemplateInput & {
  email: string;
};

type InvestmentCreatedTemplateInput = {
  name: string;
  amount: string;
  plan: string;
  expectedReturn: string;
  endDate: string;
};

type InvestmentCreatedAdminTemplateInput = InvestmentCreatedTemplateInput & {
  email: string;
};

type AdminCreditTemplateInput = {
  name: string;
  amount: string;
  balance: string;
};

type AccountStatusTemplateInput = {
  name: string;
  isActive: boolean;
};

function buildTemplate(subject: string, subtitle: string, content: string, text: string): MailTemplate {
  return {
    subject,
    html: wrapBrandedTemplate({
      title: subject,
      subtitle,
      content,
    }),
    text,
    attachments: [accelixyLogoAttachment()],
  };
}

export function investmentPaidTemplate({ name, amount, plan }: InvestmentPaidTemplateInput) {
  const safeName = escapeHtml(name);
  const safePlan = escapeHtml(plan);
  const safeAmount = escapeHtml(amount);
  return buildTemplate(
    "Investment payout processed",
    "Your investment payout has been completed.",
    `<p style="margin:0 0 12px;">Hello ${safeName},</p>
     <p style="margin:0 0 12px;">Your investment payout has been processed successfully.</p>
     <p style="margin:0 0 12px;"><strong>Plan:</strong> ${safePlan}<br />
     <strong>Amount credited:</strong> ${safeAmount}</p>
     <p style="margin:0;">Thank you for investing with Accelixy.</p>`,
    `Hello ${name},\nYour investment payout has been processed.\nPlan: ${plan}\nAmount credited: ${amount}\n`,
  );
}

export function withdrawalUpdateTemplate({ name, status, amount }: WithdrawalUpdateTemplateInput) {
  const safeName = escapeHtml(name);
  const safeStatus = escapeHtml(status);
  const safeAmount = escapeHtml(amount);
  return buildTemplate(
    "Withdrawal request update",
    "There is an update on your withdrawal request.",
    `<p style="margin:0 0 12px;">Hello ${safeName},</p>
     <p style="margin:0 0 12px;">Your withdrawal request has been updated.</p>
     <p style="margin:0 0 12px;"><strong>Status:</strong> ${safeStatus}<br />
     <strong>Amount:</strong> ${safeAmount}</p>
     <p style="margin:0;">Please contact support if you need help.</p>`,
    `Hello ${name},\nYour withdrawal request is now ${status}.\nAmount: ${amount}\n`,
  );
}

export function generalNoticeTemplate({ name, subject, message }: GeneralNoticeTemplateInput) {
  const safeName = escapeHtml(name);
  const safeMessage = withLineBreaks(message);
  return buildTemplate(
    subject,
    "Account notice from Accelixy",
    `<p style="margin:0 0 12px;">Hello ${safeName},</p>
     <p style="margin:0;">${safeMessage}</p>`,
    `Hello ${name},\n${message}`,
  );
}

export function welcomeTemplate({ name }: WelcomeTemplateInput) {
  const safeName = escapeHtml(name);
  return buildTemplate(
    "Welcome to Accelixy",
    "Your account is ready.",
    `<p style="margin:0 0 12px;">Hello ${safeName},</p>
     <p style="margin:0 0 12px;">Welcome to Accelixy. Your account is now active and ready.</p>
     <p style="margin:0;">Log in anytime to manage deposits, investments, and withdrawals.</p>`,
    `Hello ${name},\nWelcome to Accelixy. Your account is now active and ready.\n`,
  );
}

export function depositApprovedTemplate({ name, amount }: DepositApprovedTemplateInput) {
  const safeName = escapeHtml(name);
  const safeAmount = escapeHtml(amount);
  return buildTemplate(
    "Deposit approved",
    "Your deposit was approved and credited.",
    `<p style="margin:0 0 12px;">Hello ${safeName},</p>
     <p style="margin:0 0 12px;">Your deposit has been approved and credited.</p>
     <p style="margin:0;"><strong>Amount:</strong> ${safeAmount}</p>`,
    `Hello ${name},\nYour deposit has been approved and credited.\nAmount: ${amount}\n`,
  );
}

export function signupAdminAlertTemplate({
  name,
  username,
  email,
  country,
  phone,
}: NewSignupAdminTemplateInput) {
  const subject = "New user signup";
  return buildTemplate(
    subject,
    "A new account has been created.",
    `<p style="margin:0 0 12px;">A new user has signed up on Accelixy.</p>
     <p style="margin:0;"><strong>Name:</strong> ${escapeHtml(name)}<br />
     <strong>Username:</strong> ${escapeHtml(username)}<br />
     <strong>Email:</strong> ${escapeHtml(email)}<br />
     <strong>Country:</strong> ${escapeHtml(country)}<br />
     <strong>Phone:</strong> ${escapeHtml(phone)}</p>`,
    `A new user has signed up.\nName: ${name}\nUsername: ${username}\nEmail: ${email}\nCountry: ${country}\nPhone: ${phone}\n`,
  );
}

export function depositRequestUserTemplate({
  name,
  amount,
  method,
  reference,
}: DepositRequestTemplateInput) {
  return buildTemplate(
    "Deposit request received",
    "Your deposit request has been recorded.",
    `<p style="margin:0 0 12px;">Hello ${escapeHtml(name)},</p>
     <p style="margin:0 0 12px;">We received your deposit request and it is pending confirmation.</p>
     <p style="margin:0;"><strong>Amount:</strong> ${escapeHtml(amount)}<br />
     <strong>Method:</strong> ${escapeHtml(method)}<br />
     <strong>Reference:</strong> ${escapeHtml(reference)}</p>`,
    `Hello ${name},\nWe received your deposit request and it is pending confirmation.\nAmount: ${amount}\nMethod: ${method}\nReference: ${reference}\n`,
  );
}

export function depositRequestAdminTemplate({
  name,
  email,
  amount,
  method,
  reference,
}: DepositRequestAdminTemplateInput) {
  const subject = "New deposit request";
  return buildTemplate(
    subject,
    "A user has submitted a deposit request.",
    `<p style="margin:0 0 12px;">A deposit request was submitted.</p>
     <p style="margin:0;"><strong>User:</strong> ${escapeHtml(name)}<br />
     <strong>Email:</strong> ${escapeHtml(email)}<br />
     <strong>Amount:</strong> ${escapeHtml(amount)}<br />
     <strong>Method:</strong> ${escapeHtml(method)}<br />
     <strong>Reference:</strong> ${escapeHtml(reference)}</p>`,
    `A deposit request was submitted.\nUser: ${name}\nEmail: ${email}\nAmount: ${amount}\nMethod: ${method}\nReference: ${reference}\n`,
  );
}

export function withdrawalRequestUserTemplate({
  name,
  amount,
  method,
  walletAddress,
}: WithdrawalRequestTemplateInput) {
  return buildTemplate(
    "Withdrawal request received",
    "Your withdrawal request is pending review.",
    `<p style="margin:0 0 12px;">Hello ${escapeHtml(name)},</p>
     <p style="margin:0 0 12px;">We received your withdrawal request.</p>
     <p style="margin:0;"><strong>Amount:</strong> ${escapeHtml(amount)}<br />
     <strong>Method:</strong> ${escapeHtml(method)}<br />
     <strong>Destination wallet:</strong> ${escapeHtml(walletAddress)}</p>`,
    `Hello ${name},\nWe received your withdrawal request.\nAmount: ${amount}\nMethod: ${method}\nDestination wallet: ${walletAddress}\n`,
  );
}

export function withdrawalRequestAdminTemplate({
  name,
  email,
  amount,
  method,
  walletAddress,
}: WithdrawalRequestAdminTemplateInput) {
  const subject = "New withdrawal request";
  return buildTemplate(
    subject,
    "A user has submitted a withdrawal request.",
    `<p style="margin:0 0 12px;">A withdrawal request was submitted.</p>
     <p style="margin:0;"><strong>User:</strong> ${escapeHtml(name)}<br />
     <strong>Email:</strong> ${escapeHtml(email)}<br />
     <strong>Amount:</strong> ${escapeHtml(amount)}<br />
     <strong>Method:</strong> ${escapeHtml(method)}<br />
     <strong>Destination wallet:</strong> ${escapeHtml(walletAddress)}</p>`,
    `A withdrawal request was submitted.\nUser: ${name}\nEmail: ${email}\nAmount: ${amount}\nMethod: ${method}\nDestination wallet: ${walletAddress}\n`,
  );
}

export function investmentCreatedUserTemplate({
  name,
  amount,
  plan,
  expectedReturn,
  endDate,
}: InvestmentCreatedTemplateInput) {
  return buildTemplate(
    "Investment created",
    "Your investment has been created successfully.",
    `<p style="margin:0 0 12px;">Hello ${escapeHtml(name)},</p>
     <p style="margin:0 0 12px;">Your investment has been created and is now active.</p>
     <p style="margin:0;"><strong>Plan:</strong> ${escapeHtml(plan)}<br />
     <strong>Amount:</strong> ${escapeHtml(amount)}<br />
     <strong>Expected return:</strong> ${escapeHtml(expectedReturn)}<br />
     <strong>Maturity:</strong> ${escapeHtml(endDate)}</p>`,
    `Hello ${name},\nYour investment has been created and is now active.\nPlan: ${plan}\nAmount: ${amount}\nExpected return: ${expectedReturn}\nMaturity: ${endDate}\n`,
  );
}

export function investmentCreatedAdminTemplate({
  name,
  email,
  amount,
  plan,
  expectedReturn,
  endDate,
}: InvestmentCreatedAdminTemplateInput) {
  const subject = "New investment created";
  return buildTemplate(
    subject,
    "A user has created a new investment.",
    `<p style="margin:0 0 12px;">A new investment was created.</p>
     <p style="margin:0;"><strong>User:</strong> ${escapeHtml(name)}<br />
     <strong>Email:</strong> ${escapeHtml(email)}<br />
     <strong>Plan:</strong> ${escapeHtml(plan)}<br />
     <strong>Amount:</strong> ${escapeHtml(amount)}<br />
     <strong>Expected return:</strong> ${escapeHtml(expectedReturn)}<br />
     <strong>Maturity:</strong> ${escapeHtml(endDate)}</p>`,
    `A new investment was created.\nUser: ${name}\nEmail: ${email}\nPlan: ${plan}\nAmount: ${amount}\nExpected return: ${expectedReturn}\nMaturity: ${endDate}\n`,
  );
}

export function adminCreditUserTemplate({ name, amount, balance }: AdminCreditTemplateInput) {
  return buildTemplate(
    "Account credited by admin",
    "A manual credit has been applied to your wallet.",
    `<p style="margin:0 0 12px;">Hello ${escapeHtml(name)},</p>
     <p style="margin:0 0 12px;">An admin has credited your wallet.</p>
     <p style="margin:0;"><strong>Credited amount:</strong> ${escapeHtml(amount)}<br />
     <strong>New balance:</strong> ${escapeHtml(balance)}</p>`,
    `Hello ${name},\nAn admin has credited your wallet.\nCredited amount: ${amount}\nNew balance: ${balance}\n`,
  );
}

export function accountStatusTemplate({ name, isActive }: AccountStatusTemplateInput) {
  const subject = isActive ? "Your account has been activated" : "Your account has been deactivated";
  const body = isActive
    ? "Your account is active again. You can now access your dashboard."
    : "Your account has been deactivated. Please contact support for assistance.";
  return buildTemplate(
    subject,
    "Account status update",
    `<p style="margin:0 0 12px;">Hello ${escapeHtml(name)},</p>
     <p style="margin:0;">${escapeHtml(body)}</p>`,
    `Hello ${name},\n${body}\n`,
  );
}
