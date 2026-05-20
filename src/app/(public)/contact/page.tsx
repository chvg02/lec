"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Loader2, Mail, MapPin, Pencil, Phone } from "lucide-react";

import { Input } from "@/components/input";
import { TextArea } from "@/components/TextArea";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/permissions";

type ContactForm = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type ContactSettings = {
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
};

const initialForm: ContactForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const defaultSettings: ContactSettings = {
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
};

export default function Contact() {
  const { data: session } = useSession();
  const [form, setForm] = useState<ContactForm>(initialForm);
  const [settings, setSettings] = useState<ContactSettings>(defaultSettings);
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const canEditContact = hasPermission(session?.user, "canEditContact");

  useEffect(() => {
    async function fetchContactSettings() {
      try {
        const response = await fetch("/api/contact");

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        setSettings((current) => ({ ...current, ...data }));
      } catch (error) {
        console.error("Erro ao carregar campos de contato:", error);
      }
    }

    fetchContactSettings();
  }, []);

  function updateField(field: keyof ContactForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSending(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível enviar a mensagem.");
      }

      setFeedback({
        type: "success",
        text: "Mensagem enviada com sucesso. Em breve entraremos em contato.",
      });
      setForm(initialForm);
    } catch (error) {
      setFeedback({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Não foi possível enviar a mensagem.",
      });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="mx-auto flex w-full flex-1 flex-col items-center gap-8 bg-slate-50 px-20 py-20">
      <div className="relative flex w-full flex-col items-center gap-4">
        {canEditContact && (
          <Button asChild variant="outline" className="order-3 gap-2 md:absolute md:right-0 md:top-0 md:order-none">
            <Link href="/contact/edit">
              <Pencil className="h-4 w-4" />
              Editar contato
            </Link>
          </Button>
        )}
        <h1 className="text-5xl font-black tracking-[-0.033em] text-slate-900">
          {settings.title}
        </h1>
        <h5 className="max-w-2xl text-center text-base font-normal leading-normal text-slate-500">
          {settings.subtitle}
        </h5>
      </div>
      <div className="mt-6 grid w-full grid-cols-2 gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex w-full flex-row items-center justify-between gap-4 rounded-xl border bg-white p-4 shadow-sm">
            <div className="rounded-xl bg-blue-100 p-4 text-blue-500">
              <MapPin size={20} />
            </div>
            <div className="flex flex-1 flex-col items-start">
              <h3 className="text-base font-bold">{settings.address_title}</h3>
              <h5 className="text-sm font-light">
                {settings.address}
              </h5>
            </div>
          </div>
          <div className="flex w-full flex-row items-center justify-between gap-4 rounded-xl border bg-white p-4 shadow-sm">
            <div className="rounded-xl bg-blue-100 p-4 text-blue-500">
              <Phone size={20} />
            </div>
            <div className="flex flex-1 flex-col items-start">
              <h3 className="text-base font-bold">{settings.phone_title}</h3>
              <h5 className="text-sm font-light">{settings.phone}</h5>
            </div>
          </div>
          <div className="flex w-full flex-row items-center justify-between gap-4 rounded-xl border bg-white p-4 shadow-sm">
            <div className="rounded-xl bg-blue-100 p-4 text-blue-500">
              <Mail size={20} />
            </div>
            <div className="flex flex-1 flex-col items-start">
              <h3 className="text-base font-bold">{settings.email_title}</h3>
              <h5 className="text-sm font-light">{settings.email}</h5>
            </div>
          </div>
          <div className="h-96 w-full overflow-hidden rounded-xl border shadow-sm">
            <iframe
              allowFullScreen
              height="100%"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={settings.map_embed_url}
              width="100%"
            ></iframe>
          </div>
        </div>
        <div className="flex w-full flex-1 flex-col items-start gap-4 rounded-xl border bg-white p-8 shadow-sm">
          <div className="flex w-full flex-col items-start gap-1">
            <h1 className="text-2xl font-black">{settings.form_title}</h1>
            <h3 className="font-light">
              {settings.form_subtitle}
            </h3>
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex w-full flex-1 flex-col justify-end gap-6"
          >
            <Input
              label="Nome Completo"
              placeholder="Seu nome completo"
              type="text"
              required
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
            />
            <Input
              label="E-mail"
              placeholder="seu@email.com"
              type="email"
              required
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
            />
            <Input
              label="Assunto"
              placeholder="Assunto da mensagem"
              type="text"
              required
              value={form.subject}
              onChange={(event) => updateField("subject", event.target.value)}
            />
            <TextArea
              label="Mensagem"
              placeholder="Escreva sua mensagem aqui..."
              required
              rows={6}
              value={form.message}
              onChange={(event) => updateField("message", event.target.value)}
            />

            {feedback && (
              <p
                className={`text-sm ${
                  feedback.type === "success" ? "text-green-600" : "text-red-600"
                }`}
              >
                {feedback.text}
              </p>
            )}

            <Button
              type="submit"
              disabled={isSending}
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Mensagem"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
