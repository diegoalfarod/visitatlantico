import type { Metadata } from "next";
import { CarnavalEventSchema } from "@/components/schemas/EventSchema";
import { HeroImage } from "@/components/OptimizedImage";
import RelatedContent from "@/components/RelatedContent";
import FAQ from "@/components/FAQ";
import { FAQSchema } from "@/components/schemas/FAQSchema";

/**
 * PILLAR PAGE: Carnaval de Barranquilla 2026
 *
 * Keywords target:
 * - carnaval de barranquilla 2026
 * - carnaval barranquilla fechas
 * - batalla de flores barranquilla
 * - guacherna barranquilla
 * - patrimonio unesco carnaval
 */

export const metadata: Metadata = {
  title: "Carnaval de Barranquilla 2026 | Guía Completa y Fechas",
  description:
    "Carnaval de Barranquilla 2026 del 14 al 17 de febrero. Segundo carnaval más grande del mundo, Patrimonio UNESCO. Batalla de Flores, Guacherna, Gran Parada. Guía completa con fechas, eventos, hoteles y consejos.",
  keywords: [
    "carnaval de barranquilla 2026",
    "carnaval barranquilla fechas",
    "batalla de flores barranquilla",
    "guacherna barranquilla",
    "carnaval unesco",
    "second largest carnival world",
    "barranquilla carnival tickets",
    "eventos carnaval barranquilla",
    "palcos batalla de flores",
    "hoteles carnaval barranquilla",
  ],
  openGraph: {
    title: "Carnaval de Barranquilla 2026 | 14-17 Febrero",
    description:
      "Segundo carnaval más grande del mundo. Patrimonio Cultural Inmaterial de la Humanidad UNESCO. Vive 4 días de cultura, música y tradición caribeña.",
    images: [
      {
        url: "/images/carnaval-batalla-flores-2026.jpg",
        width: 1200,
        height: 630,
        alt: "Carnaval de Barranquilla 2026 - Batalla de Flores",
      },
    ],
    type: "article",
  },
  alternates: {
    canonical: "/carnaval",
    languages: {
      "es-CO": "/es/carnaval",
      "en-US": "/en/carnival",
    },
  },
};

