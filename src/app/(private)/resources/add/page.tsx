"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, FileUp, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { upload } from "@vercel/blob/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MAX_RESOURCE_UPLOAD_SIZE_BYTES } from "@/lib/security";
import { ResourceDTO } from "@/types/TypesObject";

const materialTypeOptions = [
  { value: "article", label: "Artigo" },
  { value: "didactic_material", label: "Videoaulas e Materiais" },
  { value: "software", label: "Software" },
] as const;

type MaterialType = (typeof materialTypeOptions)[number]["value"];

const MULTIPART_UPLOAD_THRESHOLD_BYTES = 4 * 1024 * 1024;

function getFileName(fileUrl: string) {
  return decodeURIComponent(fileUrl.split("/").pop() || "recurso");
}

function formatFileSize(bytes: number) {
  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / 1024 ** unitIndex;

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function sanitizeClientFileName(fileName: string) {
  return fileName
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 120);
}

export default function AddResourcePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEditing = Boolean(editId);
  const { data: session } = useSession();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [materialType, setMaterialType] = useState<MaterialType>("didactic_material");
  const [fileUrl, setFileUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editId) {
      return;
    }

    async function fetchMaterial() {
      try {
        const response = await fetch(`/api/materials?id=${editId}`);
        const data: ResourceDTO = await response.json();

        if (!response.ok) {
          setError(data as unknown as string);
          return;
        }

        setTitle(data.title || "");
        setDescription(data.description || "");
        setFileUrl(data.file_url || "");
        setMaterialType(data.material_type || "didactic_material");
      } catch (requestError) {
        console.error(requestError);
        setError("Não foi possível carregar o recurso para edição.");
      }
    }

    fetchMaterial();
  }, [editId]);

  const selectedTypeLabel = useMemo(
    () =>
      materialTypeOptions.find((option) => option.value === materialType)?.label ??
      "Recurso",
    [materialType]
  );

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError("");

    if (file.size > MAX_RESOURCE_UPLOAD_SIZE_BYTES) {
      setUploading(false);
      setError(
        `O arquivo excede o limite de ${formatFileSize(MAX_RESOURCE_UPLOAD_SIZE_BYTES)}.`
      );
      return;
    }

    try {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const safeOriginalName = sanitizeClientFileName(file.name) || "recurso";
      const blob = await upload(`resources/${uniqueSuffix}-${safeOriginalName}`, file, {
        access: "public",
        handleUploadUrl: "/api/upload/client",
        contentType: file.type,
        multipart: file.size > MULTIPART_UPLOAD_THRESHOLD_BYTES,
        onUploadProgress: ({ percentage }) => {
          setUploadProgress(Math.max(1, Math.round(percentage)));
        },
      });

      if (!blob?.url) {
        setError("O Blob nao retornou a URL do arquivo.");
        return;
      }

      setUploadProgress(100);
      setFileUrl(blob.url);
    } catch (uploadError) {
      console.error(uploadError);
      setError("Erro de rede ao enviar o arquivo.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (!title || !description || !fileUrl || !session?.user.id) {
      setLoading(false);
      setError("Título, descrição e arquivo são obrigatórios.");
      return;
    }

    try {
      const response = await fetch("/api/materials", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(isEditing && { id: Number(editId) }),
          title,
          description,
          file_url: fileUrl,
          material_type: materialType,
          user_id: session.user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao salvar o recurso.");
        return;
      }

      router.push("/resources/view");
      router.refresh();
    } catch (requestError) {
      console.error(requestError);
      setError("Erro de rede ao salvar o recurso.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">
          {isEditing ? "Editar Recurso" : "Adicionar Recurso"}
        </h1>
        <p className="mt-2 text-slate-500">
          Cadastre softwares, series de videoaulas, arquivos e outros materiais
          produzidos pelo laboratório.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Nome do recurso"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Descreva o recurso e como ele pode ser utilizado"
            className="min-h-32 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition-all duration-200 ease-out hover:border-slate-300 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="materialType">Tipo do recurso</Label>
          <select
            id="materialType"
            value={materialType}
            onChange={(event) => setMaterialType(event.target.value as MaterialType)}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition-all duration-200 ease-out hover:border-slate-300 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
          >
            {materialTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Arquivo para download</Label>
            <p className="text-sm text-slate-500">
              Tipo selecionado: {selectedTypeLabel}
            </p>
          </div>

          {!fileUrl ? (
            <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition-all duration-200 hover:border-blue-300 hover:bg-blue-50/50">
              {uploading ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                  <span className="text-sm font-medium text-slate-600">
                    Enviando arquivo... {uploadProgress}%
                  </span>
                </>
              ) : (
                <>
                  <FileUp className="h-8 w-8 text-blue-500" />
                  <span className="font-semibold text-slate-700">
                    Clique para selecionar o arquivo do recurso
                  </span>
                  <span className="text-sm text-slate-500">
                    PDFs, ZIPs, videos e documentos ate{" "}
                    {formatFileSize(MAX_RESOURCE_UPLOAD_SIZE_BYTES)}
                  </span>
                </>
              )}
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Arquivo pronto para download
                  </p>
                  <p className="mt-1 break-all text-sm text-slate-500">
                    {getFileName(fileUrl)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline">
                    <a href={fileUrl} download>
                      <Download className="h-4 w-4" />
                      Baixar arquivo
                    </a>
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setFileUrl("")}
                  >
                    Trocar arquivo
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}

        <div className="flex flex-wrap justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/resources/view")}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-blue-500 text-white hover:bg-blue-600"
            disabled={loading || uploading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : isEditing ? (
              "Salvar alterações"
            ) : (
              "Cadastrar recurso"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
