"use client";

import { useEffect, useMemo, useState } from "react";

import { Cards } from "./cards";

type ProjectItem = {
  id: number;
  title: string;
  description: string;
  createdAt?: string;
  images?: Array<{
    image_url?: string;
  }>;
};

type NewsItem = {
  id: number;
  title: string;
  description: string;
  news_date?: string;
  created_at?: string;
  images?: Array<{
    image_url?: string;
  }>;
};

type EventItem = {
  id: number;
  title: string;
  description: string;
  event_date?: string;
  created_at?: string;
  images?: Array<{
    image_url?: string;
  }>;
};

type HighlightCard = {
  id: number;
  image?: string;
  title: string;
  description: string;
  type: "project" | "news" | "resource";
  href?: string;
  actionLabel?: string;
  status?: "inProgress" | "done";
};

const fallbackHighlights: HighlightCard[] = [
  {
    id: 100001,
    image: "/markus-spiske-iar-afB0QQw-unsplash.jpg",
    title: "Pesquisas e Projetos",
    description:
      "Conheça iniciativas de pesquisa e projetos aplicados no ensino de computação.",
    type: "project",
    href: "/projects",
    actionLabel: "Ver pesquisas",
    status: "inProgress",
  },
  {
    id: 100002,
    image: "/imgpadrao2.jpg",
    title: "Notícias do laboratório",
    description:
      "Acompanhe atualizações, lançamentos e novidades mais recentes produzidas pelo laboratório.",
    type: "news",
    href: "/news",
    actionLabel: "Ler notícias",
  },
  {
    id: 100003,
    image: "/teste.jpg",
    title: "Eventos em destaque",
    description:
      "Confira ações, encontros e atividades recentes promovidas pelo laboratório e sua comunidade.",
    type: "news",
    href: "/news",
    actionLabel: "Ver eventos",
  },
  {
    id: 100004,
    image: "/imgpadrao3.jpg",
    title: "Recursos educacionais do laboratório",
    description:
      "Explore materiais didáticos, artigos e ferramentas produzidas para apoiar o ensino e a aprendizagem da computação.",
    type: "resource",
    href: "/resources",
    actionLabel: "Acessar recursos",
  },
];

function getTimestamp(value?: string) {
  if (!value) {
    return 0;
  }

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function getMostRecentProject(projects: ProjectItem[]): HighlightCard | undefined {
  const mostRecentProject = [...projects].sort(
    (first, second) => getTimestamp(second.createdAt) - getTimestamp(first.createdAt)
  )[0];

  if (!mostRecentProject) {
    return undefined;
  }

  return {
    id: mostRecentProject.id,
    image: mostRecentProject.images?.[0]?.image_url,
    title: mostRecentProject.title,
    description: mostRecentProject.description,
    type: "project",
    href: `/projects/${mostRecentProject.id}`,
    actionLabel: "Ver pesquisas",
    status: "inProgress",
  };
}

function getMostRecentNews(news: NewsItem[]): HighlightCard | undefined {
  const latestNews = [...news].sort((first, second) => {
    const secondDate = getTimestamp(second.news_date ?? second.created_at);
    const firstDate = getTimestamp(first.news_date ?? first.created_at);
    return secondDate - firstDate;
  })[0];

  if (!latestNews) {
    return undefined;
  }

  return {
    id: latestNews.id,
    image: latestNews.images?.[0]?.image_url,
    title: latestNews.title,
    description: latestNews.description,
    type: "news",
    href: `/news/news-${latestNews.id}`,
    actionLabel: "Ler notícia",
  };
}

function getMostRecentEvent(events: EventItem[]): HighlightCard | undefined {
  const latestEvent = [...events].sort((first, second) => {
    const secondDate = getTimestamp(second.event_date ?? second.created_at);
    const firstDate = getTimestamp(first.event_date ?? first.created_at);
    return secondDate - firstDate;
  })[0];

  if (!latestEvent) {
    return undefined;
  }

  return {
    id: latestEvent.id,
    image: latestEvent.images?.[0]?.image_url,
    title: latestEvent.title,
    description: latestEvent.description,
    type: "news",
    href: `/news/event-${latestEvent.id}`,
    actionLabel: "Ver evento",
  };
}

export const SectionHeader = () => {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    async function loadHighlights() {
      try {
        const [projectsResponse, newsResponse, eventsResponse] =
          await Promise.all([
            fetch("/api/project"),
            fetch("/api/news"),
            fetch("/api/events"),
          ]);

        const [projectsData, newsData, eventsData] =
          await Promise.all([
            projectsResponse.ok ? projectsResponse.json() : [],
            newsResponse.ok ? newsResponse.json() : [],
            eventsResponse.ok ? eventsResponse.json() : [],
          ]);

        setProjects(Array.isArray(projectsData) ? projectsData : []);
        setNews(Array.isArray(newsData) ? newsData : []);
        setEvents(Array.isArray(eventsData) ? eventsData : []);
      } catch (error) {
        console.error("Erro ao carregar destaques da home:", error);
      }
    }

    loadHighlights();
  }, []);

  const highlightCards = useMemo(() => {
    const projectHighlight = getMostRecentProject(projects) ?? fallbackHighlights[0];
    const newsHighlight = getMostRecentNews(news) ?? fallbackHighlights[1];
    const eventHighlight = getMostRecentEvent(events) ?? fallbackHighlights[2];
    const resourceHighlight = fallbackHighlights[3];

    return [
      projectHighlight,
      newsHighlight,
      eventHighlight,
      resourceHighlight,
    ];
  }, [events, news, projects]);

  return (
    <section
      className="flex min-h-full flex-1 bg-slate-100 py-8 dark:bg-slate-900/50 sm:py-16"
      id="pesquisas"
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12 flex flex-col items-center gap-4 text-center">
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">
            Destaques Recentes
          </h2>
          <p className="max-w-2xl font-light">
            Acompanhe os conteúdos mais recentes do laboratório em pesquisas,
            notícias, eventos e recursos educacionais.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {highlightCards.map((card) => (
            <Cards
              key={`${card.type}-${card.id}`}
              id={card.id}
              image={card.image}
              title={card.title}
              description={card.description}
              type={card.type}
              status={card.status}
              href={card.href}
              actionLabel={card.actionLabel}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
