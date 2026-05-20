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
    <div className="mx-auto px-4 sm:px-24 md:px-32 lg:px-40 ">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={30}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: true }}
         loop={true}
        className="rounded-2xl overflow-hidden"
      >
        {/* Slide 1 */}
        <SwiperSlide>
          <HeroSection
            imagemSrc="/imgpadrao2.jpg" 
            title="Inovando a Educação em Computação"
            description="Pesquisa e desenvolvimento de práticas pedagógicas para o ensino e aprendizagem da computação."          
            Textbutom="Conheça Nossas Pesquisas"
            href='/projects'
          />
        </SwiperSlide>

        {/* Slide 2 */}
        <SwiperSlide>
          <HeroSection
            imagemSrc="/teste.jpg"
            title="Transformando o Futuro da Tecnologia"
            description="Projetos inovadores e pesquisa aplicada no ensino de computação."
            Textbutom="Ver Projetos"
            href="/projects"
          />
        </SwiperSlide>

        {/* Slide 3 */}
        <SwiperSlide>
          <HeroSection
            imagemSrc="/imgpadrao3.jpg"
            title="Educação e Inovação Andam Juntas"
            description="Capacitamos professores e alunos para o futuro digital."
           Textbutom="Saiba Mais"
           href="/sobre"
          />
        </SwiperSlide>
      </Swiper>
    </div>
  );
}
