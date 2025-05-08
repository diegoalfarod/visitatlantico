"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  FaUmbrellaBeach, FaLeaf, FaUtensils, FaMountain, FaLandmark, FaUsers,
  FaRunning, FaMoon, FaSpa, FaMusic, FaHeart, FaBinoculars,
  FaShoppingCart, FaCamera, FaShip, FaSwimmer, FaFish, FaVideo,
  FaPaintBrush, FaStar, FaCocktail, FaCoffee, FaChevronDown, FaChevronUp
} from "react-icons/fa";

type Experience = {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
};

const DynamicIcon = ({ icon: Icon, size = 16 }: { icon: React.ComponentType<{ size?: number }>, size?: number }) => {
  return <Icon size={size} />;
};

export default function FeaturedExperiences() {
  const brandColors = {
    primary: "#E40E20",
    secondary: "#D34A78",
    dark: "#4A4F55",
    medium: "#7A888C",
    light: "#C1C5C8",
    gold: "#F4B223",
    yellow: "#FFD000",
    lightBlue: "#009ADE",
    darkBlue: "#0047BA",
    lightTeal: "#9ED4E9",
    teal: "#00833E",
    green: "#00B4B1",
  };

  const categoryConfig: Record<string, { icon: React.ComponentType<{ size?: number }>; color: string }> = {
    Playas:      { icon: FaUmbrellaBeach, color: brandColors.lightBlue },
    Eco:         { icon: FaLeaf,          color: brandColors.green },
    Gastronomía: { icon: FaUtensils,      color: brandColors.gold },
    Aventura:    { icon: FaMountain,      color: brandColors.teal },
    Cultura:     { icon: FaMusic,         color: brandColors.darkBlue },
    Historia:    { icon: FaLandmark,      color: brandColors.medium },
    Familia:     { icon: FaUsers,         color: brandColors.yellow },
    Deportes:    { icon: FaRunning,       color: brandColors.lightTeal },
    Nocturna:    { icon: FaMoon,          color: brandColors.dark },
    Bienestar:   { icon: FaSpa,           color: brandColors.secondary },
    Festivales:  { icon: FaMusic,         color: brandColors.primary },
    Romántico:   { icon: FaHeart,         color: brandColors.secondary },
    Naturaleza:  { icon: FaMountain,      color: brandColors.green },
    Avistamiento:{ icon: FaBinoculars,    color: brandColors.teal },
    Compras:     { icon: FaShoppingCart,  color: brandColors.medium },
    Fotografía:  { icon: FaCamera,        color: brandColors.gold },
    Náutica:     { icon: FaShip,          color: brandColors.lightBlue },
    Acuáticos:   { icon: FaSwimmer,       color: brandColors.lightTeal },
    Pesca:       { icon: FaFish,          color: brandColors.primary },
    Cine:        { icon: FaVideo,         color: brandColors.yellow },
    Arte:        { icon: FaPaintBrush,    color: brandColors.light },
    Estelar:     { icon: FaStar,          color: brandColors.dark },
    Coctelería:  { icon: FaCocktail,      color: brandColors.secondary },
    RutaCafé:    { icon: FaCoffee,        color: brandColors.gold },
  };

  const defaultCategoryConfig = {
    icon: FaStar,
    color: brandColors.primary
  };

  const getCategoryConfig = (category: string) => {
    return categoryConfig[category] || defaultCategoryConfig;
  };

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [visibleCategoryCount, setVisibleCategoryCount] = useState(6);
  const [visibleExperienceCount, setVisibleExperienceCount] = useState(3);

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

  const toggleCategory = (cat: string) => {
    setActiveCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const filteredExperiences = activeCategories.length
    ? experiences.filter(exp => activeCategories.includes(exp.category))
    : experiences;

  const categories = Object.keys(categoryConfig);
  const visibleCategories = categories.slice(0, visibleCategoryCount);

  if (loading) {
    return (
      <section className="pt-28 pb-24">
        <div className="flex justify-center items-center h-64">
          <div className="h-16 w-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="relative w-full bg-background pb-32 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 opacity-10 backdrop-blur-3xl">
            <div
              className="absolute -top-40 -left-40 w-96 h-96 rounded-full"
              style={{ backgroundColor: brandColors.primary + "30" }}
            />
            <div
              className="absolute top-60 right-20 w-80 h-80 rounded-full"
              style={{ backgroundColor: brandColors.lightBlue + "20" }}
            />
            <div
              className="absolute bottom-20 left-20 w-64 h-64 rounded-full"
              style={{ backgroundColor: brandColors.gold + "20" }}
            />
          </div>
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
                  brandColors.dark + "10",
                ][i % 4],
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

        <div className="absolute top-0 left-0 w-full overflow-hidden leading-none z-10">
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
          <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-24 relative z-10">
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
                style={{
                  background: `linear-gradient(90deg, ${brandColors.primary}40, ${brandColors.secondary}40)`,
                }}
                animate={{
                  opacity: [0.3, 0.5, 0.3],
                  rotate: [0, 3, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <h2 className="relative text-4xl md:text-6xl font-fivo font-bold text-foreground tracking-tight">
                Experiencias Destacadas
              </h2>
            </div>
            <div className="flex items-center justify-center gap-4 text-foreground/70 font-fivo font-medium text-lg mb-6">
              <span
                className="h-0.5 w-16 rounded-full"
                style={{
                  background: `linear-gradient(90deg, transparent, ${brandColors.primary}, transparent)`,
                }}
              />
              <span>Vive el Atlántico</span>
              <span
                className="h-0.5 w-16 rounded-full"
                style={{
                  background: `linear-gradient(90deg, transparent, ${brandColors.primary}, transparent)`,
                }}
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

          <motion.div
            className="flex flex-wrap justify-center gap-2 mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {visibleCategories.map(cat => {
              const cfg = getCategoryConfig(cat);
              const isActive = activeCategories.includes(cat);
              return (
                <motion.button
                  key={cat}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => toggleCategory(cat)}
                  className={`px-4 py-1.5 rounded-full font-fivo text-sm flex items-center gap-2 transition-all duration-200 border shadow-sm ${
                    isActive
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <DynamicIcon icon={cfg.icon} size={14} /> {cat}
                </motion.button>
              );
            })}

            {visibleCategoryCount < categories.length && (
              <motion.button
                onClick={() => setVisibleCategoryCount(prev => prev + 5)}
                className="px-4 py-1.5 rounded-full text-sm text-gray-600 bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-all duration-200 flex items-center gap-1"
              >
                <DynamicIcon icon={FaChevronDown} size={16} /> Más filtros
              </motion.button>
            )}
            {visibleCategoryCount >= categories.length && categories.length > 6 && (
              <motion.button
                onClick={() => setVisibleCategoryCount(6)}
                className="px-4 py-1.5 rounded-full text-sm text-gray-600 bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-all duration-200 flex items-center gap-1"
              >
                <DynamicIcon icon={FaChevronUp} size={16} /> Ocultar filtros
              </motion.button>
            )}
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredExperiences
              .slice(0, visibleExperienceCount)
              .map((exp, idx) => {
                const cfg = getCategoryConfig(exp.category);
                return (
                  <motion.div
                    key={exp.id}
                    className="group relative overflow-hidden rounded-2xl bg-white shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                    onClick={() => window.location.href = `/experiences/${exp.id}`}
                  >
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"
                      style={{
                        background: `radial-gradient(circle at 50% 0%, ${cfg.color}10, transparent 70%)`,
                        backdropFilter: "blur(3px)",
                      }}
                    />

                    <div className="relative h-72 overflow-hidden">
                      <motion.div
                        className="absolute inset-0"
                        whileHover={{ scale: 1.08 }}
                        transition={{ duration: 0.8, ease: "easeOutQuint" }}
                      >
                        <Image
                          loader={({ src }) => src}
                          unoptimized
                          src={exp.image}
                          alt={exp.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-700"
                        />
                      </motion.div>
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          background: `linear-gradient(to top, ${cfg.color}90, transparent 80%)`,
                        }}
                      />
                      <div
                        className="absolute top-4 left-4 inline-flex items-center gap-2 text-white text-xs font-fivo font-semibold px-3 py-1.5 rounded-full backdrop-blur-lg shadow-lg z-20"
                        style={{
                          backgroundColor: cfg.color + "AA",
                          boxShadow: `0 4px 12px ${cfg.color}40`,
                        }}
                      >
                        <DynamicIcon icon={cfg.icon} size={14} />
                        {exp.category}
                      </div>
                    </div>

                    <div className="p-6 relative z-20">
                      <motion.div
                        className="absolute top-0 left-0 h-0.5 w-0 group-hover:w-1/2 transition-all duration-700 ease-out"
                        style={{ backgroundColor: cfg.color }}
                      />
                      <h3 className="font-fivo font-bold text-xl text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                        {exp.title}
                      </h3>
                      <p className="font-fivo text-foreground/70 text-sm leading-relaxed">
                        {exp.description.length > 120
                          ? `${exp.description.substring(0, 120)}...`
                          : exp.description}
                      </p>
                      <div className="mt-4 pt-3 border-t border-foreground/10 flex justify-end">
                        <motion.span
                          className="text-sm font-fivo font-medium inline-flex items-center gap-1 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
                          whileHover={{ x: 3 }}
                          transition={{ duration: 0.2 }}
                          style={{ color: cfg.color }}
                        >
                          Explorar
                          <svg
                            width="16"
                            height="16"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14 5l7 7m0 0l-7 7m7-7H3"
                            />
                          </svg>
                        </motion.span>
                      </div>
                    </div>

                    <div
                      className="absolute bottom-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: `radial-gradient(circle at 100% 100%, ${cfg.color}30, transparent 70%)`,
                      }}
                    />
                  </motion.div>
                );
              })}
          </div>

          {visibleExperienceCount < filteredExperiences.length && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setVisibleExperienceCount(prev => prev + 3)}
                className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium bg-black text-white rounded-full hover:bg-gray-800 transition"
              >
                <DynamicIcon icon={FaChevronDown} size={16} /> Ver más experiencias
              </button>
            </div>
          )}
          {visibleExperienceCount > 3 && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setVisibleExperienceCount(3)}
                className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium bg-gray-100 text-foreground rounded-full hover:bg-gray-200 transition"
              >
                <DynamicIcon icon={FaChevronUp} size={16} /> Ocultar experiencias
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}