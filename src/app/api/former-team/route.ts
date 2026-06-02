import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await prisma.user.findMany({
    where: { isFormerTeam: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      profileImageUrl: true,
      role: true,
      isActive: true,
      isTeam: true,
      isFormerTeam: true,
    },
  });

  return NextResponse.json(data);
}
