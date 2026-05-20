
import { Cards } from "./cards"
import { cards } from "@/mocks/card"
import { TabsContent,Tabs } from "@/components/ui/tabs"

export const SectionHeader =()=> {

    return (
        <section className="py-16 sm:py-24 bg-slate-100 dark:bg-slate-900/50" id="pesquisas">
        <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col items-center text-center gap-4 mb-12">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Linhas de Pesquisa</h2>
        <p className="max-w-2xl text-base">Exploramos diversas áreas para avançar o conhecimento e a prática na educação em computação.</p>
        </div>
        <Tabs defaultValue="pesquisas" className="w-full">
        <TabsContent value="pesquisas" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {
                        cards.filter(card => card.type === 'inProgress').slice(0,3).map(card =>
                            <Cards
                                key={card.id}
                                id={card.id}
                                image={card.image}
                                title={card.title}
                                description={card.description}
                                type={'project'}
                                status={'inProgress'}
                                href={card.href}
                            />
                        )
                    }
                </TabsContent>
                </Tabs>
        </div>
        </section>
    )
}