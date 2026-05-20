import { NextResponse } from "next/server";
import { Resend } from "resend";
import { Prisma } from "../../../../../generated/prisma/client";

import { prisma } from "@/lib/prisma";
import {
  generateResetPasswordToken,
  getResetPasswordExpirationDate,
  hashResetPasswordToken,
} from "@/lib/reset-password";
import {
  consumeRateLimit,
  getClientIp,
  isValidEmail,
  normalizeEmail,
} from "@/lib/security";

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

const successResponse = NextResponse.json({
  message:
    "Se existir uma conta com esse email, enviaremos um link para redefinir a senha.",
});

export async function POST(request: Request) {
  try {
    const rateLimit = consumeRateLimit(`forgot-password:${getClientIp(request)}`, 5, 10 * 60 * 1000);

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
    const email = normalizeEmail(body.email);

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Informe um email válido para recuperar a senha." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      return successResponse;
    }

    const token = generateResetPasswordToken();
    const tokenHash = hashResetPasswordToken(token);
    const expiresAt = getResetPasswordExpirationDate();

    await prisma.$executeRaw(
      Prisma.sql`
        UPDATE "users"
        SET "resetPasswordTokenHash" = ${tokenHash},
            "resetPasswordExpiresAt" = ${expiresAt},
            "updatedAt" = NOW()
        WHERE "id" = ${user.id}
      `
    );

    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    const resend = new Resend(getRequiredEnv("RESEND_API_KEY"));
    const fromName = process.env.CONTACT_FROM_NAME ?? "LEC Facom";
    const fromEmail = getRequiredEnv("RESEND_FROM_EMAIL");
    const safeName = escapeHtml(user.name);
    const safeUrl = escapeHtml(resetUrl);

    const { error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [user.email],
      subject: "Recuperação de senha",
      text: [
        `Ola, ${user.name}.`,
        "",
        "Recebemos um pedido para redefinir sua senha.",
        `Acesse o link abaixo para continuar: ${resetUrl}`,
        "",
        "Se você não solicitou essa alteração, ignore este email.",
      ].join("\n"),
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
          <h2>Recuperação de senha</h2>
          <p>Ola, ${safeName}.</p>
          <p>Recebemos um pedido para redefinir sua senha.</p>
          <p>
            <a href="${safeUrl}" style="display:inline-block;padding:12px 18px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:8px;">
              Redefinir senha
            </a>
          </p>
          <p>Se preferir, copie e cole este link no navegador:</p>
          <p>${safeUrl}</p>
          <p>Se você não solicitou essa alteração, ignore este email.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Erro do Resend ao enviar recuperação de senha:", error);

      return NextResponse.json(
        { error: "Não foi possível enviar o email de recuperação." },
        { status: 500 }
      );
    }

    return successResponse;
  } catch (error) {
    console.error("Erro ao solicitar recuperação de senha:", error);

    return NextResponse.json(
      { error: "Não foi possível processar a solicitação." },
      { status: 500 }
    );
  }
}
