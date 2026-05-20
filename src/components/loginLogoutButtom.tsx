"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

export function LoginLogoutButton() {
  const { data: session } = useSession();

  // Usuário NÃO está logado -> mostra Login normal
  if (!session) {
    return (
      <Link href="/SignIn" className="relative z-20">
        <Button className="relative z-20 rounded-full bg-[#0088b7] hover:bg-[#0077a3]/90 transition-colors">
          Login
          <User className="ml-2" size={18} />
        </Button>
      </Link>
    );
  }

  // Usuário LOGADO -> mostra menu com Logout
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="relative z-20 rounded-full bg-[#0088b7] hover:bg-[#0077a3]/90 transition-colors">
          {session.user?.name ?? "Usuário"}
          <User className="ml-2" size={18} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-40">
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/" })}
          className="cursor-pointer text-red-600"
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
