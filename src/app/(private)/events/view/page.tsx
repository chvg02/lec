"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Loader2, Pencil, Trash2 } from "lucide-react";

import { PrivateViewLayout } from "@/components/private/private-view-layout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EventDTO } from "@/types/TypesObject";

export default function ViewEventPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  async function fetchEvents() {
    setLoading(true);
    try {
      const response = await fetch("/api/events");
      if (!response.ok) {
        throw new Error(`Erro ${response.status}`);
      }

      const data = await response.json();
      setEvents(data);
    } catch (requestError) {
      console.error(requestError);
      setError("Erro ao carregar eventos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  async function handleDelete(id: number) {
    const confirmed = window.confirm("Tem certeza que deseja excluir permanentemente?");
    if (!confirmed) {
      return;
    }

    setIsDeleting(id);

    try {
      const response = await fetch(`/api/events?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Erro: ${data.error || "Não foi possível excluir."}`);
        return;
      }

      setEvents((current) => current.filter((event) => event.id !== id));
    } catch (requestError) {
      console.error("Erro de conexao:", requestError);
      alert("Erro ao tentar excluir.");
    } finally {
      setIsDeleting(null);
    }
  }

  function handleEdit(eventId: number) {
    router.push(`/events/add?id=${eventId}`);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
        <span className="ml-2 text-slate-500">Carregando eventos...</span>
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
      title="Eventos Cadastrados"
      addLabel="Novo Evento"
      addHref="/events/add"
      icon={CalendarClock}
      iconWrapperClassName="bg-emerald-100"
      iconClassName="text-emerald-500"
      addButtonClassName="bg-emerald-500 hover:bg-emerald-600"
    >
      {events.length === 0 ? (
        <p className="text-center text-slate-500">Nenhum evento encontrado.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">ID</TableHead>
                <TableHead className="text-center">Título</TableHead>
                <TableHead className="text-center">Descrição</TableHead>
                <TableHead className="text-center">Data</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="text-center">{event.id}</TableCell>
                  <TableCell className="text-center">{event.title}</TableCell>
                  <TableCell className="text-center">
                    <div className="line-clamp-3 whitespace-normal break-words text-left leading-6">
                      {event.description}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {new Date(event.event_date).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(event.id)}
                      >
                        <Pencil className="mr-1 h-4 w-4" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={isDeleting === event.id}
                        onClick={() => handleDelete(event.id)}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        {isDeleting === event.id ? "Excluindo..." : "Excluir"}
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
