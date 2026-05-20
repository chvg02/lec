"use client"

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, Loader2 } from "lucide-react";
import parse, { DOMNode, Element } from "html-react-parser";

import { Button } from "@/components/ui/button";
import { isSafeInternalUploadUrl, sanitizeRichTextHtml } from "@/lib/security";

type DetailItem = {
  id: number;
  title: string;
  description: string;
  content?: string;
  news_date?: string;
  event_date?: string;
  images?: Array<{
    image_url?: string;
    caption?: string | null;
  }>;
};

function formatLongDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export default function NewsDetailPage() {
  const params = useParams<{ itemId: string }>();
  const router = useRouter();
  const [item, setItem] = useState<DetailItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadItem() {
      try {
        const itemId = params.itemId;

        if (!itemId) {
          setError("Conteúdo não encontrado.");
          return;
        }

        const match = itemId.match(/^(news|event)-(\d+)$/);

        if (!match) {
          setError("Conteúdo inválido.");
          return;
        }

        const [, type, id] = match;
        const endpoint = type === "news" ? `/api/news/${id}` : `/api/events/${id}`;
        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error("Falha ao buscar conteúdo.");
        }

        const data = await response.json();
        setItem(data);
      } catch (requestError) {
        console.error(requestError);
        setError("Não foi possível carregar o conteúdo.");
      } finally {
        setIsLoading(false);
      }
    }

    loadItem();
  }, [params.itemId]);

  const parseOptions = {
    replace(domNode: DOMNode) {
      if (domNode instanceof Element && domNode.name === "img") {
        const { src, alt, width, height } = domNode.attribs;

        if (!isSafeInternalUploadUrl(src)) {
          return <></>;
        }

        return (
          <div className="relative my-6 flex w-full justify-center">
            <Image
              src={src}
              alt={alt || "Imagem do conteúdo"}
              width={Number(width) || 900}
              height={Number(height) || 520}
              className="h-auto max-w-full rounded-2xl object-contain"
            />
          </div>
        );
      }
    },
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#0b73e0]" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center text-slate-600">
        {error || "Conteúdo não encontrado."}
      </div>
    );
  }

  const isNews = params.itemId?.startsWith("news-");
  const typeLabel = isNews ? "Notícia" : "Evento";
  const publishedAt = item.news_date || item.event_date || new Date().toISOString();
  const heroImage = item.images?.[0]?.image_url || "/imgpadrao2.jpg";

  return (
    <section className="min-h-screen bg-[#f7f9fc] px-4 py-10 md:px-8 xl:px-12">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 rounded-[28px] border border-[#dfe8f1] bg-white px-5 py-8 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.28)] md:px-8 xl:px-10">
        <div className="flex items-center justify-between gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            className="h-11 rounded-full px-4 text-slate-700 hover:bg-[#eef4fb]"
          >
            <ArrowLeft className="size-4" />
            Voltar
          </Button>

          <span
            className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] ${
              isNews ? "bg-[#dcecff] text-[#0b73e0]" : "bg-[#dcf5e5] text-[#15803d]"
            }`}
          >
            {typeLabel}
          </span>
        </div>

        <div className="relative aspect-[2.2/1] overflow-hidden rounded-[24px] border border-[#d9e5f0] bg-[#edf3f8]">
          <Image
            src={heroImage}
            alt={item.title}
            fill
            className="object-cover"
            sizes="(max-width: 1280px) 100vw, 1200px"
          />
        </div>

        <div className="max-w-4xl">
          <div className="mb-4 flex items-center gap-3 text-[#326aa5]">
            <CalendarDays className="size-5" />
            <span className="text-sm font-medium">
              {typeLabel} • {formatLongDate(publishedAt)}
            </span>
          </div>

          <h1 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
            {item.title}
          </h1>
          <p className="mt-5 text-xl leading-9 text-[#3d6696]">{item.description}</p>
        </div>

        <div className="prose max-w-none text-slate-700">
          {item.content ? (
            parse(sanitizeRichTextHtml(item.content), parseOptions)
          ) : (
            <p className="text-lg leading-8 text-slate-600">{item.description}</p>
          )}
        </div>
      </div>
    </section>
  );
}
