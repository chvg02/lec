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
        <div className="flex flex-col bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300">
            
            {/* 1. Área da Imagem de Capa (Colada nas bordas) */}
            <div className="w-full h-48 relative shrink-0 bg-slate-200">
                {image ? (
                    <Image 
                        src={image}
                        alt={title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                    />
                ) : (
                    // Placeholder cinza para manter o layout se não houver foto
                    <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                        <span className="text-sm font-medium">Sem imagem de capa</span>
                    </div>
                )}
            </div>

            {/* 2. Área do Texto e Botões */}
            <div className="p-6 flex flex-col flex-1">
                {/* line-clamp-2 garante que o título tenha no máximo 2 linhas */}
                <h1 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">
                    {title}
                </h1>
                
                {/* line-clamp-3 garante a descrição com tamanho uniforme */}
                <h5 className="text-sm font-medium text-slate-500 mb-6 flex-1 line-clamp-3">
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
