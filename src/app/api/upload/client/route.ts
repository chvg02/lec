import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { requireAnyPermissionApi } from "@/lib/auth";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_UPLOAD_MIME_TYPES,
  MAX_RESOURCE_UPLOAD_SIZE_BYTES,
  MAX_UPLOAD_SIZE_BYTES,
} from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_EDITOR_IMAGE_TYPES = Array.from(ALLOWED_IMAGE_MIME_TYPES);
const ALLOWED_RESOURCE_FILE_TYPES = Array.from(ALLOWED_UPLOAD_MIME_TYPES);

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const isResourceUpload = pathname.startsWith("resources/");
        const isEditorImageUpload = pathname.startsWith("uploads/");

        if (!isResourceUpload && !isEditorImageUpload) {
          throw new Error("Caminho de upload invalido.");
        }

        const { session, response } = await requireAnyPermissionApi([
          ...(isResourceUpload ? ["canManageResources" as const] : []),
          ...(isEditorImageUpload
            ? (["canManageProjects", "canManageNews", "canManageEvents"] as const)
            : []),
        ]);

        if (response) {
          throw new Error("Voce nao tem permissao para enviar este arquivo.");
        }

        return {
          allowedContentTypes: isResourceUpload
            ? ALLOWED_RESOURCE_FILE_TYPES
            : ALLOWED_EDITOR_IMAGE_TYPES,
          maximumSizeInBytes: isResourceUpload
            ? MAX_RESOURCE_UPLOAD_SIZE_BYTES
            : MAX_UPLOAD_SIZE_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId: session.user.id }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log("Upload direto para Blob concluido:", {
          pathname: blob.pathname,
          tokenPayload,
        });
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Nao foi possivel preparar o upload da imagem.",
      },
      { status: 400 }
    );
  }
}
