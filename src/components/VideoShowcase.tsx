"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, X } from "lucide-react";
import { GiCarnivalMask, GiPalmTree, GiWaveSurfer } from "react-icons/gi";

// =============================================================================
// PALETA - Marca Atlántico
// =============================================================================
const COLORS = {
  azulBarranquero: "#007BC4",
  rojoCayena: "#D31A2B",
  naranjaSalinas: "#EA5B13",
  amarilloArepa: "#F39200",
  verdeBijao: "#008D39",
};

const VIDEO_SRC =
  "https://appdevelopi.s3.us-east-1.amazonaws.com/AtlanticoEsMas/ATLA%CC%81NTICO+ES+MA%CC%81S+Extra+Compreso.mp4";

const VIDEO_POSTER =
  "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/carnaval-de-barranquilla.jpg?alt=media&token=a0896aee-9567-4506-9272-c5b67f5f5398";

// =============================================================================
// HIGHLIGHTS
// =============================================================================
const highlights = [
  { icon: GiCarnivalMask, label: "Carnaval", color: COLORS.rojoCayena },
  { icon: GiPalmTree, label: "Playas", color: COLORS.verdeBijao },
  { icon: GiWaveSurfer, label: "Aventura", color: COLORS.azulBarranquero },
];

// =============================================================================
// COMPONENT
// =============================================================================
export default function VideoShowcase() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fullscreenVideoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, []);

  // Fullscreen video events
  useEffect(() => {
    const video = fullscreenVideoRef.current;
    if (!video || !isFullscreen) return;

    const handleTimeUpdate = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, [isFullscreen]);

  // Lock body scroll when fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  const toggleMute = () => {
    const newMuted = !isMuted;
    if (videoRef.current) videoRef.current.muted = newMuted;
    if (fullscreenVideoRef.current) fullscreenVideoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  const openFullscreen = async () => {
    setIsFullscreen(true);
    setTimeout(async () => {
      const fullVideo = fullscreenVideoRef.current;
      const previewVideo = videoRef.current;
      if (fullVideo) {
        if (previewVideo) {
          fullVideo.currentTime = previewVideo.currentTime;
        }
        fullVideo.muted = isMuted;
        try {
          await fullVideo.play();
        } catch {
          fullVideo.muted = true;
          setIsMuted(true);
          await fullVideo.play();
        }
      }
    }, 100);
  };

  const closeFullscreen = () => {
    const fullVideo = fullscreenVideoRef.current;
    const previewVideo = videoRef.current;

    if (fullVideo) {
      if (previewVideo) {
        previewVideo.currentTime = fullVideo.currentTime;
      }
      fullVideo.pause();
    }
    setIsFullscreen(false);
    setIsPlaying(false);
  };

  const toggleFullscreenPlay = async () => {
    const video = fullscreenVideoRef.current;
    if (!video) return;

    if (video.paused) {
      await video.play();
    } else {
      video.pause();
    }
  };

  return (
    <>
      <section className="relative min-h-screen bg-white overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-screen">
          {/* ============================================================= */}
          {/* LEFT SIDE - Content */}
          {/* ============================================================= */}
          <div className="relative w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-24 py-16 lg:py-24">
            {/* Background accent */}
            <div
              className="absolute top-0 left-0 w-full h-full opacity-[0.03]"
              style={{
                backgroundImage: `radial-gradient(${COLORS.azulBarranquero} 1px, transparent 1px)`,
                backgroundSize: "24px 24px",
              }}
            />

            {/* Decorative line */}
            <motion.div
              className="absolute top-16 left-8 sm:left-12 lg:left-16 xl:left-24 w-12 h-1 rounded-full"
              style={{ backgroundColor: COLORS.amarilloArepa }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            />

            <div className="relative z-10">
              {/* Label */}
              <motion.span
                className="inline-block text-[10px] sm:text-xs font-semibold tracking-[0.3em] uppercase mb-6"
                style={{
                  fontFamily: "'Josefin Sans', sans-serif",
                  color: COLORS.rojoCayena,
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                Video
              </motion.span>

              {/* Title */}
              <motion.h2
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light text-gray-900 mb-2 tracking-tight leading-[0.95]"
                style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                Conoce el
              </motion.h2>
              <motion.h3
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[0.95] mb-8"
                style={{
                  fontFamily: "'Josefin Sans', sans-serif",
                  color: COLORS.azulBarranquero,
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.15 }}
              >
                Atlántico
              </motion.h3>

              {/* Description */}
              <motion.p
                className="text-gray-500 text-base sm:text-lg leading-relaxed max-w-md mb-10"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Descubre en este video todo lo que nuestra región tiene para 
                ofrecerte: playas, cultura, gastronomía y la alegría del Caribe.
              </motion.p>

              {/* Highlights */}
              <motion.div
                className="flex flex-wrap gap-4 mb-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.25 }}
              >
                {highlights.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 px-4 py-2 rounded-full"
                    style={{ backgroundColor: `${item.color}10` }}
                  >
                    <item.icon className="text-lg" style={{ color: item.color }} />
                    <span
                      className="text-sm font-medium"
                      style={{
                        fontFamily: "'Josefin Sans', sans-serif",
                        color: item.color,
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </motion.div>

              {/* CTA */}
              <motion.button
                onClick={openFullscreen}
                className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full text-white font-semibold transition-all"
                style={{
                  fontFamily: "'Josefin Sans', sans-serif",
                  background: `linear-gradient(135deg, ${COLORS.naranjaSalinas}, ${COLORS.rojoCayena})`,
                  boxShadow: `0 10px 30px ${COLORS.rojoCayena}30`,
                }}
                whileHover={{ scale: 1.03, boxShadow: `0 15px 40px ${COLORS.rojoCayena}40` }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Play className="w-5 h-5" fill="white" />
                Ver video
              </motion.button>
            </div>
          </div>

          {/* ============================================================= */}
          {/* RIGHT SIDE - Video */}
          {/* ============================================================= */}
          <motion.div
            className="relative w-full lg:w-1/2 min-h-[50vh] lg:min-h-screen"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Video container */}
            <div
              className="absolute inset-0 cursor-pointer overflow-hidden"
              onClick={openFullscreen}
            >
              {/* Video */}
              <video
                ref={videoRef}
                src={VIDEO_SRC}
                poster={VIDEO_POSTER}
                muted
                loop
                playsInline
                preload="metadata"
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Gradient overlay */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{ opacity: isHovered ? 0.3 : 0.5 }}
                transition={{ duration: 0.4 }}
                style={{
                  background: "linear-gradient(to right, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.2) 100%)",
                }}
              />

              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="relative"
                  animate={{ scale: isHovered ? 1.1 : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Pulse ring */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-white/30"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ transform: "scale(1.5)" }}
                  />

                  {/* Button */}
                  <motion.div
                    className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-2xl"
                    whileHover={{ backgroundColor: "rgba(255,255,255,1)" }}
                  >
                    <Play
                      className="w-8 h-8 sm:w-10 sm:h-10 ml-1"
                      style={{ color: COLORS.rojoCayena }}
                      fill={COLORS.rojoCayena}
                    />
                  </motion.div>
                </motion.div>
              </div>

              {/* Corner badge */}
              <motion.div
                className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 flex items-center gap-3"
                animate={{ opacity: isHovered ? 1 : 0.8 }}
              >
                <div
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: COLORS.rojoCayena }}
                />
                <span
                  className="text-white text-sm font-medium tracking-wide"
                  style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                >
                  Reproducir
                </span>
              </motion.div>

              {/* Duration */}
              <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm">
                <span
                  className="text-white text-sm font-medium"
                  style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                >
                  2:30
                </span>
              </div>
            </div>

            {/* Decorative diagonal cut on large screens */}
            <div
              className="hidden lg:block absolute top-0 left-0 w-24 h-full pointer-events-none"
              style={{
                background: "linear-gradient(to right, white 0%, transparent 100%)",
              }}
            />
          </motion.div>
        </div>
      </section>

      {/* ============================================================= */}
      {/* FULLSCREEN VIDEO MODAL */}
      {/* ============================================================= */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Video */}
            <video
              ref={fullscreenVideoRef}
              src={VIDEO_SRC}
              muted={isMuted}
              loop
              playsInline
              className="w-full h-full object-contain"
              onClick={toggleFullscreenPlay}
            />

            {/* Top gradient */}
            <div
              className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
              style={{
                background: "linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)",
              }}
            />

            {/* Bottom gradient */}
            <div
              className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
              style={{
                background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
              }}
            />

            {/* Close button */}
            <motion.button
              onClick={closeFullscreen}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <X className="w-5 h-5" />
            </motion.button>

            {/* Branding */}
            <motion.div
              className="absolute top-6 left-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span
                className="text-white/50 text-sm font-medium tracking-[0.2em] uppercase"
                style={{ fontFamily: "'Josefin Sans', sans-serif" }}
              >
                Atlántico
              </span>
            </motion.div>

            {/* Controls */}
            <motion.div
              className="absolute bottom-8 left-0 right-0 px-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="max-w-3xl mx-auto flex items-center gap-4">
                <button
                  onClick={toggleFullscreenPlay}
                  className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </button>

                <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      width: `${progress}%`,
                      background: `linear-gradient(90deg, ${COLORS.amarilloArepa}, ${COLORS.rojoCayena})`,
                    }}
                  />
                </div>

                <button
                  onClick={toggleMute}
                  className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>

            {/* Center play (when paused) */}
            <AnimatePresence>
              {!isPlaying && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center cursor-pointer"
                  onClick={toggleFullscreenPlay}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.3)" }}
                  >
                    <Play className="w-8 h-8 text-white ml-1" fill="white" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}