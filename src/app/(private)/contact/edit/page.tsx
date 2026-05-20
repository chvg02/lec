"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hasPermission } from "@/lib/permissions";

type ContactSettingsForm = {
  title: string;
  subtitle: string;
  address_title: string;
  address: string;
  phone_title: string;
  phone: string;
  email_title: string;
  email: string;
  map_embed_url: string;
  form_title: string;
  form_subtitle: string;
  recipient_email: string;
};

const initialSettings: ContactSettingsForm = {
  title: "Entre em Contato",
  subtitle:
    "Estamos abertos para dúvidas, sugestões e propostas de parceria. Utilize os canais abaixo ou preencha o formulario.",
  address_title: "Endereço",
  address: "Av. Costa e Silva - Pioneiros, Campo Grande - MS, 79070-900, Brasil",
  phone_title: "Telefone",
  phone: "(67) 3345-7000",
  email_title: "E-mail",
  email: "contato.labeduc@ufms.br",
  map_embed_url:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3736.636601438964!2d-54.61869868507567!3d-20.5213609862768!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9486e63a5042686b%3A0x72a5aee97f7422a5!2sUniversidade%20Federal%20de%20Mato%20Grosso%20do%20Sul!5e0!3m2!1spt-BR!2sbr!4v1689278184517!5m2!1spt-BR!2sbr",
  form_title: "Envie uma Mensagem",
  form_subtitle: "Preencha os campos abaixo para nos contatar.",
  recipient_email: "vitor.aa01@gmail.com",
};

export default function EditContactPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [settings, setSettings] = useState<ContactSettingsForm>(initialSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (!hasPermission(session?.user, "canEditContact")) {
      router.replace("/dashboard");
      return;
    }

    async function fetchSettings() {
      try {
        const response = await fetch("/api/contact");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Não foi possível carregar os campos.");
        }

        setSettings((current) => ({ ...current, ...data }));
      } catch (error) {
        setFeedback({
          type: "error",
          text:
            error instanceof Error
              ? error.message
              : "Não foi possível carregar os campos.",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, [router, session, status]);

  function updateField(field: keyof ContactSettingsForm, value: string) {
    setSettings((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível salvar os campos.");
      }

      setSettings((current) => ({ ...current, ...data }));
      setFeedback({ type: "success", text: "Campos de contato atualizados com sucesso." });
    } catch (error) {
      setFeedback({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Não foi possível salvar os campos.",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-96 w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">Editar Contato</h1>
        <p className="mt-2 text-slate-500">
          Altere os campos exibidos nos cards da página de contato.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="address_title">Título do endereço</Label>
            <Input
              id="address_title"
              value={settings.address_title}
              onChange={(event) => updateField("address_title", event.target.value)}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Endereço</Label>
            <textarea
              id="address"
              value={settings.address}
              onChange={(event) => updateField("address", event.target.value)}
              className="min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition-all duration-200 ease-out hover:border-slate-300 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_title">Título do telefone</Label>
            <Input
              id="phone_title"
              value={settings.phone_title}
              onChange={(event) => updateField("phone_title", event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={settings.phone}
              onChange={(event) => updateField("phone", event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email_title">Título do e-mail</Label>
            <Input
              id="email_title"
              value={settings.email_title}
              onChange={(event) => updateField("email_title", event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail exibido</Label>
            <Input
              id="email"
              type="email"
              value={settings.email}
              onChange={(event) => updateField("email", event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipient_email">E-mail que recebe as mensagens</Label>
            <Input
              id="recipient_email"
              type="email"
              value={settings.recipient_email}
              onChange={(event) => updateField("recipient_email", event.target.value)}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="map_embed_url">Link do mapa incorporado</Label>
            <textarea
              id="map_embed_url"
              value={settings.map_embed_url}
              onChange={(event) => updateField("map_embed_url", event.target.value)}
              className="min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition-all duration-200 ease-out hover:border-slate-300 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </div>

        {feedback && (
          <p
            className={`text-sm font-medium ${
              feedback.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {feedback.text}
          </p>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-blue-500 text-white hover:bg-blue-600"
            disabled={saving}
          >
            {saving ? (
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
    </div>
  );
}
