"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import { ImageType } from "@/types/editor";

type RichTextEditorProps = {
  content: string;
  setContent: (value: string) => void;
  images: ImageType[];
  setImages: React.Dispatch<React.SetStateAction<ImageType[]>>;
};

export default function RichTextEditor({
  content,
  setContent,
  setImages,
}: RichTextEditorProps) {

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content,
    onUpdate({ editor }) {
      setContent(editor.getHTML());
    },
    immediatelyRender: false, // 👈 OBRIGATÓRIO NO NEXT.JS!
  });

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: ImageType[] = [];

    Array.from(files).forEach((file) => {
      const preview = URL.createObjectURL(file);
      newImages.push({ file, preview });

      editor?.chain().focus().setImage({ src: preview }).run();
    });

    setImages((prev) => [...prev, ...newImages]);
  };

  if (!editor) {
    return <div className="p-4 text-gray-500">Carregando editor...</div>;
  }

  return (
    <div className="w-full border rounded-lg p-4 bg-white shadow">
      
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className="btn">B</button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className="btn">I</button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()} className="btn">U</button>

        <button onClick={() => editor.chain().focus().setTextAlign("left").run()} className="btn">⫷</button>
        <button onClick={() => editor.chain().focus().setTextAlign("center").run()} className="btn">≡</button>
        <button onClick={() => editor.chain().focus().setTextAlign("right").run()} className="btn">⫸</button>

        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="btn">H2</button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className="btn">• Lista</button>

        <button onClick={() => editor.chain().focus().undo().run()} className="btn">↺</button>
        <button onClick={() => editor.chain().focus().redo().run()} className="btn">↻</button>

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleUpload}
          className="ml-4"
        />
      </div>

      <EditorContent
        editor={editor}
        className="min-h-[400px] border rounded-lg p-4 prose max-w-none"
      />
    </div>
  );
}
