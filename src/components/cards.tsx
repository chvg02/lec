import Image from "next/image";
import Link from "next/link";
import { MoveRight } from "lucide-react";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";

export type CardProps = {
    id: number;
    image?: string | null;
    title: string;
    description: string;
    type: 'project' | 'news' | 'resource';
    status?: 'inProgress' | 'done';
    href?: string;
    actionLabel?: string;
}

export function Cards({ id, image, title, description, type, href, actionLabel = "Saiba Mais" }: CardProps) {
    const defaultHref =
        type === 'project' ? `/projects/${id}` :
        type === 'news' ? `/news/${id}` :
        href || "#";

    return (
        <div className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
            
            {/* 1. Área da Imagem de Capa (Colada nas bordas) */}
            <div className="relative h-44 w-full shrink-0 bg-slate-200 sm:h-48">
                {image ? (
                    <Image 
                        src={image}
                        alt={title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                    />
                ) : (
                    // Placeholder cinza para manter o layout se não houver foto
                    <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                        <span className="text-sm font-medium">Sem imagem de capa</span>
                    </div>
                )}
            </div>

            {/* 2. Área do Texto e Botões */}
            <div className="flex flex-1 flex-col p-5 sm:p-6">
                {/* line-clamp-2 garante que o título tenha no máximo 2 linhas */}
                <h1 className="mb-2 line-clamp-2 text-lg font-bold text-slate-900 sm:text-xl">
                    {title}
                </h1>
                
                {/* line-clamp-3 garante a descrição com tamanho uniforme */}
                <h5 className="mb-6 line-clamp-3 flex-1 text-sm font-medium text-slate-500">
                    {description}
                </h5>

                {/* 3. Link Saiba Mais Centralizado */}
                <div className="mt-auto w-full flex items-center justify-center">
                    <Link
                        href={href || defaultHref}
                        className={cn(
                            buttonVariants({ variant: "link" }),
                            "flex flex-row gap-2 text-blue-500 hover:text-blue-700"
                        )}
                    >
                        {actionLabel}
                        <MoveRight size={20} />
                    </Link>
                </div>
            </div>

        </div>
    );
}
