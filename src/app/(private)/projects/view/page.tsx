"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FolderKanban, Loader2, Pencil, Trash2 } from "lucide-react";

import { PrivateViewLayout } from "@/components/private/private-view-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProjectDTO } from "@/types/TypesObject";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const router = useRouter();

  async function fetchProjects() {
    setLoading(true);
    try {
      const response = await fetch("/api/project");
      if (!response.ok) {
        throw new Error(`Erro ${response.status}`);
      }

      const data = await response.json();
      setProjects(data);
    } catch (requestError) {
      console.error(requestError);
      setError("Erro ao carregar projetos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  async function handleDelete(id: number) {
    const confirmed = window.confirm("Tem certeza que deseja excluir este projeto permanentemente?");
    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(id);

      const response = await fetch(`/api/project?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Erro: ${data.error || "Não foi possível excluir."}`);
        return;
      }

      setProjects((current) => current.filter((project) => project.id !== id));
    } catch (requestError) {
      console.error("Erro de conexao:", requestError);
      alert("Erro ao tentar excluir o projeto.");
    } finally {
      setIsDeleting(null);
    }
  }

  function handleEdit(projectId: number) {
    router.push(`/projects/add?id=${projectId}`);
  }

  function formatProjectTags(project: ProjectDTO) {
    if (!Array.isArray(project.tags) || project.tags.length === 0) {
      return "Sem tags";
    }

    return project.tags.map((tag) => tag.name).join(", ");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
        <span className="ml-2 text-slate-500">Carregando projetos...</span>
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
      title="Projetos Cadastrados"
      addLabel="Novo Projeto"
      addHref="/projects/add"
      icon={FolderKanban}
      iconWrapperClassName="bg-blue-100"
      iconClassName="text-blue-500"
      addButtonClassName="bg-blue-500 hover:bg-blue-600"
    >
      {projects.length === 0 ? (
        <p className="text-center text-slate-500">Nenhum projeto encontrado.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">ID</TableHead>
                <TableHead className="text-center">Título</TableHead>
                <TableHead className="text-center">Descrição</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Tags</TableHead>
                <TableHead className="text-center">Data</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="text-center">{project.id}</TableCell>
                  <TableCell className="text-center">{project.title}</TableCell>
                  <TableCell className="text-center">
                    <div className="line-clamp-3 whitespace-normal break-words text-left leading-6">
                      {project.description}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={project.status === "inProgress" ? "default" : "secondary"}
                      className="capitalize"
                    >
                      {project.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{formatProjectTags(project)}</TableCell>
                  <TableCell className="text-center">
                    {new Date(project.createdAt).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(project.id)}
                      >
                        <Pencil className="mr-1 h-4 w-4" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={isDeleting === project.id}
                        onClick={() => handleDelete(project.id)}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        {isDeleting === project.id ? "Excluindo..." : "Excluir"}
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
