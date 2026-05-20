"use client";

import { useEffect, useState } from "react";
import { Download, FolderArchive, Loader2, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { PrivateViewLayout } from "@/components/private/private-view-layout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResourceDTO } from "@/types/TypesObject";

const materialTypeLabels: Record<ResourceDTO["material_type"], string> = {
  article: "Artigo",
  didactic_material: "Videoaulas e Materiais",
  software: "Software",
};

function getFileName(fileUrl: string) {
  return decodeURIComponent(fileUrl.split("/").pop() || "recurso");
}

export default function ViewResourcesPage() {
  const router = useRouter();
  const [resources, setResources] = useState<ResourceDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  async function fetchResources() {
    setLoading(true);
    try {
      const response = await fetch("/api/materials");
      if (!response.ok) {
        throw new Error(`Erro ${response.status}`);
      }

      const data = await response.json();
      setResources(data);
    } catch (requestError) {
      console.error(requestError);
      setError("Erro ao carregar recursos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchResources();
  }, []);

  async function handleDelete(id: number) {
    const confirmed = window.confirm("Tem certeza que deseja excluir este recurso?");
    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(id);
      const response = await fetch(`/api/materials?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Erro: ${data.error || "Não foi possível excluir."}`);
        return;
      }

      setResources((current) => current.filter((resource) => resource.id !== id));
    } catch (requestError) {
      console.error(requestError);
      alert("Erro ao tentar excluir o recurso.");
    } finally {
      setIsDeleting(null);
    }
  }

  function handleEdit(id: number) {
    router.push(`/resources/add?id=${id}`);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
        <span className="ml-2 text-slate-500">Carregando recursos...</span>
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
      title="Recursos Cadastrados"
      addLabel="Novo Recurso"
      addHref="/resources/add"
      icon={FolderArchive}
      iconWrapperClassName="bg-cyan-100"
      iconClassName="text-cyan-600"
      addButtonClassName="bg-cyan-500 hover:bg-cyan-600"
    >
      {resources.length === 0 ? (
        <p className="text-center text-slate-500">Nenhum recurso encontrado.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">ID</TableHead>
                <TableHead className="text-center">Título</TableHead>
                <TableHead className="text-center">Descrição</TableHead>
                <TableHead className="text-center">Tipo</TableHead>
                <TableHead className="text-center">Arquivo</TableHead>
                <TableHead className="text-center">Criado em</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {resources.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell className="w-16 text-center align-top">{resource.id}</TableCell>
                  <TableCell className="min-w-48 max-w-56 text-center align-top whitespace-normal break-words">
                    {resource.title}
                  </TableCell>
                  <TableCell className="min-w-80 max-w-xl align-top text-left">
                    <div className="line-clamp-3 whitespace-normal break-words leading-6">
                      {resource.description}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {materialTypeLabels[resource.material_type]}
                  </TableCell>
                  <TableCell className="min-w-52 max-w-64 text-center align-top whitespace-normal break-words">
                    {getFileName(resource.file_url)}
                  </TableCell>
                  <TableCell className="text-center">
                    {new Date(resource.created_at).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button asChild size="sm" variant="outline">
                        <a href={resource.file_url} download>
                          <Download className="mr-1 h-4 w-4" />
                          Baixar
                        </a>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(resource.id)}
                      >
                        <Pencil className="mr-1 h-4 w-4" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={isDeleting === resource.id}
                        onClick={() => handleDelete(resource.id)}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        {isDeleting === resource.id ? "Excluindo..." : "Excluir"}
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
