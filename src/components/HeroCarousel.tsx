"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";

const videoSrc =
  "https://appdevelopi.s3.us-east-1.amazonaws.com/AtlanticoEsMas/ATLA%CC%81NTICO+ES+MA%CC%81S+Extra+Compreso.mp4";

interface Slide {
  image: string;
  title: string;
  subtitle: string;
  buttonText: string;
  link: string;
}

const slides: Slide[] = [
  {
    image:
      "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/carnaval-de-barranquilla.jpg?alt=media&token=a0896aee-9567-4506-9272-c5b67f5f5398",
    title: "Cultura y tradición en cada rincón",
    subtitle:
      "Vive la auténtica experiencia caribeña con la calidez de nuestra gente.",
    buttonText: "Planifica tu aventura",
    link: "/planner",
  },
  {
    image:
      "https://appdevelopi.s3.us-east-1.amazonaws.com/AtlanticoEsMas/Parque+Cienaga+De+Mallorquin.jpeg",
    title: "Tu próxima aventura comienza en Atlántico",
    subtitle:
      "Descubre playas paradisíacas, cultura vibrante y experiencias inolvidables.",
    buttonText: "Planifica tu aventura",
    link: "/planner",
  },
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  const nextSlide = () =>
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <>
      <section 
        className="relative w-full overflow-hidden bg-white"
        style={{ 
          height: 'calc(100vh - var(--navbar-height, 80px))',
          marginTop: 'var(--navbar-height, 80px)'
        }}
      >
        {slides.map((slide, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: index === currentSlide ? 1 : 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full"
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-transparent" />

            {index === currentSlide && (
              <div
                className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-6 md:p-16 space-y-6"
                style={{ paddingBottom: '120px' }}
                data-wg-notranslate="false"
              >
                <div className="relative w-full max-w-xl mx-auto rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white/20 backdrop-blur-md">
                  <video
                    src={videoSrc}
                    controls
                    poster={slide.image}
                    className="w-full h-full object-cover bg-black"
                  />
                </div>

                <h1 className="text-3xl md:text-5xl font-fivo font-bold tracking-wide text-white">
                  {slide.title}
                </h1>
                <p className="max-w-2xl text-lg md:text-xl font-fivo text-white">
                  {slide.subtitle}
                </p>

                <button
                  onClick={() => router.push(slide.link)}
                  className="px-6 py-3 text-lg font-fivo font-bold rounded-full bg-[#E40E20] text-white hover:bg-[#D31A2B] transition-all"
                >
                  {slide.buttonText}
                </button>
              </div>
            )}
          </motion.div>
        ))}

        {/* Flechas */}
        <div className="absolute bottom-6 left-1/2 z-40 flex -translate-x-1/2 gap-4">
          <button
            onClick={prevSlide}
            aria-label="Anterior"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-[#4A4F55] hover:bg-white shadow-md"
          >
            ‹
          </button>
          <button
            onClick={nextSlide}
            aria-label="Siguiente"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-[#4A4F55] hover:bg-white shadow-md"
          >
            ›
          </button>
        </div>

        {/* curva decorativa */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg
            viewBox="0 0 1440 150"
            className="h-[80px] w-full md:h-[100px]"
            preserveAspectRatio="none"
          >
            <path
              fill="white"
              d="M0,32 C480,160 960,0 1440,96 L1440,320 L0,320 Z"
            />
          </svg>
        </div>
      </section>

      {/* CSS adicional para fallbacks */}
      <style jsx>{`
        /* Fallback en caso de que --navbar-height no esté disponible */
        section {
          min-height: calc(100vh - 80px);
        }
        @media (min-width: 768px) {
          section {
            min-height: calc(100vh - 96px);
          }
        }
      `}</style>
    </>
  );
}