"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, ChevronRight, Map } from "lucide-react";
import { RiGovernmentLine, RiMapLine, RiTimeLine, RiUserLocationLine } from "react-icons/ri";
import PlannerPage from "@/components/planner/PlannerPage"; // ⬅️ usar PlannerPage

export default function ItineraryBanner() {
  const router = useRouter();
  const [plannerOpen, setPlannerOpen] = useState(false);

  return (
    <>
      <section className="relative w-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-16 sm:py-20 lg:py-24 overflow-hidden">
        {/* Background pattern - subtle institutional */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                `repeating-linear-gradient(90deg, transparent, transparent 100px, rgba(255,255,255,.05) 100px, rgba(255,255,255,.05) 101px)`,
            }}
          />
        </div>

        {/* Subtle decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-red-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-64 h-64 bg-red-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-white"
            >
              {/* AI badge */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-red-900/20 border border-red-800/30 text-red-400 px-4 py-2 rounded-full text-sm font-medium mb-6"
              >
                <RiGovernmentLine className="text-lg" />
                <span>Planificación potenciada por IA</span>
              </motion.div>

              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
                style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
              >
                Planifica tu <span className="text-yellow-400">Itinerario</span>
              </h2>

              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                Sistema oficial de planificación turística del departamento del Atlántico.
                Crea rutas optimizadas basadas en datos actualizados y recomendaciones verificadas.
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-6 mb-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <RiMapLine className="text-red-400 text-xl" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Rutas Oficiales</h4>
                    <p className="text-sm text-gray-400">Verificadas y actualizadas</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <RiTimeLine className="text-red-400 text-xl" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Tiempo Optimizado</h4>
                    <p className="text-sm text-gray-400">Maximiza tu experiencia</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <RiUserLocationLine className="text-red-400 text-xl" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Personalizable</h4>
                    <p className="text-sm text-gray-400">Adaptado a tus intereses</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <RiGovernmentLine className="text-red-400 text-xl" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Certificado Oficial</h4>
                    <p className="text-sm text-gray-400">Gobernación del Atlántico</p>
                  </div>
                </motion.div>
              </div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                {/* Abrir PlannerPage */}
                <motion.button
                  onClick={() => setPlannerOpen(true)}
                  className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full 
                          shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Crear Itinerario</span>
                  <ChevronRight className="text-xl" />
                </motion.button>

                {/* Ir a /destinations */}
                <motion.button
                  onClick={() => router.push("/destinations")}
                  className="px-8 py-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white 
                          font-semibold rounded-full transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Ver Destinos</span>
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Right Content - Map Preview */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                {/* Main Card */}
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-2xl">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-white text-lg font-bold">Itinerario Atlántico</h3>
                      <p className="text-gray-400 text-sm">3 días • 7 destinos</p>
                    </div>
                    <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center">
                      <Calendar className="text-red-400 text-xl" />
                    </div>
                  </div>

                  {/* Route Points */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        1
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold">Barranquilla</h4>
                        <p className="text-gray-400 text-sm">Centro histórico y museos</p>
                      </div>
                      <span className="text-gray-500 text-sm">Día 1</span>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-red-600/70 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        2
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold">Puerto Colombia</h4>
                        <p className="text-gray-400 text-sm">Playas y gastronomía</p>
                      </div>
                      <span className="text-gray-500 text-sm">Día 2</span>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-red-600/40 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        3
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold">Usiacurí</h4>
                        <p className="text-gray-400 text-sm">Artesanías y cultura</p>
                      </div>
                      <span className="text-gray-500 text-sm">Día 3</span>
                    </div>
                  </div>

                  {/* Map Preview */}
                  <div className="relative h-48 bg-gray-900/50 rounded-xl overflow-hidden border border-gray-700">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Map className="text-gray-600 w-12 h-12" />
                    </div>

                    {/* Map Points */}
                    <div className="absolute top-1/4 left-1/3">
                      <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                    </div>
                    <div className="absolute top-1/2 left-1/2">
                      <div className="w-3 h-3 bg-red-600/70 rounded-full animate-pulse delay-75" />
                    </div>
                    <div className="absolute bottom-1/3 right-1/3">
                      <div className="w-3 h-3 bg-red-600/40 rounded-full animate-pulse delay-150" />
                    </div>

                    {/* Connecting Lines */}
                    <svg className="absolute inset-0 w-full h-full">
                      <path
                        d="M 80 60 Q 120 100 140 120 T 180 140"
                        stroke="rgba(220, 38, 38, 0.3)"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray="5,5"
                      />
                    </svg>
                  </div>

                  {/* Footer Stats */}
                  <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-700">
                    <div className="text-center">
                      <div className="text-red-400 text-xl font-bold">150</div>
                      <div className="text-gray-500 text-xs">km totales</div>
                    </div>
                    <div className="text-center">
                      <div className="text-red-400 text-xl font-bold">12</div>
                      <div className="text-gray-500 text-xs">actividades</div>
                    </div>
                    <div className="text-center">
                      <div className="text-red-400 text-xl font-bold">100%</div>
                      <div className="text-gray-500 text-xs">optimizado</div>
                    </div>
                  </div>
                </div>

                {/* Decorative shadow */}
                <div className="absolute -bottom-4 -right-4 left-4 top-4 bg-red-600/10 rounded-2xl -z-10 blur-xl" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PlannerPage (nuevo modal) */}
      <PlannerPage open={plannerOpen} onOpenChange={setPlannerOpen} />
    </>
  );
}
