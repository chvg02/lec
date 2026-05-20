import { Mail, MapPin } from "lucide-react"

export const Footer =() =>{

    return(
        <footer className="bg-slate-900 text-slate-300" id="contato">
            <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="size-6 text-background-light">
                            </div>
                        <h2 className="text-lg font-bold text-white">LEC/UFMS</h2>
                        </div>
                    <p className="text-sm max-w-sm">Laboratório de Educação em Computação da Universidade Federal de Mato Grosso do Sul.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-white mb-4">Contato</h3>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                                <MapPin size={30}/>
                                <span>Av. Costa e Silva, s/n - Pioneiros, Campo Grande - MS, 79070-900</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Mail size={20} ></Mail>
                                <a className="hover:text-white" href="mailto:contato.lec@ufms.br">contato.lec@ufms.br</a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 border-t border-slate-800 pt-8 text-center text-sm">
                    <p>© 2024 LEC/UFMS. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    )

}
