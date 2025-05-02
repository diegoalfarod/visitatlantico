// src/components/QuickFilters.tsx
"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FaCameraRetro,
  FaUmbrellaBeach,
  FaLandmark,
  FaPalette,
  FaTree,
  FaUtensils,
  FaTheaterMasks,
} from "react-icons/fa";

const filters = [
  { icon: FaCameraRetro,   label: "Spots Instagrameables", color: "#F4B223" }, // Oro corporativo
  { icon: FaUmbrellaBeach, label: "Playas",               color: "#009ADE" }, // Azul Caribe
  { icon: FaLandmark,      label: "Historia",             color: "#FFDD00" }, // Amarillo complementario
  { icon: FaPalette,       label: "Artesanías",           color: "#0047BA" }, // Azul profundo
  { icon: FaTree,          label: "EcoTurismo",           color: "#95D4E9" }, // Celeste suave
  { icon: FaUtensils,      label: "Gastronomía",          color: "#00833E" }, // Verde oscuro
  { icon: FaTheaterMasks,  label: "Cultura",              color: "#00B451" }, // Verde vivo
];

export default function QuickFilters() {
  const router = useRouter();
  const handleClick = (label: string) => {
    router.push(`/destinations?category=${encodeURIComponent(label)}`);
  };

  return (
    <section className="relative w-full bg-white -mt-3 pb-10 z-20">
      <motion.div
        className="max-w-7xl mx-auto flex flex-nowrap justify-center gap-3 md:gap-5 overflow-x-auto p-4 bg-white shadow-lg rounded-full border border-border"
        initial={{ y: 20 }}
        animate={{
          y: [0, -5, 0],
          transition: { duration: 4, repeat: Infinity, repeatType: "reverse" },
        }}
      >
        {filters.map(({ icon: Icon, label, color }, idx) => (
          <motion.button
            key={label}
            onClick={() => handleClick(label)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            className="flex items-center gap-2 px-6 py-3 bg-white shadow-md rounded-full border border-border hover:shadow-lg transition-all whitespace-nowrap"
          >
            <Icon
              className="text-xl md:text-2xl"
              style={{ color }}
            />
            <span className="text-sm font-fivo font-semibold text-foreground">
              {label}
            </span>
          </motion.button>
        ))}
      </motion.div>
    </section>
  );
}
