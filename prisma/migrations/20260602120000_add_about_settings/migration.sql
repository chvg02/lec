CREATE TABLE "about_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "hero_title" TEXT NOT NULL DEFAULT 'Conheça o Laboratório de Educação em Computação',
    "hero_subtitle" TEXT NOT NULL DEFAULT 'Pesquisando e desenvolvendo o futuro do ensino de computação, desde a educação básica até o ensino superior.',
    "hero_image_url" TEXT NOT NULL DEFAULT 'https://www.ufms.br/wp-content/uploads/2021/02/UFMS.1.jpg',
    "about_title" TEXT NOT NULL DEFAULT 'Sobre o Laboratório',
    "about_description" TEXT NOT NULL DEFAULT 'O Laboratório de Educação em Computação (LEC) é um espaço dedicado à pesquisa e ao desenvolvimento de práticas pedagógicas inovadoras para o ensino e a aprendizagem da computação em diversos níveis de ensino.',
    "what_is_title" TEXT NOT NULL DEFAULT 'O que é o LEC?',
    "what_is_description" TEXT NOT NULL DEFAULT 'Um centro de excelência focado na interseção entre educação e tecnologia, buscando criar soluções que transformem o ensino da computação.',
    "objectives_title" TEXT NOT NULL DEFAULT 'Nossos Objetivos',
    "objectives_description" TEXT NOT NULL DEFAULT 'Fomentar a pesquisa, desenvolver metodologias de ensino eficazes e promover a inclusão digital através da educação em computação.',
    "mission_title" TEXT NOT NULL DEFAULT 'Nossa Missão',
    "mission_description" TEXT NOT NULL DEFAULT 'Capacitar educadores e estudantes com as ferramentas e conhecimentos necessários para prosperar em um mundo cada vez mais digital.',
    "current_team_title" TEXT NOT NULL DEFAULT 'Membros atuais',
    "current_team_description" TEXT NOT NULL DEFAULT 'Profissionais e estudantes dedicados que impulsionam a inovação no ensino de computação.',
    "former_team_title" TEXT NOT NULL DEFAULT 'Membros anteriores',
    "former_team_description" TEXT NOT NULL DEFAULT 'Pessoas que contribuíram para a trajetória do laboratório e para seus projetos.',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "about_settings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "about_settings" (
    "id",
    "updated_at"
) VALUES (
    1,
    CURRENT_TIMESTAMP
) ON CONFLICT ("id") DO NOTHING;
