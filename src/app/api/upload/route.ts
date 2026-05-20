import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { requireAnyPermissionApi } from "@/lib/auth";
import {
  isAllowedUpload,
  MAX_UPLOAD_SIZE_BYTES,
  sanitizeFileName,
} from "@/lib/security";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { response } = await requireAnyPermissionApi([
    "canManageProjects",
    "canManageNews",
    "canManageEvents",
    "canManageResources",
  ]);
  if (response) return response;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "O arquivo enviado esta vazio." }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      return NextResponse.json(
        { error: "O arquivo excede o limite de 10 MB." },
        { status: 400 }
      );
    }

    if (!isAllowedUpload(file)) {
      return NextResponse.json(
        { error: "Tipo de arquivo não permitido." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const safeOriginalName = sanitizeFileName(file.name) || "arquivo";
    const filename = `${uniqueSuffix}-${safeOriginalName}`;
    const uploadDir = path.join(process.cwd(), "public/uploads");
    const filepath = path.join(uploadDir, filename);

    await mkdir(uploadDir, { recursive: true });
    await writeFile(filepath, buffer);

    const fileUrl = `/uploads/${filename}`;

    return NextResponse.json({ imageUrl: fileUrl, fileUrl });
  } catch (error) {
    console.error("Erro no upload:", error);
    return NextResponse.json(
      { error: "Erro interno ao salvar o arquivo." },
      { status: 500 }
    );
  }
}
