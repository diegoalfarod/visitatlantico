"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HiOutlineMapPin, 
  HiOutlineClock,
  HiOutlineCalendarDays,
  HiOutlineCurrencyDollar,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineShare,
  HiOutlineLightBulb,
  HiOutlineSparkles,
  HiOutlineMap,
  HiOutlineStar,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlinePhoto
} from "react-icons/hi2";
import { 
  IoRestaurant, 
  IoSunny, 
  IoMoon,
  IoPartlySunny,
  IoCafe,
  IoWater,
  IoMusicalNotes,
  IoColorPalette,
  IoLeaf,
  IoCamera,
  IoBusiness,
  IoChevronBack,
  IoChevronForward,
  IoClose,
  IoCarOutline,
  IoWalkOutline,
  IoTimeOutline
} from "react-icons/io5";
import Image from "next/image";
import Link from "next/link";
import { getPlaceImage, getCategoryImage } from "@/data/place-images";

// =============================================================================
// COLORES - Marca Atlántico
// =============================================================================
const COLORS = {
  azulBarranquero: "#007BC4",
  rojoCayena: "#D31A2B",
  naranjaSalinas: "#EA5B13",
  amarilloArepa: "#F39200",
  verdeBijao: "#008D39",
  beigeIraca: "#B8A88A",
  grisOscuro: "#1a1a2e",
};

// =============================================================================
// TIPOS
// =============================================================================
interface Activity {
  id: string;
  name: string;
  description: string;
  time: string;
  duration: string;
  location: {
    address: string;
    municipality?: string;
    coordinates?: { lat: number; lng: number };
  };
  category: string;
  tips?: string[];
  pricing?: string;
  rating?: number;
  photos?: string[];
  whyRecommended?: string;
}

interface DayItinerary {
  day: number;
  date: string;
  title: string;
  description: string;
  theme?: string;
  municipality?: string;
  activities: Activity[];
  meals?: { breakfast?: string; lunch?: string; dinner?: string };
  estimatedCost?: number;
}

interface ItineraryData {
  id: string;
  profile: {
    days: number;
    tripType: string;
    budget: string;
    interests: string[];
  };
  days: DayItinerary[];
  metadata: { generatedAt: string; totalActivities?: number; totalCost?: number };
}

// =============================================================================
// CONFIG
// =============================================================================
const CATEGORY_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  museo: { icon: IoBusiness, color: COLORS.azulBarranquero, label: "Museo" },
  cultura: { icon: IoColorPalette, color: COLORS.rojoCayena, label: "Cultura" },
  playa: { icon: IoWater, color: COLORS.azulBarranquero, label: "Playa" },
  restaurante: { icon: IoRestaurant, color: COLORS.naranjaSalinas, label: "Restaurante" },
  bar: { icon: IoMusicalNotes, color: COLORS.rojoCayena, label: "Bar" },
  entretenimiento: { icon: IoMusicalNotes, color: COLORS.amarilloArepa, label: "Entretenimiento" },
  artesanias: { icon: IoColorPalette, color: COLORS.amarilloArepa, label: "Artesanías" },
  naturaleza: { icon: IoLeaf, color: COLORS.verdeBijao, label: "Naturaleza" },
  mirador: { icon: IoCamera, color: COLORS.naranjaSalinas, label: "Mirador" },
  parque: { icon: IoLeaf, color: COLORS.verdeBijao, label: "Parque" },
  cafe: { icon: IoCafe, color: COLORS.beigeIraca, label: "Café" },
};

const TRIP_LABELS: Record<string, string> = {
  solo: "Aventura Solo", pareja: "Escapada Romántica", familia: "Vacaciones Familiares", amigos: "Con Amigos"
};

// =============================================================================
// HELPERS
// =============================================================================
function getActivityImage(activity: Activity, index: number): string {
  // Primero intentar imágenes del lugar
  const placeImages = getPlaceImage(activity.id);
  if (placeImages.primary) return placeImages.primary;
  // Luego fotos del activity
  if (activity.photos?.[0]) return activity.photos[0];
  // Fallback por categoría
  return getCategoryImage(activity.category, index);
}

