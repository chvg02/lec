"use client";

import {
  Flag,
  ImageIcon,
  Lightbulb,
  Loader2,
  Pencil,
  Rocket,
  Save,
  Trash2,
  Upload,
  UserPlus,
  X,
} from "lucide-react";
import type { ChangeEvent, FocusEvent, KeyboardEvent } from "react";
import { createElement, useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
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

type EditableTextTag = "h1" | "h2" | "h5" | "p";

export default function About() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<AboutSettings>(DEFAULT_ABOUT_SETTINGS);
  const [draftSettings, setDraftSettings] =
    useState<AboutSettings>(DEFAULT_ABOUT_SETTINGS);
  const draftSettingsRef = useRef<AboutSettings>(DEFAULT_ABOUT_SETTINGS);
  const [team, setTeam] = useState<TeamUser[]>([]);
  const [formerTeam, setFormerTeam] = useState<TeamUser[]>([]);
  const [allUsers, setAllUsers] = useState<RegisteredUser[]>([]);
  const [selectedCurrentUser, setSelectedCurrentUser] = useState("");
  const [selectedFormerUser, setSelectedFormerUser] = useState("");
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsFeedback, setSettingsFeedback] = useState<Feedback | null>(null);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isHeroImagePickerOpen, setIsHeroImagePickerOpen] = useState(false);
  const [heroImageUrlDraft, setHeroImageUrlDraft] = useState(
    DEFAULT_ABOUT_SETTINGS.hero_image_url
  );
  const [uploadingHeroImage, setUploadingHeroImage] = useState(false);
  const heroImageFileInputRef = useRef<HTMLInputElement | null>(null);
  const canEditAbout = hasPermission(session?.user, "canEditAbout");

  const fetchAboutSettings = useCallback(async () => {
    try {
      const response = await fetch("/api/about");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível carregar a página Sobre.");
      }

      const nextSettings = { ...DEFAULT_ABOUT_SETTINGS, ...data };
      setSettings(nextSettings);
      setDraftSettings(nextSettings);
      draftSettingsRef.current = nextSettings;
      setHeroImageUrlDraft(nextSettings.hero_image_url);
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

  function updateDraftSettingsField(field: AboutSettingsField, value: string) {
    const nextSettings = { ...draftSettingsRef.current, [field]: value };
    draftSettingsRef.current = nextSettings;
    setDraftSettings(nextSettings);
  }

  function startEditingSettings() {
    setDraftSettings(settings);
    draftSettingsRef.current = settings;
    setHeroImageUrlDraft(settings.hero_image_url);
    setSettingsFeedback(null);
    setIsHeroImagePickerOpen(false);
    setIsEditingAbout(true);
  }

  function cancelEditingSettings() {
    setDraftSettings(settings);
    draftSettingsRef.current = settings;
    setHeroImageUrlDraft(settings.hero_image_url);
    setSettingsFeedback(null);
    setIsHeroImagePickerOpen(false);
    setIsEditingAbout(false);
  }

  function handleEditableBlur(
    field: AboutSettingsField,
    event: FocusEvent<HTMLElement>
  ) {
    updateDraftSettingsField(
      field,
      event.currentTarget.innerText.replace(/\u00a0/g, " ").trim()
    );
  }

  function handleSingleLineKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      event.currentTarget.blur();
    }
  }

  function handleHeroImageChange() {
    setHeroImageUrlDraft(draftSettingsRef.current.hero_image_url);
    setIsHeroImagePickerOpen((current) => !current);
  }

  function applyHeroImageUrl() {
    const nextImageUrl = heroImageUrlDraft.trim();

    if (!nextImageUrl) {
      setSettingsFeedback({
        type: "error",
        text: "Informe uma URL de imagem ou envie um arquivo.",
      });
      return;
    }

    updateDraftSettingsField("hero_image_url", nextImageUrl);
    setIsHeroImagePickerOpen(false);
    setSettingsFeedback({
      type: "success",
      text: "Imagem de capa alterada no rascunho. Clique em Salvar para publicar.",
    });
  }

  async function handleHeroImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setUploadingHeroImage(true);
    setSettingsFeedback(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploadType", "editor-image");

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível enviar a imagem.");
      }

      const imageUrl = data.imageUrl || data.fileUrl;

      if (!imageUrl) {
        throw new Error("O upload não retornou a URL da imagem.");
      }

      updateDraftSettingsField("hero_image_url", imageUrl);
      setHeroImageUrlDraft(imageUrl);
      setIsHeroImagePickerOpen(false);
      setSettingsFeedback({
        type: "success",
        text: "Imagem enviada e aplicada ao rascunho. Clique em Salvar para publicar.",
      });
    } catch (error) {
      setSettingsFeedback({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Não foi possível enviar a imagem.",
      });
    } finally {
      setUploadingHeroImage(false);
    }
  }

  async function handleSettingsSave() {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setSavingSettings(true);
    setSettingsFeedback(null);

    try {
      const response = await fetch("/api/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draftSettingsRef.current),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível salvar a página Sobre.");
      }

      const nextSettings = { ...DEFAULT_ABOUT_SETTINGS, ...data };
      setSettings(nextSettings);
      setDraftSettings(nextSettings);
      draftSettingsRef.current = nextSettings;
      setHeroImageUrlDraft(nextSettings.hero_image_url);
      setIsHeroImagePickerOpen(false);
      setIsEditingAbout(false);
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
  const displaySettings = isEditingAbout ? draftSettings : settings;

  function getEditableClassName(className: string, onDark = false) {
    if (!isEditingAbout) {
      return `${className} whitespace-pre-line break-words`;
    }

    const editableClasses = onDark
      ? "cursor-text rounded-lg px-2 py-1 outline outline-2 outline-white/50 transition-colors focus:bg-white/10 focus:outline-white"
      : "cursor-text rounded-lg px-2 py-1 outline outline-2 outline-blue-200 transition-colors focus:bg-blue-50/70 focus:outline-blue-500";

    return `${className} whitespace-pre-line break-words ${editableClasses}`;
  }

  function renderEditableText({
    field,
    tag,
    className,
    label,
    multiline = true,
    onDark = false,
  }: {
    field: AboutSettingsField;
    tag: EditableTextTag;
    className: string;
    label: string;
    multiline?: boolean;
    onDark?: boolean;
  }) {
    return createElement(
      tag,
      {
        className: getEditableClassName(className, onDark),
        contentEditable: isEditingAbout,
        suppressContentEditableWarning: true,
        role: isEditingAbout ? "textbox" : undefined,
        "aria-label": isEditingAbout ? label : undefined,
        "aria-multiline": isEditingAbout ? multiline : undefined,
        spellCheck: isEditingAbout,
        tabIndex: isEditingAbout ? 0 : undefined,
        onBlur: isEditingAbout
          ? (event: FocusEvent<HTMLElement>) => handleEditableBlur(field, event)
          : undefined,
        onKeyDown:
          isEditingAbout && !multiline ? handleSingleLineKeyDown : undefined,
      },
      displaySettings[field]
    );
  }

  const renderEditControls = () => {
    if (!canEditAbout) {
      return null;
    }

    return (
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-h-5">
          {settingsLoading && (
            <span className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando conteúdo
            </span>
          )}

          {settingsFeedback && (
            <p
              className={`text-sm font-medium ${
                settingsFeedback.type === "success"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {settingsFeedback.text}
            </p>
          )}
        </div>

        {isEditingAbout ? (
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={cancelEditingSettings}
              disabled={savingSettings}
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>
            <Button
              type="button"
              className="bg-blue-500 text-white hover:bg-blue-600"
              onClick={handleSettingsSave}
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
                  Salvar
                </>
              )}
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            className="self-end bg-blue-500 text-white hover:bg-blue-600"
            onClick={startEditingSettings}
            disabled={settingsLoading}
          >
            <Pencil className="h-4 w-4" />
            Editar página
          </Button>
        )}
      </div>
    );
  };

  const renderMemberSection = ({
    titleField,
    descriptionField,
    members,
    selectedUser,
    setSelectedUser,
    availableUsers,
    membership,
    addLabel,
    emptyLabel,
  }: {
    titleField: AboutSettingsField;
    descriptionField: AboutSettingsField;
    members: TeamUser[];
    selectedUser: string;
    setSelectedUser: (value: string) => void;
    availableUsers: RegisteredUser[];
    membership: "current" | "former";
    addLabel: string;
    emptyLabel: string;
  }) => (
    <div className="mt-12 flex flex-col items-center justify-center sm:mt-16">
      {renderEditableText({
        field: titleField,
        tag: "h1",
        className: "text-center text-3xl font-black sm:text-4xl lg:text-5xl",
        label: "Título da seção de membros",
        multiline: false,
      })}
      {renderEditableText({
        field: descriptionField,
        tag: "p",
        className:
          "mt-4 max-w-3xl text-center text-base text-slate-400 sm:text-lg",
        label: "Descrição da seção de membros",
      })}

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
                src={
                  user.profileImageUrl ||
                  `https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(
                    user.name
                  )}`
                }
                alt={user.name}
                className="aspect-square w-24 rounded-full border border-blue-400 object-cover"
              />
              <h1 className="mt-4 text-center text-lg font-black">{user.name}</h1>
              <h5 className="font-medium text-blue-500">
                {user.role === "admin" ? "Administrador" : "Membro"}
              </h5>
              <p className="mt-4 max-w-full break-words text-center text-slate-400">
                {user.email}
              </p>

              {canEditAbout && isEditingAbout && (
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

      {canEditAbout && isEditingAbout && (
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

  return (
    <div className="min-h-screen h-full px-4 py-8 sm:px-6 lg:px-16">
      {renderEditControls()}

      <div
        className="relative min-h-[360px] w-full overflow-hidden rounded-2xl bg-cover bg-center shadow-lg sm:min-h-[440px] lg:min-h-[480px]"
        style={{
          backgroundImage: `url(${
            displaySettings.hero_image_url || DEFAULT_ABOUT_SETTINGS.hero_image_url
          })`,
        }}
      >
        {canEditAbout && isEditingAbout && (
          <div className="absolute left-4 right-4 top-4 z-10 flex flex-col items-end gap-2 sm:left-auto">
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2 text-sm font-semibold text-slate-800 shadow-lg transition hover:bg-white"
              onClick={handleHeroImageChange}
            >
              <ImageIcon className="h-4 w-4" />
              Alterar imagem
            </button>

            {isHeroImagePickerOpen && (
              <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-slate-800 shadow-2xl sm:w-96">
                <label
                  htmlFor="about-hero-image-url"
                  className="text-sm font-semibold text-slate-700"
                >
                  URL da imagem
                </label>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <input
                    id="about-hero-image-url"
                    type="url"
                    value={heroImageUrlDraft}
                    onChange={(event) => setHeroImageUrlDraft(event.target.value)}
                    placeholder="https://..."
                    className="min-h-10 flex-1 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="bg-blue-500 text-white hover:bg-blue-600"
                    onClick={applyHeroImageUrl}
                  >
                    Usar URL
                  </Button>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs font-semibold uppercase text-slate-400">
                    ou
                  </span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <input
                  ref={heroImageFileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="sr-only"
                  onChange={handleHeroImageUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3 w-full"
                  onClick={() => heroImageFileInputRef.current?.click()}
                  disabled={uploadingHeroImage}
                >
                  {uploadingHeroImage ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Fazer upload
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="flex min-h-[360px] w-full flex-col items-center justify-center gap-4 bg-black/50 p-6 sm:min-h-[440px] sm:p-10 lg:min-h-[480px] lg:p-16">
          {renderEditableText({
            field: "hero_title",
            tag: "h1",
            className:
              "text-center text-3xl font-black text-white sm:text-5xl lg:text-6xl",
            label: "Título da capa",
            multiline: false,
            onDark: true,
          })}
          {renderEditableText({
            field: "hero_subtitle",
            tag: "h5",
            className:
              "max-w-4xl text-center text-base font-medium text-slate-200 sm:text-lg",
            label: "Subtítulo da capa",
            onDark: true,
          })}
        </div>
      </div>

      <div className="mt-10 w-full py-6 sm:mt-16 sm:p-8">
        {renderEditableText({
          field: "about_title",
          tag: "h1",
          className: "mb-4 text-3xl font-black text-slate-800 sm:text-4xl",
          label: "Título da seção Sobre",
          multiline: false,
        })}
        {renderEditableText({
          field: "about_description",
          tag: "p",
          className: "text-slate-400",
          label: "Texto da seção Sobre",
        })}
      </div>

      <div className="grid w-full grid-cols-1 gap-5 py-6 md:grid-cols-3 sm:p-8">
        <div className="flex flex-col items-start rounded-lg border border-slate-200 p-6 shadow-lg dark:border-slate-800">
          <Lightbulb size={36} className="mb-8 text-blue-500" />
          {renderEditableText({
            field: "what_is_title",
            tag: "h2",
            className: "text-lg font-bold",
            label: "Título do card O que é o LEC",
            multiline: false,
          })}
          {renderEditableText({
            field: "what_is_description",
            tag: "p",
            className: "text-slate-400",
            label: "Texto do card O que é o LEC",
          })}
        </div>

        <div className="flex flex-col items-start rounded-lg border border-slate-200 p-6 shadow-lg dark:border-slate-800">
          <Flag size={36} className="mb-8 text-blue-500" />
          {renderEditableText({
            field: "objectives_title",
            tag: "h2",
            className: "text-lg font-bold",
            label: "Título do card Objetivos",
            multiline: false,
          })}
          {renderEditableText({
            field: "objectives_description",
            tag: "p",
            className: "text-slate-400",
            label: "Texto do card Objetivos",
          })}
        </div>

        <div className="flex flex-col items-start rounded-lg border border-slate-200 p-6 shadow-lg dark:border-slate-800">
          <Rocket size={36} className="mb-8 text-blue-500" />
          {renderEditableText({
            field: "mission_title",
            tag: "h2",
            className: "text-lg font-bold",
            label: "Título do card Missão",
            multiline: false,
          })}
          {renderEditableText({
            field: "mission_description",
            tag: "p",
            className: "text-slate-400",
            label: "Texto do card Missão",
          })}
        </div>
      </div>

      {renderMemberSection({
        titleField: "current_team_title",
        descriptionField: "current_team_description",
        members: team,
        selectedUser: selectedCurrentUser,
        setSelectedUser: setSelectedCurrentUser,
        availableUsers: availableCurrentUsers,
        membership: "current",
        addLabel: "Adicionar aos atuais",
        emptyLabel: "Nenhum membro atual cadastrado.",
      })}

      {renderMemberSection({
        titleField: "former_team_title",
        descriptionField: "former_team_description",
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
