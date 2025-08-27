"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane,
  TreePine,
  Droplet,
  Recycle,
  ShoppingBag,
  Users,
  Leaf,
  Download,
  ExternalLink,
  MapPin,
  Calculator,
  FileText,
  ChevronRight,
  X,
} from "lucide-react";
import { RiGovernmentLine } from "react-icons/ri";

/* ===============================
   Emission factors (kg CO2e)
   Fuente/método:
   - Vuelos: factor por pasajero-km + opción RF (Radiative Forcing) ~1.9
     (uso común en metodologías; ver DEFRA 2024 y guías sobre RF).
   - Carretera: factores promedio por pasajero-km (aprox., coche
     con ocupación media; bus; tren). Ajustables en el UI.
   - Hoteles: valor por noche (promedio conservador).
   NOTA: son valores por defecto editables desde el modal.
================================= */
const DEFAULT_FACTORS = {
  flight_pkm: 0.158, // Avión (kg CO2e/pkm, solo CO2). Con RF se multiplica.
  rf_multiplier: 1.9, // Radiative Forcing recomendado (rango típico 1.7–2.0)
  car_pkm: 0.12, // Coche promedio por pasajero-km
  bus_pkm: 0.05, // Bus por pasajero-km
  rail_pkm: 0.035, // Tren por pasajero-km
  hotel_night: 10, // kg CO2e por habitación-noche (promedio conservador)
};

/* Redondeo amable */
const round = (n: number, d = 1) =>
  Math.round(n * Math.pow(10, d)) / Math.pow(10, d);

