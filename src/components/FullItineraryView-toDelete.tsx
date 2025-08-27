"use client";

import React, { useMemo, useState, useEffect } from "react";
import ItineraryMap from "@/components/ItineraryMap";
import MultiDayItinerary from "@/components/MultiDayItinerary";
import type { Stop } from "@/types/itinerary";
import {
  ArrowLeft,
  Save as SaveIcon,
  Download,
  Share2,
  CalendarDays,
  Clock,
  MapPin,
  Route,
  Sparkles,
  Info,
  Map,
  List,
  ChevronDown,
  ChevronUp,
  Users,
  DollarSign,
  Star,
  Navigation,
  Printer,
  Phone,
  Globe,
  Car,
  Bus,
  Footprints,
  Sun,
  Cloud,
  AlertCircle,
  CheckCircle,
  Coffee,
  Utensils,
  Camera,
  ShoppingBag,
  Trees,
  Building,
  Heart,
  Bookmark,
  Filter,
  LayoutGrid,
  MessageCircle,
  Send,
  Copy,
  ExternalLink,
  Sunrise,
  Sunset,
  Moon,
  Activity,
  TrendingUp,
  BarChart3,
  PieChart,
  Wallet,
  CreditCard,
  QrCode,
  Shield,
  Wifi,
  Battery,
  Signal,
  Zap,
  Gauge,
  Target,
  Award,
  Trophy,
  Flag,
  Compass,
  Anchor,
  Plane,
  Train,
  Ship,
  Bike,
  Hotel,
  Home,
  Tent,
  Mountain,
  Waves,
  Umbrella,
  Wind,
  Thermometer,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Settings,
  HelpCircle,
  MoreVertical,
  MoreHorizontal,
  Menu,
  X,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  RotateCw,
  Maximize2,
  Minimize2,
  Expand,
  Shrink,
  Move,
  Grid3x3,
  Layers,
  Package,
  Archive,
  Folder,
  FolderOpen,
  File,
  FileText,
  Image,
  Video,
  Music,
  Mic,
  Headphones,
  Speaker,
  Bell,
  BellOff,
  BellRing,
  Hash,
  Tag,
  Tags,
  Search,
  ZoomIn,
  ZoomOut,
  ScanLine,
  Crosshair,
  Locate,
  LocateFixed,
  MapPinOff,
  Navigation2,
  Briefcase,
  Luggage,
} from "lucide-react";

/**
 * FullItineraryView - Experiencia Premium de Itinerario Turístico
 * Diseño profesional con funcionalidades avanzadas para viajeros
 */
