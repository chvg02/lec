import Image from "next/image";
import HeroCaroussel from '@/components/heroCarrossel';
import { SectionHeader } from "@/components/sectionHeader";
export default function Home() {
  return (
    <div className="min-h-screen min-w-full bg-white">
      <HeroCaroussel/>
    <div>
      <SectionHeader/>

    </div>
    </div>
  );
}
