import { ActiveLink } from "@/components/activeLink";
import { User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";

export const HeaderPrivate = () => {


    return (
        <header className="fixed top-0 z-50 w-full bg-[#0088b7]/70 dark:bg-background-dark/80 backdrop-blur-sm">
            <div className="px-4">
                {/* max-w-6xl mx-auto  */}
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-4 text-slate-900 dark:text-slate-50">
                        <div className="size-14 text-primary flex items-center">
                            <Link href="/">
                                <Image src="/LEC.png"
                                    alt="Logo LEC"
                                    width={80}
                                    height={100} />
                            </Link>
                        </div>
                        <h2 className="text-lg font-bold tracking-tight text-white">Laboratório de Educação Computacional-FACOM</h2>
                    </div>
                    <nav className="hidden md:flex flex-1 justify-end">
                        <div className="flex items-center gap-8">
                            <ActiveLink href="/">Inicio</ActiveLink>
                            <ActiveLink href="/resources">Recursos</ActiveLink>
                            <ActiveLink href="/projects">Pesquisas</ActiveLink>
                            <ActiveLink href="/noticias">Notícias</ActiveLink>
                            <ActiveLink href="/contact">Contato</ActiveLink>                          
                            <ActiveLink href="/users">Usuários</ActiveLink>
                            <div className="flex flex-rol items-center">
                                 <Link href="/SignIn"className="relative z-20">
                                <Button className="relative z-20 rounded-full bg-[#0088b7] hover:bg-[#0077a3]/90 transition-colors">Login
                                    <User />
                                </Button>
                                </Link>
                            </div>
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    )
}