export default function FullItineraryView({
  itinerary,
  onUpdate,
  answers,
  locationData,
  onBack,
  onSave,
  readOnly = false,
}: {
  itinerary: Stop[];
  onUpdate: (s: Stop[]) => void;
  answers: any;
  locationData: { lat: number; lng: number } | null;
  onBack: () => void;
  onSave: () => void;
  readOnly?: boolean;
}) {
  // Estados avanzados
  const [activeView, setActiveView] = useState<"overview" | "map" | "timeline" | "practical">("overview");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [preferredTransport, setPreferredTransport] = useState<"car" | "transit" | "walk">("car");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weatherData, setWeatherData] = useState<any>(null);
  const [showEmergencyInfo, setShowEmergencyInfo] = useState(false);
  const [favoriteStops, setFavoriteStops] = useState<string[]>([]);
  const [userNotes, setUserNotes] = useState<Record<string, string>>({});
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [currency, setCurrency] = useState("EUR");
  const [language, setLanguage] = useState("es");

  // Actualizar reloj en tiempo real
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Normalizar días y calcular fechas
  const days = Math.max(1, Number(answers?.days ?? 1));
  const startDate = answers?.startDate ? new Date(answers.startDate) : new Date();
  
  // Análisis avanzado del itinerario
  const analytics = useMemo(() => {
    const stops = itinerary ?? [];
    const totalMinutes = stops.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalRemain = totalMinutes % 60;
    const totalStops = stops.length;
    
    // Distancias y transporte
    const totalDistanceKm = stops.reduce((sum, s) => sum + (Number(s.distance) || 0), 0);
    const walkableStops = stops.filter(s => Number(s.distance) < 1).length;
    const driveRequired = stops.filter(s => Number(s.distance) > 5).length;
    
    // Análisis geográfico
    const municipalities = [...new Set(stops.map(s => s.municipality || ""))].filter(Boolean);
    const categories = [...new Set(stops.map(s => s.category || "General"))];
    
    // Análisis temporal
    const morningStops = stops.filter(s => {
      const hour = parseInt(s.startTime?.split(':')[0] || "0");
      return hour < 12;
    }).length;
    const afternoonStops = stops.filter(s => {
      const hour = parseInt(s.startTime?.split(':')[0] || "0");
      return hour >= 12 && hour < 18;
    }).length;
    const eveningStops = stops.filter(s => {
      const hour = parseInt(s.startTime?.split(':')[0] || "0");
      return hour >= 18;
    }).length;
    
    // Categorización detallada
    const categoryBreakdown = stops.reduce((acc, s) => {
      const cat = s.category || "General";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Cálculo de presupuesto estimado
    const estimatedBudget = {
      transport: Math.round(totalDistanceKm * 0.5), // €0.50 por km
      meals: stops.filter(s => s.category?.includes("Restaurant")).length * 25,
      activities: stops.filter(s => s.type === "experience").length * 15,
      total: 0
    };
    estimatedBudget.total = estimatedBudget.transport + estimatedBudget.meals + estimatedBudget.activities;
    
    // Ritmo del viaje
    const avgTimePerStop = totalStops > 0 ? Math.round(totalMinutes / totalStops) : 0;
    const pace = avgTimePerStop < 60 ? "Rápido" : avgTimePerStop < 120 ? "Moderado" : "Relajado";
    
    // Highlights y recomendaciones
    const mustSee = stops.filter(s => s.priority === "high" || s.rating > 4.5);
    const photoSpots = stops.filter(s => s.tags?.includes("scenic") || s.category === "Viewpoint");
    const localExperiences = stops.filter(s => s.tags?.includes("local") || s.authentic === true);

    return {
      totalStops,
      totalMinutes,
      totalHours,
      totalRemain,
      totalDistanceKm: Number(totalDistanceKm.toFixed(1)),
      walkableStops,
      driveRequired,
      municipalities,
      categories,
      morningStops,
      afternoonStops,
      eveningStops,
      categoryBreakdown,
      estimatedBudget,
      avgTimePerStop,
      pace,
      mustSee,
      photoSpots,
      localExperiences,
    };
  }, [itinerary]);

  // Preparar datos del mapa con información enriquecida
  const mapStops = useMemo(() => {
    return (itinerary ?? []).map((s, idx) => ({
      id: s.id || `stop-${idx + 1}`,
      name: s.name,
      lat: Number(s.lat),
      lng: Number(s.lng),
      startTime: s.startTime || "",
      durationMinutes: s.durationMinutes || 60,
      description: s.description || "",
      type: s.type === "experience" ? "experience" : "destination",
      category: s.category,
      dayNumber: s.dayNumber,
      isFavorite: favoriteStops.includes(s.id || `stop-${idx + 1}`),
      hasNote: !!(userNotes[s.id || `stop-${idx + 1}`]),
    }));
  }, [itinerary, favoriteStops, userNotes]);

  const userLoc = locationData
    ? { lat: Number(locationData.lat), lng: Number(locationData.lng) }
    : null;

  // Funciones de utilidad
  const toggleFavorite = (stopId: string) => {
    setFavoriteStops(prev => 
      prev.includes(stopId) 
        ? prev.filter(id => id !== stopId)
        : [...prev, stopId]
    );
  };

  const addNote = (stopId: string, note: string) => {
    setUserNotes(prev => ({
      ...prev,
      [stopId]: note
    }));
  };

  const exportToPDF = () => {
    // Implementación de exportación a PDF
    console.log("Exportando a PDF...");
  };

  const shareItinerary = () => {
    setShowShareModal(true);
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      "Restaurant": <Utensils className="w-4 h-4" />,
      "Cafe": <Coffee className="w-4 h-4" />,
      "Shopping": <ShoppingBag className="w-4 h-4" />,
      "Nature": <Trees className="w-4 h-4" />,
      "Museum": <Building className="w-4 h-4" />,
      "Photo": <Camera className="w-4 h-4" />,
      "Hotel": <Hotel className="w-4 h-4" />,
      "Beach": <Umbrella className="w-4 h-4" />,
      "Mountain": <Mountain className="w-4 h-4" />,
      "Activity": <Activity className="w-4 h-4" />,
    };
    return icons[category] || <MapPin className="w-4 h-4" />;
  };

  // Empty state mejorado
  if (!itinerary || itinerary.length === 0) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-white">
        <PremiumHeader 
          onBack={onBack} 
          destination={answers?.destination || "Tu destino"}
          currentTime={currentTime}
        />
        <div className="flex-1 grid place-items-center p-8">
          <div className="text-center max-w-lg">
            <div className="relative mb-6">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-red-500 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl">
                <Compass className="w-16 h-16 text-white animate-pulse" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <Plus className="w-6 h-6 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Comienza tu aventura
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Tu itinerario está vacío. Añade lugares increíbles para explorar {answers?.destination || "tu destino"}.
            </p>
            <div className="space-y-3">
              <button
                onClick={onBack}
                className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold hover:from-red-700 hover:to-red-600 transition-all transform hover:scale-105 shadow-lg"
              >
                <Sparkles className="inline w-5 h-5 mr-2" />
                Generar itinerario con IA
              </button>
              <button
                onClick={onBack}
                className="w-full px-6 py-4 rounded-2xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
              >
                Añadir lugares manualmente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header Premium con información en tiempo real */}
      <PremiumHeader 
        onBack={onBack}
        onSave={onSave}
        onShare={shareItinerary}
        onExport={() => setShowExportOptions(!showExportOptions)}
        destination={answers?.destination || "Tu destino"}
        startDate={startDate}
        days={days}
        currentTime={currentTime}
        weatherData={weatherData}
      />

      {/* Barra de navegación de vistas */}
      <ViewNavigation 
        activeView={activeView}
        onViewChange={setActiveView}
        analytics={analytics}
      />

      {/* Contenido principal dinámico */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeView === "overview" && (
          <OverviewView
            analytics={analytics}
            itinerary={itinerary}
            mapStops={mapStops}
            userLocation={userLoc}
            days={days}
            onUpdate={onUpdate}
            favoriteStops={favoriteStops}
            toggleFavorite={toggleFavorite}
            userNotes={userNotes}
            addNote={addNote}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            preferredTransport={preferredTransport}
            setPreferredTransport={setPreferredTransport}
          />
        )}

        {activeView === "map" && (
          <MapView
            stops={mapStops}
            userLocation={userLoc}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            preferredTransport={preferredTransport}
            favoriteStops={favoriteStops}
            toggleFavorite={toggleFavorite}
          />
        )}

        {activeView === "timeline" && (
          <TimelineView
            itinerary={itinerary}
            onUpdate={onUpdate}
            days={days}
            userLocation={userLoc}
            readOnly={readOnly}
            favoriteStops={favoriteStops}
            toggleFavorite={toggleFavorite}
            userNotes={userNotes}
            addNote={addNote}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
          />
        )}

        {activeView === "practical" && (
          <PracticalView
            analytics={analytics}
            answers={answers}
            itinerary={itinerary}
            currency={currency}
            setCurrency={setCurrency}
            language={language}
            setLanguage={setLanguage}
            showEmergencyInfo={showEmergencyInfo}
            setShowEmergencyInfo={setShowEmergencyInfo}
            showAccessibility={showAccessibility}
            setShowAccessibility={setShowAccessibility}
          />
        )}
      </div>

      {/* Footer con acciones rápidas */}
      <QuickActionsBar
        onSave={onSave}
        onShare={shareItinerary}
        onPrint={() => window.print()}
        totalStops={analytics.totalStops}
        favoriteCount={favoriteStops.length}
        hasNotes={Object.keys(userNotes).length > 0}
      />

      {/* Modales */}
      {showShareModal && (
        <ShareModal 
          onClose={() => setShowShareModal(false)}
          itineraryLink={`https://tuapp.com/itinerary/${Date.now()}`}
        />
      )}

      {showExportOptions && (
        <ExportModal
          onClose={() => setShowExportOptions(false)}
          onExportPDF={exportToPDF}
          onExportCalendar={() => console.log("Exportar a calendario")}
          onExportGPX={() => console.log("Exportar GPX")}
        />
      )}
    </div>
  );
}

