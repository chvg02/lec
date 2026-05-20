"use client";

import type { ChangeEvent, Dispatch, SetStateAction } from "react";

export interface ImageType {
  url: string;
  caption?: string;
}

interface ImageUploaderProps {
  images: ImageType[];
  setImages: Dispatch<SetStateAction<ImageType[]>>;
}

export default function ImageUploader({ images, setImages }: ImageUploaderProps) {
  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    setImages((prev: ImageType[]) => [
      ...prev,
      { url, caption: "" }
    ]);
  };

  const updateCaption = (i: number, caption: string) => {
    const updated = [...images];
    updated[i].caption = caption;
    setImages(updated);
  };

  return (
    <div className="flex flex-col gap-4">
      <input type="file" onChange={handleFile} />

      {images.map((img: ImageType, i: number) => (
        <div key={i} className="flex flex-col gap-2 border p-2 rounded-md">
          <img src={img.url} alt={img.caption || "Preview da imagem"} className="h-32 object-cover rounded" />
          <input
            className="border p-1 rounded"
            placeholder="Legenda"
            value={img.caption}
            onChange={(e) => updateCaption(i, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}
