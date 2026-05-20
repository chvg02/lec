'use client'

import { ActiveLink } from "@/components/activeLink";
import {
    Camera,
    LayoutDashboard,
    Loader2,
    User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export const Header = () => {
    const { data: session, update } = useSession();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
    const [isUploadingProfilePhoto, setIsUploadingProfilePhoto] = useState(false);

    useEffect(() => {
        setProfileImageUrl(session?.user.profileImageUrl ?? session?.user.image ?? null);
    }, [session?.user.image, session?.user.profileImageUrl]);

    const userName = session?.user?.name ?? "Usuário";
    const avatarSrc = profileImageUrl || `https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(userName)}`;

    async function handleProfilePhotoUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file) return;

        setIsUploadingProfilePhoto(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/user/profile-photo", {
                method: "POST",
                body: formData,
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Erro ao enviar foto.");
            }

            setProfileImageUrl(result.profileImageUrl);
            await update();
        } catch (error) {
            alert(error instanceof Error ? error.message : "Erro ao enviar foto.");
        } finally {
            setIsUploadingProfilePhoto(false);
        }
    }

    return (
        <header className="fixed top-0 z-50 w-full bg-[#0088b7]/70 dark:bg-background-dark/80 backdrop-blur-sm">
            <div className="px-4">
                {/* max-w-6xl mx-auto */}
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
                        <div className="flex flex-col items-start">
                        <h2 className="text-lg font-bold tracking-tight text-white">LEC-FACOM</h2>
                        <h5 className="text-xs font-light text-white">Laboratório de Educação Computacional</h5>
                        </div>
                    </div>
                    <nav className="hidden md:flex flex-1 justify-end">
                        <div className="flex items-center gap-8">
                            <ActiveLink href="/">Inicio</ActiveLink>
                            <ActiveLink href="/sobre">Sobre</ActiveLink>
                            <ActiveLink href="/news">Notícias</ActiveLink>
                            <ActiveLink href="/projects">Pesquisas</ActiveLink>
                            <ActiveLink href="/resources">Recursos</ActiveLink>
                            <ActiveLink href="/contact">Contato</ActiveLink>
                            {!session?.user.email ?
                                <div className="flex flex-rol items-center">
                                    <Link href="/SignIn" className="relative z-20">
                                        <Button className="relative z-20 rounded-full bg-[#0088b7] text-white shadow-md hover:bg-[#0077a3] hover:shadow-lg">Login
                                            <User />
                                        </Button>
                                    </Link>
                                </div>

                                :
                                <div className="relative z-20">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button className="max-w-3xs rounded-full bg-[#0088b7] px-3 text-xs text-white shadow-md hover:bg-[#0077a3] hover:shadow-lg">
                                                <img
                                                    src={avatarSrc}
                                                    alt={userName}
                                                    className="h-7 w-7 rounded-full border border-white/70 object-cover"
                                                />
                                                <span className="max-w-28 overflow-hidden text-ellipsis whitespace-nowrap">
                                                    {userName}
                                                </span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem
                                                className="cursor-pointer gap-2"
                                                disabled={isUploadingProfilePhoto}
                                                onSelect={(event) => {
                                                    event.preventDefault();
                                                    fileInputRef.current?.click();
                                                }}
                                            >
                                                {isUploadingProfilePhoto ? (
                                                    <Loader2 className="animate-spin" size={16} />
                                                ) : (
                                                    <Camera size={16} />
                                                )}
                                                {isUploadingProfilePhoto ? "Enviando..." : "Editar foto"}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild className="cursor-pointer gap-2">
                                                <Link href="/dashboard">
                                                    <LayoutDashboard size={16} />
                                                    Dashboard
                                                </Link>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp,image/gif"
                                        className="hidden"
                                        disabled={isUploadingProfilePhoto}
                                        onChange={handleProfilePhotoUpload}
                                    />
                                </div>
                            }
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    )
}
