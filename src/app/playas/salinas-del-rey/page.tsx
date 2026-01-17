import type { Metadata } from "next";
import { TouristAttractionSchema } from "@/components/schemas/TouristAttractionSchema";
import { HeroImage } from "@/components/OptimizedImage";
import RelatedContent from "@/components/RelatedContent";

/**
 * LANDING PAGE PRIORITARIA: Salinas del Rey Blue Flag
 *
 * Keywords target (KEYWORD EMERGENTE - ventaja de primer movimiento):
 * - salinas del rey blue flag
 * - primera playa blue flag colombia
 * - playa deportiva blue flag américa
 * - playas con bandera azul colombia
 * - salinas del rey puerto colombia
 */

export const metadata: Metadata = {
  title:
    "Salinas del Rey Blue Flag | Primera Playa Deportiva Certificada de América",
  description:
    "Salinas del Rey recibe la certificación Blue Flag en diciembre 2024, convirtiéndose en la primera playa deportiva de América con esta distinción. Ubicada en Puerto Colombia, Atlántico. Deportes acuáticos, kitesurf, windsurf y aguas cristalinas.",
  keywords: [
    "salinas del rey blue flag",
    "salinas del rey puerto colombia",
    "primera playa blue flag colombia",
    "playa deportiva blue flag américa",
    "playas con bandera azul colombia",
    "certificación blue flag diciembre 2024",
    "playas puerto colombia",
    "kitesurf salinas del rey",
    "mejores playas atlántico colombia",
  ],
  openGraph: {
    title: "Salinas del Rey Blue Flag | Primera en América",
    description:
      "Primera playa deportiva de América con certificación Blue Flag. Aguas cristalinas, deportes acuáticos y calidad ambiental garantizada.",
    images: [
      {
        url: "/images/salinas-blue-flag.jpg",
        width: 1200,
        height: 630,
        alt: "Salinas del Rey - Primera Playa Blue Flag de América",
      },
    ],
    type: "article",
  },
  alternates: {
    canonical: "/playas/salinas-del-rey",
    languages: {
      "es-CO": "/es/playas/salinas-del-rey",
      "en-US": "/en/beaches/salinas-del-rey",
    },
  },
};

const salinasData = {
  nombre: "Salinas del Rey",
  descripcion:
    "Primera playa deportiva de América con certificación Blue Flag. Destino premium para deportes acuáticos en el Caribe colombiano.",
  imagen: "/images/salinas-del-rey.jpg",
  municipio: "Puerto Colombia",
  latitud: 11.0109,
  longitud: -74.9551,
  tiposTurismo: ["Deportes Acuáticos", "Playa", "Naturaleza"],
  esGratis: true,
};

