import { NextResponse } from "next/server";

import { publicUserSelect, requirePermissionApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  normalizeText,
  normalizeUploadUrl,
  parseNumericId,
} from "@/lib/security";

const MATERIAL_TYPES = new Set(["article", "didactic_material", "software"]);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawId = searchParams.get("id");

    if (rawId) {
      const id = parseNumericId(rawId);

      if (!id) {
        return NextResponse.json({ error: "ID do recurso inválido." }, { status: 400 });
      }

      const material = await prisma.materials.findUnique({
        where: { id },
        include: { user: { select: publicUserSelect } },
      });

      if (!material) {
        return NextResponse.json(
          { error: "Recurso não encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json(material);
    }

    const materials = await prisma.materials.findMany({
      include: { user: { select: publicUserSelect } },
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json(materials);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao buscar materiais" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { session, response } = await requirePermissionApi("canManageResources");
  if (response) return response;

  try {
    const data = await req.json();
    const title = normalizeText(data.title, 120);
    const description = normalizeText(data.description, 2000);
    const fileUrl = normalizeUploadUrl(data.file_url);
    const materialType = String(data.material_type ?? "");

    if (!title || !description || !fileUrl || !MATERIAL_TYPES.has(materialType)) {
      return NextResponse.json(
        { error: "Dados do recurso inválidos." },
        { status: 400 }
      );
    }

    const material = await prisma.materials.create({
      data: {
        title,
        description,
        file_url: fileUrl,
        material_type: materialType as "article" | "didactic_material" | "software",
        user: {
          connect: { id: session.user.id },
        },
      },
      include: { user: { select: publicUserSelect } },
    });

    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao criar material" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const { response } = await requirePermissionApi("canManageResources");
  if (response) return response;

  try {
    const data = await req.json();
    const id = parseNumericId(data.id);
    const title = normalizeText(data.title, 120);
    const description = normalizeText(data.description, 2000);
    const fileUrl = normalizeUploadUrl(data.file_url);
    const materialType = String(data.material_type ?? "");

    if (!id) {
      return NextResponse.json(
        { error: "ID do recurso é obrigatório para atualização" },
        { status: 400 }
      );
    }

    if (!title || !description || !fileUrl || !MATERIAL_TYPES.has(materialType)) {
      return NextResponse.json(
        { error: "Dados do recurso inválidos." },
        { status: 400 }
      );
    }

    const material = await prisma.materials.update({
      where: { id },
      data: {
        title,
        description,
        file_url: fileUrl,
        material_type: materialType as "article" | "didactic_material" | "software",
      },
      include: { user: { select: publicUserSelect } },
    });

    return NextResponse.json(material);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao atualizar material" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const { response } = await requirePermissionApi("canManageResources");
  if (response) return response;

  try {
    const { searchParams } = new URL(req.url);
    const id = parseNumericId(searchParams.get("id"));

    if (!id) {
      return NextResponse.json(
        { error: "ID do recurso é obrigatório para exclusão" },
        { status: 400 }
      );
    }

    await prisma.materials.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Recurso excluído com sucesso" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao excluir material" },
      { status: 500 }
    );
  }
}
