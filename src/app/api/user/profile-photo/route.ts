import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

import { requireAuthenticatedApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import {
  isAllowedImageUpload,
  MAX_UPLOAD_SIZE_BYTES,
  parseNumericId,
  sanitizeFileName,
} from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { session, response } = await requireAuthenticatedApi();
  if (response) return response;

  try {
    const url = new URL(req.url);
    const uploadOnly = url.searchParams.get("uploadOnly") === "1";
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const targetUserId = parseNumericId(formData.get("userId")) ?? session.user.id;
    const isSelf = targetUserId === session.user.id;

    if (!isSelf && !hasPermission(session.user, "canManageUsers")) {
      return NextResponse.json(
        { error: "Voce nao tem permissao para alterar esta foto." },
        { status: 403 }
      );
    }

    if (uploadOnly && !hasPermission(session.user, "canManageUsers")) {
      return NextResponse.json(
        { error: "Voce nao tem permissao para enviar fotos para novos usuarios." },
        { status: 403 }
      );
    }

    if (!file) {
      return NextResponse.json({ error: "Nenhuma imagem enviada." }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "A imagem enviada esta vazia." }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      return NextResponse.json(
        { error: "A imagem excede o limite de 10 MB." },
        { status: 400 }
      );
    }

    if (!isAllowedImageUpload(file)) {
      return NextResponse.json(
        { error: "Envie uma imagem PNG, JPG, JPEG, WEBP ou GIF." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const safeOriginalName = sanitizeFileName(file.name) || "foto";
    const filename = `${uniqueSuffix}-${safeOriginalName}`;
    const uploadDir = path.join(process.cwd(), "public/uploads/profile");
    const filepath = path.join(uploadDir, filename);

    await mkdir(uploadDir, { recursive: true });
    await writeFile(filepath, buffer);

    const profileImageUrl = `/uploads/profile/${filename}`;

    if (!uploadOnly) {
      await prisma.user.update({
        where: { id: targetUserId },
        data: { profileImageUrl },
      });
    }

    return NextResponse.json({ profileImageUrl });
  } catch (error) {
    console.error("Erro ao atualizar foto de perfil:", error);
    return NextResponse.json(
      { error: "Nao foi possivel atualizar a foto de perfil." },
      { status: 500 }
    );
  }
}
