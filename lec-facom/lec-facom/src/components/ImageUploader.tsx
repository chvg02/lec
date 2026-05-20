"use client";

export interface ImageType {
  url: string;
  caption?: string;
}

export default function ImageUploader({ images, setImages }: any) {
  const handleFile = async (e: any) => {
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
          <img src={img.url} className="h-32 object-cover rounded" />
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
