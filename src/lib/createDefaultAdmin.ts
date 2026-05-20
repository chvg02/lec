// src/lib/createDefaultAdmin.ts
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function createDefaultAdmin() {
  const email = "vitor.a.anjos@gmail.com"

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    await prisma.user.create({
      data: {
        name: "Vitor Anjos",
        email,
        password: await bcrypt.hash("123456", 10),
        role: "admin"
      }
    })
  }
}
