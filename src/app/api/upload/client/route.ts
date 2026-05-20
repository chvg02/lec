import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { requireAnyPermissionApi } from "@/lib/auth";
import { MAX_UPLOAD_SIZE_BYTES } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_EDITOR_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
];

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const { session, response } = await requireAnyPermissionApi([
          "canManageProjects",
          "canManageNews",
          "canManageEvents",
        ]);

        if (response) {
          throw new Error("Voce nao tem permissao para enviar imagens.");
        }

        if (!pathname.startsWith("uploads/")) {
          throw new Error("Caminho de upload invalido.");
        }

        return {
          allowedContentTypes: ALLOWED_EDITOR_IMAGE_TYPES,
          maximumSizeInBytes: MAX_UPLOAD_SIZE_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId: session.user.id }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log("Upload de imagem do editor concluido:", {
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
