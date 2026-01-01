"use client";

import { useState, useEffect, useCallback, useRef, memo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, ChevronDown } from "lucide-react";
import PlannerPage from "@/components/planner/PlannerPage";

// =============================================================================
// PALETA INSTITUCIONAL - Gobernación del Atlántico
// Solo colores permitidos del manual de marca:
// Principal: #E40E20 (Rojo), #D31A2B (Rojo oscuro)
// Neutros: #4A4F55, #7A858C, #C1C5C8, blanco
// =============================================================================

const VIDEO_SRC =
  "https://appdevelopi.s3.us-east-1.amazonaws.com/AtlanticoEsMas/ATLA%CC%81NTICO+ES+MA%CC%81S+Extra+Compreso.mp4";

interface Slide {
  id: string;
  image: string;
  title: string;
  highlight: string;
}

const slides: Slide[] = [
  {
    id: "cultura",
    image: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/carnaval-de-barranquilla.jpg?alt=media&token=a0896aee-9567-4506-9272-c5b67f5f5398",
    title: "Siente el",
    highlight: "Caribe",
  },
  {
    id: "naturaleza",
    image: "https://appdevelopi.s3.us-east-1.amazonaws.com/AtlanticoEsMas/Parque+Cienaga+De+Mallorquin.jpeg",
    title: "Vive la",
    highlight: "Magia",
  },
];

const AUTOPLAY_INTERVAL = 6000;

type VideoState = "idle" | "loading" | "playing" | "paused" | "error";

// =============================================================================
// HOOKS
// =============================================================================

function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
}

function useSwipe(onSwipeLeft: () => void, onSwipeRight: () => void) {
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);

  return {
    onTouchStart: (e: React.TouchEvent) => {
      touchEnd.current = null;
      touchStart.current = e.targetTouches[0].clientX;
    },
    onTouchMove: (e: React.TouchEvent) => {
      touchEnd.current = e.targetTouches[0].clientX;
    },
    onTouchEnd: () => {
      if (!touchStart.current || !touchEnd.current) return;
      const dist = touchStart.current - touchEnd.current;
      if (Math.abs(dist) > 50) dist > 0 ? onSwipeLeft() : onSwipeRight();
      touchStart.current = touchEnd.current = null;
    },
  };
}

// =============================================================================
// VIDEO PLAYER - Inmersivo, protagonista visual
// =============================================================================

const VideoPlayer = memo(({
  videoRef,
  isPlaying,
  isMuted,
  onPlayPause,
  onMuteToggle,
  poster,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isPlaying: boolean;
  isMuted: boolean;
  onPlayPause: () => void;
  onMuteToggle: () => void;
  poster: string;
}) => (
  <div className="relative w-full h-full rounded-[2rem] overflow-hidden group cursor-pointer" onClick={onPlayPause}>
    {/* Video */}
    <video
      ref={videoRef}
      src={VIDEO_SRC}
      poster={poster}
      muted={isMuted}
      loop
      playsInline
      preload="metadata"
      className="w-full h-full object-cover"
    />
    
    {/* Subtle vignette for depth */}
    <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.3)]" />
    
    {/* Play button - elegant, minimal */}
    <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
      <motion.div
        className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isPlaying ? (
          <Pause className="w-8 h-8 text-[#4A4F55]" />
        ) : (
          <Play className="w-8 h-8 text-[#4A4F55] ml-1" />
        )}
      </motion.div>
    </div>

    {/* Mute - bottom right, ultra minimal */}
    <button
      onClick={(e) => { e.stopPropagation(); onMuteToggle(); }}
      className="absolute bottom-4 right-4 w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-black/40 transition-all opacity-0 group-hover:opacity-100"
      aria-label={isMuted ? "Activar sonido" : "Silenciar"}
    >
      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
    </button>
  </div>
));
VideoPlayer.displayName = "VideoPlayer";

// =============================================================================
// WAVE TRANSITION - Elegante transición al siguiente componente
// =============================================================================

const WaveTransition = memo(() => (
  <div className="absolute -bottom-px left-0 right-0 z-20">
    <svg viewBox="0 0 1440 80" fill="none" className="w-full h-auto" preserveAspectRatio="none">
      <path
        d="M0 80L48 73.3C96 66.7 192 53.3 288 48C384 42.7 480 45.3 576 50.7C672 56 768 64 864 64C960 64 1056 56 1152 50.7C1248 45.3 1344 42.7 1392 41.3L1440 40V80H0Z"
        fill="white"
      />
    </svg>
  </div>
));
WaveTransition.displayName = "WaveTransition";

// =============================================================================
// MAIN COMPONENT - Cinematográfico, elegante, highend
// Coherente con Navbar (bg-gray-900 → #111827)
// =============================================================================

