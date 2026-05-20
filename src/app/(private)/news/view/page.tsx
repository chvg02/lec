"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, Pencil, Trash2 } from "lucide-react";

import { PrivateViewLayout } from "@/components/private/private-view-layout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { NewsDTO } from "@/types/TypesObject";

type NewsItem = NewsDTO & {
  news_date?: string;
  newsDate?: string;
  created_at?: string;
};

function formatNewsDate(item: NewsItem) {
  const dateValue = item.news_date ?? item.newsDate ?? item.created_at;

  if (!dateValue) {
    return "-";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("pt-BR");
}

export default function ViewNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const router = useRouter();

  async function fetchNews() {
    setLoading(true);
    try {
      const response = await fetch("/api/news");
      if (!response.ok) {
        throw new Error(`Erro ${response.status}`);
      }

      const data = await response.json();
      setNews(data);
    } catch (requestError) {
      console.error(requestError);
      setError("Erro ao carregar notícias");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNews();
  }, []);

  async function handleDelete(id: number) {
    const confirmed = window.confirm("Tem certeza que deseja excluir permanentemente?");
    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(id);

      const response = await fetch(`/api/news?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Erro: ${data.error || "Não foi possível excluir."}`);
        return;
      }

      setNews((current) => current.filter((item) => item.id !== id));
    } catch (requestError) {
      console.error("Erro de conexão:", requestError);
      alert("Erro ao tentar excluir.");
    } finally {
      setIsDeleting(null);
    }
  }

  function handleEdit(newsId: number) {
    router.push(`/news/add?id=${newsId}`);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
        <span className="ml-2 text-slate-500">Carregando notícias...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <PrivateViewLayout
      title="Notícias Cadastradas"
      addLabel="Nova Notícia"
      addHref="/news/add"
      icon={FileText}
      iconWrapperClassName="bg-amber-100"
      iconClassName="text-amber-500"
      addButtonClassName="bg-amber-500 hover:bg-amber-600"
    >
      {news.length === 0 ? (
        <p className="text-center text-slate-500">Nenhuma notícia encontrada.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">ID</TableHead>
                <TableHead className="text-center">Título</TableHead>
                <TableHead className="text-center">Descrição</TableHead>
                <TableHead className="text-center">Data</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {news.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-center">{item.id}</TableCell>
                  <TableCell className="text-center">{item.title}</TableCell>
                  <TableCell className="text-center">
                    <div className="line-clamp-3 whitespace-normal break-words text-left leading-6">
                      {item.description}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {formatNewsDate(item)}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(item.id)}
                      >
                        <Pencil className="mr-1 h-4 w-4" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={isDeleting === item.id}
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        {isDeleting === item.id ? "Excluindo..." : "Excluir"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </PrivateViewLayout>
  );
}
