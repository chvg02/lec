import { NextResponse } from "next/server";

import { requirePermissionApi } from "@/lib/auth";
import {
  ABOUT_SETTINGS_FIELD_LIMITS,
  ABOUT_SETTINGS_FIELDS,
  DEFAULT_ABOUT_SETTINGS,
  type AboutSettings,
  type AboutSettingsField,
} from "@/lib/about-settings";
import { prisma } from "@/lib/prisma";
import { normalizeText } from "@/lib/security";

export const runtime = "nodejs";

function normalizeAboutSettingsPayload(body: Record<string, unknown>) {
  return ABOUT_SETTINGS_FIELDS.reduce((settings, field) => {
    const value = normalizeText(body[field], ABOUT_SETTINGS_FIELD_LIMITS[field]);

    return {
      ...settings,
      [field]:
        field === "hero_image_url"
          ? value || DEFAULT_ABOUT_SETTINGS.hero_image_url
          : value,
    };
  }, {} as Record<AboutSettingsField, string>);
}

async function getAboutSettings() {
  return prisma.about_settings.upsert({
    where: { id: 1 },
    update: {},
    create: DEFAULT_ABOUT_SETTINGS,
  });
}

export async function GET() {
  try {
    const settings = await getAboutSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Erro ao buscar configuracoes da pagina Sobre:", error);
    return NextResponse.json(DEFAULT_ABOUT_SETTINGS);
  }
}

export async function PUT(request: Request) {
  const { response } = await requirePermissionApi("canEditAbout");
  if (response) return response;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const settingsPayload = normalizeAboutSettingsPayload(body);

    const missingField = ABOUT_SETTINGS_FIELDS.find(
      (field) => field !== "hero_image_url" && !settingsPayload[field]
    );

    if (missingField) {
      return NextResponse.json(
        { error: "Preencha todos os campos obrigatórios da página Sobre." },
        { status: 400 }
      );
    }

    const settings = await prisma.about_settings.upsert({
      where: { id: 1 },
      update: settingsPayload,
      create: {
        ...DEFAULT_ABOUT_SETTINGS,
        ...settingsPayload,
      } satisfies AboutSettings,
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Erro ao atualizar configuracoes da pagina Sobre:", error);
    return NextResponse.json(
      { error: "Não foi possível atualizar a página Sobre." },
      { status: 500 }
    );
  }
}
