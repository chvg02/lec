CREATE TABLE "contact_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT NOT NULL DEFAULT 'Entre em Contato',
    "subtitle" TEXT NOT NULL DEFAULT 'Estamos abertos para duvidas, sugestoes e propostas de parceria. Utilize os canais abaixo ou preencha o formulario.',
    "address_title" TEXT NOT NULL DEFAULT 'Endereco',
    "address" TEXT NOT NULL DEFAULT 'Av. Costa e Silva - Pioneiros, Campo Grande - MS, 79070-900, Brasil',
    "phone_title" TEXT NOT NULL DEFAULT 'Telefone',
    "phone" TEXT NOT NULL DEFAULT '(67) 3345-7000',
    "email_title" TEXT NOT NULL DEFAULT 'E-mail',
    "email" TEXT NOT NULL DEFAULT 'contato.labeduc@ufms.br',
    "map_embed_url" TEXT NOT NULL DEFAULT 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3736.636601438964!2d-54.61869868507567!3d-20.5213609862768!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9486e63a5042686b%3A0x72a5aee97f7422a5!2sUniversidade%20Federal%20de%20Mato%20Grosso%20do%20Sul!5e0!3m2!1spt-BR!2sbr!4v1689278184517!5m2!1spt-BR!2sbr',
    "form_title" TEXT NOT NULL DEFAULT 'Envie uma Mensagem',
    "form_subtitle" TEXT NOT NULL DEFAULT 'Preencha os campos abaixo para nos contatar.',
    "recipient_email" TEXT NOT NULL DEFAULT 'vitor.aa01@gmail.com',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_settings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "contact_settings" (
    "id",
    "updated_at"
) VALUES (
    1,
    CURRENT_TIMESTAMP
) ON CONFLICT ("id") DO NOTHING;