export default function CarnavalPage() {
  // FAQs optimizadas para Featured Snippets y People Also Ask
  const carnavalFAQs = [
    {
      question: "¿Cuándo es el Carnaval de Barranquilla 2026?",
      answer:
        "El Carnaval de Barranquilla 2026 se celebra del <strong>14 al 17 de febrero de 2026</strong>. Los eventos principales son: <ul><li><strong>Sábado 14:</strong> Batalla de Flores (desfile principal)</li><li><strong>Domingo 15:</strong> Gran Parada de Tradición</li><li><strong>Lunes 16:</strong> Gran Parada de Fantasía y Festival de Orquestas</li><li><strong>Martes 17:</strong> Muerte de Joselito (cierre simbólico)</li></ul> La pre-carnaval comienza desde enero con eventos como la Guacherna y la Lectura del Bando.",
    },
    {
      question: "¿Cuánto cuesta asistir al Carnaval de Barranquilla?",
      answer:
        "El costo de asistir al Carnaval varía según tu presupuesto:<br/><br/><strong>Opciones económicas (desde $50 USD/persona):</strong><ul><li>Desfiles gratis en la vía (llega temprano para buenos lugares)</li><li>Hospedaje en hostales: $15-30 USD/noche</li><li>Comida callejera: $3-8 USD por comida</li></ul><br/><strong>Opciones premium (desde $500 USD/persona):</strong><ul><li>Palcos en Batalla de Flores: $150-500 USD</li><li>Hoteles 4-5 estrellas: $100-300 USD/noche</li><li>Tours privados con guía: $80-150 USD</li></ul><br/>Recomendación: Presupuesto promedio de $300-500 USD por persona para 4 días (hospedaje, comidas, entradas y transporte).",
    },
    {
      question: "¿Dónde hospedarse para el Carnaval de Barranquilla?",
      answer:
        "Las mejores zonas para hospedarse durante el Carnaval son:<br/><br/><strong>1. Centro Norte (Zona Exclusiva):</strong><br/>Cerca de la Vía 40 donde pasan los desfiles. Hoteles como Hilton Garden Inn, GHL Hotel Barranquilla, Sonesta Hotel.<br/><br/><strong>2. El Poblado y Alto Prado:</strong><br/>Barrios seguros y cómodos, a 15-20 min de los desfiles. Buena relación calidad-precio.<br/><br/><strong>3. Buenavista:</strong><br/>Zona moderna con opciones de Airbnb y apartamentos amoblados. Ideal para grupos.<br/><br/><strong>Consejo:</strong> Reserva con <strong>4-6 meses de anticipación</strong> ya que los hoteles se llenan rápido. Los precios suben 2-3x durante el Carnaval.",
    },
    {
      question: "¿Qué es la Batalla de Flores y por qué es el evento principal?",
      answer:
        "La <strong>Batalla de Flores</strong> es el desfile inaugural del Carnaval de Barranquilla, considerado el evento más importante. Se realiza el sábado y recorre la Vía 40.<br/><br/><strong>¿Por qué es tan especial?</strong><ul><li>Desfilan las carrozas más espectaculares decoradas con flores</li><li>Participan todas las danzas folclóricas tradicionales</li><li>Es el desfile más largo (más de 8 horas)</li><li>Asisten las reinas del Carnaval en carrozas de lujo</li><li>Aparecen grupos de cumbia, mapalé y son de negro</li></ul><br/><strong>Dato histórico:</strong> Se llama 'Batalla de Flores' porque antiguamente los asistentes se lanzaban flores entre sí como símbolo de alegría y celebración.",
    },
    {
      question: "¿Es seguro asistir al Carnaval de Barranquilla?",
      answer:
        "Sí, el Carnaval de Barranquilla es <strong>generalmente seguro</strong> si sigues estas recomendaciones:<br/><br/><strong>Medidas de seguridad:</strong><ul><li>✅ No lleves objetos de valor (joyas, relojes caros)</li><li>✅ Usa riñonera o bolso cruzado pegado al cuerpo</li><li>✅ Mantente en zonas concurridas y bien iluminadas</li><li>✅ Toma taxis de aplicaciones (Uber, DiDi, InDriver)</li><li>✅ Hidrátate constantemente (hace mucho calor)</li><li>✅ Usa protector solar y gorra</li></ul><br/><strong>Durante el Carnaval hay:</strong><br/>Mayor presencia policial, zonas acordonadas, puntos de hidratación y atención médica. Más de 1 millón de personas asisten cada año sin incidentes.",
    },
    {
      question: "¿Por qué el Carnaval de Barranquilla es Patrimonio de la Humanidad UNESCO?",
      answer:
        "El Carnaval de Barranquilla fue declarado <strong>Obra Maestra del Patrimonio Oral e Intangible de la Humanidad por la UNESCO en 2003</strong>.<br/><br/><strong>Razones del reconocimiento:</strong><ul><li>🎭 Preserva tradiciones culturales de más de 100 años</li><li>🌍 Fusiona influencias indígenas, africanas y europeas</li><li>🎶 Mantiene vivas danzas folclóricas únicas (cumbia, mapalé, congo)</li><li>👥 Es un evento participativo donde toda la comunidad se involucra</li><li>📚 Transmite cultura de generación en generación</li></ul><br/>Es uno de los tres carnavales del mundo con este reconocimiento UNESCO, junto con el de Río de Janeiro y el de Venecia.",
    },
  ];

  return (
    <>
      {/* Schema.org para Google */}
      <CarnavalEventSchema />
      <FAQSchema faqs={carnavalFAQs} />

      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative h-[70vh] min-h-[500px]">
          <HeroImage
            src="/images/carnaval-hero.jpg"
            alt="Carnaval de Barranquilla 2026 - La fiesta más grande de Colombia"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Content */}
          <div className="absolute inset-0 flex items-end">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-16 lg:pb-24 w-full">
              <div className="max-w-3xl">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-josefin font-bold text-white mb-4">
                  Carnaval de Barranquilla 2026
                </h1>
                <p className="text-xl sm:text-2xl text-white/90 mb-6">
                  14 al 17 de Febrero · Patrimonio UNESCO
                </p>
                <p className="text-lg text-white/80 max-w-2xl">
                  El segundo carnaval más grande del mundo te espera con 4 días
                  de música, danza, color y tradición caribeña. Declarado
                  Patrimonio Cultural Inmaterial de la Humanidad por la UNESCO.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Fechas Importantes 2026 */}
        <section className="py-16 lg:py-24 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <h2 className="text-3xl sm:text-4xl font-josefin font-bold text-gray-900 mb-12 text-center">
              Fechas Clave Carnaval 2026
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Sábado 14 */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-[#007BC4]">
                <div className="text-center mb-4">
                  <div className="text-5xl font-bold text-[#007BC4]">14</div>
                  <div className="text-sm text-gray-600">Sábado, Febrero</div>
                </div>
                <h3 className="font-josefin font-bold text-lg mb-2">
                  Batalla de Flores
                </h3>
                <p className="text-gray-600 text-sm">
                  El desfile más importante con carrozas espectaculares,
                  comparsas y música en vivo.
                </p>
              </div>

              {/* Domingo 15 */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-[#EA5B13]">
                <div className="text-center mb-4">
                  <div className="text-5xl font-bold text-[#EA5B13]">15</div>
                  <div className="text-sm text-gray-600">Domingo, Febrero</div>
                </div>
                <h3 className="font-josefin font-bold text-lg mb-2">
                  Gran Parada
                </h3>
                <p className="text-gray-600 text-sm">
                  Miles de bailarines y músicos recorren la ciudad en el desfile
                  más grande.
                </p>
              </div>

              {/* Lunes 16 */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-[#D31A2B]">
                <div className="text-center mb-4">
                  <div className="text-5xl font-bold text-[#D31A2B]">16</div>
                  <div className="text-sm text-gray-600">Lunes, Febrero</div>
                </div>
                <h3 className="font-josefin font-bold text-lg mb-2">
                  Festival de Orquestas
                </h3>
                <p className="text-gray-600 text-sm">
                  Las mejores orquestas del Caribe compiten en el Gran Malecón.
                </p>
              </div>

              {/* Martes 17 */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-gray-800">
                <div className="text-center mb-4">
                  <div className="text-5xl font-bold text-gray-800">17</div>
                  <div className="text-sm text-gray-600">Martes, Febrero</div>
                </div>
                <h3 className="font-josefin font-bold text-lg mb-2">
                  Muerte de Joselito
                </h3>
                <p className="text-gray-600 text-sm">
                  El simbólico entierro que marca el fin del Carnaval hasta el
                  próximo año.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ¿Qué es el Carnaval? */}
        <section className="py-16 lg:py-24">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
            <h2 className="text-3xl sm:text-4xl font-josefin font-bold text-gray-900 mb-8">
              El Carnaval Más Auténtico del Caribe
            </h2>

            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                El Carnaval de Barranquilla es una celebración de 4 días que
                fusiona tradiciones indígenas, africanas y españolas en una
                explosión de música, danza y color. Con más de 100 años de
                historia, fue declarado{" "}
                <strong>
                  Patrimonio Cultural Inmaterial de la Humanidad por la UNESCO
                  en 2003
                </strong>
                , siendo el primer carnaval en recibir esta distinción.
              </p>

              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Cada año, más de 2 millones de personas se reúnen en las calles
                de Barranquilla para vivir esta experiencia única. Es el{" "}
                <strong>segundo carnaval más grande del mundo</strong> después
                de Río de Janeiro, pero mantiene un carácter más auténtico y
                accesible.
              </p>

              <h3 className="text-2xl font-josefin font-bold text-gray-900 mt-12 mb-4">
                Personajes Tradicionales
              </h3>

              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-[#007BC4] mr-2">🎭</span>
                  <span>
                    <strong>La Marimonda:</strong> Símbolo del Carnaval, con su
                    máscara de nariz larga y orejas grandes
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#007BC4] mr-2">👑</span>
                  <span>
                    <strong>El Rey Momo:</strong> Rey del Carnaval que gobierna
                    durante los 4 días
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#007BC4] mr-2">💃</span>
                  <span>
                    <strong>La Reina del Carnaval:</strong> Elegida cada año
                    para representar la belleza y cultura
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#007BC4] mr-2">⚔️</span>
                  <span>
                    <strong>El Congo:</strong> Danza guerrera de origen africano
                  </span>
                </li>
              </ul>

              <h3 className="text-2xl font-josefin font-bold text-gray-900 mt-12 mb-4">
                Eventos Pre-Carnaval
              </h3>

              <p className="text-lg text-gray-700 leading-relaxed">
                La fiesta comienza mucho antes del 14 de febrero:
              </p>

              <ul className="space-y-3 mt-4">
                <li>
                  <strong>17 de Enero:</strong> Lectura del Bando - Inicio
                  oficial
                </li>
                <li>
                  <strong>Enero-Febrero:</strong> Guacherna (desfile nocturno),
                  Coronación de la Reina
                </li>
                <li>
                  <strong>Febrero:</strong> Toma de la Ciudad por las
                  comparsas
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Consejos Prácticos */}
        <section className="py-16 lg:py-24 bg-[#007BC4] text-white">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
            <h2 className="text-3xl sm:text-4xl font-josefin font-bold mb-12 text-center">
              Consejos para Vivir el Carnaval
            </h2>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <h3 className="font-josefin font-bold text-xl mb-3">
                  📅 Reserva con Anticipación
                </h3>
                <p className="text-white/90">
                  Los hoteles se llenan 3-6 meses antes. Reserva tu alojamiento
                  cuanto antes para mejores precios.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <h3 className="font-josefin font-bold text-xl mb-3">
                  🎫 Compra Palcos Anticipado
                </h3>
                <p className="text-white/90">
                  Los palcos para la Batalla de Flores se agotan rápido. Cómpr alos
                  en diciembre-enero.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <h3 className="font-josefin font-bold text-xl mb-3">
                  ☀️ Protégete del Sol
                </h3>
                <p className="text-white/90">
                  Barranquilla es calurosa. Usa protector solar, sombrero y
                  mantente hidratado.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <h3 className="font-josefin font-bold text-xl mb-3">
                  👟 Ropa Cómoda
                </h3>
                <p className="text-white/90">
                  Usarás ropa ligera y zapatos cómodos. Prepárate para caminar y
                  bailar mucho.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-16 lg:py-24 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-josefin font-bold text-gray-900 mb-6">
              ¿Listo para el Carnaval 2026?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Descubre todo lo que el Atlántico tiene para ofrecer más allá del
              Carnaval
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="/playas"
                className="px-8 py-4 bg-[#007BC4] text-white font-josefin font-semibold rounded-full hover:bg-[#006BA3] transition-all shadow-lg"
              >
                Explorar Playas
              </a>
              <a
                href="/gastronomia"
                className="px-8 py-4 bg-white text-[#007BC4] font-josefin font-semibold rounded-full border-2 border-[#007BC4] hover:bg-[#007BC4] hover:text-white transition-all"
              >
                Gastronomía Caribeña
              </a>
            </div>
          </div>
        </section>

        {/* FAQ Section - Optimizada para Featured Snippets */}
        <FAQ
          title="Preguntas Frecuentes sobre el Carnaval 2026"
          subtitle="Todo lo que necesitas saber para vivir el mejor Carnaval de tu vida"
          faqs={carnavalFAQs}
        />

        {/* Contenido Relacionado para SEO Interlinking */}
        <RelatedContent
          title="Descubre más del Atlántico"
          items={[
            {
              title: "Playas Blue Flag del Atlántico",
              description:
                "Descubre Salinas del Rey, primera playa deportiva de América con certificación Blue Flag. Kitesur f, windsurf y deportes acuáticos en aguas cristalinas del Caribe colombiano.",
              url: "/playas/salinas-del-rey",
              image: "/images/salinas-del-rey-beach.jpg",
              category: "Playas",
            },
            {
              title: "Gastronomía Caribeña Auténtica",
              description:
                "Descubre los sabores del Caribe: arepa de huevo, pescado frito, sancocho de guandú. Recorrido por los mejores restaurantes y mercados de comida típica en Barranquilla.",
              url: "/ruta23",
              image: "/images/gastronomia-caribe.jpg",
              category: "Gastronomía",
            },
            {
              title: "17 Municipios del Atlántico",
              description:
                "Explora todos los municipios del departamento: desde las playas de Puerto Colombia hasta la historia de Soledad. Guía completa de qué ver y hacer en cada destino.",
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
