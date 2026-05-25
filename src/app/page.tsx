import HeroCaroussel from '@/components/heroCarrossel';
import { SectionHeader } from "@/components/sectionHeader";
export default function Home() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-white">
      <HeroCaroussel />
      <div className='flex min-h-screen h-full'>
        <SectionHeader />
      </div>
    </div>
  );
}
