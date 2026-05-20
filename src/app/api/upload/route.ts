import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

import { requireAnyPermissionApi } from "@/lib/auth";
import {
  isAllowedUpload,
  MAX_UPLOAD_SIZE_BYTES,
  sanitizeFileName,
} from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MISSING_BLOB_CONFIGURATION_ERROR =
  "Vercel Blob nao esta configurado. Crie um Blob Store publico e vincule BLOB_READ_WRITE_TOKEN ao projeto.";

async function saveUpload(file: File, filename: string) {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`uploads/${filename}`, file, {
      access: "public",
      contentType: file.type,
    });

    return blob.url;
  }

  if (process.env.VERCEL) {
    throw new Error(MISSING_BLOB_CONFIGURATION_ERROR);
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const uploadDir = path.join(process.cwd(), "public/uploads");
  const filepath = path.join(uploadDir, filename);

  await mkdir(uploadDir, { recursive: true });
  await writeFile(filepath, buffer);

  return `/uploads/${filename}`;
}

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
        { error: "Tipo de arquivo nao permitido." },
        { status: 400 }
      );
    }

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const safeOriginalName = sanitizeFileName(file.name) || "arquivo";
    const filename = `${uniqueSuffix}-${safeOriginalName}`;
    const fileUrl = await saveUpload(file, filename);

    return NextResponse.json({ imageUrl: fileUrl, fileUrl });
  } catch (error) {
    console.error("Erro no upload:", error);
    const isMissingBlobConfiguration =
      error instanceof Error &&
      error.message === MISSING_BLOB_CONFIGURATION_ERROR;

    return NextResponse.json(
      {
        error: isMissingBlobConfiguration
          ? MISSING_BLOB_CONFIGURATION_ERROR
          : "Erro interno ao salvar o arquivo.",
      },
      { status: 500 }
    );
  }
}
