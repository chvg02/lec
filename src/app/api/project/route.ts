import { NextResponse } from "next/server";

import { publicUserSelect, requirePermissionApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  normalizeText,
  normalizeUploadList,
  parseNumericId,
  sanitizeRichTextHtml,
} from "@/lib/security";

type ProjectTagInput = {
  name?: string;
};

const PROJECT_STATUSES = new Set(["done", "inProgress"]);

function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) {
    return [];
  }

  const uniqueTags = new Map<string, string>();

  for (const value of tags) {
    const rawTag =
      typeof value === "string"
        ? value
        : value && typeof value === "object" && "name" in value
          ? String((value as ProjectTagInput).name)
          : "";

    const cleanedTag = normalizeText(rawTag, 50);

    if (!cleanedTag) {
      continue;
    }

    const normalizedKey = cleanedTag.toLowerCase();

    if (!uniqueTags.has(normalizedKey)) {
      uniqueTags.set(normalizedKey, cleanedTag);
    }
  }

  return Array.from(uniqueTags.values());
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isDashboard = searchParams.get("view") === "dashboard";
  const rawId = searchParams.get("id");

  if (isDashboard) {
    const [latestProjects, activeCount] = await Promise.all([
      prisma.project.findMany({
        take: 4,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
        },
      }),
      prisma.project.count({
        where: { status: "inProgress" },
      }),
    ]);

    return NextResponse.json({
      projects: latestProjects,
      count: activeCount,
    });
  }

  if (rawId) {
    const id = parseNumericId(rawId);

    if (!id) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        images: true,
        tags: true,
        user: {
          select: publicUserSelect,
        },
      },
    });

    return NextResponse.json(project);
  }

  const projects = await prisma.project.findMany({
    include: {
      images: true,
      tags: true,
      user: {
        select: publicUserSelect,
      },
    },
  });

  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const { session, response } = await requirePermissionApi("canManageProjects");
  if (response) return response;

  try {
    const data = await req.json();
    const title = normalizeText(data.title, 180);
    const description = normalizeText(data.description, 2000);
    const content = sanitizeRichTextHtml(data.content);
    const status = String(data.status ?? "");

    if (!title || !description || !content || !PROJECT_STATUSES.has(status)) {
      return NextResponse.json(
        { error: "Dados obrigatórios ausentes ou inválidos" },
        { status: 400 }
      );
    }

    const tags = normalizeTags(data.tags);
    const images = normalizeUploadList(data.images);

    const project = await prisma.project.create({
      data: {
        title,
        description,
        content,
        status: status as "done" | "inProgress",
        user: {
          connect: { id: session.user.id },
        },
        tags: {
          connectOrCreate: tags.map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
        images: {
          create: images,
        },
      },
      include: {
        images: true,
        tags: true,
      },
    });

    return NextResponse.json({ message: "ok", project });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro interno ao criar projeto" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const { response } = await requirePermissionApi("canManageProjects");
  if (response) return response;

  try {
    const { searchParams } = new URL(req.url);
    const projectId = parseNumericId(searchParams.get("id"));

    if (!projectId) {
      return NextResponse.json(
        { error: "ID do projeto é obrigatório para exclusão" },
        { status: 400 }
      );
    }

    await prisma.project_images.deleteMany({
      where: {
        project_id: projectId,
      },
    });

    await prisma.project.delete({
      where: {
        id: projectId,
      },
    });

    return NextResponse.json({ message: "Projeto excluído com sucesso!" });
  } catch (error) {
    console.error("Erro ao excluir projeto:", error);
    return NextResponse.json(
      { error: "Erro interno ao excluir projeto" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const { response } = await requirePermissionApi("canManageProjects");
  if (response) return response;

  try {
    const body = await req.json();
    const id = parseNumericId(body.id);
    const title = normalizeText(body.title, 180);
    const description = normalizeText(body.description, 2000);
    const content = sanitizeRichTextHtml(body.content);
    const status = String(body.status ?? "");
    const tags = normalizeTags(body.tags);
    const images = normalizeUploadList(body.images);

    if (!id) {
      return NextResponse.json(
        { error: "ID do projeto é obrigatório para atualização" },
        { status: 400 }
      );
    }

    if (!title || !description || !content || !PROJECT_STATUSES.has(status)) {
      return NextResponse.json(
        { error: "Dados obrigatórios ausentes ou inválidos" },
        { status: 400 }
      );
    }

    const updatedProject = await prisma.project.update({
      where: {
        id,
      },
      data: {
        title,
        description,
        content,
        status: status as "done" | "inProgress",
        tags: {
          set: [],
          connectOrCreate: tags.map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
        images: {
          deleteMany: {},
          create: images,
        },
      },
      include: {
        images: true,
        tags: true,
      },
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("Erro ao atualizar projeto:", error);
    return NextResponse.json(
      { error: "Erro interno ao atualizar projeto" },
      { status: 500 }
    );
  }
}
