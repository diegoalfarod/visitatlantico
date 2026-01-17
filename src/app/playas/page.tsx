import type { Metadata } from "next";
import { HeroImage } from "@/components/OptimizedImage";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedContent from "@/components/RelatedContent";
import FAQ from "@/components/FAQ";
import { FAQSchema } from "@/components/schemas/FAQSchema";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  HiMapPin,
  HiSun,
  HiCheckBadge,
  HiFlag,
  HiSparkles,
  HiArrowRight,
} from "react-icons/hi2";

/**
 * PILLAR PAGE: Playas del Atlántico Colombia
 *
 * Keywords target:
 * - playas del atlántico colombia
 * - mejores playas barranquilla
 * - playas puerto colombia
 * - playas blue flag colombia
 * - puerto velero kitesurf
 * - playas cerca de barranquilla
 */

export const metadata: Metadata = {
  title: "Playas del Atlántico Colombia | Guía Completa 2026",
  description:
    "Descubre las mejores playas del Atlántico: Salinas del Rey (Blue Flag), Puerto Velero (kitesurf), Puerto Colombia, Playa Mendoza. Guía completa con fotos, cómo llegar, qué hacer y mejor época para visitar.",
  keywords: [
    "playas del atlántico colombia",
    "mejores playas barranquilla",
    "playas puerto colombia",
    "puerto velero kitesurf",
    "salinas del rey blue flag",
    "playas cerca de barranquilla",
    "playa mendoza atlántico",
    "playas caribe colombiano",
    "turismo de sol y playa atlántico",
  ],
  openGraph: {
    title: "Playas del Atlántico Colombia | Guía Completa 2026",
    description:
      "🏖️ Salinas del Rey Blue Flag | 🪁 Puerto Velero Kitesurf | 🌊 Playas Caribeñas del Atlántico. Aguas cristalinas, deportes acuáticos y naturaleza.",
    images: [
      {
        url: "/images/og-image-playas.jpg",
        width: 1200,
        height: 630,
        alt: "Playas del Atlántico Colombia - Caribe Colombiano",
      },
    ],
    type: "article",
  },
  alternates: {
    canonical: "/playas",
    languages: {
      "es-CO": "/es/playas",
      "en-US": "/en/beaches",
    },
  },
};

