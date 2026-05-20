"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Editor } from "@tiptap/react";

import { ImageType } from "@/types/editor";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { Calendar } from "@/components/ui/calendar";

export default function AddNewsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEditing = Boolean(editId);
  const { data: session } = useSession();

  const [coverImage, setCoverImage] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [newsDate, setNewsDate] = useState<Date | undefined>(new Date());
  const [content, setContent] = useState("");
  const [images] = useState<ImageType[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [editor, setEditor] = useState<Editor | null>(null);

  useEffect(() => {
    if (!editId) {
      return;
    }

    async function fetchNewsData() {
      try {
        const response = await fetch(`/api/news?id=${editId}`);
        const data = await response.json();
        const newsData = Array.isArray(data)
          ? data.find((item) => item.id === Number(editId))
          : data;

        if (newsData) {
          setTitle(newsData.title || "");
          setDescription(newsData.description || "");
          setContent(newsData.content || "");
          setNewsDate(newsData.news_date ? new Date(newsData.news_date) : new Date());

          if (newsData.images && newsData.images.length > 0) {
            setCoverImage(newsData.images[0].image_url || newsData.images[0].preview || "");
          }
        }
      } catch (requestError) {
        console.error("Erro ao carregar notícia para edição", requestError);
        setError("Não foi possível carregar a notícia.");
      }
    }

    fetchNewsData();
  }, [editId]);

  useEffect(() => {
    if (editor && content && isEditing) {
      editor.commands.setContent(content);
    }
  }, [editor, content, isEditing]);

  async function handleCoverUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setCoverImage(data.imageUrl);
      } else {
        setError("Erro ao fazer upload da capa");
      }
    } catch (requestError) {
      console.error(requestError);
      setError("Erro ao se conectar com servidor de upload");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (!title || !coverImage || !session?.user.id) {
      setError("Título e imagem de capa são obrigatórios.");
      return;
    }

    const htmlContent = editor ? editor.getHTML() : content;
    const formattedImages = [{ image_url: coverImage }, ...images];

    const bodyData = {
      ...(isEditing && { id: Number(editId) }),
      title,
      description,
      content: htmlContent,
      user_id: session.user.id,
      news_date: newsDate,
      images: formattedImages,
    };

    try {
      const response = await fetch("/api/news", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/news/view");
        router.refresh();
      } else {
        setError(data.error || "Erro ao salvar no banco.");
      }
    } catch (requestError) {
      console.error("Erro na conexão:", requestError);
      setError("Erro de rede ao tentar salvar.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl p-8">
      <h1 className="mb-6 text-3xl font-bold">
        {isEditing ? "Editar Notícia" : "Adicionar Notícia"}
      </h1>

      <div className="flex w-full flex-col gap-4">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <input
            className="w-full rounded border border-gray-300 p-2"
            placeholder="Título da notícia"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />

          <div className="my-2 flex flex-col gap-2">
            <label className="font-medium text-gray-700">Imagem de Capa</label>

            {coverImage ? (
              <div className="group relative h-64 w-full overflow-hidden rounded-lg border">
                <Image
                  src={coverImage}
                  alt="Capa"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1280px) 100vw, 1200px"
                />
                <button
                  type="button"
                  onClick={() => setCoverImage("")}
                  className="absolute top-4 right-4 rounded bg-red-600 px-3 py-1 text-white opacity-0 shadow transition-opacity group-hover:opacity-100"
                >
                  Remover Capa
                </button>
              </div>
            ) : (
              <label className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 transition-colors hover:bg-gray-50">
                {isUploading ? (
                  <span className="font-medium text-gray-500">Enviando imagem...</span>
                ) : (
                  <>
                    <span className="font-medium text-gray-600">
                      Clique para selecionar a imagem de capa
                    </span>
                    <span className="mt-1 text-sm text-gray-400">PNG, JPG ou WEBP</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverUpload}
                  disabled={isUploading}
                />
              </label>
            )}
          </div>

          <textarea
            className="w-full rounded border border-gray-300 p-2"
            placeholder="Descrição curta"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />

          <div className="w-full rounded-lg border border-gray-300">
            <SimpleEditor onEditorReady={setEditor} />
          </div>

          <div className="flex gap-4">
            <Calendar
              mode="single"
              selected={newsDate}
              onSelect={setNewsDate}
              className="rounded-md border"
            />
          </div>

          <button type="submit" className="mt-4 rounded bg-blue-600 p-3 text-white">
            Salvar Notícia
          </button>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
        </form>
      </div>
    </div>
  );
}