function getTimeInfo(time: string): { label: string; icon: any; color: string; bg: string } {
  const hour = parseInt(time.split(':')[0]);
  if (hour < 12) return { label: "Mañana", icon: IoSunny, color: COLORS.amarilloArepa, bg: "#fef3c7" };
  if (hour < 17) return { label: "Tarde", icon: IoPartlySunny, color: COLORS.naranjaSalinas, bg: "#ffedd5" };
  if (hour < 20) return { label: "Atardecer", icon: IoPartlySunny, color: COLORS.rojoCayena, bg: "#fee2e2" };
  return { label: "Noche", icon: IoMoon, color: COLORS.azulBarranquero, bg: "#dbeafe" };
}

function getCatConfig(cat: string) {
  return CATEGORY_CONFIG[cat] || { icon: HiOutlineMapPin, color: COLORS.grisOscuro, label: cat };
}

function formatMoney(n: number): string {
  if (n === 0) return "Gratis";
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);
}

const ease = [0.22, 1, 0.36, 1];

// =============================================================================
// COMPONENTES
// =============================================================================

// Loading
function Loading() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="relative w-16 h-16 mx-auto mb-4">
          <motion.div className="absolute inset-0 rounded-full border-4 border-t-white border-transparent" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
        </div>
        <p className="text-white/70">Cargando tu aventura...</p>
      </motion.div>
    </div>
  );
}

// Error
function ErrorView({ error }: { error: string }) {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md text-center shadow-xl">
        <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `${COLORS.rojoCayena}15` }}>
          <HiOutlineExclamationCircle className="w-8 h-8" style={{ color: COLORS.rojoCayena }} />
        </div>
        <h2 className="text-xl font-bold mb-2">No pudimos cargar el itinerario</h2>
        <p className="text-slate-500 mb-6">{error}</p>
        <button onClick={() => router.push('/')} className="px-6 py-3 rounded-full text-white font-medium" style={{ background: `linear-gradient(135deg, ${COLORS.naranjaSalinas}, ${COLORS.rojoCayena})` }}>
          Volver al inicio
        </button>
      </div>
    </div>
  );
}

// Imagen con loading
function PlaceImg({ src, alt, className = "", priority = false }: { src: string; alt: string; className?: string; priority?: boolean }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`relative overflow-hidden bg-slate-200 ${className}`}>
      {!loaded && <div className="absolute inset-0 bg-slate-300 animate-pulse" />}
      <Image src={src} alt={alt} fill className={`object-cover transition-all duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`} onLoad={() => setLoaded(true)} priority={priority} sizes="(max-width: 768px) 100vw, 50vw" />
    </div>
  );
}

