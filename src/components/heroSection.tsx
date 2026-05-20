import Image from "next/image"
import Link, { LinkProps } from "next/link";
import { Button } from "./ui/button";

type HeroSectionProps = {
    imagemSrc: string;
    title: React.ReactNode;
    description: React.ReactNode
    Textbutom: React.ReactNode;
} & LinkProps

export const HeroSection = ({ imagemSrc, href, title, description, Textbutom }: HeroSectionProps) => {
    return (
        <section className="relative h-full">
            <div className="mx-auto p-4">
                {/* py-20 sm:py-24 md:py-32 lg:py-50 */}
                <div className="relative min-h-[600px] h-11/12 flex flex-col gap-8 z-10 items-center rounded-2xl overflow-hidden justify-center text-center bg-cover bg-center bg-no-repeat p-6" data-alt="Abstract blue and purple digital art representing technology and learning background-image: linear-gradient(rgba(17, 24, 39, 0.4) 0%, rgba(17, 24, 39, 0.7) 100%)">
                    <Image src={imagemSrc}
                        alt="imagem de fundo"
                        layout="fill"
                        objectFit="cover"
                        quality={100}
                        style={{ zIndex: 0 }}
                    />
                    <div className="absolute inset-0 z-10 bg-black/60" />
                    <div className="relative z-20 flex flex-col gap-4 max-w-3xl">
                        <h1 className="text-white text-4xl md:text-5xl font-black tracking-tighter">{title}</h1>
                        <p className="text-slate-200 text-base md:text-lg">{description}</p>
                    </div>
                    <Button
                        asChild
                        size="lg"
                        className="relative z-20 rounded-full bg-[#0088b7] px-6 text-white shadow-lg shadow-cyan-950/20 hover:bg-[#0077a3] hover:shadow-xl"
                    >
                        <Link href={href}>{Textbutom}</Link>
                    </Button>
                </div>

            </div>
        </section>
    )
}
