"use client";

import { useState } from "react";
import RichTextEditor from "@/components/richText";
import { ImageType } from "@/types/editor";

export default function AddProject() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState(""); // RichText output
  const [images, setImages] = useState<ImageType[]>([]);

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("content", content);

      images.forEach((img) => {
        formData.append("images", img.file);
      });

      const res = await fetch("/api/projects", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Erro ao salvar");

      alert("Projeto salvo!");
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Adicionar Projeto</h1>

      <div className="flex flex-col gap-4">

        <input
          className="border p-2 rounded"
          placeholder="Título do projeto"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="border p-2 rounded"
          placeholder="Descrição curta"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <RichTextEditor
          content={content}
          setContent={setContent}
          images={images}
          setImages={setImages}
        />

        <button
          onClick={handleSave}
          className="bg-blue-600 text-white p-3 rounded mt-4"
        >
          Salvar Projeto
        </button>
      </div>
    </div>
  );
}
