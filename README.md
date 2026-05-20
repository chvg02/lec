# LEC Facom

Aplicacao Next.js com Prisma e PostgreSQL.

## Rodando localmente

```bash
npm install
npm run dev
```

## Rodando com Docker

O projeto ja esta preparado para subir a aplicacao e o banco via Docker Compose.

### Subir os containers

```bash
npm run docker:up
```

Ou diretamente:

```bash
docker compose up --build
```

A aplicacao fica em `http://localhost:3000` e o PostgreSQL em `localhost:5432`.

### Derrubar os containers

```bash
npm run docker:down
```

### Ver logs

```bash
npm run docker:logs
```

## Backup local

O Docker Compose inclui o servico `backup`, que salva automaticamente:

- o banco PostgreSQL em `backups/<data-hora>/database.dump`
- os arquivos enviados em `backups/<data-hora>/uploads.tar.gz`

Por padrao, o backup roda uma vez por dia e remove backups com mais de 7 dias. Esses valores ficam em `docker-compose.yml`:

- `BACKUP_INTERVAL_SECONDS: 86400`
- `BACKUP_RETENTION_DAYS: 7`

### Rodar um backup manual

Com os containers ativos:

```bash
docker compose run --rm -e BACKUP_ONCE=true backup
```

### Restaurar banco e uploads

Substitua `<data-hora>` pela pasta do backup desejado:

```bash
docker compose run --rm backup pg_restore -h db -U postgres -d lec_facom --clean --if-exists /backups/<data-hora>/database.dump
docker compose run --rm -v ./backups/<data-hora>/uploads.tar.gz:/restore/uploads.tar.gz -v lec-facom_uploads-data:/uploads postgres:16-alpine sh -c "rm -rf /uploads/* && tar -xzf /restore/uploads.tar.gz -C /uploads"
```

## Variaveis de ambiente do Docker

O Compose usa o arquivo `docker/app.env`.

Ajuste principalmente:

- `NEXTAUTH_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

O `DATABASE_URL` do container da aplicacao ja e injetado automaticamente pelo `docker-compose.yml`.

## Uploads no Vercel

Em producao na Vercel, os uploads precisam de armazenamento persistente. Crie um Vercel Blob Store publico no projeto e garanta que a variavel `BLOB_READ_WRITE_TOKEN` esteja vinculada aos ambientes usados pelo deploy.

Sem essa variavel, a rota `/api/upload` retorna erro informando que o Blob nao esta configurado. No desenvolvimento local, quando `BLOB_READ_WRITE_TOKEN` nao existe, os arquivos continuam sendo salvos em `public/uploads`.

As imagens inseridas no editor e os arquivos de recursos usam client upload do Vercel Blob para contornar o limite de 4.5 MB das Vercel Functions. Nesse fluxo, o arquivo sai direto do navegador para o Blob, e a API `/api/upload/client` gera apenas o token temporario de envio. Recursos aceitam arquivos de ate 100 MB.

## Banco Neon na Vercel

Use a URL com pooler do Neon em `DATABASE_URL`, normalmente com `-pooler` no host e `sslmode=require`. Exemplo:

```env
DATABASE_URL="postgresql://usuario:senha@ep-exemplo-pooler.regiao.aws.neon.tech/neondb?sslmode=require"
```

Para migrations e comandos Prisma CLI, mantenha tambem uma URL direta sem pooler em `DATABASE_URL_UNPOOLED` ou `POSTGRES_URL_NON_POOLING`.

## Observacoes

- As migrations do Prisma sao aplicadas automaticamente quando o container da app sobe.
- Os uploads enviados para `public/uploads` ficam persistidos no volume `uploads-data`.
- Os dados do PostgreSQL ficam persistidos no volume `postgres-data`.
