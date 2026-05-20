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

      const event = await prisma.events.findUnique({
        where: { id },
        include: {
          user: { select: publicUserSelect },
          images: true,
        },
      });

      if (!event) {
        return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
      }

      return NextResponse.json(event);
    }

    const events = await prisma.events.findMany({
      include: {
        user: { select: publicUserSelect },
        images: true,
      },
      orderBy: { event_date: "desc" },
    });
    return NextResponse.json(events);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao buscar eventos" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { session, response } = await requirePermissionApi("canManageEvents");
  if (response) return response;

  try {
    const data = await req.json();
    const title = normalizeText(data.title, 180);
    const description = normalizeText(data.description, 2000);
    const content = sanitizeRichTextHtml(data.content);
    const eventDate = String(data.event_date ?? "").trim();
    const images = normalizeUploadList(data.images);

    if (!title || !description || !content || !eventDate) {
      return NextResponse.json(
        { error: "Dados obrigatórios ausentes" },
        { status: 400 }
      );
    }

    const event = await prisma.events.create({
      data: {
        title,
        description,
        content,
        event_date: eventDate,
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

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao criar evento" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { response } = await requirePermissionApi("canManageEvents");
  if (response) return response;

  try {
    const { searchParams } = new URL(req.url);
    const eventId = parseNumericId(searchParams.get("id"));

    if (!eventId) {
      return NextResponse.json({ error: "ID do evento é obrigatório" }, { status: 400 });
    }

    await prisma.event_images.deleteMany({
      where: {
        event_id: eventId,
      },
    });

    await prisma.events.delete({
      where: {
        id: eventId,
      },
    });

    return NextResponse.json({ message: "Evento excluído com sucesso" }, { status: 200 });
  } catch (error) {
    console.error("Erro ao excluir evento:", error);
    return NextResponse.json({ error: "Erro interno ao excluir evento" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const { response } = await requirePermissionApi("canManageEvents");
  if (response) return response;

  try {
    const body = await req.json();
    const id = parseNumericId(body.id);
    const title = normalizeText(body.title, 180);
    const description = normalizeText(body.description, 2000);
    const content = sanitizeRichTextHtml(body.content);
    const eventDate = String(body.event_date ?? "").trim();
    const images = normalizeUploadList(body.images);

    if (!id) {
      return NextResponse.json({ error: "ID do evento é obrigatório" }, { status: 400 });
    }

    if (!title || !description || !content || !eventDate) {
      return NextResponse.json(
        { error: "Dados obrigatórios ausentes" },
        { status: 400 }
      );
    }

    const updatedEvent = await prisma.events.update({
      where: {
        id,
      },
      data: {
        title,
        description,
        content,
        event_date: eventDate,
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

    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar evento:", error);
    return NextResponse.json({ error: "Erro interno ao atualizar evento" }, { status: 500 });
  }
}
