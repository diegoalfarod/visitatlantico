// components/HeroCarousel.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { HiPlay, HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { RiMapPin2Line, RiCalendarLine } from "react-icons/ri";
import { BsPlayCircleFill } from "react-icons/bs";
import PlannerPage from "@/components/planner/PlannerPage"; // ⟵ usa el PlannerPage nuevo

const videoSrc =
  "https://appdevelopi.s3.us-east-1.amazonaws.com/AtlanticoEsMas/ATLA%CC%81NTICO+ES+MA%CC%81S+Extra+Compreso.mp4";

interface Slide {
  image: string;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  link: string;
}

const slides: Slide[] = [
  {
    image:
      "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/carnaval-de-barranquilla.jpg?alt=media&token=a0896aee-9567-4506-9272-c5b67f5f5398",
    title: "Cultura y tradición en cada rincón",
    subtitle: "Patrimonio Cultural de la Humanidad",
    description: "Vive la auténtica experiencia caribeña con la calidez de nuestra gente.",
    buttonText: "Planifica tu Visita",
    link: "/planner", // ⟵ usaremos esto para decidir abrir el modal
  },
  {
    image:
      "https://appdevelopi.s3.us-east-1.amazonaws.com/AtlanticoEsMas/Parque+Cienaga+De+Mallorquin.jpeg",
    title: "Naturaleza viva del Caribe",
    subtitle: "Biodiversidad y Ecoturismo",
    description: "Descubre ecosistemas únicos y playas paradisíacas en el corazón del Caribe.",
    buttonText: "Explorar Destinos",
    link: "/destinations",
  },
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [showPlannerModal, setShowPlannerModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!autoPlay || isVideoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [autoPlay, isVideoPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setAutoPlay(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setAutoPlay(false);
  };

  const handleVideoPlay = () => {
    setIsVideoPlaying(true);
    setAutoPlay(false);
  };

  const handleVideoPause = () => {
    setIsVideoPlaying(false);
    setAutoPlay(true);
  };

  // ⟵ ahora decide por el link
  const handlePlannerClick = useCallback(() => {
    if (slides[currentSlide].link === "/planner") {
      setShowPlannerModal(true);
    } else {
      router.push(slides[currentSlide].link);
    }
  }, [currentSlide, router]);

  return (
    <>
      <section
        className="relative w-full overflow-hidden"
        style={{
          minHeight: "calc(100vh - var(--navbar-height, 80px))",
          marginTop: "var(--navbar-height, 80px)",
        }}
      >
        {/* Background Images */}
        <div className="absolute inset-0">
          {slides.map((slide, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{
                opacity: index === currentSlide ? 1 : 0,
              }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0 w-full h-full"
            >
              <Image
                src={slide.image}
                alt=""
                fill
                className="object-cover object-center"
                priority={index === 0}
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60" />
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <div className="relative z-20 min-h-[calc(100vh-var(--navbar-height,80px))] flex items-center justify-center">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20 sm:pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-start lg:items-center">
              {/* Left Content - Text */}
              <motion.div
                className="text-white text-center lg:text-left order-2 lg:order-1"
                key={currentSlide}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {/* Title Section */}
                <div className="mb-6">
                  <motion.h1
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold leading-tight"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    style={{
                      textShadow:
                        "2px 2px 4px rgba(0,0,0,0.8), 4px 4px 8px rgba(0,0,0,0.6)",
                    }}
                  >
                    <span className="text-white">
                      {slides[currentSlide].title.split(" ").map((word, index, array) => {
                        const highlightWords = ["Atlántico", "Caribe", "Colombiano"];
                        const isHighlighted = highlightWords.includes(word);
                        const isLastWords = index >= array.length - 2;
                        return (
                          <span key={index}>
                            {isHighlighted || isLastWords ? (
                              <span className="text-yellow-400">{word}</span>
                            ) : (
                              word
                            )}
                            {index < array.length - 1 && " "}
                          </span>
                        );
                      })}
                    </span>
                  </motion.h1>
                </div>

                {/* Description */}
                <motion.p
                  className="text-base sm:text-lg text-white leading-relaxed mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.8)" }}
                >
                  {slides[currentSlide].description}
                </motion.p>

                {/* Action Buttons */}
                <motion.div
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                >
                  {/* Botón principal (abre planner si link === /planner) */}
                  <motion.button
                    onClick={handlePlannerClick}
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full shadow-xl transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="flex items-center justify-center gap-2 sm:gap-3">
                      <RiMapPin2Line className="text-lg sm:text-xl" />
                      {slides[currentSlide].buttonText}
                    </span>
                  </motion.button>

                  {/* Botón secundario SOLO en el slide 1 (índice 0) */}
                  {currentSlide === 0 && (
                    <motion.button
                      onClick={() => router.push("/destinations")}
                      className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-semibold rounded-full transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="flex items-center justify-center gap-2 sm:gap-3">
                        <RiCalendarLine className="text-lg sm:text-xl" />
                        Ver Destinos
                      </span>
                    </motion.button>
                  )}
                </motion.div>

                {/* Stats Section */}
                <motion.div
                  className="flex justify-center lg:justify-start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                >
                  <div className="inline-flex items-center gap-4 sm:gap-6 bg-black/40 backdrop-blur-sm border border-gray-700 rounded-2xl px-5 sm:px-6 py-3 sm:py-4">
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-red-400">23</div>
                      <div className="text-xs text-gray-400">Municipios</div>
                    </div>
                    <div className="w-px h-6 bg-gray-600" />
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-red-400">50+</div>
                      <div className="text-xs text-gray-400">Destinos</div>
                    </div>
                    <div className="w-px h-6 bg-gray-600" />
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-red-400">2M+</div>
                      <div className="text-xs text-gray-400">Visitantes</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right Content - Video */}
              <motion.div
                className="relative order-1 lg:order-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <div className="relative max-w-sm sm:max-w-md mx-auto lg:max-w-full">
                  <div className="relative bg-gray-900 rounded-lg p-0.5 shadow-2xl border border-gray-700">
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                      <video
                        id="hero-video"
                        src={videoSrc}
                        controls
                        poster={slides[currentSlide].image}
                        className="w-full h-full object-cover"
                        onPlay={handleVideoPlay}
                        onPause={handleVideoPause}
                        onEnded={handleVideoPause}
                      />

                      {!isVideoPlaying && (
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center bg-black/40"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              const video = document.getElementById(
                                "hero-video"
                              ) as HTMLVideoElement;
                              video?.play();
                            }}
                          >
                            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center shadow-2xl transition-colors duration-300">
                              <BsPlayCircleFill className="text-xl sm:text-2xl lg:text-3xl text-white ml-0.5" />
                            </div>
                          </motion.button>
                        </motion.div>
                      )}
                    </div>

                    <div className="absolute bottom-1.5 sm:bottom-2 left-2 right-2">
                      <div className="bg-black/70 backdrop-blur-sm rounded-md px-2 py-1">
                        <p className="text-white text-[10px] sm:text-xs lg:text-sm font-medium flex items-center justify-center gap-1.5">
                          <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-red-500 rounded-full animate-pulse" />
                          Video Oficial
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="absolute bottom-2 sm:bottom-4 md:bottom-6 lg:bottom-8 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 sm:gap-4">
          <motion.button
            onClick={prevSlide}
            aria-label="Anterior"
            className="w-10 h-10 sm:w-12 sm:h-12 bg-black/50 backdrop-blur-sm border border-gray-600 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <HiChevronLeft className="text-lg sm:text-xl" />
          </motion.button>

          <div className="flex gap-2 sm:gap-3">
            {slides.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "w-8 sm:w-10 bg-red-500"
                    : "w-2 sm:w-2.5 bg-gray-500 hover:bg-gray-400"
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>

          <motion.button
            onClick={nextSlide}
            aria-label="Siguiente"
            className="w-10 h-10 sm:w-12 sm:h-12 bg-black/50 backdrop-blur-sm border border-gray-600 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <HiChevronRight className="text-lg sm:text-xl" />
          </motion.button>
        </div>

        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 z-30">
          <motion.div
            className="h-1 bg-red-500"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: autoPlay && !isVideoPlaying ? 1 : 0 }}
            transition={{ duration: 8, ease: "linear" }}
            style={{ transformOrigin: "left" }}
          />
        </div>
      </section>

      {/* Planner Modal (nuevo) */}
      <PlannerPage open={showPlannerModal} onOpenChange={setShowPlannerModal} />
    </>
  );
}
