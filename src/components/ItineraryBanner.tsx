"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Calendar, ChevronRight, Map, Clock, Sunrise, Sun, Sunset,
  Coffee, Utensils, MapPin, Star, Navigation, Sparkles
} from "lucide-react";
import { 
  RiGovernmentLine, RiMapLine, RiTimeLine, 
  RiUserLocationLine, RiAiGenerate
} from "react-icons/ri";
import PlannerPage from "@/components/planner/PlannerPage";

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
                <RiAiGenerate className="text-lg" />
                <span>Itinerario generado con IA</span>
              </motion.div>

              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
                style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
              >
                Planifica tu <span className="text-yellow-400">Aventura</span>
              </h2>

              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                Sistema inteligente de planificación turística del Atlántico.
                Crea itinerarios personalizados con actividades verificadas, horarios optimizados y recomendaciones locales.
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
                    <h4 className="font-semibold text-white mb-1">Timeline Visual</h4>
                    <p className="text-sm text-gray-400">Día completo organizado</p>
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
                    <h4 className="font-semibold text-white mb-1">Horarios Precisos</h4>
                    <p className="text-sm text-gray-400">Tiempo optimizado</p>
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
                    <h4 className="font-semibold text-white mb-1">Tips Locales</h4>
                    <p className="text-sm text-gray-400">Consejos de expertos</p>
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
                    <h4 className="font-semibold text-white mb-1">Verificado</h4>
                    <p className="text-sm text-gray-400">Información oficial</p>
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
                <motion.button
                  onClick={() => setPlannerOpen(true)}
                  className="px-8 py-4 bg-gradient-to-r from-red-700 to-red-600 text-white font-semibold rounded-full 
                          shadow-xl transition-all duration-300 flex items-center justify-center gap-3 hover:from-red-800 hover:to-red-700"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Sparkles className="text-xl" />
                  <span>Crear Mi Itinerario</span>
                  <ChevronRight className="text-xl" />
                </motion.button>

                <motion.button
                  onClick={() => router.push("/destinations")}
                  className="px-8 py-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white 
                          font-semibold rounded-full transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Explorar Destinos</span>
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Right Content - Realistic Itinerary Preview */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative">
                {/* Main Card - Realistic Itinerary View */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                  {/* Header con gradiente */}
                  <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-red-900 text-white p-4 lg:p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="px-2 py-1 lg:px-3 lg:py-1 bg-white/10 backdrop-blur rounded-full text-xs font-medium">
                        ITINERARIO PERSONALIZADO
                      </div>
                      <Sparkles size={14} className="text-yellow-400" />
                    </div>
                    <h3 className="text-lg lg:text-xl font-bold mb-1">Tu Aventura en el Atlántico</h3>
                    <p className="text-xs lg:text-sm text-gray-300">3 días • 12 actividades</p>
                  </div>

                  {/* Day selector */}
                  <div className="bg-gray-50 px-4 lg:px-6 py-2 lg:py-3 border-b border-gray-200">
                    <div className="flex items-center gap-2 overflow-x-auto">
                      <div className="px-3 py-1.5 lg:px-4 lg:py-2 bg-gray-900 text-white rounded-lg text-xs lg:text-sm font-medium whitespace-nowrap">
                        Día 1
                      </div>
                      <div className="px-3 py-1.5 lg:px-4 lg:py-2 bg-gray-100 text-gray-500 rounded-lg text-xs lg:text-sm whitespace-nowrap">
                        Día 2
                      </div>
                      <div className="px-3 py-1.5 lg:px-4 lg:py-2 bg-gray-100 text-gray-500 rounded-lg text-xs lg:text-sm whitespace-nowrap">
                        Día 3
                      </div>
                    </div>
                  </div>

                  {/* Timeline de actividades - Versión móvil compacta */}
                  <div className="p-4 lg:p-6 space-y-3 lg:space-y-4 max-h-64 lg:max-h-96 overflow-y-auto">
                    {/* Actividad 1 - Mañana */}
                    <div className="flex gap-2 lg:gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center flex-shrink-0">
                          <Sunrise size={14} className="text-white lg:hidden" />
                          <Sunrise size={18} className="text-white hidden lg:block" />
                        </div>
                        <div className="w-0.5 h-12 lg:h-16 bg-gradient-to-b from-gray-300 to-transparent mt-1 lg:mt-2" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="bg-white border border-gray-200 rounded-lg lg:rounded-xl p-2.5 lg:p-3">
                          <div className="flex items-center gap-1.5 lg:gap-2 mb-1">
                            <Clock size={10} className="text-gray-400 lg:hidden" />
                            <Clock size={12} className="text-gray-400 hidden lg:block" />
                            <span className="text-xs font-bold text-gray-900">08:00</span>
                            <span className="text-xs px-1.5 py-0.5 lg:px-2 bg-gray-100 rounded text-gray-600">2h</span>
                          </div>
                          <h4 className="font-semibold text-xs lg:text-sm text-gray-900 mb-0.5 lg:mb-1 truncate">Centro Histórico</h4>
                          <p className="text-xs text-gray-500 mb-1.5 lg:mb-2 line-clamp-1">Explora la arquitectura colonial</p>
                          <div className="flex items-center gap-1">
                            <MapPin size={10} className="text-gray-400 flex-shrink-0" />
                            <span className="text-xs text-gray-500 truncate">Barranquilla Centro</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actividad 2 - Tarde */}
                    <div className="flex gap-2 lg:gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-gradient-to-r from-blue-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                          <Sun size={14} className="text-white lg:hidden" />
                          <Sun size={18} className="text-white hidden lg:block" />
                        </div>
                        <div className="w-0.5 h-12 lg:h-16 bg-gradient-to-b from-gray-300 to-transparent mt-1 lg:mt-2" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="bg-white border border-gray-200 rounded-lg lg:rounded-xl p-2.5 lg:p-3">
                          <div className="flex items-center gap-1.5 lg:gap-2 mb-1">
                            <Clock size={10} className="text-gray-400 lg:hidden" />
                            <Clock size={12} className="text-gray-400 hidden lg:block" />
                            <span className="text-xs font-bold text-gray-900">12:00</span>
                            <span className="text-xs px-1.5 py-0.5 lg:px-2 bg-gray-100 rounded text-gray-600">1h</span>
                          </div>
                          <h4 className="font-semibold text-xs lg:text-sm text-gray-900 mb-0.5 lg:mb-1 truncate">La Cueva Restaurant</h4>
                          <p className="text-xs text-gray-500 mb-1.5 lg:mb-2 line-clamp-1">Gastronomía típica del Atlántico</p>
                          <div className="flex items-center gap-2 lg:gap-3">
                            <div className="flex items-center gap-1 min-w-0">
                              <MapPin size={10} className="text-gray-400 flex-shrink-0" />
                              <span className="text-xs text-gray-500 truncate">Vía 40</span>
                            </div>
                            <div className="flex items-center gap-0.5 flex-shrink-0">
                              {[1,2,3,4,5].map(i => (
                                <Star key={i} size={8} className={`lg:hidden ${i <= 4 ? "text-yellow-400 fill-current" : "text-gray-200 fill-current"}`} />
                              ))}
                              {[1,2,3,4,5].map(i => (
                                <Star key={i} size={10} className={`hidden lg:block ${i <= 4 ? "text-yellow-400 fill-current" : "text-gray-200 fill-current"}`} />
                              ))}
                              <span className="text-xs text-gray-600 ml-0.5 lg:ml-1">4.5</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actividad 3 - Atardecer - Solo en desktop */}
                    <div className="hidden lg:flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center">
                          <Sunset size={18} className="text-white" />
                        </div>
                        <div className="w-0.5 h-16 bg-gradient-to-b from-gray-300 to-transparent mt-2" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-white border border-gray-200 rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock size={12} className="text-gray-400" />
                            <span className="text-xs font-bold text-gray-900">17:00</span>
                            <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-600">2h</span>
                          </div>
                          <h4 className="font-semibold text-sm text-gray-900 mb-1">Museo del Caribe</h4>
                          <p className="text-xs text-gray-500 mb-2">Historia y cultura de la región</p>
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-2 mt-2">
                            <p className="text-xs text-blue-800">💡 Tip: No te pierdas la sala del Carnaval</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Indicador de más actividades en móvil */}
                    <div className="lg:hidden flex items-center justify-center py-2">
                      <div className="flex items-center gap-2 text-gray-400">
                        <div className="flex gap-1">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        </div>
                        <span className="text-xs">+9 actividades más</span>
                      </div>
                    </div>
                  </div>

                  {/* Meals Section - Versión móvil simplificada */}
                  <div className="bg-gray-50 px-4 lg:px-6 py-3 lg:py-4 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 mb-2">COMIDAS RECOMENDADAS</p>
                    <div className="grid grid-cols-3 gap-1.5 lg:gap-2">
                      <div className="flex flex-col lg:flex-row items-center gap-1 lg:gap-2 p-2 bg-yellow-50 rounded-lg">
                        <Coffee size={12} className="text-yellow-600 lg:hidden" />
                        <Coffee size={14} className="text-yellow-600 hidden lg:block" />
                        <div className="text-center lg:text-left">
                          <p className="text-[10px] lg:text-xs text-gray-500 lg:block hidden">Desayuno</p>
                          <p className="text-[10px] lg:text-xs font-semibold text-gray-900 truncate">Café del Mar</p>
                        </div>
                      </div>
                      <div className="flex flex-col lg:flex-row items-center gap-1 lg:gap-2 p-2 bg-orange-50 rounded-lg">
                        <Utensils size={12} className="text-orange-600 lg:hidden" />
                        <Utensils size={14} className="text-orange-600 hidden lg:block" />
                        <div className="text-center lg:text-left">
                          <p className="text-[10px] lg:text-xs text-gray-500 lg:block hidden">Almuerzo</p>
                          <p className="text-[10px] lg:text-xs font-semibold text-gray-900 truncate">La Cueva</p>
                        </div>
                      </div>
                      <div className="flex flex-col lg:flex-row items-center gap-1 lg:gap-2 p-2 bg-purple-50 rounded-lg">
                        <Utensils size={12} className="text-purple-600 lg:hidden" />
                        <Utensils size={14} className="text-purple-600 hidden lg:block" />
                        <div className="text-center lg:text-left">
                          <p className="text-[10px] lg:text-xs text-gray-500 lg:block hidden">Cena</p>
                          <p className="text-[10px] lg:text-xs font-semibold text-gray-900 truncate">Nena Lela</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action */}
                  <div className="bg-white px-4 lg:px-6 py-2.5 lg:py-3 border-t border-gray-200">
                    <button className="w-full flex items-center justify-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 bg-gray-900 text-white rounded-lg lg:rounded-xl hover:bg-gray-800 transition-colors text-xs lg:text-sm font-medium">
                      <Navigation size={12} className="lg:hidden" />
                      <Navigation size={14} className="hidden lg:block" />
                      Ver itinerario completo
                    </button>
                  </div>
                </div>

                {/* Decorative shadow */}
                <div className="absolute -bottom-4 -right-4 left-4 top-4 bg-red-600/10 rounded-2xl -z-10 blur-xl" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PlannerPage (modal) */}
      <PlannerPage open={plannerOpen} onOpenChange={setPlannerOpen} />
    </>
  );
}