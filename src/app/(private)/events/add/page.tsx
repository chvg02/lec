"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Editor } from "@tiptap/react";

import { Calendar } from "@/components/ui/calendar";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";

export default function AddEventPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEditing = Boolean(editId);
  const { data: session } = useSession();

  const [coverImage, setCoverImage] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [eventDate, setEventDate] = useState<Date | undefined>(new Date());
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [editor, setEditor] = useState<Editor | null>(null);

  useEffect(() => {
    if (!editId) {
      return;
    }

    async function fetchEventData() {
      try {
        const response = await fetch(`/api/events?id=${editId}`);
        const data = await response.json();
        const eventData = Array.isArray(data)
          ? data.find((item) => item.id === Number(editId))
          : data;

        if (eventData) {
          setTitle(eventData.title || "");
          setDescription(eventData.description || "");
          setContent(eventData.content || "");
          setEventDate(
            eventData.event_date ? new Date(eventData.event_date) : new Date()
          );

          if (eventData.images && eventData.images.length > 0) {
            setCoverImage(eventData.images[0].image_url || "");
          }
        }
      } catch (requestError) {
        console.error("Erro ao carregar evento para edição", requestError);
        setError("Não foi possível carregar o evento.");
      }
    }

    fetchEventData();
  }, [editId]);

  useEffect(() => {
    if (editor && content && isEditing) {
      editor.commands.setContent(content);
    }
  }, [content, editor, isEditing]);

  async function handleCoverUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao fazer upload da capa.");
        return;
      }

      setCoverImage(data.imageUrl);
    } catch (uploadError) {
      console.error(uploadError);
      setError("Erro ao enviar a imagem.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (!title || !description || !coverImage || !eventDate || !session?.user.id) {
      setError("Título, descrição, data e imagem de capa são obrigatórios.");
      return;
    }

    setIsSaving(true);
    const htmlContent = editor ? editor.getHTML() : content;

    const bodyData = {
      ...(isEditing && { id: Number(editId) }),
      title,
      description,
      content: htmlContent,
      user_id: session.user.id,
      event_date: eventDate,
      images: [{ image_url: coverImage }],
    };

    try {
      const response = await fetch("/api/events", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao salvar evento.");
        return;
      }

      router.push("/events/view");
      router.refresh();
    } catch (requestError) {
      console.error("Erro na conexao:", requestError);
      setError("Erro de rede ao tentar salvar.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl p-8">
      <h1 className="mb-6 text-3xl font-bold">
        {isEditing ? "Editar Evento" : "Adicionar Evento"}
      </h1>

      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <input
          className="w-full rounded border border-gray-300 p-2"
          placeholder="Título do evento"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />

        <div className="my-2 flex flex-col gap-2">
          <label className="font-medium text-gray-700">Imagem de Capa</label>

          {coverImage ? (
            <div className="group relative h-64 w-full overflow-hidden rounded-lg border">
              <Image
                src={coverImage}
                alt="Capa do evento"
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
          className="min-h-36 w-full rounded border border-gray-300 p-2"
          placeholder="Descrição do evento"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />

        <div className="w-full rounded-lg border border-gray-300">
          <SimpleEditor onEditorReady={setEditor} />
        </div>

        <div className="flex gap-4">
          <Calendar
            mode="single"
            selected={eventDate}
            onSelect={setEventDate}
            className="rounded-md border"
          />
        </div>

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isSaving}
          className="mt-4 rounded bg-blue-600 p-3 text-white disabled:opacity-60"
        >
          {isSaving
            ? "Salvando..."
            : isEditing
            ? "Salvar Alterações"
            : "Salvar Evento"}
        </button>
      </form>
    </div>
  );
}
