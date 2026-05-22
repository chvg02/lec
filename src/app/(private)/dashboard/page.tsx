'use client'

import { Button } from "@/components/ui/button";
import {
  CalendarClock,
  FileText,
  FolderArchive,
  FolderKanban,
  Info,
  Loader2,
  LogOut,
  Mail,
  Plus,
  UsersRound,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { hasPermission } from "@/lib/permissions";

interface CategoryData {
  list: DashboardListItem[];
  activeCount: number;
}

interface DashboardListItem {
  id: number;
  title?: string;
  titulo?: string;
  name?: string;
  nome?: string;
}

interface DashboardData {
  projects: CategoryData;
  users: CategoryData;
  news: CategoryData;
  events: CategoryData;
  resources: CategoryData;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const canManageProjects = hasPermission(session?.user, "canManageProjects");
  const canManageUsers = hasPermission(session?.user, "canManageUsers");
  const canManageNews = hasPermission(session?.user, "canManageNews");
  const canManageEvents = hasPermission(session?.user, "canManageEvents");
  const canManageResources = hasPermission(session?.user, "canManageResources");
  const canEditContact = hasPermission(session?.user, "canEditContact");
  const canEditAbout = hasPermission(session?.user, "canEditAbout");
  const visibleModules = [
    canManageProjects,
    canManageUsers,
    canManageNews,
    canManageEvents,
    canManageResources,
    canEditContact,
    canEditAbout,
  ].filter(Boolean).length;

  const [data, setData] = useState<DashboardData>({
    projects: { list: [], activeCount: 0 },
    users: { list: [], activeCount: 0 },
    news: { list: [], activeCount: 0 },
    events: { list: [], activeCount: 0 },
    resources: { list: [], activeCount: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [projRes, userRes, newsRes, eventsRes, resourcesRes] = await Promise.all([
          canManageProjects
            ? fetch("/api/project?view=dashboard").then((res) => (res.ok ? res.json() : null))
            : Promise.resolve(null),
          canManageUsers
            ? fetch("/api/user?view=dashboard").then((res) => (res.ok ? res.json() : null))
            : Promise.resolve(null),
          canManageNews
            ? fetch("/api/news").then((res) => (res.ok ? res.json() : []))
            : Promise.resolve([]),
          canManageEvents
            ? fetch("/api/events").then((res) => (res.ok ? res.json() : []))
            : Promise.resolve([]),
          canManageResources
            ? fetch("/api/materials").then((res) => (res.ok ? res.json() : []))
            : Promise.resolve([]),
        ]);

        setData({
          projects: {
            list: projRes?.projects || [],
            activeCount: projRes?.count || 0,
          },
          users: {
            list: Array.isArray(userRes) ? userRes : userRes?.users || [],
            activeCount: userRes?.count || (Array.isArray(userRes) ? userRes.length : 0),
          },
          news: {
            list: Array.isArray(newsRes) ? newsRes.slice(0, 5) : [],
            activeCount: Array.isArray(newsRes) ? newsRes.length : 0,
          },
          events: {
            list: Array.isArray(eventsRes) ? eventsRes.slice(0, 5) : [],
            activeCount: Array.isArray(eventsRes) ? eventsRes.length : 0,
          },
          resources: {
            list: Array.isArray(resourcesRes) ? resourcesRes.slice(0, 5) : [],
            activeCount: Array.isArray(resourcesRes) ? resourcesRes.length : 0,
          },
        });
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    if (session) {
      fetchDashboardData();
    }
  }, [
    canManageEvents,
    canManageNews,
    canManageProjects,
    canManageResources,
    canManageUsers,
    canEditAbout,
    canEditContact,
    session,
  ]);

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.replace("/");
  }

  function handleGoTo(path: string) {
    router.push(path);
  }

  function getItemLabel(item: DashboardListItem) {
    return item.title ?? item.titulo ?? item.name ?? item.nome ?? "Sem título";
  }

  if (!session) return null;

  return (
    <div className="w-full p-8">
      <div className="flex flex-row items-center justify-between">
        <div>
          <h1 className="w-full text-2xl font-black">Dashboard</h1>
          <p className="font-light">Bem-vindo ao seu painel de controle!</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="destructive" onClick={handleSignOut}>
            <LogOut size={16} /> Logout
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 w-full items-center justify-center">
          <Loader2 className="animate-spin text-blue-500" size={48} />
        </div>
      ) : (
        <div className={`mt-8 grid w-full grid-cols-1 gap-8 md:grid-cols-2 ${visibleModules >= 5 ? "xl:grid-cols-5" : "xl:grid-cols-4"}`}>
          {visibleModules === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 md:col-span-2 xl:col-span-4">
              Nenhuma funcionalidade foi atribuída ao seu usuário ainda.
            </div>
          )}
          {canManageProjects && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <div className="flex flex-row items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex flex-row items-center gap-4">
                <div className="rounded-lg bg-blue-100 p-2">
                  <FolderKanban size={24} className="text-blue-500" />
                </div>
                <h1 className="text-xl font-bold">Projetos</h1>
              </div>
              <div className="flex flex-row items-center gap-2">
                <h3 className="font-medium text-slate-400">Ativos:</h3>
                <h1 className="text-3xl font-black">{data.projects.activeCount}</h1>
              </div>
            </div>
            <div className="flex flex-1 h-full flex-col gap-2 pt-4">
              <div className="flex flex-row items-center justify-between">
                <h5 className="text-lg font-medium">Recentes:</h5>
                <Button variant="ghost" className="text-sm text-blue-500" onClick={() => handleGoTo("/projects/view")}>
                  Ver Todos
                </Button>
              </div>
              <div className="flex flex-col gap-1 p-2">
                {data.projects.list.map((item) => (
                  <span key={item.id} className="border-l-2 border-blue-200 pl-2 text-sm text-slate-500">
                    {getItemLabel(item)}
                  </span>
                ))}
                {data.projects.list.length === 0 && <span className="text-sm text-slate-400">Nenhum projeto.</span>}
              </div>
            </div>
            <Button className="mt-4 w-full bg-blue-500 hover:bg-blue-600" onClick={() => handleGoTo("/projects/add")}>
              <Plus size={24} /> Adicionar Projeto
            </Button>
          </div>
          )}

          {canManageUsers && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <div className="flex flex-row items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex flex-row items-center gap-4">
                  <div className="rounded-lg bg-violet-100 p-2">
                    <UsersRound size={24} className="text-violet-500" />
                  </div>
                  <h1 className="text-xl font-bold">Usuários</h1>
                </div>
                <div className="flex flex-row items-center gap-2">
                  <h3 className="font-medium text-slate-400">Ativos:</h3>
                  <h1 className="text-3xl font-black">{data.users.activeCount}</h1>
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-4">
                <div className="flex flex-row items-center justify-between">
                  <h5 className="text-lg font-medium">Recentes:</h5>
                  <Button variant="ghost" className="text-sm text-blue-500" onClick={() => handleGoTo("/users/view")}>
                    Ver Todos
                  </Button>
                </div>
                <div className="flex flex-col gap-1 p-2">
                  {data.users.list.map((item) => (
                    <span key={item.id} className="border-l-2 border-violet-200 pl-2 text-sm text-slate-500">
                      {getItemLabel(item)}
                    </span>
                  ))}
                  {data.users.list.length === 0 && <span className="text-sm text-slate-400">Nenhum usuário.</span>}
                </div>
              </div>
              <Button className="mt-4 w-full bg-violet-500 hover:bg-violet-600" onClick={() => handleGoTo("/users/add")}>
                <Plus size={24} /> Adicionar Usuário
              </Button>
            </div>
          )}

          {canEditContact && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <div className="flex flex-row items-center gap-4 border-b border-slate-200 pb-4">
                <div className="rounded-lg bg-sky-100 p-2">
                  <Mail size={24} className="text-sky-600" />
                </div>
                <h1 className="text-xl font-bold">Contato</h1>
              </div>
              <p className="pt-4 text-sm text-slate-500">
                Atualize telefone, endereço, e-mail e mapa exibidos na página de contato.
              </p>
              <Button className="mt-4 w-full bg-sky-500 hover:bg-sky-600" onClick={() => handleGoTo("/contact/edit")}>
                Editar contato
              </Button>
            </div>
          )}

          {canEditAbout && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <div className="flex flex-row items-center gap-4 border-b border-slate-200 pb-4">
                <div className="rounded-lg bg-rose-100 p-2">
                  <Info size={24} className="text-rose-600" />
                </div>
                <h1 className="text-xl font-bold">Sobre</h1>
              </div>
              <p className="pt-4 text-sm text-slate-500">
                Gerencie os membros atuais e anteriores exibidos na página Sobre.
              </p>
              <Button className="mt-4 w-full bg-rose-500 hover:bg-rose-600" onClick={() => handleGoTo("/sobre")}>
                Editar Sobre
              </Button>
            </div>
          )}

          {canManageNews && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <div className="flex flex-row items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex flex-row items-center gap-4">
                <div className="rounded-lg bg-amber-100 p-2">
                  <FileText size={24} className="text-amber-500" />
                </div>
                <h1 className="text-xl font-bold">Notícias</h1>
              </div>
              <div className="flex flex-row items-center gap-2">
                <h3 className="font-medium text-slate-400">Ativas:</h3>
                <h1 className="text-3xl font-black">{data.news.activeCount}</h1>
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-4">
              <div className="flex flex-row items-center justify-between">
                <h5 className="text-lg font-medium">Recentes:</h5>
                <Button variant="ghost" className="text-sm text-blue-500" onClick={() => handleGoTo("/news/view")}>
                  Ver Todos
                </Button>
              </div>
              <div className="flex flex-col gap-1 p-2">
                {data.news.list.map((item) => (
                  <span key={item.id} className="border-l-2 border-amber-200 pl-2 text-sm text-slate-500">
                    {getItemLabel(item)}
                  </span>
                ))}
                {data.news.list.length === 0 && <span className="text-sm text-slate-400">Nenhuma notícia.</span>}
              </div>
            </div>
            <Button className="mt-4 w-full bg-amber-500 hover:bg-amber-600" onClick={() => handleGoTo("/news/add")}>
              <Plus size={24} /> Adicionar Notícia
            </Button>
          </div>
          )}

          {canManageEvents && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <div className="flex flex-row items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex flex-row items-center gap-4">
                <div className="rounded-lg bg-emerald-100 p-2">
                  <CalendarClock size={24} className="text-emerald-500" />
                </div>
                <h1 className="text-xl font-bold">Eventos</h1>
              </div>
              <div className="flex flex-row items-center gap-2">
                <h3 className="font-medium text-slate-400">Ativos:</h3>
                <h1 className="text-3xl font-black">{data.events.activeCount}</h1>
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-4">
              <div className="flex flex-row items-center justify-between">
                <h5 className="text-lg font-medium">Recentes:</h5>
                <Button variant="ghost" className="text-sm text-blue-500" onClick={() => handleGoTo("/events/view")}>
                  Ver Todos
                </Button>
              </div>
              <div className="flex flex-col gap-1 p-2">
                {data.events.list.map((item) => (
                  <span key={item.id} className="border-l-2 border-emerald-200 pl-2 text-sm text-slate-500">
                    {getItemLabel(item)}
                  </span>
                ))}
                {data.events.list.length === 0 && <span className="text-sm text-slate-400">Nenhum evento.</span>}
              </div>
            </div>
            <Button className="mt-4 w-full bg-emerald-500 hover:bg-emerald-600" onClick={() => handleGoTo("/events/add")}>
              <Plus size={24} /> Adicionar Evento
            </Button>
          </div>
          )}

          {canManageResources && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <div className="flex flex-row items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex flex-row items-center gap-4">
                <div className="rounded-lg bg-cyan-100 p-2">
                  <FolderArchive size={24} className="text-cyan-600" />
                </div>
                <h1 className="text-xl font-bold">Recursos</h1>
              </div>
              <div className="flex flex-row items-center gap-2">
                <h3 className="font-medium text-slate-400">Ativos:</h3>
                <h1 className="text-3xl font-black">{data.resources.activeCount}</h1>
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-4">
              <div className="flex flex-row items-center justify-between">
                <h5 className="text-lg font-medium">Recentes:</h5>
                <Button variant="ghost" className="text-sm text-blue-500" onClick={() => handleGoTo("/resources/view")}>
                  Ver Todos
                </Button>
              </div>
              <div className="flex flex-col gap-1 p-2">
                {data.resources.list.map((item) => (
                  <span key={item.id} className="border-l-2 border-cyan-200 pl-2 text-sm text-slate-500">
                    {getItemLabel(item)}
                  </span>
                ))}
                {data.resources.list.length === 0 && <span className="text-sm text-slate-400">Nenhum recurso.</span>}
              </div>
            </div>
            <Button className="mt-4 w-full bg-cyan-500 hover:bg-cyan-600" onClick={() => handleGoTo("/resources/add")}>
              <Plus size={24} /> Adicionar Recurso
            </Button>
          </div>
          )}
        </div>
      )}
    </div>
  );
}
