import { NextResponse } from "next/server";

import { publicUserSelect, requirePermissionApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  normalizeText,
  normalizeUploadList,
  parseNumericId,
  sanitizeRichTextHtml,
} from "@/lib/security";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawId = searchParams.get("id");

    if (rawId) {
      const id = parseNumericId(rawId);

      if (!id) {
        return NextResponse.json({ error: "ID inválido" }, { status: 400 });
      }

      const news = await prisma.news.findUnique({
        where: { id },
        include: {
          user: { select: publicUserSelect },
          images: true,
        },
      });

      if (!news) {
        return NextResponse.json({ error: "Notícia não encontrada" }, { status: 404 });
      }

      return NextResponse.json(news);
    }

    const news = await prisma.news.findMany({
      include: {
        user: { select: publicUserSelect },
        images: true,
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json(news);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao buscar notícias" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { session, response } = await requirePermissionApi("canManageNews");
  if (response) return response;

  try {
    const data = await req.json();
    const title = normalizeText(data.title, 180);
    const description = normalizeText(data.description, 2000);
    const content = sanitizeRichTextHtml(data.content);
    const newsDate = String(data.news_date ?? "").trim();
    const images = normalizeUploadList(data.images);

    if (!title || !description || !content || !newsDate) {
      return NextResponse.json(
        { error: "Dados obrigatórios ausentes" },
        { status: 400 }
      );
    }

    const created = await prisma.news.create({
      data: {
        title,
        description,
        content,
        news_date: newsDate,
        user: {
          connect: { id: session.user.id },
        },
        images: {
          create: images,
        },
      },
      include: {
        images: true,
        user: { select: publicUserSelect },
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao criar notícia" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { response } = await requirePermissionApi("canManageNews");
  if (response) return response;

  try {
    const { searchParams } = new URL(req.url);
    const newsId = parseNumericId(searchParams.get("id"));

    if (!newsId) {
      return NextResponse.json(
        { error: "ID da notícia é obrigatório para exclusão" },
        { status: 400 }
      );
    }

    await prisma.news_images.deleteMany({
      where: {
        news_id: newsId,
      },
    });

    await prisma.news.delete({
      where: {
        id: newsId,
      },
    });

    return NextResponse.json({ message: "Notícia excluída com sucesso" }, { status: 200 });
  } catch (error) {
    console.error("Erro ao excluir notícia:", error);
    return NextResponse.json({ error: "Erro interno ao excluir notícia" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const { response } = await requirePermissionApi("canManageNews");
  if (response) return response;

  try {
    const body = await req.json();
    const id = parseNumericId(body.id);
    const title = normalizeText(body.title, 180);
    const description = normalizeText(body.description, 2000);
    const content = sanitizeRichTextHtml(body.content);
    const newsDate = String(body.news_date ?? "").trim();
    const images = normalizeUploadList(body.images);

    if (!id) {
      return NextResponse.json({ error: "ID da notícia é obrigatório para atualização" }, { status: 400 });
    }

    if (!title || !description || !content || !newsDate) {
      return NextResponse.json(
        { error: "Dados obrigatórios ausentes" },
        { status: 400 }
      );
    }

    const updatedNews = await prisma.news.update({
      where: {
        id,
      },
      data: {
        title,
        description,
        content,
        news_date: newsDate,
        images: {
          deleteMany: {},
          create: images,
        },
      },
      include: {
        images: true,
        user: { select: publicUserSelect },
      },
    });

    return NextResponse.json(updatedNews, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar notícia:", error);
    return NextResponse.json({ error: "Erro interno ao atualizar notícia" }, { status: 500 });
  }
}
