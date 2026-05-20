import { NextResponse } from "next/server";
import { Resend } from "resend";

import { requirePermissionApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  consumeRateLimit,
  getClientIp,
  isValidEmail,
  normalizeEmail,
  normalizeText,
} from "@/lib/security";

const CONTACT_RECIPIENT = "vitor.aa01@gmail.com";
const DEFAULT_CONTACT_SETTINGS = {
  id: 1,
  title: "Entre em Contato",
  subtitle:
    "Estamos abertos para duvidas, sugestoes e propostas de parceria. Utilize os canais abaixo ou preencha o formulario.",
  address_title: "Endereco",
  address: "Av. Costa e Silva - Pioneiros, Campo Grande - MS, 79070-900, Brasil",
  phone_title: "Telefone",
  phone: "(67) 3345-7000",
  email_title: "E-mail",
  email: "contato.labeduc@ufms.br",
  map_embed_url:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3736.636601438964!2d-54.61869868507567!3d-20.5213609862768!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9486e63a5042686b%3A0x72a5aee97f7422a5!2sUniversidade%20Federal%20de%20Mato%20Grosso%20do%20Sul!5e0!3m2!1spt-BR!2sbr!4v1689278184517!5m2!1spt-BR!2sbr",
  form_title: "Envie uma Mensagem",
  form_subtitle: "Preencha os campos abaixo para nos contatar.",
  recipient_email: CONTACT_RECIPIENT,
};

async function getContactSettings() {
  return prisma.contact_settings.upsert({
    where: { id: 1 },
    update: {},
    create: DEFAULT_CONTACT_SETTINGS,
  });
}

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Variavel de ambiente ausente: ${name}`);
  }

  return value;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getContactSendErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "statusCode" in error) {
    const resendError = error as { statusCode?: number; message?: string };

    if (
      resendError.statusCode === 403 &&
      resendError.message?.includes("You can only send testing emails")
    ) {
      return "O envio esta em modo de teste no Resend. Nesse modo, as mensagens so podem ser enviadas para o e-mail da propria conta Resend. Para enviar para outro e-mail, verifique um dominio no Resend e use um remetente desse dominio.";
    }
  }

  return "Nao foi possivel enviar a mensagem no momento.";
}

export async function GET() {
  try {
    const settings = await getContactSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Erro ao buscar configuracoes de contato:", error);
    return NextResponse.json(DEFAULT_CONTACT_SETTINGS);
  }
}

export async function POST(request: Request) {
  try {
    const rateLimit = consumeRateLimit(`contact:${getClientIp(request)}`, 5, 10 * 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente." },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
        }
      );
    }

    const body = await request.json();
    const name = normalizeText(body.name, 120);
    const email = normalizeEmail(body.email);
    const subject = normalizeText(body.subject, 160);
    const message = normalizeText(body.message, 5000);

    if (!name || !email || !subject || !message || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Preencha nome, email valido, assunto e mensagem." },
        { status: 400 }
      );
    }

    const settings = await getContactSettings();
    const resend = new Resend(getRequiredEnv("RESEND_API_KEY"));
    const fromName = process.env.CONTACT_FROM_NAME ?? "LEC Facom";
    const fromEmail = getRequiredEnv("RESEND_FROM_EMAIL");

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message);

    const { error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [settings.recipient_email || CONTACT_RECIPIENT],
      replyTo: email,
      subject: `[Contato Site] ${subject}`,
      text: [
        `Nome: ${name}`,
        `Email para resposta: ${email}`,
        "",
        "Mensagem:",
        message,
      ].join("\n"),
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
          <h2>Nova mensagem enviada pela pagina de contato</h2>
          <p><strong>Nome:</strong> ${safeName}</p>
          <p><strong>Email para resposta:</strong> ${safeEmail}</p>
          <p><strong>Assunto:</strong> ${safeSubject}</p>
          <p><strong>Mensagem:</strong></p>
          <p style="white-space: pre-wrap;">${safeMessage}</p>
        </div>
      `,
    });

    if (error) {
      console.error("Erro do Resend ao enviar email de contato:", error);

      return NextResponse.json(
        { error: getContactSendErrorMessage(error) },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Mensagem enviada com sucesso." });
  } catch (error) {
    console.error("Erro ao enviar email de contato:", error);

    return NextResponse.json(
      { error: "Nao foi possivel enviar a mensagem no momento." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const { response } = await requirePermissionApi("canEditContact");
  if (response) return response;

  try {
    const body = await request.json();
    const title = normalizeText(body.title, 120);
    const subtitle = normalizeText(body.subtitle, 500);
    const addressTitle = normalizeText(body.address_title, 80);
    const address = normalizeText(body.address, 500);
    const phoneTitle = normalizeText(body.phone_title, 80);
    const phone = normalizeText(body.phone, 80);
    const emailTitle = normalizeText(body.email_title, 80);
    const email = normalizeEmail(body.email);
    const mapEmbedUrl = normalizeText(body.map_embed_url, 2000);
    const formTitle = normalizeText(body.form_title, 120);
    const formSubtitle = normalizeText(body.form_subtitle, 300);
    const recipientEmail = normalizeEmail(body.recipient_email);

    if (
      !title ||
      !subtitle ||
      !addressTitle ||
      !address ||
      !phoneTitle ||
      !phone ||
      !emailTitle ||
      !email ||
      !isValidEmail(email) ||
      !formTitle ||
      !formSubtitle ||
      !recipientEmail ||
      !isValidEmail(recipientEmail)
    ) {
      return NextResponse.json(
        { error: "Preencha todos os campos obrigatorios com dados validos." },
        { status: 400 }
      );
    }

    const settings = await prisma.contact_settings.upsert({
      where: { id: 1 },
      update: {
        title,
        subtitle,
        address_title: addressTitle,
        address,
        phone_title: phoneTitle,
        phone,
        email_title: emailTitle,
        email,
        map_embed_url: mapEmbedUrl,
        form_title: formTitle,
        form_subtitle: formSubtitle,
        recipient_email: recipientEmail,
      },
      create: {
        ...DEFAULT_CONTACT_SETTINGS,
        title,
        subtitle,
        address_title: addressTitle,
        address,
        phone_title: phoneTitle,
        phone,
        email_title: emailTitle,
        email,
        map_embed_url: mapEmbedUrl,
        form_title: formTitle,
        form_subtitle: formSubtitle,
        recipient_email: recipientEmail,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Erro ao atualizar configuracoes de contato:", error);
    return NextResponse.json(
      { error: "Nao foi possivel atualizar os campos de contato." },
      { status: 500 }
    );
  }
}
