import Image from "next/image";
import Link from "next/link";
import { MoveRight } from "lucide-react";


export type CardProps = {
    id: number,
    image?: string |null;
    title: string;
    description: string;
    type: 'project'| 'news';
    status: 'inProgress' | 'done';
    href?: string;
}


export function Cards({ id, image, title, description,type, href }: CardProps) {
    
    return (
        <div className="rounded-2xl border border-slate-100 hover:scale-105 hover:shadow-xl shadow-md p-2 flex flex-row md:flex-col gap-4 transition-all duration-300">
            {image && (
            <Image src={image}
                alt={title}
                width={400}
                height={250}
                className="w-full h-48 object-cover rounded-xl"
            />
            )}
            <div className="flex-1 flex flex-col items-start justify-evenly md:justify-center gap-2 px-2">
                <h1 className="text-base font-bold">{title}</h1>
                <h5 className="text-sm font-medium text-slate-500 text-ellipsis">{description}</h5>

                <div className="w-full h-full flex-1 flex items-end">
                <Link href={ type==='project' ?  `/projects/${id}` : `/news/${id}`} className="flex flex-row gap-2 items-center font-bold text-blue-500">
                    Saiba Mais
                    <MoveRight size={20} />
                </Link>
                </div>
            </div>
        </div>
    );
}