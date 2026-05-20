import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { hashResetPasswordToken } from "@/lib/reset-password";
import { normalizeText } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = normalizeText(body.token, 256);
    const password = String(body.password ?? "");

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token e nova senha são obrigatórios." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 8 caracteres." },
        { status: 400 }
      );
    }

    const tokenHash = hashResetPasswordToken(token);

    const users = await prisma.$queryRaw<Array<{ id: number }>>(
      Prisma.sql`
        SELECT "id"
        FROM "users"
        WHERE "resetPasswordTokenHash" = ${tokenHash}
          AND "resetPasswordExpiresAt" > NOW()
        LIMIT 1
      `
    );

    const user = users[0];

    if (!user) {
      return NextResponse.json(
        { error: "Link inválido ou expirado." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$executeRaw(
      Prisma.sql`
        UPDATE "users"
        SET "password" = ${hashedPassword},
            "resetPasswordTokenHash" = NULL,
            "resetPasswordExpiresAt" = NULL,
            "updatedAt" = NOW()
        WHERE "id" = ${user.id}
      `
    );

    return NextResponse.json({
      message: "Senha redefinida com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao redefinir senha:", error);

    return NextResponse.json(
      { error: "Não foi possível redefinir a senha." },
      { status: 500 }
    );
  }
}
