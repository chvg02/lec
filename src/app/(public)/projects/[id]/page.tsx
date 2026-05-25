"use client"

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { MoveLeft, Loader2 } from 'lucide-react';
import parse, { DOMNode, Element } from 'html-react-parser';
import { isSafeInternalUploadUrl, sanitizeRichTextHtml } from '@/lib/security';

type ProjectDetail = {
    title?: string;
    description?: string;
    content?: string;
    images?: Array<{
        image_url?: string;
    }>;
};

export default function ProjectPage() {
    const params = useParams();
    const [project, setProject] = useState<ProjectDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Criamos as opções para substituir tags específicas
    const parseOptions = {
        replace(domNode: DOMNode) {
            // Verifica se o nó é uma tag de imagem
            if (domNode instanceof Element && domNode.name === 'img') {
                const { src, alt, width, height } = domNode.attribs;

                if (!isSafeInternalUploadUrl(src)) {
                    return <></>;
                }

                return (
                    <div className="relative w-full my-6 flex justify-center">
                        {/* Substituímos pelo componente otimizado do Next */}
                        <Image
                            src={src}
                            alt={alt || 'Imagem do conteúdo'}
                            width={Number(width) || 800} // Valor padrão caso o HTML não tenha width
                            height={Number(height) || 450} // Valor padrão caso o HTML não tenha height
                            className="rounded-xl object-contain max-w-full h-auto"
                        />
                    </div>
                );
            }
        }
    };


    useEffect(() => {
        // params.id aqui é uma string, ex: "5"
        if (params.id) {
            fetch(`/api/project/${params.id}`)
                .then(res => res.json())
                .then(data => {
                    setProject(data);
                    setLoading(false);
                });
        }
    }, [params.id]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" size={40} />
            </div>
        );
    }

    if (!project) {
        return <div className="text-center py-20">Projeto não encontrado.</div>;
    }

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center gap-8 px-4 py-8 sm:px-6">
            <div className="w-full flex flex-col items-start gap-4 ">
                {/* Acessando a primeira imagem do array que vem do Prisma */}
                <div className="relative h-72 w-full overflow-hidden rounded-3xl shadow-lg sm:h-96">
                    <Image
                        src={project.images?.[0]?.image_url || '/imgpadrao2.jpg'}
                        fill
                        alt={project.title || ""}
                        className='rounded-3xl object-cover'
                    />

                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                    <h1 className="absolute inset-x-0 bottom-0 p-5 text-center text-2xl font-black tracking-tight text-white sm:p-6 sm:text-4xl">{project.title}</h1>
                </div>
                <h5 className="text-base text-slate-500 sm:text-lg">{project.description}</h5>

                <div className="prose max-w-none overflow-hidden text-slate-700">

                            {project.content && (
                        <div className="prose prose-base sm:prose-lg mt-8 w-full max-w-none text-slate-700">
                            {parse(sanitizeRichTextHtml(project.content), parseOptions)}
                        </div>
                    )}

                </div>

                <div className='mt-8 flex w-full justify-end'>
                    <Button onClick={() => router.back()} className="w-full bg-blue-600 px-6 font-bold hover:bg-blue-700 sm:w-auto">
                        <MoveLeft size={20} className="mr-2" />
                        Voltar
                    </Button>
                </div>
            </div>
        </div>
    );
}
