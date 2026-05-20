import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const projetos = await prisma.project.findMany();
    return NextResponse.json(projetos);
}



export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { title, description, content, user_id, tags, images } = data;

    const project = await prisma.project.create({
      data: { title, description, content, user_id },
    });

    if (tags?.length) {
      for (const name of tags) {
        let tag = await prisma.tags.findFirst({ where: { name } });

        if (!tag) tag = await prisma.tags.create({ data: { name } });

        await prisma.project_tags.create({
          data: { project_id: project.id, tag_id: tag.id },
        });
      }
    }

    if (images?.length) {
      await prisma.project_images.createMany({
        data: images.map((img: any) => ({
          project_id: project.id,
          image_url: img.url,
          caption: img.caption ?? null,
        })),
      });
    }

    return Response.json({ message: "ok", project });
  } catch (e: any) {
    console.error(e);
    return new Response("Internal error", { status: 500 });
  }
}