/* ============================= COMPONENTES PRINCIPALES ============================= */

function PremiumHeader({
  onBack,
  onSave,
  onShare,
  onExport,
  destination,
  startDate,
  days,
  currentTime,
  weatherData,
}: any) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
            </button>
            
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {destination}
                <Flag className="w-4 h-4 text-red-500" />
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5" />
                  {startDate && formatDate(startDate)} • {days} {days === 1 ? 'día' : 'días'}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </span>
                {weatherData && (
                  <span className="flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5" />
                    {weatherData.temp}°C
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onShare && (
              <button
                onClick={onShare}
                className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                title="Compartir itinerario"
              >
                <Share2 className="w-4 h-4 text-gray-600" />
              </button>
            )}
            
            {onExport && (
              <button
                onClick={onExport}
                className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                title="Exportar"
              >
                <Download className="w-4 h-4 text-gray-600" />
              </button>
            )}
            
            {onSave && (
              <button
                onClick={onSave}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-medium hover:from-red-700 hover:to-red-600 transition-all shadow-sm flex items-center gap-2"
              >
                <SaveIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Guardar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function ViewNavigation({ activeView, onViewChange, analytics }: any) {
  const views = [
    { 
      id: "overview", 
      label: "Vista General", 
      icon: <LayoutGrid className="w-4 h-4" />,
      badge: null 
    },
    { 
      id: "map", 
      label: "Mapa", 
      icon: <Map className="w-4 h-4" />,
      badge: analytics.totalStops 
    },
    { 
      id: "timeline", 
      label: "Cronograma", 
      icon: <Clock className="w-4 h-4" />,
      badge: null 
    },
    { 
      id: "practical", 
      label: "Info Práctica", 
      icon: <Info className="w-4 h-4" />,
      badge: "!" 
    },
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="px-4">
        <div className="flex gap-1">
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => onViewChange(view.id)}
              className={`
                relative px-4 py-3 font-medium text-sm transition-all
                ${activeView === view.id 
                  ? "text-red-600 border-b-2 border-red-600" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }
              `}
            >
              <span className="flex items-center gap-2">
                {view.icon}
                <span className="hidden sm:inline">{view.label}</span>
                {view.badge && (
                  <span className={`
                    ml-1 px-1.5 py-0.5 text-xs rounded-full
                    ${view.badge === "!" 
                      ? "bg-amber-100 text-amber-700" 
                      : "bg-gray-100 text-gray-700"
                    }
                  `}>
                    {view.badge}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

function OverviewView({
  analytics,
  itinerary,
  mapStops,
  userLocation,
  days,
  onUpdate,
  favoriteStops,
  toggleFavorite,
  userNotes,
  addNote,
  selectedCategories,
  setSelectedCategories,
  preferredTransport,
  setPreferredTransport,
}: any) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Resumen ejecutivo con métricas clave */}
        <div className="bg-gradient-to-br from-red-600 via-red-500 to-orange-500 text-white rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              Resumen de tu aventura
            </h2>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
              {analytics.pace}
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <StatCard
              icon={<MapPin />}
              value={analytics.totalStops}
              label="Lugares"
              sublabel={`${analytics.municipalities.length} municipios`}
            />
            <StatCard
              icon={<Clock />}
              value={`${analytics.totalHours}h ${analytics.totalRemain}m`}
              label="Duración total"
              sublabel={`~${analytics.avgTimePerStop}min/lugar`}
            />
            <StatCard
              icon={<Route />}
              value={`${analytics.totalDistanceKm} km`}
              label="Distancia"
              sublabel={`${analytics.walkableStops} caminables`}
            />
            <StatCard
              icon={<Wallet />}
              value={`€${analytics.estimatedBudget.total}`}
              label="Presupuesto est."
              sublabel="Por persona"
            />
          </div>

          {/* Insights rápidos */}
          <div className="flex flex-wrap gap-2">
            {analytics.mustSee.length > 0 && (
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                🌟 {analytics.mustSee.length} imperdibles
              </span>
            )}
            {analytics.photoSpots.length > 0 && (
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                📸 {analytics.photoSpots.length} spots fotográficos
              </span>
            )}
            {analytics.localExperiences.length > 0 && (
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                🎭 {analytics.localExperiences.length} experiencias locales
              </span>
            )}
          </div>
        </div>

        {/* Distribución visual del tiempo */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-gray-600" />
            Distribución del día
          </h3>
          <div className="space-y-3">
            <TimeDistribution
              label="Mañana"
              icon={<Sunrise className="w-4 h-4" />}
              count={analytics.morningStops}
              total={analytics.totalStops}
              color="bg-amber-500"
            />
            <TimeDistribution
              label="Tarde"
              icon={<Sun className="w-4 h-4" />}
              count={analytics.afternoonStops}
              total={analytics.totalStops}
              color="bg-orange-500"
            />
            <TimeDistribution
              label="Noche"
              icon={<Moon className="w-4 h-4" />}
              count={analytics.eveningStops}
              total={analytics.totalStops}
              color="bg-indigo-500"
            />
          </div>
        </div>

        {/* Categorías y filtros */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            Tipos de actividades
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(analytics.categoryBreakdown).map(([cat, count]) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategories((prev: string[]) =>
                    prev.includes(cat) 
                      ? prev.filter(c => c !== cat)
                      : [...prev, cat]
                  );
                }}
                className={`
                  px-4 py-2 rounded-xl font-medium text-sm transition-all
                  ${selectedCategories.includes(cat)
                    ? "bg-red-100 text-red-700 border-2 border-red-300"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  {getCategoryIcon(cat)}
                  {cat} ({count})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Mapa compacto */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Map className="w-5 h-5 text-gray-600" />
              Vista rápida del recorrido
            </h3>
          </div>
          <div className="h-64 md:h-96">
            <ItineraryMap stops={mapStops} userLocation={userLocation} />
          </div>
        </div>

        {/* Transporte preferido */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Navigation2 className="w-5 h-5 text-gray-600" />
            Modo de transporte
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <TransportOption
              icon={<Car />}
              label="Coche"
              time="Más rápido"
              active={preferredTransport === "car"}
              onClick={() => setPreferredTransport("car")}
            />
            <TransportOption
              icon={<Bus />}
              label="Transporte público"
              time="Económico"
              active={preferredTransport === "transit"}
              onClick={() => setPreferredTransport("transit")}
            />
            <TransportOption
              icon={<Footprints />}
              label="A pie"
              time="Experiencia local"
              active={preferredTransport === "walk"}
              onClick={() => setPreferredTransport("walk")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function MapView({ stops, userLocation, selectedDay, setSelectedDay, preferredTransport, favoriteStops, toggleFavorite }: any) {
  return (
    <div className="h-full flex flex-col">
      {/* Controles del mapa */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
              <Layers className="w-4 h-4 text-gray-700" />
            </button>
            <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
              <Crosshair className="w-4 h-4 text-gray-700" />
            </button>
            <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
              <Maximize2 className="w-4 h-4 text-gray-700" />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={selectedDay || "all"}
              onChange={(e) => setSelectedDay(e.target.value === "all" ? null : Number(e.target.value))}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium"
            >
              <option value="all">Todos los días</option>
              {Array.from({ length: 3 }, (_, i) => (
                <option key={i} value={i + 1}>Día {i + 1}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Mapa a pantalla completa */}
      <div className="flex-1">
        <ItineraryMap 
          stops={stops} 
          userLocation={userLocation}
          selectedDay={selectedDay}
          showRoute={true}
          transportMode={preferredTransport}
        />
      </div>
      
      {/* Lista lateral de lugares (móvil: bottom sheet) */}
      <div className="md:absolute md:left-4 md:top-20 md:bottom-4 md:w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-3 border-b bg-gray-50">
          <h4 className="font-semibold text-gray-900 text-sm">
            Lugares ({stops.length})
          </h4>
        </div>
        <div className="overflow-y-auto max-h-64 md:max-h-full">
          {stops.map((stop: any, idx: number) => (
            <div
              key={stop.id}
              className="p-3 border-b hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-sm text-gray-900">{stop.name}</span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {stop.startTime} • {stop.durationMinutes} min
                  </div>
                </div>
                <button
                  onClick={() => toggleFavorite(stop.id)}
                  className="p-1"
                >
                  <Heart className={`w-4 h-4 ${stop.isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TimelineView({
  itinerary,
  onUpdate,
  days,
  userLocation,
  readOnly,
  favoriteStops,
  toggleFavorite,
  userNotes,
  addNote,
  selectedDay,
  setSelectedDay,
}: any) {
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Selector de días */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setSelectedDay(null)}
            className={`
              px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all
              ${selectedDay === null
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }
            `}
          >
            Todos los días
          </button>
          {Array.from({ length: days }, (_, i) => (
            <button
              key={i}
              onClick={() => setSelectedDay(i + 1)}
              className={`
                px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all
                ${selectedDay === i + 1
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }
              `}
            >
              Día {i + 1}
            </button>
          ))}
        </div>
      </div>
      
      {/* Timeline interactivo */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          <MultiDayItinerary
            itinerary={itinerary}
            onItineraryUpdate={onUpdate}
            days={days}
            userLocation={userLocation}
            readOnly={readOnly}
            selectedDay={selectedDay}
            favoriteStops={favoriteStops}
            toggleFavorite={toggleFavorite}
            userNotes={userNotes}
            addNote={addNote}
          />
        </div>
      </div>
    </div>
  );
}

function PracticalView({
  analytics,
  answers,
  itinerary,
  currency,
  setCurrency,
  language,
  setLanguage,
  showEmergencyInfo,
  setShowEmergencyInfo,
  showAccessibility,
  setShowAccessibility,
}: any) {
  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="p-4 space-y-4 max-w-4xl mx-auto">
        {/* Información de emergencia */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <button
            onClick={() => setShowEmergencyInfo(!showEmergencyInfo)}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <Phone className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Números de emergencia</h3>
                <p className="text-sm text-gray-500">Contactos importantes para tu seguridad</p>
              </div>
            </div>
            {showEmergencyInfo ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          
          {showEmergencyInfo && (
            <div className="px-6 pb-6 space-y-3 border-t">
              <EmergencyContact icon="🚨" title="Emergencias" number="112" />
              <EmergencyContact icon="🚓" title="Policía" number="091" />
              <EmergencyContact icon="🚑" title="Ambulancia" number="061" />
              <EmergencyContact icon="🔥" title="Bomberos" number="080" />
              <EmergencyContact icon="ℹ️" title="Info turística" number="+34 900 123 456" />
            </div>
          )}
        </div>

        {/* Presupuesto detallado */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-gray-600" />
              Presupuesto estimado
            </h3>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="px-3 py-1 rounded-lg border border-gray-300 text-sm"
            >
              <option value="EUR">EUR €</option>
              <option value="USD">USD $</option>
              <option value="GBP">GBP £</option>
            </select>
          </div>
          
          <div className="space-y-3">
            <BudgetItem
              icon={<Car className="w-4 h-4" />}
              label="Transporte"
              amount={analytics.estimatedBudget.transport}
              currency={currency}
              detail={`${analytics.totalDistanceKm} km totales`}
            />
            <BudgetItem
              icon={<Utensils className="w-4 h-4" />}
              label="Comidas"
              amount={analytics.estimatedBudget.meals}
              currency={currency}
              detail={`${analytics.categoryBreakdown.Restaurant || 0} restaurantes`}
            />
            <BudgetItem
              icon={<Activity className="w-4 h-4" />}
              label="Actividades"
              amount={analytics.estimatedBudget.activities}
              currency={currency}
              detail={`${itinerary.filter((s: any) => s.type === "experience").length} experiencias`}
            />
            
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">Total por persona</span>
                <span className="text-xl font-bold text-red-600">
                  {currency === "EUR" ? "€" : currency === "USD" ? "$" : "£"}
                  {analytics.estimatedBudget.total}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                * Estimación basada en precios promedio. No incluye alojamiento.
              </p>
            </div>
          </div>
        </div>

        {/* Checklist de viaje */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-gray-600" />
            Checklist del viajero
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ChecklistSection title="Documentos" items={[
              "Pasaporte/DNI",
              "Seguro de viaje",
              "Reservas impresas",
              "Tarjetas de crédito",
              "Licencia de conducir"
            ]} />
            
            <ChecklistSection title="Esenciales" items={[
              "Cargador móvil",
              "Adaptador enchufe",
              "Medicamentos",
              "Protector solar",
              "Botella de agua"
            ]} />
            
            <ChecklistSection title="Ropa" items={[
              "Calzado cómodo",
              "Ropa de lluvia",
              "Gorra/sombrero",
              "Ropa de baño",
              "Chaqueta ligera"
            ]} />
            
            <ChecklistSection title="Tecnología" items={[
              "Cámara/GoPro",
              "Power bank",
              "Auriculares",
              "Apps offline",
              "Mapas descargados"
            ]} />
          </div>
        </div>

        {/* Información local */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-gray-600" />
            Información local
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem
              icon={<Wifi className="w-5 h-5 text-blue-600" />}
              title="WiFi gratuito"
              content="Disponible en cafeterías, restaurantes y espacios públicos. Busca redes municipales."
            />
            
            <InfoItem
              icon={<CreditCard className="w-5 h-5 text-green-600" />}
              title="Pagos"
              content="Tarjeta aceptada en la mayoría de lugares. Efectivo recomendado para mercados locales."
            />
            
            <InfoItem
              icon={<Clock className="w-5 h-5 text-orange-600" />}
              title="Horarios comerciales"
              content="Tiendas: 10:00-14:00 y 17:00-20:00. Domingos generalmente cerrado."
            />
            
            <InfoItem
              icon={<Utensils className="w-5 h-5 text-red-600" />}
              title="Horarios comidas"
              content="Almuerzo: 14:00-16:00. Cena: 21:00-23:00. Reserva recomendada."
            />
          </div>
        </div>

        {/* Accesibilidad */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <button
            onClick={() => setShowAccessibility(!showAccessibility)}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Accesibilidad</h3>
                <p className="text-sm text-gray-500">Información para personas con movilidad reducida</p>
              </div>
            </div>
            {showAccessibility ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          
          {showAccessibility && (
            <div className="px-6 pb-6 border-t">
              <div className="space-y-3 mt-4">
                <AccessibilityInfo
                  icon="♿"
                  title="Transporte adaptado"
                  description="Autobuses y metro con acceso para sillas de ruedas. Taxis adaptados disponibles bajo reserva."
                />
                <AccessibilityInfo
                  icon="🏛️"
                  title="Monumentos"
                  description="La mayoría de museos y atracciones principales tienen acceso adaptado y ascensores."
                />
                <AccessibilityInfo
                  icon="🍽️"
                  title="Restaurantes"
                  description="Muchos restaurantes tienen acceso adaptado. Recomendamos confirmar al reservar."
                />
              </div>
            </div>
          )}
        </div>

        {/* Consejos y recomendaciones */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            Consejos del local
          </h3>
          
          <div className="space-y-3">
            <TipCard
              emoji="🌅"
              tip="Madruga para evitar multitudes en los lugares más populares"
            />
            <TipCard
              emoji="🎫"
              tip="Compra entradas online con antelación para ahorrar tiempo y dinero"
            />
            <TipCard
              emoji="🚶"
              tip="Lleva calzado cómodo, caminarás más de lo que piensas"
            />
            <TipCard
              emoji="💧"
              tip="Mantente hidratado, especialmente en verano"
            />
            <TipCard
              emoji="📱"
              tip="Descarga mapas offline antes de salir del hotel"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionsBar({ onSave, onShare, onPrint, totalStops, favoriteCount, hasNotes }: any) {
  return (
    <div className="bg-white border-t border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {totalStops} lugares
          </span>
          {favoriteCount > 0 && (
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4 text-red-500" />
              {favoriteCount} favoritos
            </span>
          )}
          {hasNotes && (
            <span className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              Con notas
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onPrint}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Imprimir"
          >
            <Printer className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={onShare}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Compartir"
          >
            <Share2 className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================= COMPONENTES DE UTILIDAD ============================= */

function StatCard({ icon, value, label, sublabel }: any) {
  return (
    <div className="bg-white/10 backdrop-blur rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2 text-white/80">
        {React.cloneElement(icon, { className: "w-5 h-5" })}
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sublabel && (
        <div className="text-xs text-white/60 mt-1">{sublabel}</div>
      )}
    </div>
  );
}

function TimeDistribution({ label, icon, count, total, color }: any) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-2 text-sm text-gray-700">
          {icon}
          {label}
        </span>
        <span className="text-sm font-medium text-gray-900">
          {count} lugares
        </span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function TransportOption({ icon, label, time, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`
        p-4 rounded-xl border-2 transition-all
        ${active
          ? "border-red-500 bg-red-50"
          : "border-gray-200 hover:border-gray-300 bg-white"
        }
      `}
    >
      <div className={`flex flex-col items-center gap-2 ${active ? "text-red-600" : "text-gray-700"}`}>
        {React.cloneElement(icon, { className: "w-6 h-6" })}
        <span className="font-medium text-sm">{label}</span>
        <span className="text-xs text-gray-500">{time}</span>
      </div>
    </button>
  );
}

function EmergencyContact({ icon, title, number }: any) {
  return (
    <a
      href={`tel:${number}`}
      className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <span className="font-medium text-gray-900">{title}</span>
      </div>
      <span className="font-bold text-lg text-blue-600">{number}</span>
    </a>
  );
}

function BudgetItem({ icon, label, amount, currency, detail }: any) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
          {icon}
        </div>
        <div>
          <div className="font-medium text-gray-900">{label}</div>
          <div className="text-xs text-gray-500">{detail}</div>
        </div>
      </div>
      <div className="font-semibold text-gray-900">
        {currency === "EUR" ? "€" : currency === "USD" ? "$" : "£"}{amount}
      </div>
    </div>
  );
}

function ChecklistSection({ title, items }: any) {
  const [checked, setChecked] = useState<string[]>([]);
  
  return (
    <div>
      <h4 className="font-medium text-gray-900 mb-2">{title}</h4>
      <div className="space-y-2">
        {items.map((item: string) => (
          <label key={item} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={checked.includes(item)}
              onChange={(e) => {
                if (e.target.checked) {
                  setChecked([...checked, item]);
                } else {
                  setChecked(checked.filter(i => i !== item));
                }
              }}
              className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
            />
            <span className={`text-sm ${checked.includes(item) ? "line-through text-gray-400" : "text-gray-700"}`}>
              {item}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function InfoItem({ icon, title, content }: any) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h4 className="font-medium text-gray-900 mb-1">{title}</h4>
        <p className="text-sm text-gray-600">{content}</p>
      </div>
    </div>
  );
}

function AccessibilityInfo({ icon, title, description }: any) {
  return (
    <div className="flex gap-3 p-3 rounded-xl bg-blue-50">
      <span className="text-2xl">{icon}</span>
      <div>
        <h4 className="font-medium text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  );
}

function TipCard({ emoji, tip }: any) {
  return (
    <div className="flex items-start gap-3 p-3 bg-white rounded-xl">
      <span className="text-xl">{emoji}</span>
      <p className="text-sm text-gray-700">{tip}</p>
    </div>
  );
}

function ShareModal({ onClose, itineraryLink }: any) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(itineraryLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Compartir itinerario</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Enlace del itinerario
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={itineraryLink}
                readOnly
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm"
              />
              <button
                onClick={handleCopy}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Compartir en:</p>
            <div className="grid grid-cols-4 gap-3">
              <ShareButton icon="📧" label="Email" />
              <ShareButton icon="💬" label="WhatsApp" />
              <ShareButton icon="📘" label="Facebook" />
              <ShareButton icon="🐦" label="Twitter" />
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-800">
              El enlace permite ver tu itinerario pero no editarlo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShareButton({ icon, label }: any) {
  return (
    <button className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <span className="text-2xl">{icon}</span>
      <span className="text-xs text-gray-600">{label}</span>
    </button>
  );
}

function ExportModal({ onClose, onExportPDF, onExportCalendar, onExportGPX }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Exportar itinerario</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="space-y-3">
          <ExportOption
            icon={<FileText className="w-5 h-5" />}
            title="PDF"
            description="Documento completo con mapa e información"
            onClick={onExportPDF}
            color="text-red-600 bg-red-50"
          />
          
          <ExportOption
            icon={<CalendarDays className="w-5 h-5" />}
            title="Calendario"
            description="Añade los eventos a tu calendario"
            onClick={onExportCalendar}
            color="text-blue-600 bg-blue-50"
          />
          
          <ExportOption
            icon={<Route className="w-5 h-5" />}
            title="GPX"
            description="Archivo para GPS y apps de navegación"
            onClick={onExportGPX}
            color="text-green-600 bg-green-50"
          />
          
          <ExportOption
            icon={<Image className="w-5 h-5" />}
            title="Imagen"
            description="Captura visual del itinerario"
            onClick={() => console.log("Exportar imagen")}
            color="text-purple-600 bg-purple-50"
          />
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

function ExportOption({ icon, title, description, onClick, color }: any) {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-left"
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{title}</h4>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </button>
  );
}

function getCategoryIcon(category: string) {
  const icons: Record<string, React.ReactNode> = {
    "Restaurant": <Utensils className="w-4 h-4" />,
    "Cafe": <Coffee className="w-4 h-4" />,
    "Shopping": <ShoppingBag className="w-4 h-4" />,
    "Nature": <Trees className="w-4 h-4" />,
    "Museum": <Building className="w-4 h-4" />,
    "Photo": <Camera className="w-4 h-4" />,
    "Hotel": <Hotel className="w-4 h-4" />,
    "Beach": <Umbrella className="w-4 h-4" />,
    "Mountain": <Mountain className="w-4 h-4" />,
    "Activity": <Activity className="w-4 h-4" />,
  };
  return icons[category] || <MapPin className="w-4 h-4" />;
}