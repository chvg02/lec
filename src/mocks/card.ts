export type CardProps = {
    id: number,
    image?: string;
    title: string;
    description: string;
    type: "inProgress" | "done"
    href?: string;
}

export const cards: CardProps[]= [
    {
        id: 1,
        image: '/markus-spiske-iar-afB0QQw-unsplash.jpg',
        title: 'Pesquisas e Projetos',
        description: 'Conheça iniciativas de pesquisa e projetos aplicados no ensino de computação.',
        type: 'inProgress',
    },
    {
        id: 2,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBY7NFfYlH8hD1f5c07Z_UlhAJn1GuQ3tXdcxQ3op4FSb1omc7QSizNXbJpZU3kk3BbMHMtElqQVjpjikxn1hsyzedwwvoRo_s5REAeX06zduohy8OdwLP8bEuN3ScyQI64KeBIrIDMlK-XZS14yk_o65fstmw7e0yEd6h4deodMGmc-D68-WoXZGE2P1Rk_MC_X6ykwTvYH6QfgkuTJpDxHLiPVPiVsHC0qI1JBYhy2JfSefMTJmETJ_eJcmI0x7gULGWzLbUJ3g',
        title: 'Ensino de Programação para Crianças',
        description: 'Desenvolvimento de metodologias e ferramentas lúdicas para introduzir conceitos de programação.',
        type: 'inProgress'
    },
    {
        id: 3, 
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVJGGqk6Cp8EaH9jAZXbbOAYDtCkHRMxpLupfzCLh97psFM0twmEZAZAZivtBCjGnFI9xt2VPc8kU_dDofbVYjasMSxAwKkeTvbpDtdm5loGZONw5_CQXSRimdK62-RFL1LMDxYZPFpowTgW0VpTHzESf7CWUEfX5sAzNfECeEdKYddib-AedFseU3Nul3g4o-HXwWZpi11PruXYXN_G85iYlX9o_C9oqp9nO8V8bHw8pm43QvhoMQpInuU_V4qP9YRjYi8pU2fA',
        title: 'Gamificação no Aprendizado',
        description: 'Aplicação de elementos de jogos para aumentar o engajamento e a motivação dos alunos.',
        type: 'inProgress'
    },
    {
        id: 4,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDZX_NxLBHT6o_ewP71Bnm7bou-ouEH-fsTwPidXgIU5TLuh0CD9013_NcMTZFijZXxgudSX8PDomU8nAZBwKjJjWhQMYrDLxMdBqcqZK3XovcAo1BOTCl8rnk607jccOk4tMUnF4TgMIh8Z_L18JqtV1meCn__2mK3HcvPL47stVIpuDasjmSWLrYNHUTdg6xSEY3ivM6fD7CwcJ8ELWy9f8paSFXGk2FIetKTH0T0sh57k_IJwLntlMNQAIFEouWMa1707Opv5A',
        title: 'Computação Desplugada',
        description: 'Criando atividades que ensinam conceitos computacionais sem o uso de computadores.',
        type: 'inProgress'
    },
    {
        id: 5,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLTWuQjKqJt7G3RvouEZgxhpILxcGpLaYSNwBm08nhYRjjYhWmdFqTN8C51Au5xdcrtY0izYtJ0D46iPh0c6Ng3Khz5Nl1OglirBrkFzLrl7TSEYulq_iRiI6FAtLEAv9uxBVWkYmo1jD9qXOMveMI3qrBaRjnj601iRXcIVaPMx_NIk-09yxsy-e0cHwWDOubgvNZyWjuBLRPHXMp6lZfrnHw8N8dtooECXDcqK4pWHF3tFQqD_2tzyVqETiIy5vu9oLVXbd2ag',
        title: 'Ferramentas de Avaliação Automatizada',
        description: 'Desenvolvendo sistemas para automatizar a correção e o feedback de exercícios de programação.',
        type: 'done'
    },
    {
        id: 6,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB62WD2WeQnVbHygLCH6CAf4trwQmctBp6z-S1NDOOeSMZV5RbtGCOAULNCAKzPLcr9pVYzNZdadpQ1RSNCnJ6wjh3qKaIJOJJYNwYwdTi3QtHFsmDhdaTDAyXly074smgpdfRubO_KpQqS9TQQrWFWZQ2DoKyLQ_hKiwdSJIiPFQNt9p0-gaTe0wR5jGMVfmiQ_60hkbq65DLsIk-6fLqMBOxKiY8UPf_wUQo2E68iYCKcqzoZCaDYvRjZ3m4xWhDnSsH-Les0oQ',
        title: 'Realidade Virtual para Ensino',
        description: 'Explorando o potencial da realidade virtual e aumentada como ferramenta pedagógica.',
        type: 'done'
    },
    
]