// Mini ruta visual del día
function DayRoutePreview({ activities }: { activities: Activity[] }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-hide">
      {activities.map((act, i) => {
        const config = getCatConfig(act.category);
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md" style={{ backgroundColor: config.color }}>
                {i + 1}
              </div>
              <span className="text-[10px] text-white/60 mt-1 max-w-[60px] truncate text-center">{act.name.split(' ')[0]}</span>
            </div>
            {i < activities.length - 1 && (
              <div className="flex items-center mx-1">
                <div className="w-8 h-0.5 bg-white/30" />
                <IoCarOutline className="w-3 h-3 text-white/40" />
                <div className="w-8 h-0.5 bg-white/30" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Card de parada en el itinerario (estilo timeline)
function StopCard({ activity, index, total, onViewPhotos }: { activity: Activity; index: number; total: number; onViewPhotos: () => void }) {
  const config = getCatConfig(activity.category);
  const timeInfo = getTimeInfo(activity.time);
  const image = getActivityImage(activity, index);
  const isLast = index === total - 1;

  return (
    <motion.div 
      className="relative"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease }}
    >
      {/* Timeline connector */}
      <div className="absolute left-6 top-0 bottom-0 flex flex-col items-center">
        {/* Número de parada */}
        <div className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg" style={{ backgroundColor: config.color }}>
          {index + 1}
        </div>
        {/* Línea conectora */}
        {!isLast && (
          <div className="flex-1 w-0.5 bg-gradient-to-b from-slate-300 to-slate-200 my-2">
            <div className="absolute left-4 top-16 flex items-center gap-1 text-xs text-slate-400">
              <IoCarOutline className="w-3 h-3" />
              <span>~15 min</span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="ml-20 pb-8">
        {/* Time badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold" style={{ backgroundColor: timeInfo.bg, color: timeInfo.color }}>
            <timeInfo.icon className="w-4 h-4" />
            {activity.time}
          </span>
          <span className="text-sm text-slate-500">{activity.duration}</span>
        </div>

        {/* Card principal */}
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Imagen */}
            <div className="relative md:w-72 h-48 md:h-auto flex-shrink-0 cursor-pointer group" onClick={onViewPhotos}>
              <PlaceImg src={image} alt={activity.name} className="w-full h-full" priority={index < 2} />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-2">
                  <HiOutlinePhoto className="w-5 h-5 text-slate-700" />
                </div>
              </div>
              {/* Category badge en imagen */}
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-white text-xs font-medium" style={{ backgroundColor: config.color }}>
                  <config.icon className="w-3 h-3" />
                  {config.label}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 p-5">
              <h3 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Josefin Sans', sans-serif" }}>
                {activity.name}
              </h3>
              
              {/* Location */}
              <p className="text-sm text-slate-500 flex items-center gap-1.5 mb-3">
                <HiOutlineMapPin className="w-4 h-4 flex-shrink-0" />
                {activity.location.municipality || activity.location.address}
              </p>

              {/* Description */}
              <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-2">
                {activity.description}
              </p>

              {/* Why recommended */}
              {activity.whyRecommended && (
                <div className="flex gap-2 p-3 rounded-xl mb-4" style={{ backgroundColor: `${COLORS.amarilloArepa}10` }}>
                  <HiOutlineSparkles className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: COLORS.amarilloArepa }} />
                  <p className="text-xs text-amber-800">{activity.whyRecommended}</p>
                </div>
              )}

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {activity.rating && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 rounded-lg text-xs">
                    <HiOutlineStar className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="font-semibold text-amber-700">{activity.rating.toFixed(1)}</span>
                  </span>
                )}
                {activity.pricing && (
                  <span className="px-2 py-1 rounded-lg text-xs font-medium" style={{ backgroundColor: `${COLORS.verdeBijao}12`, color: COLORS.verdeBijao }}>
                    {activity.pricing}
                  </span>
                )}
              </div>

              {/* Tip */}
              {activity.tips?.[0] && (
                <div className="flex gap-2 text-xs text-slate-500 border-t border-slate-100 pt-3">
                  <HiOutlineLightBulb className="w-4 h-4 flex-shrink-0" style={{ color: COLORS.naranjaSalinas }} />
                  <span>{activity.tips[0]}</span>
                </div>
              )}

              {/* Action button */}
              {activity.location.coordinates && (
                <button
                  onClick={() => window.open(`https://maps.google.com/maps?q=${activity.location.coordinates!.lat},${activity.location.coordinates!.lng}`, '_blank')}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                  <HiOutlineMap className="w-4 h-4" />
                  Cómo llegar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Galería fullscreen
function Gallery({ activity, onClose }: { activity: Activity; onClose: () => void }) {
  const [idx, setIdx] = useState(0);
  const placeImages = getPlaceImage(activity.id);
  const photos = placeImages.gallery.length > 0 ? placeImages.gallery : (activity.photos?.length ? activity.photos : [getCategoryImage(activity.category)]);
  
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setIdx(i => (i + 1) % photos.length);
      if (e.key === 'ArrowLeft') setIdx(i => (i - 1 + photos.length) % photos.length);
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [photos.length, onClose]);

  return (
    <motion.div className="fixed inset-0 z-50 bg-black/95" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <button onClick={onClose} className="absolute top-4 right-4 z-10 p-3 rounded-full bg-white/10 text-white hover:bg-white/20"><IoClose className="w-6 h-6" /></button>
      <div className="absolute top-4 left-4 px-4 py-2 rounded-full bg-white/10 text-white text-sm">{idx + 1} / {photos.length}</div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          <motion.div key={idx} className="relative w-full h-full max-w-5xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Image src={photos[idx]} alt={activity.name} fill className="object-contain" priority />
          </motion.div>
        </AnimatePresence>
      </div>
      {photos.length > 1 && (
        <>
          <button onClick={() => setIdx(i => (i - 1 + photos.length) % photos.length)} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20"><IoChevronBack className="w-6 h-6" /></button>
          <button onClick={() => setIdx(i => (i + 1) % photos.length)} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20"><IoChevronForward className="w-6 h-6" /></button>
        </>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
        <h3 className="text-2xl font-bold text-white">{activity.name}</h3>
        <p className="text-white/70 mt-1">{activity.location.address}</p>
      </div>
    </motion.div>
  );
}

// Selector de días con thumbnails
function DayTabs({ days, selected, onSelect }: { days: DayItinerary[]; selected: number; onSelect: (i: number) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
      {days.map((day, i) => {
        const active = selected === i;
        const img = getActivityImage(day.activities[0], 0);
        return (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={`relative flex-shrink-0 rounded-xl overflow-hidden transition-all ${active ? 'ring-2 ring-white ring-offset-2 ring-offset-black/50' : 'opacity-60 hover:opacity-80'}`}
            style={{ width: active ? 110 : 60, height: 70 }}
          >
            <Image src={img} alt={`Día ${day.day}`} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-1 left-2">
              <p className="text-white/70 text-[10px]">Día</p>
              <p className="text-white text-lg font-bold leading-none">{day.day}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// =============================================================================
// PÁGINA PRINCIPAL
// =============================================================================
export default function ItineraryPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<ItineraryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dayIdx, setDayIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [gallery, setGallery] = useState<Activity | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const cached = localStorage.getItem('lastItinerary');
        if (cached) {
          const c = JSON.parse(cached);
          if (c.id === params.id && c.itinerary?.days) {
            setData({ id: c.id, profile: c.profile || {}, days: c.itinerary.days, metadata: c.itinerary.metadata || {} });
            setLoading(false);
            return;
          }
        }
        const res = await fetch(`/api/itinerary/${params.id}`);
        if (!res.ok) throw new Error('No encontrado');
        setData(await res.json());
      } catch (e: any) { setError(e.message); } finally { setLoading(false); }
    };
    load();
  }, [params.id]);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) await navigator.share({ title: 'Mi Itinerario', url }).catch(() => {});
    else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  const openRoute = () => {
    if (!data) return;
    const acts = data.days[dayIdx].activities.filter(a => a.location.coordinates);
    if (!acts.length) return;
    const o = acts[0].location.coordinates!, d = acts[acts.length - 1].location.coordinates!;
    const w = acts.slice(1, -1).map(a => `${a.location.coordinates!.lat},${a.location.coordinates!.lng}`).join('|');
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${o.lat},${o.lng}&destination=${d.lat},${d.lng}${w ? `&waypoints=${w}` : ''}&travelmode=driving`, '_blank');
  };

  if (loading) return <Loading />;
  if (error || !data) return <ErrorView error={error || 'No encontrado'} />;

  const day = data.days[dayIdx];
  const heroImg = getActivityImage(day.activities[0], 0);

  return (
    <div className="min-h-screen bg-slate-100">
      <AnimatePresence>{gallery && <Gallery activity={gallery} onClose={() => setGallery(null)} />}</AnimatePresence>

      {/* Hero compacto con info del día */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <Image src={heroImg} alt={day.title} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30" />

        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-20 p-4">
          <div className="max-w-5xl mx-auto flex justify-between">
            <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition">
              <HiOutlineChevronLeft className="w-5 h-5" /><span className="hidden sm:inline font-medium">Inicio</span>
            </Link>
            <div className="flex gap-2">
              <button onClick={openRoute} className="p-2.5 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20" title="Ver ruta"><HiOutlineMap className="w-5 h-5" /></button>
              <button onClick={share} className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20">
                {copied ? <HiOutlineCheckCircle className="w-5 h-5" /> : <HiOutlineShare className="w-5 h-5" />}
                <span className="hidden sm:inline text-sm">{copied ? 'Copiado' : 'Compartir'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
          <div className="max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-sm mb-3">
              <HiOutlineSparkles className="w-4 h-4 text-amber-400" />
              {TRIP_LABELS[data.profile.tripType]} • {data.profile.days} días
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3" style={{ fontFamily: "'Josefin Sans', sans-serif" }}>
              Día {day.day}: {day.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap gap-3 text-white/80 text-sm mb-4">
              <span className="flex items-center gap-1.5"><HiOutlineCalendarDays className="w-4 h-4" />{day.date}</span>
              <span className="flex items-center gap-1.5"><HiOutlineMapPin className="w-4 h-4" />{day.municipality || 'Atlántico'}</span>
              <span className="flex items-center gap-1.5"><IoTimeOutline className="w-4 h-4" />{day.activities.length} paradas</span>
              {day.estimatedCost && <span className="flex items-center gap-1.5"><HiOutlineCurrencyDollar className="w-4 h-4" />{formatMoney(day.estimatedCost)}</span>}
            </div>

            {/* Mini route preview */}
            <DayRoutePreview activities={day.activities} />

            {/* Day tabs */}
            <div className="mt-4">
              <DayTabs days={data.days} selected={dayIdx} onSelect={setDayIdx} />
            </div>
          </div>
        </div>
      </section>

      {/* Timeline de paradas */}
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: "'Josefin Sans', sans-serif" }}>
            Tu ruta del día
          </h2>
          <p className="text-slate-500">{day.description}</p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {day.activities.map((act, i) => (
            <StopCard key={act.id || i} activity={act} index={i} total={day.activities.length} onViewPhotos={() => setGallery(act)} />
          ))}
        </div>

        {/* Map CTA */}
        <div className="mt-8 p-6 bg-white rounded-2xl shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Ver ruta completa en Google Maps</h3>
              <p className="text-sm text-slate-500">Abre la navegación con todas las paradas del día</p>
            </div>
            <button onClick={openRoute} className="flex items-center gap-2 px-6 py-3 text-white rounded-xl font-medium" style={{ background: `linear-gradient(135deg, ${COLORS.azulBarranquero}, ${COLORS.grisOscuro})` }}>
              <HiOutlineMap className="w-5 h-5" />
              Abrir en Maps
            </button>
          </div>
        </div>

        {/* Day navigation */}
        <div className="flex items-center justify-between mt-10 pt-8 border-t border-slate-200">
          <button
            onClick={() => setDayIdx(Math.max(0, dayIdx - 1))}
            disabled={dayIdx === 0}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition ${dayIdx === 0 ? 'bg-slate-200 text-slate-400' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
          >
            <HiOutlineChevronLeft className="w-5 h-5" /><span className="hidden sm:inline">Día anterior</span>
          </button>

          <div className="flex gap-1.5">
            {data.days.map((_, i) => (
              <button key={i} onClick={() => setDayIdx(i)} className={`h-2 rounded-full transition-all ${i === dayIdx ? 'w-6' : 'w-2'}`} style={{ backgroundColor: i === dayIdx ? COLORS.naranjaSalinas : '#cbd5e1' }} />
            ))}
          </div>

          <button
            onClick={() => setDayIdx(Math.min(data.days.length - 1, dayIdx + 1))}
            disabled={dayIdx === data.days.length - 1}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition ${dayIdx === data.days.length - 1 ? 'bg-slate-200 text-slate-400' : 'text-white'}`}
            style={dayIdx < data.days.length - 1 ? { background: `linear-gradient(135deg, ${COLORS.naranjaSalinas}, ${COLORS.rojoCayena})` } : {}}
          >
            <span className="hidden sm:inline">Siguiente día</span><HiOutlineChevronRight className="w-5 h-5" />
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${COLORS.naranjaSalinas}, ${COLORS.rojoCayena})` }}>
              <HiOutlineSparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">Tu Aventura en el Atlántico</p>
              <p className="text-xs text-slate-400">Itinerario generado con IA</p>
            </div>
          </div>
          <p className="text-xs text-slate-500">ID: {data.id}</p>
        </div>
      </footer>

      <style jsx global>{`.scrollbar-hide::-webkit-scrollbar{display:none}.scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
}