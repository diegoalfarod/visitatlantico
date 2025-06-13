"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  HelpCircle,
  Calendar,
  MapPin,
  Share2,
  Download,
  Sparkles,
  Search,
  Utensils,
  Phone,
  Globe,
  Clock,
  CreditCard,
  Users,
  MessageCircle
} from "lucide-react";

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<string>("planificador");
  const [openQuestions, setOpenQuestions] = useState<string[]>([]);

  const toggleQuestion = (id: string) => {
    setOpenQuestions(prev =>
      prev.includes(id) 
        ? prev.filter(q => q !== id)
        : [...prev, id]
    );
  };

  const faqCategories = [
    {
      id: "planificador",
      title: "Planificador de Viajes con IA",
      icon: <Sparkles className="w-5 h-5" />,
      questions: [
        {
          id: "q1",
          question: "¿Cómo funciona el planificador de viajes con IA?",
          answer: "Nuestro planificador utiliza inteligencia artificial para crear itinerarios personalizados. Solo necesitas responder 4 preguntas simples: cuántos días tienes, qué tipo de experiencias buscas (hasta 3 opciones), si quieres explorar otros municipios además de Barranquilla, y tu email. La IA analizará tus preferencias y creará un itinerario optimizado con horarios, rutas y recomendaciones específicas."
        },
        {
          id: "q2",
          question: "¿Puedo editar mi itinerario después de que la IA lo genere?",
          answer: "¡Por supuesto! Puedes personalizar completamente tu itinerario: arrastra y suelta actividades para reorganizarlas, edita los horarios haciendo clic en ellos, ajusta la duración de cada actividad, elimina destinos que no te interesen, o agrega nuevos lugares desde nuestra base de datos. También puedes agregar descansos personalizados entre actividades."
        },
        {
          id: "q3",
          question: "¿El planificador funciona para viajes de varios días?",
          answer: "Sí, el planificador puede crear itinerarios de 1 a 7 días. Para viajes de múltiples días, organiza automáticamente las actividades por día, considerando distancias y tiempos de traslado. En dispositivos móviles, puedes navegar entre días deslizando horizontalmente o usando los tabs superiores."
        },
        {
          id: "q4",
          question: "¿Puedo compartir mi itinerario con amigos o familiares?",
          answer: "Sí, el sistema genera un enlace único que puedes compartir. En dispositivos móviles, se abrirá el menú nativo de compartir para enviarlo por WhatsApp, email o redes sociales. En computadoras, el enlace se copia al portapapeles. Cualquier persona con el enlace podrá ver tu itinerario completo."
        },
        {
          id: "q5",
          question: "¿Puedo descargar mi itinerario para consultarlo sin internet?",
          answer: "Sí, puedes descargar tu itinerario como PDF con un solo clic. El PDF incluye toda la información: horarios, descripciones de lugares, consejos locales, direcciones y un resumen visual del viaje. Es perfecto para imprimir o consultar offline durante tu viaje."
        }
      ]
    },
    {
      id: "destinos",
      title: "Destinos y Experiencias",
      icon: <MapPin className="w-5 h-5" />,
      questions: [
        {
          id: "q6",
          question: "¿Qué tipos de destinos puedo encontrar en VisitAtlántico?",
          answer: "Ofrecemos más de 20 categorías de destinos: playas paradisíacas, sitios culturales, experiencias gastronómicas, aventuras al aire libre, lugares históricos, actividades familiares, deportes acuáticos, vida nocturna, espacios de bienestar, festivales, sitios románticos, naturaleza y ecoturismo, avistamiento de aves, compras, spots fotográficos, actividades náuticas, pesca deportiva, arte y artesanías locales."
        },
        {
          id: "q7",
          question: "¿Cómo puedo filtrar destinos según mis intereses?",
          answer: "En la página de destinos, encontrarás botones de categorías en la parte superior. Puedes seleccionar múltiples categorías a la vez para filtrar. También puedes cambiar entre vista de lista y vista de mapa para explorar geográficamente. Cada destino muestra etiquetas con sus categorías principales para ayudarte a identificar rápidamente si es de tu interés."
        },
        {
          id: "q8",
          question: "¿Los destinos incluyen información práctica como horarios y precios?",
          answer: "Cada destino tiene una página detallada con información completa: descripción, ubicación exacta, fotografías, categorías, consejos locales y cómo llegar. Para información actualizada sobre horarios y precios, recomendamos contactar directamente con cada lugar o verificar sus redes sociales, ya que estos pueden variar según la temporada."
        },
        {
          id: "q9",
          question: "¿Puedo ver todos los destinos en un mapa?",
          answer: "Sí, en la página de destinos puedes cambiar entre vista de lista y vista de mapa usando los botones en la parte superior. El mapa interactivo muestra todos los destinos con marcadores codificados por colores según su categoría principal. Puedes hacer clic en cualquier marcador para ver información rápida del lugar."
        }
      ]
    },
    {
      id: "gastronomia",
      title: "Gastronomía",
      icon: <Utensils className="w-5 h-5" />,
      questions: [
        {
          id: "q10",
          question: "¿Qué información gastronómica ofrece VisitAtlántico?",
          answer: "Nuestra sección de gastronomía incluye: platos típicos del Atlántico con sus historias y lugares donde probarlos, festivales gastronómicos durante todo el año con fechas y ubicaciones, restaurantes recomendados, y rutas gastronómicas temáticas. Cada plato incluye descripción, ingredientes principales y consejos sobre dónde degustarlo."
        },
        {
          id: "q11",
          question: "¿Cómo puedo encontrar festivales gastronómicos durante mi visita?",
          answer: "En la sección de gastronomía, encontrarás un calendario de festivales gastronómicos con fechas específicas. Puedes agregar estos eventos a tu calendario personal con un clic. Los festivales están organizados por mes e incluyen información sobre el lugar, descripción del evento y si están enfocados en algún plato o ingrediente específico."
        },
        {
          id: "q12",
          question: "¿Incluyen opciones para diferentes tipos de dietas?",
          answer: "Mientras que nos enfocamos en mostrar la gastronomía tradicional del Atlántico, muchos restaurantes locales ofrecen opciones vegetarianas y veganas. En las descripciones de platos típicos, indicamos los ingredientes principales para que puedas identificar qué opciones se adaptan a tu dieta. Recomendamos contactar directamente a los restaurantes para opciones específicas."
        }
      ]
    },
    {
      id: "practica",
      title: "Información Práctica",
      icon: <Clock className="w-5 h-5" />,
      questions: [
        {
          id: "q13",
          question: "¿Cuál es la mejor época para visitar el Atlántico?",
          answer: "El Atlántico tiene clima cálido tropical todo el año, con temperaturas entre 24°C y 32°C. La temporada seca (diciembre a abril) es ideal para playas y actividades al aire libre. La temporada de lluvias (mayo a noviembre) tiene precipitaciones cortas. El Carnaval de Barranquilla (febrero/marzo) es la época más concurrida. Para evitar multitudes, considera visitar en mayo-junio o septiembre-octubre."
        },
        {
          id: "q14",
          question: "¿Cómo puedo moverme entre los diferentes municipios del Atlántico?",
          answer: "Barranquilla es el hub principal con buenas conexiones. Para municipios cercanos como Puerto Colombia o Soledad, hay transporte público frecuente. Para lugares más alejados como Usiacurí o Juan de Acosta, recomendamos taxi, carro particular o tours organizados. En el planificador, indicamos las distancias entre destinos para ayudarte a organizar tus traslados."
        },
        {
          id: "q15",
          question: "¿Es seguro viajar por el Atlántico?",
          answer: "El Atlántico es generalmente seguro para turistas. Como en cualquier destino, recomendamos precauciones básicas: guarda objetos de valor, usa transporte confiable, evita mostrar grandes cantidades de dinero, y prefiere áreas turísticas bien iluminadas en la noche. Los locales son amables y serviciales con los visitantes."
        },
        {
          id: "q16",
          question: "¿Qué debo llevar para mi viaje al Atlántico?",
          answer: "Esenciales para el clima tropical: ropa ligera y fresca, protector solar alto, sombrero o gorra, lentes de sol, traje de baño, sandalias cómodas, repelente de insectos, botella de agua reutilizable. Para actividades específicas: zapatos cerrados para senderismo, cámara para los spots fotográficos. Durante el Carnaval, agrega ropa colorida y cómoda para bailar."
        }
      ]
    },
    {
      id: "tecnico",
      title: "Uso del Sitio Web",
      icon: <Globe className="w-5 h-5" />,
      questions: [
        {
          id: "q17",
          question: "¿El sitio web está disponible en otros idiomas?",
          answer: "Sí, VisitAtlántico está disponible en español e inglés. Puedes cambiar el idioma usando los enlaces ES | EN en la barra de navegación superior. Cada versión está optimizada para ofrecer la mejor experiencia en ese idioma."
        },
        {
          id: "q18",
          question: "¿Necesito crear una cuenta para usar el planificador?",
          answer: "No, no necesitas crear una cuenta. El planificador funciona inmediatamente sin registro. Solo pedimos tu email al final para enviarte el itinerario, pero puedes descargarlo como PDF o compartirlo sin proporcionar datos personales. Valoramos tu privacidad y no almacenamos información personal sin tu consentimiento."
        },
        {
          id: "q19",
          question: "¿El sitio funciona bien en dispositivos móviles?",
          answer: "Sí, VisitAtlántico está completamente optimizado para móviles. En el planificador, puedes: deslizar entre días del itinerario, mantener presionado para reordenar actividades, usar menús contextuales para editar. Todas las funciones están adaptadas para pantallas táctiles con gestos intuitivos."
        },
        {
          id: "q20",
          question: "¿Cómo puedo reportar un error o sugerir mejoras?",
          answer: "Agradecemos tu feedback. Puedes contactarnos a través de la página de contacto o enviar un email a atencionalciudadano@atlantico.gov.co. Si encuentras información desactualizada sobre algún destino, por favor indícanos el lugar específico para actualizarlo. Tu opinión nos ayuda a mejorar la experiencia para todos los visitantes."
        }
      ]
    }
  ];

  const currentCategory = faqCategories.find(cat => cat.id === activeCategory);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <HelpCircle className="w-12 h-12 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Preguntas Frecuentes</h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Encuentra respuestas a las dudas más comunes sobre tu viaje al Atlántico
            </p>
          </motion.div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <nav className="flex items-center gap-2 text-sm text-slate-600">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Inicio
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/sitemap" className="hover:text-blue-600 transition-colors">
            Mapa del Sitio
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-900 font-medium">Preguntas Frecuentes</span>
        </nav>
      </div>

      {/* FAQ Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h2 className="text-lg font-semibold mb-4 text-slate-900">Categorías</h2>
              <div className="space-y-2">
                {faqCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setActiveCategory(category.id);
                      setOpenQuestions([]);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeCategory === category.id
                        ? "bg-blue-600 text-white shadow-md"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className={activeCategory === category.id ? "text-white" : "text-blue-600"}>
                      {category.icon}
                    </div>
                    <span className="text-sm font-medium text-left">{category.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    {currentCategory?.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {currentCategory?.title}
                  </h2>
                </div>

                <div className="space-y-4">
                  {currentCategory?.questions.map((q, index) => (
                    <motion.div
                      key={q.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-slate-200 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => toggleQuestion(q.id)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                      >
                        <h3 className="text-left font-medium text-slate-900 pr-4">
                          {q.question}
                        </h3>
                        <motion.div
                          animate={{ rotate: openQuestions.includes(q.id) ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-5 h-5 text-slate-500 flex-shrink-0" />
                        </motion.div>
                      </button>

                      <AnimatePresence>
                        {openQuestions.includes(q.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-4 text-slate-600 leading-relaxed">
                              {q.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white text-center"
        >
          <MessageCircle className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-3">
            ¿No encontraste lo que buscabas?
          </h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Nuestro equipo está disponible para resolver cualquier duda adicional sobre tu viaje al Atlántico
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
            >
              <Phone className="w-5 h-5" />
              Contáctanos
            </Link>
            <a
              href="https://www.atlantico.gov.co/index.php/ayuda"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors font-medium"
            >
              <Users className="w-5 h-5" />
              Atención al Ciudadano
            </a>
          </div>
        </motion.div>
      </div>
    </main>
  );
}