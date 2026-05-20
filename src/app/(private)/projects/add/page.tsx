"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { Editor } from "@tiptap/react";
import { useSession } from "next-auth/react";

import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { normalizeSearchText } from "@/lib/search";
import { ImageType } from "@/types/editor";

type ProjectTag = {
  name: string;
};

type ProjectImage = {
  image_url?: string;
  preview?: string;
};

type ProjectResponse = {
  id: number;
  title: string;
  description: string;
  content: string;
  status: "inProgress" | "done";
  tags?: ProjectTag[];
  images?: ProjectImage[];
};

type ProjectListResponse = {
  tags?: ProjectTag[];
};

function normalizeTagValue(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export default function AddProject() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEditing = Boolean(editId);

  const { data: session } = useSession();
  const user_id = session?.user.id;

  const [coverImage, setCoverImage] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"inProgress" | "done">("inProgress");
  const [content, setContent] = useState("");
  const [images] = useState<ImageType[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [existingTags, setExistingTags] = useState<string[]>([]);
  const [tagText, setTagText] = useState("");
  const [error, setError] = useState("");
  const [editor, setEditor] = useState<Editor | null>(null);

  useEffect(() => {
    const fetchExistingTags = async () => {
      try {
        const response = await fetch("/api/project");
        const projects: ProjectListResponse[] = await response.json();

        const uniqueTags = Array.from(
          new Set(
            projects.flatMap((project) =>
              (project.tags ?? []).map((tag) => normalizeTagValue(tag.name))
            )
          )
        )
          .filter(Boolean)
          .sort((first, second) => first.localeCompare(second));

        setExistingTags(uniqueTags);
      } catch (fetchError) {
        console.error("Erro ao carregar tags existentes", fetchError);
      }
    };

    fetchExistingTags();
  }, []);

  useEffect(() => {
    if (!editId) {
      return;
    }

    const fetchProjectData = async () => {
      try {
        const response = await fetch(`/api/project?id=${editId}`);
        const projectData: ProjectResponse | null = await response.json();

        if (!projectData) {
          setError("Projeto não encontrado para edição.");
          return;
        }

        setTitle(projectData.title || "");
        setDescription(projectData.description || "");
        setContent(projectData.content || "");
        setStatus(projectData.status || "inProgress");
        setTags((projectData.tags ?? []).map((tag) => tag.name));

        if (projectData.images && projectData.images.length > 0) {
          setCoverImage(
            projectData.images[0].image_url || projectData.images[0].preview || ""
          );
        }
      } catch (fetchError) {
        console.error("Erro ao carregar projeto para edição", fetchError);
        setError("Não foi possível carregar os dados do projeto.");
      }
    };

    fetchProjectData();
  }, [editId]);

  useEffect(() => {
    if (editor && content && isEditing) {
      editor.commands.setContent(content);
    }
  }, [editor, content, isEditing]);

  const handleAddTag = (rawValue?: string) => {
    const nextTag = normalizeTagValue(rawValue ?? tagText);

    if (!nextTag) {
      return;
    }

    const alreadyExists = tags.some(
      (currentTag) => currentTag.toLowerCase() === nextTag.toLowerCase()
    );

    if (alreadyExists) {
      setTagText("");
      return;
    }

    setTags((currentTags) => [...currentTags, nextTag]);
    setTagText("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((currentTags) =>
      currentTags.filter((currentTag) => currentTag !== tagToRemove)
    );
  };

  const handleTagKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      handleAddTag();
    }

    if (event.key === "Backspace" && !tagText && tags.length > 0) {
      event.preventDefault();
      handleRemoveTag(tags[tags.length - 1]);
    }
  };

  const filteredTagSuggestions = useMemo(() => {
    const normalizedInput = normalizeSearchText(tagText);

    return existingTags
      .filter((existingTag) => {
        const alreadySelected = tags.some(
          (currentTag) =>
            normalizeSearchText(currentTag) === normalizeSearchText(existingTag)
        );

        if (alreadySelected) {
          return false;
        }

        if (!normalizedInput) {
          return true;
        }

        return normalizeSearchText(existingTag).includes(normalizedInput);
      })
      .slice(0, 8);
  }, [existingTags, tagText, tags]);

  const handleCoverUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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
    } catch (uploadError) {
      console.error(uploadError);
      setError("Erro ao se conectar com servidor de upload");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!title || !coverImage) {
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
      user_id,
      status,
      tags,
      images: formattedImages,
    };

    try {
      const response = await fetch("/api/project", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/projects");
        router.refresh();
      } else {
        setError(data.error || "Erro ao salvar no banco.");
      }
    } catch (saveError) {
      console.error("Erro na conexao:", saveError);
      setError("Erro de rede ao tentar salvar.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl p-8">
      <h1 className="mb-6 text-3xl font-bold">
        {isEditing ? "Editar Projeto" : "Adicionar Projeto"}
      </h1>

      <div className="flex w-full flex-col gap-4">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <input
            className="w-full rounded border border-gray-300 p-2"
            placeholder="Título do projeto"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />

          <div className="my-2 flex flex-col gap-2">
            <label className="font-medium text-gray-700">Imagem de Capa</label>

            {coverImage ? (
              <div className="group relative h-64 w-full overflow-hidden rounded-lg border">
                <img
                  src={coverImage}
                  alt="Capa"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setCoverImage("")}
                  className="absolute right-4 top-4 rounded bg-red-600 px-3 py-1 text-white shadow opacity-0 transition-opacity group-hover:opacity-100"
                >
                  Remover Capa
                </button>
              </div>
            ) : (
              <label className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 transition-colors hover:bg-gray-50">
                {isUploading ? (
                  <span className="font-medium text-gray-500">
                    Enviando imagem...
                  </span>
                ) : (
                  <>
                    <span className="font-medium text-gray-600">
                      Clique para selecionar a imagem de capa
                    </span>
                    <span className="mt-1 text-sm text-gray-400">
                      PNG, JPG ou WEBP
                    </span>
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
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="status"
                value="inProgress"
                checked={status === "inProgress"}
                onChange={(event) =>
                  setStatus(event.target.value as "inProgress" | "done")
                }
              />
              Em Andamento
            </label>

            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="status"
                value="done"
                checked={status === "done"}
                onChange={(event) =>
                  setStatus(event.target.value as "inProgress" | "done")
                }
              />
              Concluidas
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700">Tags</label>
            <div className="relative">
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded border border-gray-300 p-2"
                  placeholder="Digite a tag e pressione Enter"
                  value={tagText}
                  onChange={(event) => setTagText(event.target.value)}
                  onKeyDown={handleTagKeyDown}
                />
                <button
                  type="button"
                  className="rounded bg-blue-600 px-4 py-2 text-white"
                  onClick={() => handleAddTag()}
                >
                  Adicionar
                </button>
              </div>

              {filteredTagSuggestions.length > 0 && (
                <div className="absolute z-10 mt-2 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                  <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Sugestões existentes
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {filteredTagSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => handleAddTag(suggestion)}
                        className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 transition hover:bg-blue-100 hover:text-blue-700"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <p className="text-sm text-slate-500">
              As tags são normalizadas, não duplicam e mostram sugestões das já
              cadastradas enquanto você digita.
            </p>
            {existingTags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {existingTags
                  .filter(
                    (existingTag) =>
                      !tags.some(
                        (currentTag) =>
                          normalizeSearchText(currentTag) ===
                          normalizeSearchText(existingTag)
                      )
                  )
                  .slice(0, 12)
                  .map((existingTag) => (
                    <button
                      key={existingTag}
                      type="button"
                      onClick={() => handleAddTag(existingTag)}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
                    >
                      {existingTag}
                    </button>
                  ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-blue-500 hover:text-blue-700"
                  aria-label={`Remover tag ${tag}`}
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="mt-4 rounded bg-blue-600 p-3 text-white"
          >
            Salvar Projeto
          </button>
        </form>
      </div>
    </div>
  );
}
