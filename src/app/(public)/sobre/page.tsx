"use client";

import { Flag, Lightbulb, Loader2, Rocket, Save, Trash2, UserPlus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DEFAULT_ABOUT_SETTINGS,
  type AboutSettings,
  type AboutSettingsField,
} from "@/lib/about-settings";
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

type Feedback = {
  type: "success" | "error";
  text: string;
};

type AboutEditorSection = {
  title: string;
  fields: Array<{
    field: AboutSettingsField;
    label: string;
    multiline?: boolean;
  }>;
};

const ABOUT_EDITOR_SECTIONS: AboutEditorSection[] = [
  {
    title: "Capa",
    fields: [
      { field: "hero_title", label: "Título da capa" },
      { field: "hero_subtitle", label: "Subtítulo da capa", multiline: true },
      { field: "hero_image_url", label: "URL da imagem de fundo" },
    ],
  },
  {
    title: "Introdução",
    fields: [
      { field: "about_title", label: "Título da seção" },
      { field: "about_description", label: "Texto da seção", multiline: true },
    ],
  },
  {
    title: "Cards",
    fields: [
      { field: "what_is_title", label: "Título do card 1" },
      { field: "what_is_description", label: "Texto do card 1", multiline: true },
      { field: "objectives_title", label: "Título do card 2" },
      { field: "objectives_description", label: "Texto do card 2", multiline: true },
      { field: "mission_title", label: "Título do card 3" },
      { field: "mission_description", label: "Texto do card 3", multiline: true },
    ],
  },
  {
    title: "Seções de membros",
    fields: [
      { field: "current_team_title", label: "Título dos membros atuais" },
      {
        field: "current_team_description",
        label: "Descrição dos membros atuais",
        multiline: true,
      },
      { field: "former_team_title", label: "Título dos membros anteriores" },
      {
        field: "former_team_description",
        label: "Descrição dos membros anteriores",
        multiline: true,
      },
    ],
  },
];

