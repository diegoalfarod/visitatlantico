// src/components/FeaturedExperiences.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FaUmbrellaBeach, FaLeaf, FaUtensils } from "react-icons/fa6";

type Experience = {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
};

export default function FeaturedExperiences() {
  // Color palette from client brand identity
  const brandColors = {
    primary: "#E40E20",      // Main brand red - RGB: E40E20
    secondary: "#D34A78",    // Secondary pink - RGB: D34A78
    dark: "#4A4F55",         // Dark gray - RGB: 4A4F55
    medium: "#7A888C",       // Medium gray - RGB: 7A888C
    light: "#C1C5C8",        // Light gray - RGB: C1C5C8
    gold: "#F4B223",         // Gold - RGB: F4B223
    yellow: "#FFD000",       // Yellow - RGB: FFD000
    lightBlue: "#009ADE",    // Light blue - RGB: 009ADE
    darkBlue: "#0047BA",     // Dark blue - RGB: 0047BA
    lightTeal: "#9ED4E9",    // Light teal - RGB: 9ED4E9
    teal: "#00833E",         // Teal blue - RGB: 00833E
    green: "#00B4B1",        // Green - RGB: 00B4B1
  };

  const categoryConfig: Record<
    string,
    { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; color: string }
  > = {
    EcoTurismo:  { icon: FaLeaf,          color: brandColors.green },
    Playas:      { icon: FaUmbrellaBeach, color: brandColors.lightBlue },
    Gastronomía: { icon: FaUtensils,      color: brandColors.gold },
  };

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Experience | null>(null);
  const [open, setOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchExperiences() {
      try {
        const snap = await getDocs(collection(db, "experiences"));
        setExperiences(
          snap.docs.map(doc => ({
            id: doc.id,
            ...(doc.data() as Omit<Experience, "id">),
          }))
        );
      } catch (e) {
        console.error("Error fetching experiences:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchExperiences();
  }, []);

  const handleOpen = (exp: Experience) => {
    setSelected(exp);
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
    setTimeout(() => setSelected(null), 300); // Wait for animation to complete
  };
  
  const filteredExperiences = activeCategory 
    ? experiences.filter(exp => exp.category === activeCategory)
    : experiences;

  if (loading) {
    return (
      <section className="pt-28 pb-24">
        <div className="flex justify-center items-center h-64">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
          </div>
        </div>
      </section>
    );
  }

  // Get unique categories
  const categories = [...new Set(experiences.map(exp => exp.category))];

  return (
    <>
      {/* Experiences Section */}
      <section className="relative w-full bg-background pb-32 overflow-hidden">
        {/* Modern background design with brand colors */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Blurred gradient background */}
          <div className="absolute inset-0 opacity-10 backdrop-blur-3xl">
            <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full" style={{ backgroundColor: brandColors.primary + "30" }}></div>
            <div className="absolute top-60 right-20 w-80 h-80 rounded-full" style={{ backgroundColor: brandColors.lightBlue + "20" }}></div>
            <div className="absolute bottom-20 left-20 w-64 h-64 rounded-full" style={{ backgroundColor: brandColors.gold + "20" }}></div>
          </div>
          
          {/* Decorative elements - using brand colors */}
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 20 + 10,
                height: Math.random() * 20 + 10,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: [
                  brandColors.primary + "10",
                  brandColors.lightBlue + "10", 
                  brandColors.gold + "10",
                  brandColors.dark + "10"
                ][Math.floor(i % 4)]
              }}
              animate={{
                y: [0, Math.random() * 20 - 10],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: Math.random() * 4 + 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Top transition - modern wave with brand colors */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-none z-10">
          {/* Decorative wave pattern */}
          <svg 
            viewBox="0 0 1200 120" 
            className="w-full h-20 md:h-32 text-background"
            preserveAspectRatio="none"
          >
            <path 
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
              fill={brandColors.primary}
              opacity=".15"
            />
            <path 
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
              fill={brandColors.lightBlue}
              opacity=".25"
            />
            <path 
              d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" 
              fill="currentColor"
            />
          </svg>
          
          {/* Gradient overlay */}
          <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-background to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-24 relative z-10">
          {/* Header with brand colors and refined styling */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative inline-block mb-4">
              <motion.div
                className="absolute -inset-1 rounded-lg blur-xl opacity-40"
                style={{ background: `linear-gradient(90deg, ${brandColors.primary}40, ${brandColors.secondary}40)` }}
                animate={{ 
                  opacity: [0.3, 0.5, 0.3],
                  rotate: [0, 3, 0] 
                }}
                transition={{ 
                  duration: 8, 
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
              />
              <h2 className="relative text-4xl md:text-6xl font-fivo font-bold text-foreground tracking-tight">
                Experiencias Destacadas
              </h2>
            </div>
            
            <div className="flex items-center justify-center gap-4 text-foreground/70 font-fivo font-medium text-lg mb-6">
              <span 
                className="h-0.5 w-16 rounded-full"
                style={{ background: `linear-gradient(90deg, transparent, ${brandColors.primary}, transparent)` }}
              />
              <span>Vive el Atlántico</span>
              <span 
                className="h-0.5 w-16 rounded-full"
                style={{ background: `linear-gradient(90deg, transparent, ${brandColors.primary}, transparent)` }}
              />
            </div>
            
            <motion.p 
              className="max-w-2xl mx-auto text-foreground/70 font-fivo text-base md:text-lg leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Descubre aventuras inolvidables en las mejores ubicaciones del departamento
            </motion.p>
          </motion.div>

          {/* Category filter tabs with brand colors */}
          <motion.div 
            className="flex flex-wrap justify-center gap-3 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(null)}
              className={`px-5 py-3 rounded-full font-fivo font-medium text-sm transition-all duration-300 ${
                activeCategory === null
                  ? "text-white shadow-lg"
                  : "bg-foreground/5 text-foreground/70 hover:bg-foreground/10"
              }`}
              style={{
                backgroundColor: activeCategory === null ? brandColors.primary : "",
                boxShadow: activeCategory === null ? `0 8px 16px ${brandColors.primary}30` : ""
              }}
            >
              Todas
            </motion.button>
            
            {categories.map((category) => {
              const cfg = categoryConfig[category] || categoryConfig.EcoTurismo;
              return (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveCategory(category)}
                  className={`px-5 py-3 rounded-full font-fivo font-medium text-sm inline-flex items-center gap-2 transition-all duration-300 ${
                    activeCategory === category
                      ? "text-white shadow-lg"
                      : "bg-foreground/5 text-foreground/70 hover:bg-foreground/10"
                  }`}
                  style={{
                    backgroundColor: activeCategory === category ? cfg.color : "",
                    boxShadow: activeCategory === category ? `0 8px 16px ${cfg.color}30` : ""
                  }}
                >
                  <cfg.icon className={activeCategory === category ? "text-white" : "text-foreground/60"} />
                  {category}
                </motion.button>
              );
            })}
          </motion.div>

          {/* Premium card grid with improved cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredExperiences.slice(0, visibleCount).map((exp, idx) => {
              const cfg = categoryConfig[exp.category] || categoryConfig.EcoTurismo;
              return (
                <motion.div
                  key={exp.id}
                  className="group relative overflow-hidden rounded-2xl bg-white shadow-xl hover:shadow-2xl transition-all duration-500"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  onClick={() => handleOpen(exp)}
                >
                  {/* Glass morphism effect on hover */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"
                    style={{ 
                      background: `radial-gradient(circle at 50% 0%, ${cfg.color}10, transparent 70%)`,
                      backdropFilter: "blur(3px)" 
                    }}
                  ></motion.div>
                  
                  {/* Enhanced image container with parallax effect */}
                  <div className="relative h-72 overflow-hidden">
                    <motion.div
                      className="absolute inset-0"
                      whileHover={{ scale: 1.08 }}
                      transition={{ duration: 0.8, ease: "easeOutQuint" }}
                    >
                      <Image
                        loader={({ src }: { src: string }) => src}
                        unoptimized
                        src={exp.image}
                        alt={exp.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700"
                      />
                    </motion.div>
                    
                    {/* Enhanced overlay gradient */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ 
                        background: `linear-gradient(to top, ${cfg.color}90, transparent 80%)` 
                      }}
                    ></div>
                    
                    {/* Glass morphism category badge */}
                    <div
                      className="absolute top-4 left-4 inline-flex items-center gap-2 text-white text-xs font-fivo font-semibold px-3 py-1.5 rounded-full backdrop-blur-lg shadow-lg z-20"
                      style={{ 
                        backgroundColor: cfg.color + "AA",
                        boxShadow: `0 4px 12px ${cfg.color}40`
                      }}
                    >
                      <cfg.icon className="text-white text-sm" />
                      {exp.category}
                    </div>
                  </div>

                  {/* Enhanced text content */}
                  <div className="p-6 relative z-20">
                    {/* Animated accent line */}
                    <motion.div 
                      className="absolute top-0 left-0 h-0.5 w-0 group-hover:w-1/2 transition-all duration-700 ease-out"
                      style={{ backgroundColor: cfg.color }}
                    ></motion.div>
                    
                    <h3 className="font-fivo font-bold text-xl text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                      {exp.title}
                    </h3>
                    
                    <p className="font-fivo text-foreground/70 text-sm leading-relaxed">
                      {exp.description.length > 120
                        ? `${exp.description.substring(0, 120)}...`
                        : exp.description}
                    </p>
                    
                    {/* Enhanced View more button */}
                    <div className="mt-4 pt-3 border-t border-foreground/10 flex justify-end">
                      <motion.span 
                        className="text-sm font-fivo font-medium inline-flex items-center gap-1 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
                        whileHover={{ x: 3 }}
                        transition={{ duration: 0.2 }}
                        style={{ color: cfg.color }}
                      >
                        Ver más
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </motion.span>
                    </div>
                  </div>
                  
                  {/* Corner decoration */}
                  <div 
                    className="absolute bottom-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ 
                      background: `radial-gradient(circle at 100% 100%, ${cfg.color}30, transparent 70%)` 
                    }}
                  ></div>
                </motion.div>
              );
            })}
          </div>

          {/* Enhanced Load More button */}
          {visibleCount < filteredExperiences.length && (
            <motion.div
              className="flex justify-center mt-16"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <motion.button
                whileHover={{
                  scale: 1.03,
                  boxShadow: `0 15px 30px rgba(0,0,0,0.1), 0 8px 15px ${brandColors.primary}30`,
                }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setVisibleCount(v => v + 3)}
                className="inline-flex items-center gap-2 text-white font-fivo font-semibold px-8 py-3 rounded-full shadow-lg transition-all duration-300 relative overflow-hidden"
                style={{ backgroundColor: brandColors.primary }}
              >
                {/* Animated background */}
                <motion.div 
                  className="absolute inset-0 opacity-20"
                  style={{
                    background: "linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent)"
                  }}
                  animate={{ 
                    x: ['-100%', '200%'],
                  }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Button text and icon */}
                <span className="relative z-10">Ver más experiencias</span>
                <svg
                  className="w-5 h-5 relative z-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 12h14m0 0l-6-6m6 6l-6 6"
                  />
                </svg>
              </motion.button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Enhanced Modal */}
      <AnimatePresence>
        {open && selected && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          >
            <motion.div
              className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden mx-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Enhanced close button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-colors duration-200"
              >
                <svg className="w-5 h-5 text-foreground" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.button>

              <div className="flex flex-col md:flex-row">
                {/* Left: Enhanced image section */}
                <div className="md:w-1/2 relative">
                  <div className="relative h-64 md:h-full">
                    <Image
                      loader={({ src }: { src: string }) => src}
                      unoptimized
                      src={selected.image}
                      alt={selected.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                    
                    {/* Enhanced gradient overlay */}
                    <div 
                      className="absolute inset-0 md:bg-gradient-to-r md:from-black/40 md:to-transparent"
                      style={{ 
                        background: "linear-gradient(to right, rgba(0,0,0,0.5), rgba(0,0,0,0.3) 60%, transparent)" 
                      }}
                    ></div>
                    
                    {/* Category badge */}
                    <div
                      className="absolute top-4 left-4 inline-flex items-center gap-2 text-white text-xs font-fivo font-semibold px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg"
                      style={{ 
                        backgroundColor: (categoryConfig[selected.category] || categoryConfig.EcoTurismo).color + "CC",
                        boxShadow: `0 4px 12px ${(categoryConfig[selected.category] || categoryConfig.EcoTurismo).color}40` 
                      }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full opacity-30"
                        style={{ 
                          background: `conic-gradient(from 0deg, ${(categoryConfig[selected.category] || categoryConfig.EcoTurismo).color}, transparent)`,
                          filter: "blur(8px)"
                        }}
                      />
                      {selected.category}
                    </div>
                  </div>
                </div>
                
                {/* Right: Enhanced content section */}
                <div className="md:w-1/2 p-6 md:p-8">
                  <h2 className="font-fivo font-bold text-2xl md:text-3xl text-foreground mb-4">
                    {selected.title}
                  </h2>
                  
                  {/* Animated accent line */}
                  <motion.div 
                    className="h-0.5 w-0 bg-primary/70 mb-6"
                    initial={{ width: 0 }}
                    animate={{ width: "4rem" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  ></motion.div>
                  
                  <div className="prose prose-sm max-w-none font-fivo text-foreground/90 leading-relaxed">
                    <p>{selected.description}</p>
                  </div>
                  
                  {/* Enhanced Call to Action */}
                  <div className="mt-8">
                    <motion.button
                      whileHover={{
                        scale: 1.02,
                        boxShadow: `0 10px 25px ${brandColors.primary}25`,
                      }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center justify-center w-full py-3 px-6 text-white font-fivo font-semibold rounded-xl shadow-lg transition-all duration-300 relative overflow-hidden"
                      style={{ 
                        backgroundColor: brandColors.primary,
                        boxShadow: `0 8px 16px ${brandColors.primary}20`
                      }}
                    >
                      {/* Animated shine effect */}
                      <motion.div 
                        className="absolute inset-0 opacity-30"
                        style={{
                          background: "linear-gradient(45deg, transparent, rgba(255,255,255,0.4), transparent)"
                        }}
                        animate={{ 
                          x: ['-100%', '200%'],
                        }}
                        transition={{ 
                          duration: 1.5,
                          repeat: Infinity,
                          repeatDelay: 1,
                          ease: "easeInOut"
                        }}
                      />
                      
                      <span className="relative z-10">Reservar esta experiencia</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}