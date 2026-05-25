"use client";

import { Flag, Lightbulb, Rocket, Trash2, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { hasPermission } from "@/lib/permissions";

type TeamUser = {
  id: number;
  name: string;
  email: string;
  profileImageUrl?: string | null;
  role: string;
  isTeam?: boolean;
  isFormerTeam?: boolean;
};

type RegisteredUser = TeamUser & {
  isTeam: boolean;
  isFormerTeam: boolean;
};

export default function About() {
  const { data: session } = useSession();
  const [team, setTeam] = useState<TeamUser[]>([]);
  const [formerTeam, setFormerTeam] = useState<TeamUser[]>([]);
  const [allUsers, setAllUsers] = useState<RegisteredUser[]>([]);
  const [selectedCurrentUser, setSelectedCurrentUser] = useState("");
  const [selectedFormerUser, setSelectedFormerUser] = useState("");
  const [loading, setLoading] = useState(false);
  const canEditAbout = hasPermission(session?.user, "canEditAbout");

  const fetchTeam = async () => {
    const response = await fetch("/api/team");

    if (!response.ok) {
      throw new Error("Não foi possível carregar a equipe.");
    }

    const data: TeamUser[] = await response.json();
    setTeam(data);
  };

  const fetchFormerTeam = async () => {
    const response = await fetch("/api/former-team");

    if (!response.ok) {
      throw new Error("Não foi possível carregar os membros anteriores.");
    }

    const data: TeamUser[] = await response.json();
    setFormerTeam(data);
  };

  const fetchUsers = async () => {
    const response = await fetch("/api/user");

    if (!response.ok) {
      throw new Error("Não foi possível carregar os usuários.");
    }

    const data: RegisteredUser[] = await response.json();
    setAllUsers(data);
  };

  const refreshData = async () => {
    if (canEditAbout) {
      await Promise.all([fetchTeam(), fetchFormerTeam(), fetchUsers()]);
      return;
    }

    await Promise.all([fetchTeam(), fetchFormerTeam()]);
  };

  useEffect(() => {
    refreshData().catch((error) => {
      console.error("Erro ao carregar dados da página Sobre:", error);
    });
  }, [canEditAbout]);

  const updateMembership = async (
    id: number,
    membership: "current" | "former",
    active: boolean
  ) => {
    setLoading(true);

    try {
      const response = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          ...(membership === "current"
            ? { isTeam: active }
            : { isFormerTeam: active }),
        }),
      });

      if (!response.ok) {
        throw new Error("Não foi possível atualizar a equipe.");
      }

      if (active) {
        if (membership === "current") {
          setSelectedCurrentUser("");
        } else {
          setSelectedFormerUser("");
        }
      }

      await refreshData();
    } catch (error) {
      console.error("Erro ao atualizar equipe:", error);
    } finally {
      setLoading(false);
    }
  };

  const availableCurrentUsers = allUsers.filter((user) => !user.isTeam);
  const availableFormerUsers = allUsers.filter((user) => !user.isFormerTeam);

  const renderMemberSection = ({
    title,
    description,
    members,
    selectedUser,
    setSelectedUser,
    availableUsers,
    membership,
    addLabel,
    emptyLabel,
  }: {
    title: string;
    description: string;
    members: TeamUser[];
    selectedUser: string;
    setSelectedUser: (value: string) => void;
    availableUsers: RegisteredUser[];
    membership: "current" | "former";
    addLabel: string;
    emptyLabel: string;
  }) => (
    <div className="mt-12 flex flex-col items-center justify-center sm:mt-16">
      <h1 className="text-center text-3xl font-black sm:text-4xl lg:text-5xl">{title}</h1>
      <p className="mt-4 max-w-3xl text-center text-base text-slate-400 sm:text-lg">{description}</p>

      {members.length === 0 ? (
        <p className="mt-8 text-center text-slate-500">{emptyLabel}</p>
      ) : (
        <div className="grid w-full grid-cols-1 gap-5 py-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {members.map((user) => (
            <div
              key={user.id}
              className="flex min-w-0 flex-col items-center justify-center rounded-2xl border border-slate-200 p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl sm:p-8"
            >
              <img
                src={user.profileImageUrl || `https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(user.name)}`}
                alt={user.name}
                className="aspect-square w-24 rounded-full border border-blue-400 object-cover"
              />
              <h1 className="mt-4 text-center text-lg font-black">{user.name}</h1>
              <h5 className="font-medium text-blue-500">
                {user.role === "admin" ? "Administrador" : "Membro"}
              </h5>
              <p className="mt-4 max-w-full break-words text-center text-slate-400">{user.email}</p>

              {canEditAbout && (
                <button
                  className="mt-4 flex items-center gap-2 rounded bg-red-500 px-2 py-1 text-white hover:bg-red-600"
                  onClick={() => updateMembership(user.id, membership, false)}
                  disabled={loading}
                >
                  <Trash2 size={16} /> Remover
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {canEditAbout && (
        <div className="mt-8 flex w-full flex-col items-center justify-center gap-3">
          <div className="flex w-full max-w-2xl flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
            <select
              className="w-full rounded border px-4 py-2"
              value={selectedUser}
              onChange={(event) => setSelectedUser(event.target.value)}
            >
              <option value="">Selecionar usuário cadastrado...</option>
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>

            <button
              className="flex items-center justify-center gap-2 rounded bg-blue-500 px-4 py-2 text-white disabled:opacity-50"
              onClick={() =>
                updateMembership(Number(selectedUser), membership, true)
              }
              disabled={loading || !selectedUser}
            >
              <UserPlus size={16} /> {addLabel}
            </button>
          </div>

          <p className="text-sm text-slate-500">
            Apenas usuários já cadastrados no sistema podem ser adicionados a
            esta seção.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen h-full px-4 py-8 sm:px-6 lg:px-16">
      <div className="min-h-[360px] w-full overflow-hidden rounded-2xl bg-[url('https://www.ufms.br/wp-content/uploads/2021/02/UFMS.1.jpg')] bg-cover bg-center shadow-lg sm:min-h-[440px] lg:min-h-[480px]">
        <div className="flex min-h-[360px] w-full flex-col items-center justify-center gap-4 bg-black/50 p-6 sm:min-h-[440px] sm:p-10 lg:min-h-[480px] lg:p-16">
          <h1 className="text-center text-3xl font-black text-white sm:text-5xl lg:text-6xl">
            Conheça o Laboratório de Educação em Computação
          </h1>
          <h5 className="max-w-4xl text-center text-base font-medium text-slate-200 sm:text-lg">
            Pesquisando e desenvolvendo o futuro do ensino de computação, desde
            a educação básica até o ensino superior.
          </h5>
        </div>
      </div>

      <div className="mt-10 w-full py-6 sm:mt-16 sm:p-8">
        <h1 className="mb-4 text-3xl font-black text-slate-800 sm:text-4xl">
          Sobre o Laboratório
        </h1>
        <p className="text-slate-400">
          O Laboratório de Educação em Computação (LEC) é um espaço dedicado à
          pesquisa e ao desenvolvimento de práticas pedagógicas inovadoras para o
          ensino e a aprendizagem da computação em diversos níveis de ensino.
        </p>
      </div>

      <div className="grid w-full grid-cols-1 gap-5 py-6 md:grid-cols-3 sm:p-8">
        <div className="flex flex-col items-start rounded-lg border border-slate-200 p-6 shadow-lg dark:border-slate-800">
          <Lightbulb size={36} className="mb-8 text-blue-500" />
          <h2 className="text-lg font-bold">O que é o LEC?</h2>
          <p className="text-slate-400">
            Um centro de excelência focado na interseção entre educação e
            tecnologia, buscando criar soluções que transformem o ensino da
            computação.
          </p>
        </div>

        <div className="flex flex-col items-start rounded-lg border border-slate-200 p-6 shadow-lg dark:border-slate-800">
          <Flag size={36} className="mb-8 text-blue-500" />
          <h2 className="text-lg font-bold">Nossos Objetivos</h2>
          <p className="text-slate-400">
            Fomentar a pesquisa, desenvolver metodologias de ensino eficazes e
            promover a inclusão digital através da educação em computação.
          </p>
        </div>

        <div className="flex flex-col items-start rounded-lg border border-slate-200 p-6 shadow-lg dark:border-slate-800">
          <Rocket size={36} className="mb-8 text-blue-500" />
          <h2 className="text-lg font-bold">Nossa Missão</h2>
          <p className="text-slate-400">
            Capacitar educadores e estudantes com as ferramentas e conhecimentos
            necessários para prosperar em um mundo cada vez mais digital.
          </p>
        </div>
      </div>

      {renderMemberSection({
        title: "Membros atuais",
        description:
          "Profissionais e estudantes dedicados que impulsionam a inovação no ensino de computação.",
        members: team,
        selectedUser: selectedCurrentUser,
        setSelectedUser: setSelectedCurrentUser,
        availableUsers: availableCurrentUsers,
        membership: "current",
        addLabel: "Adicionar aos atuais",
        emptyLabel: "Nenhum membro atual cadastrado.",
      })}

      {renderMemberSection({
        title: "Membros anteriores",
        description:
          "Pessoas que contribuíram para a trajetória do laboratório e para seus projetos.",
        members: formerTeam,
        selectedUser: selectedFormerUser,
        setSelectedUser: setSelectedFormerUser,
        availableUsers: availableFormerUsers,
        membership: "former",
        addLabel: "Adicionar aos anteriores",
        emptyLabel: "Nenhum membro anterior cadastrado.",
      })}
    </div>
  );
}
