'use client'

import { useEffect, useMemo, useState } from "react";
import { Download, FileArchive, FileCode2, FileText } from "lucide-react";

import { FilterBar } from "@/components/filterBar";
import { SearchBar } from "@/components/searchBar";
import { Button } from "@/components/ui/button";
import { getSearchScore, matchesSearchQuery } from "@/lib/search";
import { ResourceDTO } from "@/types/TypesObject";

type MaterialType = ResourceDTO["material_type"];

const materialTypeLabels: Record<MaterialType, string> = {
  article: "Artigos",
  didactic_material: "Videoaulas e Materiais",
  software: "Software",
};

const materialTypeIcons: Record<MaterialType, typeof FileText> = {
  article: FileText,
  didactic_material: FileArchive,
  software: FileCode2,
};

function getFileName(fileUrl: string) {
  return decodeURIComponent(fileUrl.split("/").pop() || "recurso");
}

export default function Resources() {
  const [resources, setResources] = useState<ResourceDTO[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("Todos");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadResources() {
      try {
        const response = await fetch("/api/materials");
        const data = response.ok ? await response.json() : [];
        setResources(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erro ao carregar recursos:", error);
        setResources([]);
      }
    }

    loadResources();
  }, []);

  const filteredResources = useMemo(() => {
    const visibleResources = resources.filter((resource) => {
      const matchesSearch = matchesSearchQuery(
        [
          resource.title,
          resource.description,
          resource.file_url,
          resource.user?.name,
          resource.user?.email,
          materialTypeLabels[resource.material_type],
        ],
        search
      );

      const matchesFilter =
        selectedFilter === "Todos" ||
        materialTypeLabels[resource.material_type] === selectedFilter;

      return matchesSearch && matchesFilter;
    });

    return visibleResources.sort((first, second) => {
      const secondScore = getSearchScore(
        [
          second.title,
          second.description,
          second.user?.name,
          materialTypeLabels[second.material_type],
        ],
        search,
        second.title
      );
      const firstScore = getSearchScore(
        [
          first.title,
          first.description,
          first.user?.name,
          materialTypeLabels[first.material_type],
        ],
        search,
        first.title
      );

      return secondScore - firstScore;
    });
  }, [resources, search, selectedFilter]);

  return (
    <div className="mx-auto flex w-full flex-1 flex-col items-center gap-8 bg-slate-50 px-4 py-12 sm:px-6 md:px-10 md:py-16 xl:px-20">
      <div className="flex w-full max-w-5xl flex-col items-center gap-4">
        <h1 className="text-center text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          Recursos Educacionais
        </h1>
        <h5 className="max-w-3xl text-center text-base font-normal leading-normal text-slate-500">
          Explore softwares, series de videoaulas, artigos, arquivos e outros
          materiais desenvolvidos pelo laboratório para apoiar o ensino e a
          aprendizagem da computação.
        </h5>
        <div className="mt-6 flex w-full flex-col items-center gap-4">
          <div className="w-full max-w-xl">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Busque por título, descrição, autor ou tipo..."
            />
          </div>
          <FilterBar
            items={["Todos", "Software", "Artigos", "Videoaulas e Materiais"]}
            value={selectedFilter}
            onSelect={(item) => setSelectedFilter(item)}
          />
        </div>
      </div>

      <div className="grid w-full max-w-7xl grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredResources.map((resource) => {
          const Icon = materialTypeIcons[resource.material_type];

          return (
            <article
              key={resource.id}
              className="flex h-full min-w-0 flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg sm:p-6"
            >
              <div className="mb-5 flex flex-col items-start justify-between gap-4 sm:flex-row">
                <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-600">
                  {materialTypeLabels[resource.material_type]}
                </span>
              </div>

              <div className="flex-1 space-y-3">
                <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  {resource.title}
                </h2>
                <p className="line-clamp-4 text-sm leading-7 text-slate-600">
                  {resource.description}
                </p>
              </div>

              <div className="mt-6 space-y-3 border-t border-slate-100 pt-4">
                <div className="space-y-1 text-sm text-slate-500">
                  <p>
                    <span className="font-semibold text-slate-700">Arquivo:</span>{" "}
                    <span className="break-all">{getFileName(resource.file_url)}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">Autor:</span>{" "}
                    {resource.user?.name || "Laboratório"}
                  </p>
                </div>

                <Button
                  asChild
                  className="w-full bg-blue-500 text-white hover:bg-blue-600"
                >
                  <a href={resource.file_url} download>
                    <Download className="h-4 w-4" />
                    Baixar recurso
                  </a>
                </Button>
              </div>
            </article>
          );
        })}

        {filteredResources.length === 0 && (
          <p className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-slate-500">
            Nenhum recurso encontrado com os filtros atuais.
          </p>
        )}
      </div>
    </div>
  )
}