export default function SustainabilityBanner() {
  const [hoveredTip, setHoveredTip] = useState<number | null>(null);
  const [hoveredResource, setHoveredResource] = useState<number | null>(null);

  // === MODAL CALCULADORA ===
  const [calcOpen, setCalcOpen] = useState(false);

  // Entradas
  const [flightKm, setFlightKm] = useState<number>(0);
  const [classMultiplier, setClassMultiplier] = useState<number>(1); // Economy=1; Premium=1.5; Business=2.0 (aprox)
  const [applyRF, setApplyRF] = useState<boolean>(true);

  const [carKm, setCarKm] = useState<number>(0);
  const [busKm, setBusKm] = useState<number>(0);
  const [railKm, setRailKm] = useState<number>(0);

  const [hotelNights, setHotelNights] = useState<number>(0);

  // Factores editables
  const [factors, setFactors] = useState(DEFAULT_FACTORS);

  // Resultados
  const calc = useMemo(() => {
    const flightBase = flightKm * factors.flight_pkm * classMultiplier;
    const flight = applyRF ? flightBase * factors.rf_multiplier : flightBase;

    const road =
      carKm * factors.car_pkm + busKm * factors.bus_pkm + railKm * factors.rail_pkm;

    const lodging = hotelNights * factors.hotel_night;

    const total = flight + road + lodging;

    return {
      flight: round(flight, 1),
      road: round(road, 1),
      lodging: round(lodging, 1),
      total: round(total, 1),
    };
  }, [
    flightKm,
    classMultiplier,
    applyRF,
    carKm,
    busKm,
    railKm,
    hotelNights,
    factors,
  ]);

  // Consejos principales de turismo sostenible
  const sustainabilityTips = [
    {
      icon: <Plane className="w-6 h-6 text-cyan-600" />,
      title: "Transporte",
      points: ["Buses intermunicipales", "Bicicletas en Puerto Colombia", "Comparte trayectos"],
      impact: "-70% CO₂",
    },
    {
      icon: <Droplet className="w-6 h-6 text-blue-600" />,
      title: "Agua",
      points: ["Duchas de 5 minutos", "Reutiliza toallas", "Reporta fugas"],
      impact: "-200L/día",
    },
    {
      icon: <Recycle className="w-6 h-6 text-green-600" />,
      title: "Residuos",
      points: ["Bolsa reutilizable", "Evita plásticos", "Separa basura"],
      impact: "-3kg/semana",
    },
    {
      icon: <ShoppingBag className="w-6 h-6 text-orange-600" />,
      title: "Economía Local",
      points: ["Artesanías Usiacurí", "Restaurantes locales", "Guías certificados"],
      impact: "80% local",
    },
    {
      icon: <Users className="w-6 h-6 text-red-600" />,
      title: "Cultura",
      points: ["Pide permisos", "Aprende del Carnaval", "Respeta tradiciones"],
      impact: "Preservación",
    },
    {
      icon: <TreePine className="w-6 h-6 text-green-600" />,
      title: "Naturaleza",
      points: ["Senderos marcados", "No alimentes fauna", "No extraigas especies"],
      impact: "Conservación",
    },
  ];

  // Recursos descargables
  const resources = [
    {
      icon: <FileText className="w-5 h-5 text-red-600" />,
      title: "Guía PDF Completa",
      subtitle: "Manual del viajero",
      size: "2.3 MB",
      kind: "pdf",
    },
    {
      icon: <MapPin className="w-5 h-5 text-green-600" />,
      title: "Destinos Ecológicos",
      subtitle: "Rincones naturales auténticos",
      size: "1.1 MB",
      kind: "eco",
    },
    {
      icon: (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/jimmy-avatar.png" alt="Jimmy" className="w-8 h-8 rounded-full object-cover" />
      ),
      title: "Jimmy - Asistente IA",
      subtitle: "Tu guía virtual del Atlántico",
      size: "Chat 24/7",
      kind: "jimmy",
    },
    {
      icon: <Calculator className="w-5 h-5 text-purple-600" />,
      title: "Calculadora Huella",
      subtitle: "Mide tu impacto",
      size: "Online",
      kind: "calc",
    },
  ];

  // Datos de impacto
  const impactStats = [
    { number: "23", label: "Municipios", color: "text-red-600" },
    { number: "5,000+", label: "Empleos locales", color: "text-amber-600" },
    { number: "40%", label: "Menos residuos", color: "text-green-600" },
    { number: "15", label: "Ecosistemas", color: "text-blue-600" },
  ];

  /* Handlers Recursos */
  const handleResourceClick = (kind: string) => {
    if (kind === "jimmy") {
      if (typeof window !== "undefined") {
        // 2 nombres de evento por si tipografías/guiones varían
        window.dispatchEvent(new Event("jimmy:open"));
        window.dispatchEvent(new Event("jimmy-open"));
  
        // fallback imperativo si el widget lo expone
        (window as any).openJimmy?.();
      }
      return;
    }
    if (kind === "calc") {
      setCalcOpen(true);
      return;
    }
    // otros recursos se manejan por <a>/<Link>
  };
  

  return (
    <section className="relative w-full bg-white py-16 sm:py-20 border-t border-gray-200">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(0,0,0,.02) 35px, rgba(0,0,0,.02) 70px)",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-600 px-4 py-2 rounded-full text-sm font-medium mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Leaf className="text-lg" />
            <span>Turismo Sostenible</span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Viaja de manera <span className="text-green-600">Responsable</span>
          </h2>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Pequeñas acciones que generan un gran impacto positivo en el Atlántico
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-10 p-6 
                     bg-gray-50 border border-gray-200 rounded-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {impactStats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className={`text-xl sm:text-2xl font-bold ${stat.color}`}>{stat.number}</div>
              <div className="text-xs text-gray-600">{stat.label}</div>
            </div>
          ))}

          <div className="hidden sm:block w-px h-8 bg-gray-300" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center shadow-lg">
              <RiGovernmentLine className="text-white text-xl" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-gray-900">EcoTurismo</div>
              <div className="text-xs text-gray-500">Gobernación del Atlántico</div>
            </div>
          </div>
        </motion.div>

        {/* Principios */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex lg:grid lg:grid-cols-6 gap-3 sm:gap-4 min-w-max lg:min-w-0">
              {sustainabilityTips.map((tip, idx) => (
                <motion.div
                  key={idx}
                  className="group relative bg-white border border-gray-200 rounded-xl p-4 sm:p-5 hover:border-gray-300 hover:shadow-lg hover:bg-gray-50 transition-all duration-300 min-w-[140px] sm:min-w-[160px] lg:min-w-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{
                    y: -4,
                    transition: { type: "spring", stiffness: 300, damping: 20 },
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ delay: idx * 0.05, duration: 0.4 }}
                  onMouseEnter={() => setHoveredTip(idx)}
                  onMouseLeave={() => setHoveredTip(null)}
                >
                  <motion.div
                    className="flex justify-center items-center w-12 h-12 mx-auto mb-3 rounded-lg bg-gray-50"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {tip.icon}
                  </motion.div>

                  <h3 className="text-sm font-semibold text-gray-700 text-center mb-2">{tip.title}</h3>

                  <div className="text-xs font-medium text-green-600 text-center mb-3 bg-green-50 rounded-full py-1">
                    {tip.impact}
                  </div>

                  <motion.div className="space-y-1" initial={{ opacity: 0.5 }} animate={{ opacity: hoveredTip === idx ? 1 : 0.5 }}>
                    {tip.points.map((point, pidx) => (
                      <div key={pidx} className="text-xs text-gray-500 flex items-start gap-1">
                        <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </motion.div>

                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 opacity-0 group-hover:opacity-100 rounded-b-xl"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recursos */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-10"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Recursos para tu Viaje</h3>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {resources.map((resource, idx) => {
              const isEco = resource.kind === "eco";
              const isGuide = resource.kind === "pdf";
              const isJimmy = resource.kind === "jimmy";
              const isCalc = resource.kind === "calc";

              const CardInner = (
                <div className="flex flex-col items-center text-center">
                  <motion.div
                    className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mb-3"
                    animate={{
                      scale: hoveredResource === idx ? 1.1 : 1,
                      rotate: hoveredResource === idx ? 5 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {resource.icon}
                  </motion.div>

                  <h4 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-red-600 transition-colors">
                    {resource.title}
                  </h4>

                  <p className="text-xs text-gray-500 mb-2">{resource.subtitle}</p>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-400">{resource.size}</span>
                    <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-red-600 transition-colors" />
                  </div>
                </div>
              );

              return (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onMouseEnter={() => setHoveredResource(idx)}
                  onMouseLeave={() => setHoveredResource(null)}
                  className="bg-white p-5 rounded-xl border border-gray-200 hover:border-red-300 hover:shadow-lg transition-all duration-200 text-left group"
                >
                  {isGuide ? (
                    // Descarga directa del PDF ubicado en public/docs/guia-turismo.pdf
                    <a
                      href="/docs/guia-turismo.pdf"
                      download="Guia-Turismo-Atlantico.pdf"
                      target="_blank"
                      rel="noopener"
                      className="block"
                      onClick={() => handleResourceClick(resource.kind)}
                    >
                      {CardInner}
                    </a>
                  ) : isEco ? (
                    // Navega a destinos con filtro EcoTurismo
                    <Link
                      href={{ pathname: "/destinations", query: { filter: "EcoTurismo" } }}
                      className="block"
                      onClick={() => handleResourceClick(resource.kind)}
                    >
                      {CardInner}
                    </Link>
                  ) : isJimmy || isCalc ? (
                    <button
                      type="button"
                      className="block w-full text-left"
                      onClick={() => handleResourceClick(resource.kind)}
                    >
                      {CardInner}
                    </button>
                  ) : (
                    CardInner
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* CTA Section (descarga PDF) */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <a
            href="/docs/guia-turismo.pdf"
            download
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold shadow-xl transition-all duration-300"
          >
            <Download className="w-5 h-5" />
            <span>Descargar Guía Completa</span>
          </a>
        </motion.div>
      </div>

      {/* ===== Modal Calculadora de Huella ===== */}
      <AnimatePresence>
        {calcOpen && (
          <motion.div
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCalcOpen(false)}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-200"
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-purple-600" />
                  <h4 className="font-semibold">Calculadora de Huella</h4>
                </div>
                <button
                  className="p-2 rounded-lg hover:bg-gray-100"
                  onClick={() => setCalcOpen(false)}
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6 p-5">
                {/* Vuelos */}
                <div className="space-y-3">
                  <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Plane className="w-4 h-4 text-cyan-600" /> Vuelos
                  </h5>
                  <label className="block text-sm text-gray-600">
                    Kilómetros (ida + vuelta)
                    <input
                      type="number"
                      min={0}
                      value={flightKm}
                      onChange={(e) => setFlightKm(Number(e.target.value || 0))}
                      className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                      placeholder="p. ej. 1800"
                    />
                  </label>
                  <label className="block text-sm text-gray-600">
                    Clase
                    <select
                      value={classMultiplier}
                      onChange={(e) => setClassMultiplier(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm bg-white"
                    >
                      <option value={1}>Económica (x1)</option>
                      <option value={1.5}>Premium Económica (x1.5)</option>
                      <option value={2}>Business (x2)</option>
                    </select>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={applyRF}
                      onChange={(e) => setApplyRF(e.target.checked)}
                    />
                    Incluir efecto de altitud / RF (recomendado)
                  </label>
                </div>

                {/* Carretera */}
                <div className="space-y-3">
                  <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-600" /> Transporte terrestre
                  </h5>
                  <div className="grid grid-cols-3 gap-3">
                    <label className="block text-sm text-gray-600">
                      Coche (km)
                      <input
                        type="number"
                        min={0}
                        value={carKm}
                        onChange={(e) => setCarKm(Number(e.target.value || 0))}
                        className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                        placeholder="p. ej. 120"
                      />
                    </label>
                    <label className="block text-sm text-gray-600">
                      Bus (km)
                      <input
                        type="number"
                        min={0}
                        value={busKm}
                        onChange={(e) => setBusKm(Number(e.target.value || 0))}
                        className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                        placeholder="p. ej. 60"
                      />
                    </label>
                    <label className="block text-sm text-gray-600">
                      Tren (km)
                      <input
                        type="number"
                        min={0}
                        value={railKm}
                        onChange={(e) => setRailKm(Number(e.target.value || 0))}
                        className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                        placeholder="p. ej. 80"
                      />
                    </label>
                  </div>
                </div>

                {/* Alojamiento */}
                <div className="space-y-3 md:col-span-2">
                  <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                    <TreePine className="w-4 h-4 text-green-600" /> Alojamiento
                  </h5>
                  <label className="block text-sm text-gray-600 max-w-xs">
                    Noches de hotel
                    <input
                      type="number"
                      min={0}
                      value={hotelNights}
                      onChange={(e) => setHotelNights(Number(e.target.value || 0))}
                      className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                      placeholder="p. ej. 3"
                    />
                  </label>
                </div>

                {/* Factores (avanzado) */}
                <details className="md:col-span-2 bg-gray-50 rounded-xl border border-gray-200 p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-gray-800">
                    Ajustar factores (avanzado)
                  </summary>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
                    {([
                      ["flight_pkm", "Vuelo (kg CO2e/pkm)"],
                      ["rf_multiplier", "RF multiplier (vuelos)"],
                      ["car_pkm", "Coche (kg CO2e/pkm)"],
                      ["bus_pkm", "Bus (kg CO2e/pkm)"],
                      ["rail_pkm", "Tren (kg CO2e/pkm)"],
                      ["hotel_night", "Hotel (kg CO2e/noche)"],
                    ] as const).map(([k, label]) => (
                      <label key={k} className="block text-sm text-gray-600">
                        {label}
                        <input
                          type="number"
                          step="0.001"
                          value={(factors as any)[k]}
                          onChange={(e) =>
                            setFactors((prev) => ({
                              ...prev,
                              [k]: Number(e.target.value || 0),
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm bg-white"
                        />
                      </label>
                    ))}
                  </div>
                </details>
              </div>

              {/* Resultados */}
              <div className="px-5 pb-5">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="rounded-xl border p-4">
                    <div className="text-xs text-gray-500">Vuelos</div>
                    <div className="text-2xl font-bold">{calc.flight} kg</div>
                  </div>
                  <div className="rounded-xl border p-4">
                    <div className="text-xs text-gray-500">Transporte terrestre</div>
                    <div className="text-2xl font-bold">{calc.road} kg</div>
                  </div>
                  <div className="rounded-xl border p-4">
                    <div className="text-xs text-gray-500">Alojamiento</div>
                    <div className="text-2xl font-bold">{calc.lodging} kg</div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-green-50 border border-green-200 p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-green-700">Huella total estimada</div>
                    <div className="text-2xl font-bold text-green-800">{calc.total} kg CO₂e</div>
                  </div>
                  <button
                    className="px-4 py-2 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700"
                    onClick={() => setCalcOpen(false)}
                  >
                    Listo
                  </button>
                </div>

                <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                  Esta calculadora usa factores por defecto inspirados en prácticas comunes (DEFRA / GHG
                  Protocol). Activa la opción <strong>RF</strong> para vuelos para contemplar efectos no-CO₂ en
                  altitud. Los factores son editables para adecuarse a contextos locales o nuevas tablas
                  oficiales.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
