"use client";

import { useState } from "react";
import RichTextEditor from "@/components/richText";
import { ImageType } from "@/types/editor";

export default function AddProject() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState(""); 
  const [images, setImages] = useState<ImageType[]>([]);

  const [cover, setCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("draft");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCover(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("content", content);
      formData.append("category", category);
      formData.append("status", status);
      formData.append("startDate", startDate);
      formData.append("endDate", endDate);

      if (cover) formData.append("cover", cover);

      images.forEach((img) => formData.append("images", img.file));

      const res = await fetch("/api/projects", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Erro ao salvar");

      alert("Projeto salvo!");
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">

      <h1 className="text-4xl font-bold">Adicionar Projeto</h1>

      {/* TÍTULO */}
      <div>
        <label className="font-semibold">Título</label>
        <input
          className="border p-2 rounded w-full mt-1"
          placeholder="Título do projeto"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* DESCRIÇÃO */}
      <div>
        <label className="font-semibold">Descrição curta</label>
        <textarea
          className="border p-2 rounded w-full mt-1"
          placeholder="Resumo do projeto"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* CATEGORIA */}
      <div>
        <label className="font-semibold">Categoria</label>
        <select
          className="border p-2 rounded w-full mt-1"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Selecione...</option>
          <option value="pesquisa">Pesquisa</option>
          <option value="extensao">Extensão</option>
          <option value="desenvolvimento">Desenvolvimento</option>
          <option value="evento">Evento</option>
        </select>
      </div>

      {/* STATUS */}
      <div>
        <label className="font-semibold block">Status</label>
        <div className="flex gap-4 mt-1">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="draft"
              checked={status === "draft"}
              onChange={() => setStatus("draft")}
            />
            Rascunho
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="published"
              checked={status === "published"}
              onChange={() => setStatus("published")}
            />
            Publicado
          </label>
        </div>
      </div>

      {/* DATAS */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="font-semibold">Data de início</label>
          <input
            type="date"
            className="border p-2 rounded w-full mt-1"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div>
          <label className="font-semibold">Data de término</label>
          <input
            type="date"
            className="border p-2 rounded w-full mt-1"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* CAPA */}
      <div>
        <label className="font-semibold">Imagem de Capa</label>
        <input
          type="file"
          accept="image/*"
          className="border p-2 rounded w-full mt-1"
          onChange={handleCoverUpload}
        />

        {coverPreview && (
          <img
            src={coverPreview}
            className="mt-4 w-full h-64 object-cover rounded shadow"
            alt="Preview"
          />
        )}
      </div>

      {/* EDITOR */}
      <div>
        <label className="font-semibold block mb-2">Conteúdo Completo</label>
        <RichTextEditor
          content={content}
          setContent={setContent}
          images={images}
          setImages={setImages}
        />
      </div>

      {/* BOTÃO */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="bg-blue-600 text-white p-3 rounded mt-4 w-full disabled:opacity-50"
      >
        {isSaving ? "Salvando..." : "Salvar Projeto"}
      </button>

    </div>
  );
}
