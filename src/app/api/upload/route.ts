import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

import { requireAnyPermissionApi } from "@/lib/auth";
import {
  isAllowedImageUpload,
  isAllowedUpload,
  MAX_RESOURCE_UPLOAD_SIZE_BYTES,
  MAX_UPLOAD_SIZE_BYTES,
  sanitizeFileName,
} from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MISSING_BLOB_CONFIGURATION_ERROR =
  "Vercel Blob nao esta configurado. Crie um Blob Store publico e vincule BLOB_READ_WRITE_TOKEN ao projeto.";

type UploadType = "cover-image" | "editor-image" | "resource";

function getUploadType(value: FormDataEntryValue | null): UploadType {
  return value === "editor-image" || value === "resource"
    ? value
    : "cover-image";
}

async function saveUpload(file: File, filename: string, uploadType: UploadType) {
  const isResourceUpload = uploadType === "resource";
  const blobPrefix = isResourceUpload ? "resources" : "uploads";
  const localFolder = isResourceUpload ? "resources" : "";

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`${blobPrefix}/${filename}`, file, {
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
  const uploadDir = path.join(process.cwd(), "public/uploads", localFolder);
  const filepath = path.join(uploadDir, filename);

  await mkdir(uploadDir, { recursive: true });
  await writeFile(filepath, buffer);

  return localFolder ? `/uploads/${localFolder}/${filename}` : `/uploads/${filename}`;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const uploadType = getUploadType(formData.get("uploadType"));
    const isResourceUpload = uploadType === "resource";

    const { response } = await requireAnyPermissionApi(
      isResourceUpload
        ? ["canManageResources"]
        : ["canManageProjects", "canManageNews", "canManageEvents", "canManageResources"]
    );
    if (response) return response;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "O arquivo enviado esta vazio." }, { status: 400 });
    }

    const maxUploadSize = isResourceUpload
      ? MAX_RESOURCE_UPLOAD_SIZE_BYTES
      : MAX_UPLOAD_SIZE_BYTES;

    if (file.size > maxUploadSize) {
      return NextResponse.json(
        {
          error: isResourceUpload
            ? "O arquivo excede o limite de 100 MB."
            : "O arquivo excede o limite de 10 MB.",
        },
        { status: 400 }
      );
    }

    const isAllowedFile =
      uploadType === "editor-image" ? isAllowedImageUpload(file) : isAllowedUpload(file);

    if (!isAllowedFile) {
      return NextResponse.json(
        { error: "Tipo de arquivo nao permitido." },
        { status: 400 }
      );
    }

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const safeOriginalName = sanitizeFileName(file.name) || "arquivo";
    const filename = `${uniqueSuffix}-${safeOriginalName}`;
    const fileUrl = await saveUpload(file, filename, uploadType);

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
