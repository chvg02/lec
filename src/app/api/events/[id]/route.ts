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
    const eventId = parseNumericId(rawId);

    if (!eventId) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const event = await prisma.events.findUnique({
      where: { id: eventId },
      include: {
        user: { select: publicUserSelect },
        images: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
