import nodemailer from "nodemailer";

export class MailConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MailConfigError";
  }
}

type SendEmailOptions = {
  to: string | string[];
  replyTo?: string;
  subject: string;
  text: string;
  html: string;
};

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new MailConfigError(`Variavel de ambiente ausente: ${name}`);
  }

  return value;
}

function getSmtpPort() {
  const rawPort = process.env.SMTP_PORT?.trim() || "587";
  const port = Number(rawPort);

  if (!Number.isInteger(port) || port <= 0) {
    throw new MailConfigError("SMTP_PORT deve ser um numero valido.");
  }

  return port;
}

function getSmtpSecure(port: number) {
  const rawSecure = process.env.SMTP_SECURE?.trim().toLowerCase();

  if (!rawSecure) {
    return port === 465;
  }

  if (["true", "1", "yes", "sim"].includes(rawSecure)) {
    return true;
  }

  if (["false", "0", "no", "nao"].includes(rawSecure)) {
    return false;
  }

  throw new MailConfigError("SMTP_SECURE deve ser true ou false.");
}

function createTransporter() {
  const port = getSmtpPort();

  return nodemailer.createTransport({
    host: getRequiredEnv("SMTP_HOST"),
    port,
    secure: getSmtpSecure(port),
    auth: {
      user: getRequiredEnv("SMTP_USER"),
      pass: getRequiredEnv("SMTP_PASS"),
    },
  });
}

export async function sendEmail(options: SendEmailOptions) {
  const fromName =
    process.env.SMTP_FROM_NAME?.trim() ||
    process.env.CONTACT_FROM_NAME?.trim() ||
    "LEC Facom";
  const fromEmail = getRequiredEnv("SMTP_FROM_EMAIL");

  await createTransporter().sendMail({
    from: {
      name: fromName,
      address: fromEmail,
    },
    to: options.to,
    replyTo: options.replyTo,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
}

export function isMailConfigError(error: unknown) {
  return error instanceof MailConfigError;
}

export function getMailConfigErrorMessage(error: unknown) {
  if (isMailConfigError(error)) {
    return `${(error as MailConfigError).message}. Configure SMTP_HOST, SMTP_USER, SMTP_PASS e SMTP_FROM_EMAIL. SMTP_PORT e SMTP_SECURE sao opcionais.`;
  }

  return null;
}
