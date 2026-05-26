# LEC Facom

Aplicacao Next.js com Prisma, PostgreSQL e uploads persistentes.

## Rodando localmente

```bash
npm install
npm run dev
```

## Deploy em VM com Docker

O projeto esta preparado para subir a aplicacao, PostgreSQL, volume de uploads e backup automatico com Docker Compose.

### 1. Configurar variaveis

Opcionalmente copie o exemplo de variaveis do Compose para a raiz:

```bash
cp docker/compose.env.example .env
```

Edite `.env` para alterar porta publica, nome do banco e senha do Postgres:

```env
APP_PORT=3000
POSTGRES_DB=lec_facom
POSTGRES_USER=postgres
POSTGRES_PASSWORD=troque-esta-senha
POSTGRES_PUBLIC_PORT=5432
```

Depois edite `docker/app.env` com as variaveis da aplicacao:

```env
NEXTAUTH_URL=https://seu-dominio.com
NEXTAUTH_SECRET=gere-um-segredo-forte

SMTP_HOST=smtp.seu-provedor.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=usuario@dominio.com
SMTP_PASS=senha-ou-app-password
SMTP_FROM_EMAIL=usuario@dominio.com
SMTP_FROM_NAME=LEC Facom

DEFAULT_ADMIN_EMAIL=vitor.a.anjos@ufms.br
DEFAULT_ADMIN_PASSWORD="Echvgme0406#"
DEFAULT_ADMIN_NAME=vitor anjos
DEFAULT_ADMIN_RESET_PASSWORD=false
```

Gere um `NEXTAUTH_SECRET` forte com:

```bash
openssl rand -base64 32
```

### 2. Subir os containers

```bash
docker compose up -d --build
```

A aplicacao fica na porta definida em `APP_PORT` (`3000` por padrao).

### 3. Ver logs

```bash
docker compose logs -f app
```

### 4. Derrubar os containers

```bash
docker compose down
```

Use `docker compose down -v` apenas se quiser apagar tambem banco e uploads.

## O que o Docker faz ao iniciar

- Aguarda o Postgres aceitar conexoes.
- Executa `prisma migrate deploy`.
- Garante a existencia do usuario administrador inicial:
  - email: `vitor.a.anjos@ufms.br`
  - senha inicial: a definida em `DEFAULT_ADMIN_PASSWORD`
  - nome: `vitor anjos`
- Inicia o Next.js em `0.0.0.0:3000`.

Para desativar migrations ou seed automaticos, ajuste em `docker/app.env`:

```env
RUN_MIGRATIONS=false
ENSURE_DEFAULT_ADMIN=false
```

Por padrao, o seed nao troca a senha de um admin existente. Para forcar a senha do `DEFAULT_ADMIN_PASSWORD` em um restart:

```env
DEFAULT_ADMIN_RESET_PASSWORD=true
```

Para resetar a senha do admin padrao uma unica vez, sem deixar o restart sempre sobrescrevendo a senha:

```bash
docker compose exec app npm run db:reset-default-admin
```

Esse comando monta automaticamente a conexao do banco a partir das variaveis `POSTGRES_*` do container.

Depois que o administrador existir, ele pode trocar a senha pelo fluxo `Esqueci minha senha` na tela de login. Para isso funcionar em producao, mantenha `NEXTAUTH_URL` apontando para o dominio correto e configure as variaveis SMTP.

## Uploads

No Docker, os uploads sao salvos localmente em `/app/public/uploads` e persistidos no volume `uploads-data`.

Nao e necessario configurar Vercel Blob na VM. Se `BLOB_READ_WRITE_TOKEN` for definido, a API ainda consegue salvar no Vercel Blob, mas o fluxo padrao do Docker usa o volume local.

## Banco de dados

O Postgres fica no servico `db`. A aplicacao recebe automaticamente:

```env
DATABASE_URL=postgresql://POSTGRES_USER:POSTGRES_PASSWORD@db:5432/POSTGRES_DB?schema=public
```

O `DATABASE_URL` e montado pelo `docker/entrypoint.sh` a partir de `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_PORT` e `POSTGRES_DB`. A porta do banco e vinculada somente ao `127.0.0.1` da VM para evitar exposicao publica.

## Backup

O servico `backup` salva automaticamente:

- banco PostgreSQL em `backups/<data-hora>/database.dump`
- uploads em `backups/<data-hora>/uploads.tar.gz`

Por padrao, o backup roda uma vez por dia e remove backups com mais de 7 dias. Ajuste em `.env`:

```env
BACKUP_INTERVAL_SECONDS=86400
BACKUP_RETENTION_DAYS=7
```

Backup manual:

```bash
docker compose run --rm -e BACKUP_ONCE=true backup
```

Restaurar banco e uploads:

```bash
docker compose run --rm backup pg_restore -h db -U postgres -d lec_facom --clean --if-exists /backups/<data-hora>/database.dump
docker compose run --rm -v ./backups/<data-hora>/uploads.tar.gz:/restore/uploads.tar.gz -v lec-facom_uploads-data:/uploads postgres:16-alpine sh -c "rm -rf /uploads/* && tar -xzf /restore/uploads.tar.gz -C /uploads"
```

## Reverse proxy

Em producao, a forma comum e apontar Nginx, Caddy ou Traefik para `http://127.0.0.1:3000` e definir:

```env
NEXTAUTH_URL=https://seu-dominio.com
```

Garanta tambem que o firewall da VM exponha apenas as portas necessarias, normalmente `80`, `443` e, se desejado, a porta da aplicacao.
