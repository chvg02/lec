import { readFile } from "fs/promises";
import path from "path";

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONTENT_TYPES: Record<string, string> = {
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

type UploadRouteContext = {
  params: Promise<{ filePath: string[] }> | { filePath: string[] };
};

export async function GET(_request: Request, context: UploadRouteContext) {
  const { filePath } = await context.params;
  const requestedPath = filePath.join("/");

  if (!/^[A-Za-z0-9._/-]+$/.test(requestedPath)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const resolvedPath = path.resolve(uploadDir, requestedPath);

  if (!resolvedPath.startsWith(path.resolve(uploadDir) + path.sep)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const file = await readFile(resolvedPath);
    const contentType =
      CONTENT_TYPES[path.extname(resolvedPath).toLowerCase()] ||
      "application/octet-stream";

    return new NextResponse(file, {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": contentType,
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
