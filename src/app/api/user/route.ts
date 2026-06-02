import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

import {
  publicUserSelect,
  requireAnyPermissionApi,
  requirePermissionApi,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPermissionPayload } from "@/lib/permissions";
import {
  isValidEmail,
  normalizeEmail,
  normalizeProfileImageUrl,
  normalizeText,
  parseNumericId,
} from "@/lib/security";

const USER_ROLES = new Set(["admin", "user"]);

export async function GET(req: NextRequest) {
  const view = req.nextUrl.searchParams.get("view");

  if (view === "dashboard") {
    const { response } = await requirePermissionApi("canManageUsers");
    if (response) return response;

    const [users, count] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: publicUserSelect,
      }),
      prisma.user.count({ where: { isActive: true } }),
    ]);

    return NextResponse.json({ users, count });
  }

  const { response } = await requireAnyPermissionApi(["canManageUsers", "canEditAbout"]);
  if (response) return response;

  const data = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: publicUserSelect,
  });

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { response } = await requirePermissionApi("canManageUsers");
  if (response) return response;

  try {
    const body = await req.json();
    const name = normalizeText(body.name, 120);
    const email = normalizeEmail(body.email);
    const password = String(body.password ?? "");
    const role = String(body.role ?? "");
    const permissions = getPermissionPayload(body);
    const profileImageUrl = normalizeProfileImageUrl(body.profileImageUrl);

    if (body.profileImageUrl && !profileImageUrl) {
      return NextResponse.json({ error: "Foto de perfil invalida." }, { status: 400 });
    }

    if (!name || !email || !password || !USER_ROLES.has(role) || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Dados obrigatórios ausentes ou inválidos" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 8 caracteres" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        profileImageUrl,
        role: role as "admin" | "user",
        ...permissions,
      },
    });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      role: user.role,
      isActive: user.isActive,
      isTeam: user.isTeam,
      isFormerTeam: user.isFormerTeam,
      ...permissions,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { response } = await requirePermissionApi("canManageUsers");
  if (response) return response;

  try {
    const body = await req.json();
    const id = parseNumericId(body.id);

    if (!id) {
      return NextResponse.json({ error: "ID do usuário inválido." }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Usuário deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao deletar usuário" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const { response } = await requirePermissionApi("canManageUsers");
  if (response) return response;

  try {
    const body = await req.json();
    const id = parseNumericId(body.id);
    const name = normalizeText(body.name, 120);
    const email = normalizeEmail(body.email);
    const role = String(body.role ?? "");
    const permissions = getPermissionPayload(body);
    const profileImageUrl =
      typeof body.profileImageUrl === "string" && body.profileImageUrl
        ? normalizeProfileImageUrl(body.profileImageUrl)
        : null;

    if (body.profileImageUrl && !profileImageUrl) {
      return NextResponse.json({ error: "Foto de perfil invalida." }, { status: 400 });
    }

    if (!id || !name || !email || !USER_ROLES.has(role) || !isValidEmail(email)) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }

    await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        profileImageUrl,
        role: role as "admin" | "user",
        ...permissions,
      },
    });

    return NextResponse.json({ message: "Usuário alterado com sucesso" });
  } catch (error) {
    console.error("Erro ao alterar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao alterar usuário" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const id = parseNumericId(body.id);
    const isTeam = body.isTeam;
    const isFormerTeam = body.isFormerTeam;
    const isActive = body.isActive;
    const updatesTeam = typeof isTeam === "boolean" || typeof isFormerTeam === "boolean";
    const updatesAccountStatus = typeof isActive === "boolean";

    if (!id || (!updatesTeam && !updatesAccountStatus)) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }

    const { session, response } = updatesAccountStatus
      ? await requirePermissionApi("canManageUsers")
      : await requirePermissionApi("canEditAbout");
    if (response) return response;

    if (updatesAccountStatus && isActive === false && session?.user.id === id) {
      return NextResponse.json(
        { error: "Você não pode desativar a própria conta." },
        { status: 400 }
      );
    }

    const data: Prisma.UserUpdateInput = {};

    if (typeof isTeam === "boolean") {
      data.isTeam = isTeam;
      if (isTeam) {
        data.isFormerTeam = false;
      }
    }

    if (typeof isFormerTeam === "boolean") {
      data.isFormerTeam = isFormerTeam;
      if (isFormerTeam) {
        data.isTeam = false;
      }
    }

    if (updatesAccountStatus) {
      data.isActive = isActive;

      if (!isActive) {
        data.isTeam = false;
        data.resetPasswordTokenHash = null;
        data.resetPasswordExpiresAt = null;
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: publicUserSelect,
    });
    return NextResponse.json(user);
  } catch {
    return NextResponse.json(
      { error: "Erro ao atualizar usuário." },
      { status: 500 }
    );
  }
}
