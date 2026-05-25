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
            <div className="mx-auto p-3 sm:p-4">
                {/* py-20 sm:py-24 md:py-32 lg:py-50 */}
                <div className="relative z-10 flex min-h-[420px] flex-col items-center justify-center gap-6 overflow-hidden rounded-2xl bg-cover bg-center bg-no-repeat p-5 text-center sm:min-h-[520px] sm:gap-8 sm:p-6 lg:min-h-[600px]" data-alt="Abstract blue and purple digital art representing technology and learning background-image: linear-gradient(rgba(17, 24, 39, 0.4) 0%, rgba(17, 24, 39, 0.7) 100%)">
                    <Image src={imagemSrc}
                        alt="imagem de fundo"
                        fill
                        className="object-cover"
                        style={{ zIndex: 0 }}
                    />
                    <div className="absolute inset-0 z-10 bg-black/60" />
                    <div className="relative z-20 flex max-w-3xl flex-col gap-4">
                        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">{title}</h1>
                        <p className="text-base text-slate-200 md:text-lg">{description}</p>
                    </div>
                    <Button
                        asChild
                        size="lg"
                        className="relative z-20 h-auto rounded-full bg-[#0088b7] px-5 py-3 text-sm text-white shadow-lg shadow-cyan-950/20 hover:bg-[#0077a3] hover:shadow-xl sm:px-6 sm:text-base"
                    >
                        <Link href={href}>{Textbutom}</Link>
                    </Button>
                </div>

            </div>
        </section>
    )
}
