'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";

import { Cards } from "@/components/cards";
import { SearchBar } from "@/components/searchBar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getSearchScore, matchesSearchQuery } from "@/lib/search";

type ProjectImage = {
  image_url: string;
};

type ProjectTag = {
  name: string;
};

type Project = {
  id: number;
  title: string;
  description: string;
  content: string;
  status: "inProgress" | "done";
  createdAt?: string;
  images?: ProjectImage[];
  tags?: ProjectTag[];
};

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("Todas");

  useEffect(() => {
    async function loadProjects() {
      try {
        const response = await fetch("/api/project");
        const data = response.ok ? await response.json() : [];
        setProjects(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erro ao carregar projetos:", error);
        setProjects([]);
      }
    }

    loadProjects();
  }, []);

  const availableTags = useMemo(() => {
    const uniqueTags = Array.from(
      new Set(
        projects.flatMap((project) =>
          (project.tags ?? []).map((tag) => tag.name)
        )
      )
    ).sort((first, second) => first.localeCompare(second));

    return ["Todas", ...uniqueTags];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const visibleProjects = projects.filter((project) =>
      {
        const matchesSearch = matchesSearchQuery(
          [
            project.title,
            project.description,
            project.content,
            project.status === "inProgress"
              ? "pesquisa em andamento"
              : "projeto concluido",
            project.tags?.map((tag) => tag.name).join(" "),
          ],
          search
        );

        const matchesTag =
          selectedTag === "Todas" ||
          (project.tags ?? []).some((tag) => tag.name === selectedTag);

        return matchesSearch && matchesTag;
      }
    );

    return visibleProjects.sort((first, second) => {
      const secondScore = getSearchScore(
        [
          second.title,
          second.description,
          second.content,
          second.tags?.map((tag) => tag.name).join(" "),
        ],
        search,
        second.title
      );
      const firstScore = getSearchScore(
        [
          first.title,
          first.description,
          first.content,
          first.tags?.map((tag) => tag.name).join(" "),
        ],
        search,
        first.title
      );

      return secondScore - firstScore;
    });
  }, [projects, search, selectedTag]);

  const inProgressProjects = filteredProjects.filter(
    (project) => project.status === "inProgress"
  );
  const completedProjects = filteredProjects.filter(
    (project) => project.status === "done"
  );
  const recentProjects = useMemo(
    () =>
      [...projects]
        .sort((first, second) => {
          const firstDate = first.createdAt ? new Date(first.createdAt).getTime() : 0;
          const secondDate = second.createdAt ? new Date(second.createdAt).getTime() : 0;

          return secondDate - firstDate;
        })
        .slice(0, 3),
    [projects]
  );

  return (
    <div className="flex w-full flex-1 flex-col items-center gap-8 px-4 py-8 sm:px-6 lg:px-16">
      <div className="mt-10 flex w-full flex-col items-start gap-4 sm:mt-16">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          Pesquisa & Projetos
        </h1>
        <h5 className="max-w-2xl text-base font-normal leading-normal text-slate-400">
          Explore nossas investigaes em andamento e projetos inovadores que
          moldam o futuro da educao em computao.
        </h5>
        <div className="w-full max-w-xl">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Busque por título, descrição, conteúdo ou tag..."
          />
        </div>
        <div className="flex w-full flex-wrap gap-3">
          {availableTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
              className={cn(
                buttonVariants({
                  variant: selectedTag === tag ? "default" : "secondary",
                  size: "sm",
                }),
                `rounded-full px-4 ${
                selectedTag === tag
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="pesquisas" className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-1 gap-1 sm:grid-cols-2">
          <TabsTrigger
            value="pesquisas"
            className="min-h-10 w-full whitespace-normal text-center"
          >
            Pesquisas em Andamento
          </TabsTrigger>
          <TabsTrigger
            value="concluidos"
            className="min-h-10 w-full whitespace-normal text-center"
          >
            Projetos Concluidos
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="pesquisas"
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {inProgressProjects.map((project) => (
            <Cards
              key={project.id}
              id={project.id}
              image={project.images?.[0]?.image_url}
              title={project.title}
              status={project.status}
              description={project.description}
              type="project"
            />
          ))}
          {inProgressProjects.length === 0 && (
            <p className="col-span-full rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-slate-500">
              Nenhuma pesquisa encontrada para a busca atual.
            </p>
          )}
        </TabsContent>

        <TabsContent
          value="concluidos"
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {completedProjects.map((project) => (
            <Cards
              key={project.id}
              id={project.id}
              image={project.images?.[0]?.image_url}
              title={project.title}
              status={project.status}
              description={project.description}
              type="project"
            />
          ))}
          {completedProjects.length === 0 && (
            <p className="col-span-full rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-slate-500">
              Nenhum projeto concluido encontrado para a busca atual.
            </p>
          )}
        </TabsContent>
      </Tabs>

      <div className="w-full border-t border-top-slate-200 pt-8">
        <div className="flex flex-col items-start gap-4">
          <h1 className="text-2xl font-bold tracking-[-0.033em] text-slate-900">
            Publicações Recentes
          </h1>
          <div className="flex w-full flex-col">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                className="flex cursor-pointer flex-col items-start justify-between gap-4 border-b border-slate-200 p-4 transition-all duration-200 hover:rounded-md hover:bg-slate-100 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-col items-start gap-2">
                  <h3 className="text-md font-bold">{project.title}</h3>
                  <p className="text-sm font-medium text-slate-500">
                    {project.description}
                  </p>
                </div>
                <Button
                  asChild
                  className="w-full bg-blue-500 text-xs font-bold uppercase hover:bg-blue-700 sm:w-auto"
                >
                  <Link href={`/projects/${project.id}`}>
                    <FileText size={16} />
                    Ver Projeto
                  </Link>
                </Button>
              </div>
            ))}
            {recentProjects.length === 0 && (
              <p className="rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-slate-500">
                Nenhuma publicação recente encontrada.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