export default function About() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<AboutSettings>(DEFAULT_ABOUT_SETTINGS);
  const [team, setTeam] = useState<TeamUser[]>([]);
  const [formerTeam, setFormerTeam] = useState<TeamUser[]>([]);
  const [allUsers, setAllUsers] = useState<RegisteredUser[]>([]);
  const [selectedCurrentUser, setSelectedCurrentUser] = useState("");
  const [selectedFormerUser, setSelectedFormerUser] = useState("");
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsFeedback, setSettingsFeedback] = useState<Feedback | null>(null);
  const canEditAbout = hasPermission(session?.user, "canEditAbout");

  const fetchAboutSettings = useCallback(async () => {
    try {
      const response = await fetch("/api/about");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível carregar a página Sobre.");
      }

      setSettings((current) => ({ ...current, ...data }));
    } catch (error) {
      console.error("Erro ao carregar textos da página Sobre:", error);
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  const fetchTeam = useCallback(async () => {
    const response = await fetch("/api/team");

    if (!response.ok) {
      throw new Error("Não foi possível carregar a equipe.");
    }

    const data: TeamUser[] = await response.json();
    setTeam(data);
  }, []);

  const fetchFormerTeam = useCallback(async () => {
    const response = await fetch("/api/former-team");

    if (!response.ok) {
      throw new Error("Não foi possível carregar os membros anteriores.");
    }

    const data: TeamUser[] = await response.json();
    setFormerTeam(data);
  }, []);

  const fetchUsers = useCallback(async () => {
    const response = await fetch("/api/user");

    if (!response.ok) {
      throw new Error("Não foi possível carregar os usuários.");
    }

    const data: RegisteredUser[] = await response.json();
    setAllUsers(data);
  }, []);

  const refreshData = useCallback(async () => {
    if (canEditAbout) {
      await Promise.all([fetchTeam(), fetchFormerTeam(), fetchUsers()]);
      return;
    }

    await Promise.all([fetchTeam(), fetchFormerTeam()]);
  }, [canEditAbout, fetchFormerTeam, fetchTeam, fetchUsers]);

  useEffect(() => {
    fetchAboutSettings();
  }, [fetchAboutSettings]);

  useEffect(() => {
    refreshData().catch((error) => {
      console.error("Erro ao carregar dados da página Sobre:", error);
    });
  }, [refreshData]);

  function updateSettingsField(field: AboutSettingsField, value: string) {
    setSettings((current) => ({ ...current, [field]: value }));
  }

  async function handleSettingsSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingSettings(true);
    setSettingsFeedback(null);

    try {
      const response = await fetch("/api/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível salvar a página Sobre.");
      }

      setSettings((current) => ({ ...current, ...data }));
      setSettingsFeedback({
        type: "success",
        text: "Página Sobre atualizada com sucesso.",
      });
    } catch (error) {
      setSettingsFeedback({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Não foi possível salvar a página Sobre.",
      });
    } finally {
      setSavingSettings(false);
    }
  }

  const updateMembership = async (
    id: number,
    membership: "current" | "former",
    active: boolean
  ) => {
    setMembershipLoading(true);

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
      setMembershipLoading(false);
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
                  disabled={membershipLoading}
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
              disabled={membershipLoading || !selectedUser}
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

  const renderSettingsEditor = () => (
    <form
      onSubmit={handleSettingsSubmit}
      className="mt-8 space-y-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Editar conteúdo da página</h2>
          <p className="mt-1 text-sm text-slate-500">
            Atualize os textos, a imagem de capa e os títulos das seções exibidas ao público.
          </p>
        </div>
        {settingsLoading && (
          <span className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando
          </span>
        )}
      </div>

      {ABOUT_EDITOR_SECTIONS.map((section) => (
        <div key={section.title} className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800">{section.title}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {section.fields.map(({ field, label, multiline }) => (
              <div
                key={field}
                className={multiline ? "space-y-2 md:col-span-2" : "space-y-2"}
              >
                <Label htmlFor={field}>{label}</Label>
                {multiline ? (
                  <textarea
                    id={field}
                    value={settings[field]}
                    onChange={(event) => updateSettingsField(field, event.target.value)}
                    className="min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition-all duration-200 ease-out hover:border-slate-300 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                  />
                ) : (
                  <Input
                    id={field}
                    value={settings[field]}
                    onChange={(event) => updateSettingsField(field, event.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {settingsFeedback && (
        <p
          className={`text-sm font-medium ${
            settingsFeedback.type === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {settingsFeedback.text}
        </p>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          className="bg-blue-500 text-white hover:bg-blue-600"
          disabled={savingSettings || settingsLoading}
        >
          {savingSettings ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Salvar alterações
            </>
          )}
        </Button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen h-full px-4 py-8 sm:px-6 lg:px-16">
      <div
        className="min-h-[360px] w-full overflow-hidden rounded-2xl bg-cover bg-center shadow-lg sm:min-h-[440px] lg:min-h-[480px]"
        style={{
          backgroundImage: `url(${settings.hero_image_url || DEFAULT_ABOUT_SETTINGS.hero_image_url})`,
        }}
      >
        <div className="flex min-h-[360px] w-full flex-col items-center justify-center gap-4 bg-black/50 p-6 sm:min-h-[440px] sm:p-10 lg:min-h-[480px] lg:p-16">
          <h1 className="text-center text-3xl font-black text-white sm:text-5xl lg:text-6xl">
            {settings.hero_title}
          </h1>
          <h5 className="max-w-4xl text-center text-base font-medium text-slate-200 sm:text-lg">
            {settings.hero_subtitle}
          </h5>
        </div>
      </div>

      {canEditAbout && renderSettingsEditor()}

      <div className="mt-10 w-full py-6 sm:mt-16 sm:p-8">
        <h1 className="mb-4 text-3xl font-black text-slate-800 sm:text-4xl">
          {settings.about_title}
        </h1>
        <p className="text-slate-400">
          {settings.about_description}
        </p>
      </div>

      <div className="grid w-full grid-cols-1 gap-5 py-6 md:grid-cols-3 sm:p-8">
        <div className="flex flex-col items-start rounded-lg border border-slate-200 p-6 shadow-lg dark:border-slate-800">
          <Lightbulb size={36} className="mb-8 text-blue-500" />
          <h2 className="text-lg font-bold">{settings.what_is_title}</h2>
          <p className="text-slate-400">
            {settings.what_is_description}
          </p>
        </div>

        <div className="flex flex-col items-start rounded-lg border border-slate-200 p-6 shadow-lg dark:border-slate-800">
          <Flag size={36} className="mb-8 text-blue-500" />
          <h2 className="text-lg font-bold">{settings.objectives_title}</h2>
          <p className="text-slate-400">
            {settings.objectives_description}
          </p>
        </div>

        <div className="flex flex-col items-start rounded-lg border border-slate-200 p-6 shadow-lg dark:border-slate-800">
          <Rocket size={36} className="mb-8 text-blue-500" />
          <h2 className="text-lg font-bold">{settings.mission_title}</h2>
          <p className="text-slate-400">
            {settings.mission_description}
          </p>
        </div>
      </div>

      {renderMemberSection({
        title: settings.current_team_title,
        description: settings.current_team_description,
        members: team,
        selectedUser: selectedCurrentUser,
        setSelectedUser: setSelectedCurrentUser,
        availableUsers: availableCurrentUsers,
        membership: "current",
        addLabel: "Adicionar aos atuais",
        emptyLabel: "Nenhum membro atual cadastrado.",
      })}

      {renderMemberSection({
        title: settings.former_team_title,
        description: settings.former_team_description,
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
