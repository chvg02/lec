'use client';

import { Cards } from "@/components/cards";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { articles } from "@/mocks/article";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";

export default function Projects() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [projetos, setProjetos] = useState<any[]>([]);

  // Carregar os projetos quando logado
  useEffect(() => {
    fetch("/api/project")
      .then(res => res.json())
      .then(data => setProjetos(data));
  }, []);


    return (
        <div className="flex-1 flex flex-col items-center gap-8 w-4/5 mx-auto px-4 py-8">
            <div className="flex-1 flex flex-row items-center gap-8 w-4/5 mx-auto px-4 py-8">
            <div className="w-full flex flex-col items-start gap-4">
                <h1 className="text-4xl font-black tracking-[-0.033em] text-slate-900">Pesquisa & Projetos</h1>
                <h5 className="text-slate-500 text-base font-normal leading-normal max-w-2xl">Explore nossas investigações em andamento e projetos inovadores que moldam o futuro da educação em computação.</h5>
                </div>
                <div className="flex flex-col items-end justify-end ml-auto self-end">
                    <Link href="/newProject">
                    <Button  className="relative z-20 rounded-full bg-[#0088b7] hover:bg-[#0077a3]/90 transition-colors">Novo Projeto</Button>
                    </Link>
                </div>
            </div>
            <Tabs defaultValue="pesquisas" className="w-full">
                <TabsList className="w-full">
                    <TabsTrigger
                        value="pesquisas"
                        className="w-full data-[state=active]:text-blue-400 data-[state=active]:font-bold data-[state=inactive]:text-slate-400"
                    >
                        Pesquisas em Andamento</TabsTrigger>
                    <TabsTrigger
                        value="concluidos"
                        className="w-full data-[state=active]:text-blue-400 data-[state=active]:font-bold data-[state=inactive]:text-slate-400"
                    >
                        Projetos Concluídos</TabsTrigger>
                </TabsList>
                <TabsContent value="pesquisas" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {    projetos.filter(card=>card.status==='inProgress').map(card=>
                        <Cards
                        
                                key={card.id}
                                id={card.id}
                                image={card.linkURL}
                                title={card.title}
                                status={card.status}
                                description={card.content}
                                type={'project'}
                            />
                    )}
                </TabsContent>
                <TabsContent value="concluidos" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {
                        projetos.filter(card=>card.status==='done').map(card=>
                        <Cards
                                key={card.id}
                                id={card.id}
                                image={card.linkURL}
                                title={card.title}
                                status={card.status}
                                description={card.content}
                                type={'project'}
                            />
                        )
                    }
                </TabsContent>
            </Tabs>
            <div className="w-full flex flex-col items-start gap-4 pt-8 border-top-slate-200 border-t">
                <h1 className="text-2xl font-bold tracking-[-0.033em] text-slate-900">Publicações Recentes</h1>
                <div className="w-full flex flex-col">
                    {articles.map((article, index) =>
                        <div key={index} className="p-4 border-b hover:rounded-md border-slate-200 hover:bg-slate-100 transition-all duration-200 cursor-pointer flex flex-row items-center justify-between">
                            <div className="flex flex-col items-start gap-2">
                                <h3 className="text-md font-bold">{article.title}</h3>
                                <p className="text-sm font-medium text-slate-500">{article.authors}</p>
                            </div>
                            <Button className="bg-blue-500 font-bold text-xs uppercase hover:bg-blue-700">
                                <FileText size={16}/>
                                Ver Artigo
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}