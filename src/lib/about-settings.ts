export type AboutSettings = {
  id?: number;
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string;
  about_title: string;
  about_description: string;
  what_is_title: string;
  what_is_description: string;
  objectives_title: string;
  objectives_description: string;
  mission_title: string;
  mission_description: string;
  current_team_title: string;
  current_team_description: string;
  former_team_title: string;
  former_team_description: string;
};

export type AboutSettingsField = Exclude<keyof AboutSettings, "id">;

export const DEFAULT_ABOUT_SETTINGS: AboutSettings = {
  id: 1,
  hero_title: "Conheça o Laboratório de Educação em Computação",
  hero_subtitle:
    "Pesquisando e desenvolvendo o futuro do ensino de computação, desde a educação básica até o ensino superior.",
  hero_image_url: "https://www.ufms.br/wp-content/uploads/2021/02/UFMS.1.jpg",
  about_title: "Sobre o Laboratório",
  about_description:
    "O Laboratório de Educação em Computação (LEC) é um espaço dedicado à pesquisa e ao desenvolvimento de práticas pedagógicas inovadoras para o ensino e a aprendizagem da computação em diversos níveis de ensino.",
  what_is_title: "O que é o LEC?",
  what_is_description:
    "Um centro de excelência focado na interseção entre educação e tecnologia, buscando criar soluções que transformem o ensino da computação.",
  objectives_title: "Nossos Objetivos",
  objectives_description:
    "Fomentar a pesquisa, desenvolver metodologias de ensino eficazes e promover a inclusão digital através da educação em computação.",
  mission_title: "Nossa Missão",
  mission_description:
    "Capacitar educadores e estudantes com as ferramentas e conhecimentos necessários para prosperar em um mundo cada vez mais digital.",
  current_team_title: "Membros atuais",
  current_team_description:
    "Profissionais e estudantes dedicados que impulsionam a inovação no ensino de computação.",
  former_team_title: "Membros anteriores",
  former_team_description:
    "Pessoas que contribuíram para a trajetória do laboratório e para seus projetos.",
};

export const ABOUT_SETTINGS_FIELD_LIMITS: Record<AboutSettingsField, number> = {
  hero_title: 180,
  hero_subtitle: 500,
  hero_image_url: 2000,
  about_title: 120,
  about_description: 1200,
  what_is_title: 120,
  what_is_description: 700,
  objectives_title: 120,
  objectives_description: 700,
  mission_title: 120,
  mission_description: 700,
  current_team_title: 120,
  current_team_description: 500,
  former_team_title: 120,
  former_team_description: 500,
};

export const ABOUT_SETTINGS_FIELDS = Object.keys(
  ABOUT_SETTINGS_FIELD_LIMITS
) as AboutSettingsField[];
