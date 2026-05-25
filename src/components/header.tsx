'use client'

import { ActiveLink } from "@/components/activeLink";
import {
    Camera,
    LayoutDashboard,
    Loader2,
    LogOut,
    Menu,
    X,
    User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { signOut, useSession } from "next-auth/react";
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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        setProfileImageUrl(session?.user.profileImageUrl ?? session?.user.image ?? null);
    }, [session?.user.image, session?.user.profileImageUrl]);

    const userName = session?.user?.name ?? "Usuário";
    const avatarSrc = profileImageUrl || `https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(userName)}`;
    const navigationLinks = [
        { href: "/", label: "Inicio" },
        { href: "/sobre", label: "Sobre" },
        { href: "/news", label: "Notícias" },
        { href: "/projects", label: "Pesquisas" },
        { href: "/resources", label: "Recursos" },
        { href: "/contact", label: "Contato" },
    ];

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
            <div className="mx-auto max-w-7xl px-3 sm:px-4">
                {/* max-w-6xl mx-auto */}
                <div className="flex items-center justify-between h-16">
                    <div className="flex min-w-0 items-center gap-3 text-slate-900 dark:text-slate-50 sm:gap-4">
                        <div className="flex size-12 shrink-0 items-center text-primary sm:size-14">
                            <Link href="/">
                                <Image src="/LEC.png"
                                    alt="Logo LEC"
                                    width={80}
                                    height={100} />
                            </Link>
                        </div>
                        <div className="flex min-w-0 flex-col items-start">
                            <h2 className="text-base font-bold tracking-tight text-white sm:text-lg">LEC-FACOM</h2>
                            <h5 className="max-w-[12rem] truncate text-[11px] font-light text-white sm:max-w-none sm:text-xs">Laboratório de Educação em Computação</h5>
                        </div>
                    </div>
                    <nav className="hidden flex-1 justify-end lg:flex">
                        <div className="flex items-center gap-5 xl:gap-8">
                            {navigationLinks.map((link) => (
                                <ActiveLink key={link.href} href={link.href}>
                                    {link.label}
                                </ActiveLink>
                            ))}
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
                                                <Image
                                                    src={avatarSrc}
                                                    alt={userName}
                                                    width={28}
                                                    height={28}
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
                                            <DropdownMenuItem
                                                className="cursor-pointer gap-2 text-red-600 focus:bg-red-50 focus:text-red-700"
                                                onClick={() => signOut({ callbackUrl: "/" })}
                                            >
                                                <LogOut size={16} />
                                                Logout
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
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
                        aria-expanded={isMobileMenuOpen}
                        aria-controls="mobile-navigation"
                        className="text-white hover:bg-white/15 hover:text-white lg:hidden"
                        onClick={() => setIsMobileMenuOpen((current) => !current)}
                    >
                        {isMobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                    </Button>
                </div>
            </div>
            {isMobileMenuOpen && (
                <div
                    id="mobile-navigation"
                    className="border-t border-white/15 bg-[#0088b7]/95 px-4 py-4 shadow-xl backdrop-blur-md lg:hidden"
                >
                    <nav className="mx-auto flex max-w-7xl flex-col gap-2">
                        {navigationLinks.map((link) => (
                            <ActiveLink
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="rounded-lg px-3 py-2 text-base text-white hover:bg-white/15 hover:text-white"
                            >
                                {link.label}
                            </ActiveLink>
                        ))}

                        <div className="mt-3 border-t border-white/15 pt-3">
                            {!session?.user.email ? (
                                <Button asChild className="w-full rounded-full bg-white text-[#0088b7] hover:bg-slate-100">
                                    <Link href="/SignIn" onClick={() => setIsMobileMenuOpen(false)}>
                                        Login
                                        <User className="size-4" />
                                    </Link>
                                </Button>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <div className="flex min-w-0 items-center gap-3 rounded-xl bg-white/10 p-3 text-white">
                                        <Image
                                            src={avatarSrc}
                                            alt={userName}
                                            width={40}
                                            height={40}
                                            className="h-10 w-10 shrink-0 rounded-full border border-white/70 object-cover"
                                        />
                                        <span className="min-w-0 truncate text-sm font-semibold">{userName}</span>
                                    </div>
                                    <Button asChild className="w-full rounded-full bg-white text-[#0088b7] hover:bg-slate-100">
                                        <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                                            <LayoutDashboard className="size-4" />
                                            Dashboard
                                        </Link>
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        className="w-full rounded-full bg-white/15 text-white hover:bg-white/25"
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            signOut({ callbackUrl: "/" });
                                        }}
                                    >
                                        <LogOut className="size-4" />
                                        Logout
                                    </Button>
                                </div>
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    )
}
