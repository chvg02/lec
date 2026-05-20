import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    const data = await prisma.user.findMany();
    return NextResponse.json(data);
}

export async function POST(req: Request) {
    try {
        const { name, email, password, role } = await req.json();
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name, email, password: hashedPassword, role: role
            }
        });
        return NextResponse.json(user);

    } catch (error) {
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
  try {
    const {id} = await req.json();
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Usuário deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    return NextResponse.json({ error: "Erro ao deletar usuário" }, { status: 500 });
  }
}
export async function PUT(req:NextRequest) {
    try{
        const  {id,name, email, role }= await req.json();
        await prisma.user.update({where:{id}, data:{name, email, role:role}})
         return NextResponse.json({ message: "Usuário alterado com sucesso" });
    }
    catch (error) {
    console.error("Erro ao alterar:", error);
    return NextResponse.json({ error: "Erro ao alterar usuário" }, { status: 500 });
  }
}