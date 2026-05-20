// src/components/HeroCarousel.tsx
"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { HeroSection } from "./heroSection";

export default function HeroCaroussel() {
  return (
    <div>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={30}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: true }}
        loop={true}
        className="h-full w-full overflow-hidden rounded-2xl"
      >
        <SwiperSlide>
          <HeroSection
            imagemSrc="/imgpadrao2.jpg"
            title="Notícias e Eventos do Laboratório"
            description="Acompanhe os destaques mais recentes, lançamentos, ações e eventos promovidos pelo laboratório."
            Textbutom="Ver Notícias e Eventos"
            href="/news"
          />
        </SwiperSlide>

        <SwiperSlide>
          <HeroSection
            imagemSrc="/teste.jpg"
            title="Pesquisas e Projetos em Destaque"
            description="Conheça nossas pesquisas em andamento e os projetos que impulsionam inovação no ensino de computação."
            Textbutom="Explorar Pesquisas"
            href="/projects"
          />
        </SwiperSlide>

        <SwiperSlide>
          <HeroSection
            imagemSrc="/imgpadrao3.jpg"
            title="Recursos para Ensinar e Aprender"
            description="Explore materiais didáticos, artigos e ferramentas produzidas para apoiar a educação em computação."
            Textbutom="Acessar Recursos"
            href="/resources"
          />
        </SwiperSlide>
      </Swiper>
    </div>
  );
}
