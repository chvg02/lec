import { NextResponse } from "next/server";

import { publicUserSelect } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseNumericId } from "@/lib/security";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const newsId = parseNumericId(rawId);

    if (!newsId) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const news = await prisma.news.findUnique({
      where: { id: newsId },
      include: {
        user: { select: publicUserSelect },
        images: true,
      },
    });

    if (!news) {
      return NextResponse.json({ error: "Notícia não encontrada" }, { status: 404 });
    }

    return NextResponse.json(news);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