export default function SalinasDelReyPage() {
  return (
    <>
      {/* Schema.org */}
      <TouristAttractionSchema atraccion={salinasData} />

      <main className="min-h-screen bg-white">
        {/* Hero */}
        <section className="relative h-[75vh] min-h-[600px]">
          <HeroImage
            src="/images/salinas-blue-flag-hero.jpg"
            alt="Salinas del Rey - Primera Playa Blue Flag de América"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#007BC4]/90 via-[#007BC4]/40 to-transparent" />

          <div className="absolute inset-0 flex items-end">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-20 w-full">
              {/* Badge Blue Flag */}
              <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full mb-6 shadow-lg">
                <span className="text-2xl">🏖️</span>
                <span className="font-bold text-[#007BC4]">
                  Certificación Blue Flag
                </span>
                <span className="bg-[#007BC4] text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Diciembre 2024
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-josefin font-bold text-white mb-4">
                Salinas del Rey
              </h1>
              <p className="text-2xl sm:text-3xl text-white/90 mb-6 font-light">
                Primera Playa Deportiva Blue Flag de América
              </p>
              <p className="text-lg text-white/80 max-w-2xl">
                Puerto Colombia, Atlántico · La única playa deportiva del
                continente americano con la prestigiosa certificación
                internacional Blue Flag
              </p>
            </div>
          </div>
        </section>

        {/* ¿Qué es Blue Flag? */}
        <section className="py-16 lg:py-24 bg-gradient-to-b from-white to-blue-50">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="max-w-3xl">
              <div className="inline-block bg-blue-100 text-[#007BC4] px-4 py-2 rounded-full text-sm font-semibold mb-6">
                CERTIFICACIÓN INTERNACIONAL
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-josefin font-bold text-gray-900 mb-6">
                ¿Qué Significa la Bandera Azul?
              </h2>

              <p className="text-xl text-gray-700 leading-relaxed mb-8">
                La <strong>certificación Blue Flag</strong> es el galardón
                ambiental más reconocido del mundo para playas y marinas. Solo
                las playas que cumplen con los más altos estándares de calidad
                del agua, gestión ambiental, seguridad y servicios pueden
                obtenerla.
              </p>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="text-4xl mb-3">💧</div>
                  <h3 className="font-josefin font-bold text-lg mb-2">
                    Agua de Calidad Excepcional
                  </h3>
                  <p className="text-gray-600">
                    Análisis constante garantiza agua limpia y segura para
                    nadar.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="text-4xl mb-3">🌊</div>
                  <h3 className="font-josefin font-bold text-lg mb-2">
                    Gestión Ambiental
                  </h3>
                  <p className="text-gray-600">
                    Protección de ecosistemas marinos y playas sostenibles.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="text-4xl mb-3">🛟</div>
                  <h3 className="font-josefin font-bold text-lg mb-2">
                    Seguridad y Servicios
                  </h3>
                  <p className="text-gray-600">
                    Salvavidas, accesibilidad y servicios de alta calidad.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="text-4xl mb-3">📚</div>
                  <h3 className="font-josefin font-bold text-lg mb-2">
                    Educación Ambiental
                  </h3>
                  <p className="text-gray-600">
                    Programas de concienciación sobre conservación marina.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Hito Histórico */}
        <section className="py-16 lg:py-24 bg-[#007BC4] text-white">
          <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-josefin font-bold mb-8">
              Un Hito para Colombia y América
            </h2>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div>
                <div className="text-5xl sm:text-6xl font-bold mb-2">1ª</div>
                <p className="text-lg text-white/90">
                  Playa deportiva Blue Flag de América
                </p>
              </div>

              <div>
                <div className="text-5xl sm:text-6xl font-bold mb-2">2024</div>
                <p className="text-lg text-white/90">
                  Certificación otorgada en diciembre
                </p>
              </div>

              <div>
                <div className="text-5xl sm:text-6xl font-bold mb-2">33</div>
                <p className="text-lg text-white/90">
                  Criterios de excelencia cumplidos
                </p>
              </div>
            </div>

            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Salinas del Rey se une a un selecto grupo de menos de 5,000 playas
              en todo el mundo con esta distinción, posicionando a Colombia como
              líder en turismo sostenible en América Latina.
            </p>
          </div>
        </section>

        {/* Deportes Acuáticos */}
        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-josefin font-bold text-gray-900 mb-12">
              Paraíso para Deportes Acuáticos
            </h2>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Las condiciones perfectas de viento y mar hacen de Salinas del
                  Rey el destino ideal para deportes acuáticos. Sus aguas
                  cristalinas y vientos constantes atraen a atletas de todo el
                  mundo.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 rounded-full p-3 flex-shrink-0">
                      <span className="text-2xl">🪁</span>
                    </div>
                    <div>
                      <h3 className="font-josefin font-bold text-lg mb-1">
                        Kitesurf
                      </h3>
                      <p className="text-gray-600">
                        Vientos ideales de 15-25 nudos casi todo el año. Escuelas
                        certificadas.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 rounded-full p-3 flex-shrink-0">
                      <span className="text-2xl">🏄</span>
                    </div>
                    <div>
                      <h3 className="font-josefin font-bold text-lg mb-1">
                        Windsurf
                      </h3>
                      <p className="text-gray-600">
                        Aguas tranquilas perfectas para principiantes y expertos.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 rounded-full p-3 flex-shrink-0">
                      <span className="text-2xl">🏖️</span>
                    </div>
                    <div>
                      <h3 className="font-josefin font-bold text-lg mb-1">
                        Paddle Board (SUP)
                      </h3>
                      <p className="text-gray-600">
                        Explora la costa en stand up paddle por aguas tranquilas.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 rounded-full p-3 flex-shrink-0">
                      <span className="text-2xl">🤿</span>
                    </div>
                    <div>
                      <h3 className="font-josefin font-bold text-lg mb-1">
                        Snorkel
                      </h3>
                      <p className="text-gray-600">
                        Aguas cristalinas para observar vida marina caribeña.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <HeroImage
                  src="/images/kitesurf-salinas.jpg"
                  alt="Kitesurf en Salinas del Rey"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Cómo Llegar */}
        <section className="py-16 lg:py-24 bg-gray-50">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
            <h2 className="text-3xl sm:text-4xl font-josefin font-bold text-gray-900 mb-8">
              Cómo Llegar a Salinas del Rey
            </h2>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-[#007BC4] text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-josefin font-bold text-lg mb-2">
                      Desde Barranquilla
                    </h3>
                    <p className="text-gray-600">
                      30 minutos en auto por la Vía al Mar (22 km). Toma la
                      salida hacia Puerto Colombia.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-[#007BC4] text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-josefin font-bold text-lg mb-2">
                      Desde el Aeropuerto
                    </h3>
                    <p className="text-gray-600">
                      35-40 minutos desde el Aeropuerto Ernesto Cortissoz.
                      Servicios de taxi y Uber disponibles.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-[#007BC4] text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-josefin font-bold text-lg mb-2">
                      Transporte Público
                    </h3>
                    <p className="text-gray-600">
                      Buses desde el terminal de Barranquilla hacia Puerto
                      Colombia. Frecuencia cada 20-30 minutos.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-gray-700">
                  <strong>Coordenadas GPS:</strong> 11.0109° N, 74.9551° W
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 lg:py-24 bg-gradient-to-r from-[#007BC4] to-[#0091E6] text-white">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-josefin font-bold mb-6">
              Explora Más Playas del Atlántico
            </h2>
            <p className="text-xl text-white/90 mb-8">
              El Atlántico te ofrece 90km de costa caribeña con playas para
              todos los gustos
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="/playas"
                className="px-8 py-4 bg-white text-[#007BC4] font-josefin font-semibold rounded-full hover:bg-gray-100 transition-all shadow-lg"
              >
                Ver Todas las Playas
              </a>
              <a
                href="/destinos/puerto-colombia"
                className="px-8 py-4 bg-transparent text-white font-josefin font-semibold rounded-full border-2 border-white hover:bg-white hover:text-[#007BC4] transition-all"
              >
                Descubre Puerto Colombia
              </a>
            </div>
          </div>
        </section>

        {/* Contenido Relacionado para SEO Interlinking */}
        <RelatedContent
          title="Más Experiencias en el Atlántico"
          items={[
            {
              title: "Carnaval de Barranquilla 2026",
              description:
                "Vive el segundo carnaval más grande del mundo del 14 al 17 de febrero 2026. Patrimonio Cultural Inmaterial de la Humanidad UNESCO con 4 días de fiesta, música y tradición caribeña.",
              url: "/carnaval",
              image: "/images/carnaval-batalla-flores.jpg",
              category: "Eventos",
            },
            {
              title: "Ruta Gastronómica del Atlántico",
              description:
                "Explora los sabores auténticos del Caribe colombiano. Desde arepas de huevo hasta pescados frescos, descubre los mejores restaurantes y mercados de Barranquilla.",
              url: "/ruta23",
              image: "/images/gastronomia-caribe.jpg",
              category: "Gastronomía",
            },
            {
              title: "Ecoturismo en los Manglares",
              description:
                "Descubre la biodiversidad del Caribe en los manglares del Atlántico. Observación de aves, kayak ecológico y tours guiados por ecosistemas únicos.",
              url: "/destinations",
              image: "/images/manglares-atlantico.jpg",
              category: "Ecoturismo",
            },
          ]}
        />
      </main>
    </>
  );
}
