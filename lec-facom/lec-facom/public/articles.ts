export type ArticleProps = {
    title: string,
    authors: string,
    href?: string,
}

export const articles : ArticleProps[] = [
    {
        title: "A Framework for Integrating Computational Thinking into K-12 Curricula",
        authors: "Silva, J., Souza, A., Pereira, M. (2023). Journal of Computer Science Education, 29(3), 123-145.",
        href: "#"
    },
    {
        title: "Gamified Learning Environments: A Longitudinal Study on Student Engagement",
        authors: "Costa, F., Lima, R. (2022). Proceedings of the 53rd ACM Technical Symposium on Computer Science Education.",
        href: "#"
    },
    {
        title: "Unplugged Activities for Teaching Sorting Algorithms to Young Learners",
        authors: "Nascimento, E., Oliveira, G. (2021). IEEE Transactions on Education, 64(2), 98-105.",
        href: "#"
    }
]