export default function PlayasPage() {
  const playasFAQs = [
    {
      question: "¿Cuáles son las mejores playas del Atlántico Colombia?",
      answer:
        "Las mejores playas del Atlántico son:<br/><br/><strong>1. Salinas del Rey (Puerto Colombia):</strong> Primera playa deportiva Blue Flag de América. Ideal para deportes acuáticos, kitesurf y windsurf. Aguas cristalinas y certificación de calidad ambiental.<br/><br/><strong>2. Puerto Velero:</strong> Paraíso del kitesurf con vientos constantes. Zona residencial moderna con restaurantes frente al mar.<br/><br/><strong>3. Playa Mendoza:</strong> Playa familiar tranquila, perfecta para relajarse. Gastronomía local con pescado frito y sancocho de mariscos.<br/><br/><strong>4. Punta Roca (Puerto Colombia):</strong> Playa histórica con el muelle más largo de Suramérica. Vista al atardecer espectacular.",
    },
    {
      question: "¿Cómo llegar a las playas del Atlántico desde Barranquilla?",
      answer:
        "<strong>Desde Barranquilla las playas están muy cerca:</strong><br/><br/><strong>Puerto Colombia (Salinas del Rey):</strong><br/>📍 Distancia: 20 km (25 minutos)<br/>🚗 Ruta: Vía 40 Norte → Puerto Colombia<br/>🚌 Bus público: Desde el Terminal de Barranquilla ($3,000 COP)<br/>🚕 Taxi/Uber: $25,000-35,000 COP<br/><br/><strong>Puerto Velero:</strong><br/>📍 Distancia: 35 km (40 minutos)<br/>🚗 Ruta: Vía al Mar → Juan de Acosta → Puerto Velero<br/>🚌 Bus: Desde Terminal ($5,000 COP)<br/><br/><strong>Playa Mendoza:</strong><br/>📍 Distancia: 45 km (50 minutos)<br/>🚗 Ruta: Vía Juan de Acosta<br/><br/><strong>Consejo:</strong> Alquila auto para mayor comodidad y visita varias playas en un día.",
    },
    {
      question: "¿Cuál es la mejor época para visitar las playas del Atlántico?",
      answer:
        "<strong>La mejor época para visitar las playas del Atlántico es de diciembre a abril</strong> (temporada seca).<br/><br/><strong>Temporada Alta (Diciembre - Marzo):</strong><br/>✅ Clima soleado con pocas lluvias<br/>✅ Mar tranquilo y cristalino<br/>✅ Ideal para deportes acuáticos<br/>✅ Temperatura: 28-32°C<br/>⚠️ Precios más altos y más turistas<br/><br/><strong>Temporada Media (Abril - Junio / Noviembre):</strong><br/>✅ Menos turistas, precios más bajos<br/>✅ Clima agradable con lluvias ocasionales<br/>✅ Buena época para kitesurf (vientos fuertes)<br/><br/><strong>Temporada Baja (Julio - Octubre):</strong><br/>⚠️ Época de lluvias (aguaceros cortos)<br/>⚠️ Mar más agitado<br/>✅ Descuentos en hoteles (hasta 40% off)<br/>✅ Playas casi vacías<br/><br/><strong>Consejo:</strong> Para kitesurf/windsurf, marzo-abril tiene los mejores vientos.",
    },
    {
      question: "¿Qué playas del Atlántico tienen certificación Blue Flag?",
      answer:
        "Actualmente, <strong>Salinas del Rey</strong> es la única playa del Atlántico con certificación <strong>Blue Flag</strong> (Bandera Azul).<br/><br/><strong>¿Qué significa Blue Flag?</strong><br/>La certificación Blue Flag es un reconocimiento internacional de la <strong>Foundation for Environmental Education (FEE)</strong> que garantiza:<br/><br/>✅ <strong>Calidad del agua:</strong> Análisis microbiológicos frecuentes<br/>✅ <strong>Gestión ambiental:</strong> Manejo de residuos y sostenibilidad<br/>✅ <strong>Seguridad:</strong> Salvavidas, primeros auxilios, señalización<br/>✅ <strong>Servicios:</strong> Baños, duchas, accesibilidad<br/>✅ <strong>Educación ambiental:</strong> Información sobre ecosistemas locales<br/><br/><strong>Salinas del Rey</strong> recibió esta certificación en <strong>diciembre 2024</strong>, convirtiéndose en la <strong>primera playa deportiva de América</strong> con este reconocimiento.<br/><br/>Esto la posiciona al nivel de playas famosas como Copacabana (Brasil) y playas del Mediterráneo europeo.",
    },
    {
      question: "¿Qué actividades se pueden hacer en las playas del Atlántico?",
      answer:
        "Las playas del Atlántico ofrecen una gran variedad de actividades:<br/><br/><strong>Deportes Acuáticos:</strong><br/>🪁 <strong>Kitesurf y Windsurf:</strong> Puerto Velero y Salinas del Rey (escuelas con instructores certificados)<br/>🏄‍♂️ <strong>Surf y Stand-Up Paddle:</strong> Temporada de olas en septiembre-noviembre<br/>🤿 <strong>Snorkel:</strong> Aguas cristalinas con vida marina<br/>🚤 <strong>Jet Ski y Banana Boat:</strong> Disponibles en temporada alta<br/><br/><strong>Actividades Familiares:</strong><br/>🏖️ <strong>Playa y sol:</strong> Ideal para niños en Playa Mendoza<br/>🎣 <strong>Pesca deportiva:</strong> Tours desde Puerto Colombia<br/>🐚 <strong>Caminatas por la playa:</strong> Atardeceres espectaculares<br/><br/><strong>Gastronomía:</strong><br/>🍽️ <strong>Restaurantes frente al mar:</strong> Pescado frito, arroz de coco, patacones<br/>🍹 <strong>Cocteles caribeños:</strong> Coco loco, limonada de coco<br/><br/><strong>Cultura e Historia:</strong><br/>🏛️ <strong>Muelle de Puerto Colombia:</strong> El más largo de Suramérica (antiguamente)<br/>📸 <strong>Fotografía:</strong> Amaneceres y atardeceres únicos del Caribe",
    },
    {
      question: "¿Las playas del Atlántico son seguras para nadar?",
      answer:
        "Sí, las playas del Atlántico son <strong>generalmente seguras</strong> si sigues estas recomendaciones:<br/><br/><strong>Playas más seguras para nadar:</strong><br/>✅ <strong>Salinas del Rey:</strong> Certificación Blue Flag garantiza seguridad. Salvavidas presentes.<br/>✅ <strong>Playa Mendoza:</strong> Aguas tranquilas, ideal para familias con niños.<br/>✅ <strong>Puerto Velero:</strong> Zona residencial con servicios y vigilancia.<br/><br/><strong>Precauciones importantes:</strong><br/>⚠️ <strong>Corrientes:</strong> Algunas zonas tienen corrientes fuertes. Nadar cerca de la orilla.<br/>⚠️ <strong>Banderas:</strong> Respetar banderas rojas (prohibido nadar) y amarillas (precaución).<br/>⚠️ <strong>Horarios:</strong> Evitar nadar al atardecer cuando no hay salvavidas.<br/>⚠️ <strong>Oleaje:</strong> En temporada de lluvias el mar está más agitado.<br/><br/><strong>Servicios de seguridad:</strong><br/>🏥 Puestos de primeros auxilios en playas principales<br/>👨‍⚕️ Salvavidas en Salinas del Rey y Puerto Colombia<br/>📞 Línea de emergencias: 123<br/><br/><strong>Consejo:</strong> Siempre nada en zonas vigiladas y pregunta a locales sobre condiciones del mar.",
    },
  ];

  const playasDestacadas = [
    {
      nombre: "Salinas del Rey",
      descripcion:
        "Primera playa deportiva Blue Flag de América. Certificación de calidad ambiental y servicios premium.",
      imagen: "/images/salinas-del-rey.jpg",
      ubicacion: "Puerto Colombia, 20 km de Barranquilla",
      destacado: "Blue Flag 2024",
      url: "/playas/salinas-del-rey",
      caracteristicas: ["Kitesurf", "Windsurf", "Aguas cristalinas", "Salvavidas"],
    },
    {
      nombre: "Puerto Velero",
      descripcion:
        "Paraíso del kitesurf con vientos constantes. Zona residencial moderna con restaurantes y hoteles frente al mar.",
      imagen: "/images/puerto-velero.jpg",
      ubicacion: "Juan de Acosta, 35 km de Barranquilla",
      destacado: "Kitesurf y Windsurf",
      url: "/destinations",
      caracteristicas: ["Kitesurf profesional", "Windsurf", "Restaurantes", "Hoteles"],
    },
    {
      nombre: "Playa Mendoza",
      descripcion:
        "Playa familiar tranquila con gastronomía local auténtica. Ideal para pasar el día en familia.",
      imagen: "/images/playa-mendoza.jpg",
      ubicacion: "Tubará, 45 km de Barranquilla",
      destacado: "Playa familiar",
      url: "/destinations",
      caracteristicas: ["Tranquila", "Gastronomía local", "Ideal familias", "Pesca"],
    },
  ];

  return (
    <>
      {/* Schema.org */}
      <FAQSchema faqs={playasFAQs} />

      <main className="min-h-screen bg-white">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            {
              name: "Playas del Atlántico",
              url: "https://visitatlantico.com/playas",
            },
          ]}
        />

        {/* Hero Section */}
        <section className="relative h-[70vh] min-h-[500px]">
          <HeroImage
            src="/images/playas-atlantico-hero.jpg"
            alt="Playas del Atlántico Colombia - Caribe Colombiano"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

          {/* Hero content */}
          <div className="absolute inset-0 flex items-center justify-center text-center px-5">
            <div className="max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1
                  className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-2xl"
                  style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                >
                  Playas del Atlántico{" "}
                  <span className="text-yellow-300">Colombia</span>
                </h1>
                <p className="text-xl md:text-2xl text-white/95 mb-8 max-w-3xl mx-auto drop-shadow-lg leading-relaxed">
                  Descubre playas Blue Flag, paraísos del kitesurf y aguas
                  cristalinas del Caribe colombiano. A solo minutos de Barranquilla.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <a
                    href="#playas-destacadas"
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-full hover:shadow-2xl transform hover:-translate-y-1 transition-all"
                    style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                  >
                    Explorar Playas
                    <HiArrowRight className="ml-2 w-5 h-5" />
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Introducción */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-4xl mx-auto px-5 sm:px-8">
            <h2
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
              style={{ fontFamily: "'Josefin Sans', sans-serif" }}
            >
              Las Mejores Playas del Caribe Colombiano
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
              <p>
                El departamento del <strong>Atlántico</strong> es hogar de algunas de
                las playas más espectaculares del Caribe colombiano. A solo 20-45
                minutos de Barranquilla, estas playas ofrecen una combinación perfecta
                de aguas cristalinas, deportes acuáticos de clase mundial y
                gastronomía caribeña auténtica.
              </p>
              <p>
                En <strong>diciembre 2024</strong>, el Atlántico alcanzó un hito
                histórico cuando <strong>Salinas del Rey</strong> recibió la
                certificación <strong>Blue Flag</strong>, convirtiéndose en la{" "}
                <strong>primera playa deportiva de América</strong> con este
                reconocimiento internacional de calidad ambiental y servicios.
              </p>
              <p>
                Ya sea que busques la adrenalina del <strong>kitesurf</strong> en
                Puerto Velero, la tranquilidad familiar de Playa Mendoza, o la
                excelencia certificada de Salinas del Rey, las playas del Atlántico
                tienen algo para cada tipo de viajero.
              </p>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-l-4 border-blue-500 p-6 rounded-r-2xl my-8">
                <div className="flex items-start">
                  <HiSparkles className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">
                      ¿Por qué visitar las playas del Atlántico?
                    </h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>
                        ✅ <strong>Cercanía:</strong> 20-45 min desde Barranquilla
                      </li>
                      <li>
                        ✅ <strong>Certificación Blue Flag:</strong> Calidad garantizada
                      </li>
                      <li>
                        ✅ <strong>Deportes acuáticos:</strong> Kitesurf, windsurf, surf
                      </li>
                      <li>
                        ✅ <strong>Gastronomía:</strong> Pescado frito, arroz de coco,
                        sancocho
                      </li>
                      <li>
                        ✅ <strong>Clima ideal:</strong> 28-32°C todo el año
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Playas Destacadas */}
        <section
          id="playas-destacadas"
          className="py-16 lg:py-24 bg-gradient-to-br from-slate-50 to-blue-50"
        >
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="text-center mb-12">
              <h2
                className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                style={{ fontFamily: "'Josefin Sans', sans-serif" }}
              >
                Playas Destacadas del Atlántico
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Cada playa tiene su propia personalidad y atractivos únicos
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto rounded-full mt-6" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {playasDestacadas.map((playa, index) => (
                <Link
                  key={playa.nombre}
                  href={playa.url}
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  {/* Imagen */}
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={playa.imagen}
                      alt={playa.nombre}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {/* Badge destacado */}
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center">
                        {playa.destacado === "Blue Flag 2024" && (
                          <HiFlag className="w-3 h-3 mr-1" />
                        )}
                        {playa.destacado}
                      </span>
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="p-6">
                    <h3
                      className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors"
                      style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                    >
                      {playa.nombre}
                    </h3>
                    <p className="flex items-center text-sm text-gray-500 mb-3">
                      <HiMapPin className="w-4 h-4 mr-1" />
                      {playa.ubicacion}
                    </p>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {playa.descripcion}
                    </p>

                    {/* Características */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {playa.caracteristicas.map((caracteristica) => (
                        <span
                          key={caracteristica}
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full"
                        >
                          {caracteristica}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="flex items-center text-orange-600 font-semibold group-hover:text-orange-700">
                      <span>Ver más</span>
                      <HiArrowRight className="ml-2 transform group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Guía Práctica */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-4xl mx-auto px-5 sm:px-8">
            <h2
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center"
              style={{ fontFamily: "'Josefin Sans', sans-serif" }}
            >
              Guía Práctica para Visitar las Playas
            </h2>

            <div className="space-y-12">
              {/* Cómo llegar */}
              <div>
                <h3
                  className="text-2xl font-bold text-gray-900 mb-4 flex items-center"
                  style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                >
                  <HiMapPin className="w-7 h-7 text-orange-600 mr-2" />
                  Cómo Llegar
                </h3>
                <div className="prose prose-lg max-w-none text-gray-700">
                  <p>
                    Todas las playas del Atlántico están a <strong>20-50 minutos</strong>{" "}
                    de Barranquilla por la Vía al Mar (Circunvalar de la Prosperidad).
                  </p>
                  <ul>
                    <li>
                      <strong>En auto propio o rental:</strong> La forma más cómoda. Toma
                      la Vía 40 Norte hacia Puerto Colombia o la Vía al Mar hacia Juan de
                      Acosta.
                    </li>
                    <li>
                      <strong>Transporte público:</strong> Buses desde el Terminal de
                      Barranquilla a Puerto Colombia ($3,000 COP) y Tubará ($5,000 COP).
                      Frecuencia cada 20-30 minutos.
                    </li>
                    <li>
                      <strong>Taxi/Uber:</strong> $25,000-50,000 COP dependiendo del
                      destino. Confirma tarifa antes de salir.
                    </li>
                    <li>
                      <strong>Tours organizados:</strong> Muchos hoteles en Barranquilla
                      ofrecen tours de día a las playas ($50,000-80,000 COP por persona,
                      incluye transporte y almuerzo).
                    </li>
                  </ul>
                </div>
              </div>

              {/* Mejor época */}
              <div>
                <h3
                  className="text-2xl font-bold text-gray-900 mb-4 flex items-center"
                  style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                >
                  <HiSun className="w-7 h-7 text-orange-600 mr-2" />
                  Mejor Época para Visitar
                </h3>
                <div className="prose prose-lg max-w-none text-gray-700">
                  <p>
                    <strong>Diciembre a abril</strong> es la temporada seca con clima
                    soleado, mar tranquilo y temperaturas de 28-32°C. Es temporada alta,
                    por lo que hoteles y restaurantes están más llenos y los precios son
                    más altos.
                  </p>
                  <p>
                    <strong>Marzo y abril</strong> son ideales para <strong>kitesurf y
                    windsurf</strong> gracias a los vientos alisios del noreste que soplan
                    constantemente.
                  </p>
                  <p>
                    <strong>Julio a octubre</strong> es temporada de lluvias, pero los
                    aguaceros suelen ser cortos. Ventajas: menos turistas, precios más
                    bajos (hasta 40% de descuento), y playas casi vacías.
                  </p>
                </div>
              </div>

              {/* Qué llevar */}
              <div>
                <h3
                  className="text-2xl font-bold text-gray-900 mb-4 flex items-center"
                  style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                >
                  <HiCheckBadge className="w-7 h-7 text-orange-600 mr-2" />
                  Qué Llevar
                </h3>
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200 rounded-2xl p-6">
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-orange-600 mr-2">☀️</span>
                      <span>
                        <strong>Protector solar</strong> (FPS 50+) y reaplica cada 2 horas
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-600 mr-2">🧢</span>
                      <span>
                        <strong>Gorra o sombrero</strong> para protegerte del sol
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-600 mr-2">🕶️</span>
                      <span>
                        <strong>Gafas de sol</strong> con protección UV
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-600 mr-2">💧</span>
                      <span>
                        <strong>Agua embotellada</strong> (hidrátate constantemente)
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-600 mr-2">👙</span>
                      <span>
                        <strong>Traje de baño</strong> y toalla de playa
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-600 mr-2">🩴</span>
                      <span>
                        <strong>Sandalias</strong> resistentes al agua
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-600 mr-2">💵</span>
                      <span>
                        <strong>Efectivo</strong> (muchos lugares no aceptan tarjeta)
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-600 mr-2">📱</span>
                      <span>
                        <strong>Bolsa impermeable</strong> para proteger celular y
                        documentos
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Gastronomía */}
              <div>
                <h3
                  className="text-2xl font-bold text-gray-900 mb-4"
                  style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                >
                  Gastronomía en las Playas
                </h3>
                <div className="prose prose-lg max-w-none text-gray-700">
                  <p>
                    La gastronomía costera del Atlántico es un festín de sabores
                    caribeños:
                  </p>
                  <ul>
                    <li>
                      <strong>Pescado frito con patacones:</strong> El plato emblemático.
                      Pescado fresco frito servido con plátano verde frito y ensalada.
                      Precio: $25,000-35,000 COP.
                    </li>
                    <li>
                      <strong>Arroz de coco con camarones:</strong> Arroz cocinado en leche
                      de coco con camarones frescos. Sabor dulce y salado único.
                    </li>
                    <li>
                      <strong>Sancocho de mariscos:</strong> Sopa de mariscos con yuca,
                      plátano y cilantro. Perfecto para almuerzo.
                    </li>
                    <li>
                      <strong>Ceviche costeño:</strong> Camarón o chipi chipi marinado en
                      limón con cebolla, cilantro y ají.
                    </li>
                    <li>
                      <strong>Coco loco:</strong> Coctel servido en coco con ron,
                      aguardiente y leche de coco. Refrescante y potente.
                    </li>
                  </ul>
                  <p>
                    <strong>Recomendación:</strong> Come en los restaurantes locales (no
                    cadenas) para probar la gastronomía auténtica. En Playa Mendoza
                    encontrarás los mejores precios y sazón casera.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <FAQ
          title="Preguntas Frecuentes sobre las Playas del Atlántico"
          subtitle="Respuestas a las dudas más comunes de los viajeros"
          faqs={playasFAQs}
        />

        {/* Contenido relacionado */}
        <RelatedContent
          title="Más Experiencias en el Atlántico"
          items={[
            {
              title: "Carnaval de Barranquilla 2026",
              description:
                "Vive el segundo carnaval más grande del mundo, Patrimonio UNESCO. 14-17 de febrero 2026.",
              url: "/carnaval",
              image: "/images/carnaval-batalla-flores.jpg",
              category: "Eventos",
            },
            {
              title: "Ruta Gastronómica del Atlántico",
              description:
                "Descubre la gastronomía caribeña en sus 17 municipios. Sabores auténticos y tradición.",
              url: "/ruta23",
              image: "/images/gastronomia-atlantico.jpg",
              category: "Gastronomía",
            },
            {
              title: "17 Municipios del Atlántico",
              description:
                "Explora cada rincón del departamento: historia, cultura y naturaleza.",
              url: "/destinations",
              image: "/images/municipios-atlantico.jpg",
              category: "Destinos",
            },
          ]}
        />
      </main>
    </>
  );
}