export default function HeroCarousel() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [showPlanner, setShowPlanner] = useState(false);
  const [videoState, setVideoState] = useState<VideoState>("idle");
  const [isMuted, setIsMuted] = useState(true);
  const [animationPhase, setAnimationPhase] = useState(0);

  const isPlaying = videoState === "playing";
  const slide = slides[currentSlide];

  // Smooth cinematic entrance - 3 phases
  useEffect(() => {
    const timers = [
      setTimeout(() => setAnimationPhase(1), 200),   // Start fade
      setTimeout(() => setAnimationPhase(2), 1500),  // Video emerges
      setTimeout(() => setAnimationPhase(3), 2800),  // Full reveal
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Video events
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlay = () => setVideoState("playing");
    const onPause = () => setVideoState("paused");
    const onError = () => setVideoState("error");
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("error", onError);
    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("error", onError);
    };
  }, []);

  // Autoplay slides
  useEffect(() => {
    if (!autoPlay || isPlaying) return;
    const t = setInterval(() => setCurrentSlide((p) => (p + 1) % slides.length), AUTOPLAY_INTERVAL);
    return () => clearInterval(t);
  }, [autoPlay, isPlaying]);

  // Navigation
  const next = useCallback(() => {
    setCurrentSlide((p) => (p + 1) % slides.length);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 10000);
  }, []);

  const prev = useCallback(() => {
    setCurrentSlide((p) => (p - 1 + slides.length) % slides.length);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 10000);
  }, []);

  const swipe = useSwipe(next, prev);

  // Video controls
  const togglePlay = useCallback(async () => {
    const v = videoRef.current;
    if (!v) return;
    if (isPlaying) {
      v.pause();
      setAutoPlay(true);
    } else {
      try {
        await v.play();
        setAutoPlay(false);
      } catch {
        v.muted = true;
        setIsMuted(true);
        await v.play().catch(() => {});
        setAutoPlay(false);
      }
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (v) {
      v.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  // Scroll to events section
  const scrollToEvents = useCallback(() => {
    document.getElementById("upcoming-events")?.scrollIntoView({ 
      behavior: reducedMotion ? "auto" : "smooth" 
    });
  }, [reducedMotion]);

  return (
    <>
      {/* 
        El navbar es fixed y tiene altura dinámica guardada en --navbar-height.
        Usamos padding-top en vez de margin-top para que el fondo del hero
        se extienda hasta arriba y no haya gap visual.
      */}
      <section
        className="relative w-full min-h-screen overflow-hidden bg-gray-900"
        {...swipe}
      >
        {/* Spacer para el navbar - mismo color que navbar para transición seamless */}
        <div 
          className="absolute top-0 left-0 right-0 bg-gray-900 z-0"
          style={{ height: "var(--navbar-height, 80px)" }}
        />
        
        {/* Background layer */}
        <div className="absolute inset-0">
          {slides.map((s, i) => {
            const isActive = i === currentSlide;
            const isAdjacent = i === (currentSlide + 1) % slides.length;
            if (!isActive && !isAdjacent) return null;

            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: isActive ? 1 : 0 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="absolute inset-0"
                style={{ top: "var(--navbar-height, 80px)" }}
              >
                {/* Image with smooth scale */}
                <motion.div
                  className="absolute inset-0"
                  initial={{ scale: 1.1 }}
                  animate={{ scale: animationPhase >= 1 ? 1.02 : 1.1 }}
                  transition={{ duration: 8, ease: "easeOut" }}
                >
                  <Image
                    src={s.image}
                    alt=""
                    fill
                    className="object-cover"
                    priority={isActive || isAdjacent}
                    sizes="100vw"
                    unoptimized
                  />
                </motion.div>
                
                {/* Cinematic darkening - matches navbar darkness */}
                <motion.div 
                  className="absolute inset-0 bg-gray-900"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: animationPhase >= 1 ? 0.6 : 0 }}
                  transition={{ duration: 3, ease: [0.25, 0.1, 0.25, 1] }}
                />
                
                {/* Vignette effect */}
                <div 
                  className="absolute inset-0"
                  style={{
                    background: 'radial-gradient(ellipse at center, transparent 0%, rgba(17,24,39,0.5) 100%)'
                  }}
                />
                
                {/* Top gradient - seamless blend with navbar */}
                <div 
                  className="absolute inset-x-0 top-0 h-32"
                  style={{
                    background: 'linear-gradient(to bottom, rgb(17,24,39) 0%, transparent 100%)'
                  }}
                />
                
                {/* Bottom gradient for text readability */}
                <motion.div 
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to top, rgb(17,24,39) 0%, rgba(17,24,39,0.4) 40%, transparent 70%)'
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: animationPhase >= 1 ? 1 : 0 }}
                  transition={{ duration: 2.5, ease: "easeOut" }}
                />
                
                {/* Left gradient for text */}
                <motion.div 
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to right, rgba(17,24,39,0.8) 0%, transparent 50%)'
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: animationPhase >= 2 ? 1 : 0 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Slide indicators - positioned below navbar */}
        <motion.div 
          className="absolute left-1/2 -translate-x-1/2 z-30 flex gap-4"
          style={{ top: "calc(var(--navbar-height, 80px) + 24px)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: animationPhase >= 3 ? 1 : 0 }}
          transition={{ duration: 1 }}
        >
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrentSlide(i); setAutoPlay(false); }}
              className="group py-2 px-1"
              aria-label={`Slide ${i + 1}`}
            >
              <div className={`h-px transition-all duration-1000 ease-out ${
                i === currentSlide 
                  ? "w-16 bg-white" 
                  : "w-8 bg-white/25 group-hover:bg-white/40"
              }`} />
            </button>
          ))}
        </motion.div>

        {/* Main Content */}
        <div 
          className="relative z-10 flex flex-col justify-end"
          style={{ 
            minHeight: "100vh",
            paddingTop: "var(--navbar-height, 80px)",
            paddingBottom: "clamp(6rem, 12vh, 10rem)"
          }}
        >
          <div className="px-6 sm:px-10 lg:px-16 xl:px-24 max-w-[1600px] mx-auto w-full">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10 lg:gap-20">
              
              {/* Typography */}
              <motion.div 
                className="flex-1 max-w-3xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: animationPhase >= 2 ? 1 : 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <h1 className="text-[clamp(3rem,8vw,8rem)] font-bold tracking-tight leading-[0.85]">
                      <span className="text-white">{slide.title}</span>
                      <br />
                      <span className="text-[#E40E20]">{slide.highlight}</span>
                    </h1>
                    
                    <motion.div 
                      className="mt-8 flex items-center gap-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                    >
                      <div className="w-12 h-px bg-white/30" />
                      <p className="text-white/40 text-sm tracking-[0.25em] uppercase">
                        Atlántico, Colombia
                      </p>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              {/* Video - The star */}
              <motion.div
                className="w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[380px] xl:max-w-[420px]"
                initial={{ opacity: 0, y: 100 }}
                animate={{ 
                  opacity: animationPhase >= 2 ? 1 : 0, 
                  y: animationPhase >= 2 ? 0 : 100,
                }}
                transition={{ 
                  duration: 1.8, 
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <div className="relative">
                  {/* Ambient glow */}
                  <motion.div 
                    className="absolute -inset-8 rounded-[3rem] opacity-0"
                    style={{
                      background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.1) 0%, transparent 70%)'
                    }}
                    animate={{ opacity: animationPhase >= 3 ? 1 : 0 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                  />
                  
                  {/* Video container */}
                  <motion.div 
                    className="relative aspect-[3/4] rounded-[2rem] overflow-hidden"
                    style={{
                      boxShadow: animationPhase >= 3 
                        ? '0 50px 100px -20px rgba(0,0,0,0.8), 0 30px 60px -30px rgba(0,0,0,0.6)'
                        : 'none'
                    }}
                  >
                    <VideoPlayer
                      videoRef={videoRef}
                      isPlaying={isPlaying}
                      isMuted={isMuted}
                      onPlayPause={togglePlay}
                      onMuteToggle={toggleMute}
                      poster={slide.image}
                    />
                    
                    {/* Subtle border */}
                    <motion.div 
                      className="absolute inset-0 rounded-[2rem] pointer-events-none"
                      style={{
                        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)'
                      }}
                      animate={{ opacity: animationPhase >= 3 ? 1 : 0 }}
                      transition={{ duration: 1 }}
                    />
                  </motion.div>
                  
                  {/* Red accent line */}
                  <motion.div 
                    className="absolute -bottom-4 left-1/2 h-1 bg-[#E40E20] rounded-full"
                    initial={{ width: 0, x: '-50%' }}
                    animate={{ 
                      width: animationPhase >= 3 ? 48 : 0,
                      x: '-50%'
                    }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll CTA */}
        <motion.button
          onClick={scrollToEvents}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-white/40 hover:text-white/70 transition-colors duration-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: animationPhase >= 3 ? 1 : 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <span className="text-[10px] tracking-[0.4em] uppercase">Explorar</span>
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.button>

        {/* Wave transition */}
        <WaveTransition />
      </section>

      <PlannerPage open={showPlanner} onOpenChange={setShowPlanner} />
    </>
  );
}