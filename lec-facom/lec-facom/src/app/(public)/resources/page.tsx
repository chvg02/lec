'use client'
import { Cards } from "@/components/cards";
import { FilterBar } from "@/components/filterBar";
import { SearchBar } from "@/components/searchBar";
import { cards } from "@/mocks/card";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function Resources() {
    const [projetos, setProjetos] = useState<any[]>([]);
    const { data: session, status } = useSession();
    if (status === "loading") {
        return <p>Carregando...</p>;
    }

    if (session) {
        redirect('/resource')
    }


    useEffect(() => {
        fetch("api/project")
            .then(res => res.json())
            .then(data => setProjetos(data));
    }, []);

    const [selectedFilter, setSelectedFilter] = useState("Todos");


    return (
        <div className="flex-1 flex flex-col items-center gap-8 w-full mx-auto px-20 py-20 bg-slate-50">
            <div className="w-1/2 flex flex-col items-center gap-4">
                <h1 className="text-5xl font-black tracking-[-0.033em] text-slate-900">Recursos Educacionais</h1>
                <h5 className="text-slate-500 text-base font-normal leading-normal max-w-2xl text-center">Explore materiais didáticos, softwares educativos e outras ferramentas desenvolvidas pelo nosso laboratório para aprimorar o ensino e a aprendizagem da computação.</h5>
                <div className="mt-6 w-full flex flex-col items-center gap-4">
                    <SearchBar />
                    <FilterBar
                        items={["Todos", "Software", "Artigos", "Apostilas", "Videoaulas"]}
                        value={selectedFilter}
                        onSelect={(item) => setSelectedFilter(item)}
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {
                    projetos.filter(card => card.status === 'inProgress').map(card =>
                        <Cards
                            key={card.id}
                            id={card.id}
                            image={card.linkURL}
                            title={card.title}
                            description={card.content}
                            type={'project'}
                            status={card.status}

                        />
                    )
                }
            </div>
        </div>
    )
}