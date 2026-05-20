import { Input } from "@/components/input";
import { TextArea } from "@/components/TextArea";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Phone } from "lucide-react";

export default function Contact() {
    return (
        <div className="flex-1 flex flex-col items-center gap-8 w-full mx-auto px-20 py-20 bg-slate-50">
            <div className="w-full flex flex-col items-center gap-4">
                <h1 className="text-5xl font-black tracking-[-0.033em] text-slate-900">Entre em Contato</h1>
                <h5 className="text-slate-500 text-base font-normal leading-normal max-w-2xl text-center">Estamos abertos para dúvidas, sugestões e propostas de parceria. Utilize os canais abaixo ou preencha o formulário.</h5>
            </div>
            <div className="w-full grid grid-cols-2 mt-6 gap-8">
                <div className="flex flex-col gap-4">
                    <div className="w-full bg-white rounded-xl border p-4 shadow-sm flex flex-row gap-4 items-center justify-between">
                        <div className="bg-blue-100 text-blue-500 p-4 rounded-xl">
                            <MapPin size={20} />
                        </div>
                        <div className="flex-1 flex flex-col items-start">
                            <h3 className="font-bold text-base">Endereço</h3>
                            <h5 className="font-light text-sm">Av. Costa e Silva - Pioneiros, Campo Grande - MS, 79070-900, Brasil</h5>
                        </div>
                    </div>
                    <div className="w-full bg-white rounded-xl border p-4 shadow-sm flex flex-row gap-4 items-center justify-between">
                        <div className="bg-blue-100 text-blue-500 p-4 rounded-xl">
                            <Phone size={20} />
                        </div>
                        <div className="flex-1 flex flex-col items-start">
                            <h3 className="font-bold text-base">Telefone</h3>
                            <h5 className="font-light text-sm">(67) 3345-7000</h5>
                        </div>
                    </div>
                    <div className="w-full bg-white rounded-xl border p-4 shadow-sm flex flex-row gap-4 items-center justify-between">
                        <div className="bg-blue-100 text-blue-500 p-4 rounded-xl">
                            <Mail size={20} />
                        </div>
                        <div className="flex-1 flex flex-col items-start">
                            <h3 className="font-bold text-base">E-mail</h3>
                            <h5 className="font-light text-sm">contato.labeduc@ufms.br</h5>
                        </div>
                    </div>
                    <div className="w-full h-96 rounded-xl border shadow-sm overflow-hidden">
                        <iframe allowFullScreen height="100%" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3736.636601438964!2d-54.61869868507567!3d-20.5213609862768!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9486e63a5042686b%3A0x72a5aee97f7422a5!2sUniversidade%20Federal%20de%20Mato%20Grosso%20do%20Sul!5e0!3m2!1spt-BR!2sbr!4v1689278184517!5m2!1spt-BR!2sbr" width="100%"></iframe>
                    </div>
                </div>
                <div className="w-full flex-1 bg-white rounded-xl border p-8 shadow-sm flex flex-col gap-4 items-start ">
                    <div className="w-full gap-1 flex flex-col items-start">
                        <h1 className="font-black text-2xl">Envie uma Mensagem</h1>
                        <h3 className="font-light">Preencha os campos abaixo para nos contatar.</h3>
                    </div>
                    <form className="w-full flex-1 flex flex-col gap-6 justify-end">
                        <Input label="Nome Completo" placeholder="Seu nome completo" type="text" required />
                        <Input label="E-mail" placeholder="seu@email.com" type="email" required />
                        <Input label="Assunto" placeholder="Assunto da mensagem" type="text" required />
                        <TextArea label="Mensagem" placeholder="Escreva sua mensagem aqui..." required rows={6} />
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Enviar Mensagem</Button>
                    </form>
                </div>
            </div>
        </div>
    )
}