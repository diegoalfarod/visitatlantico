import type { Metadata } from "next";
import { FAQSchema } from "@/components/schemas/FAQSchema";

/**
 * Layout para Ruta 23 - Gastronomía del Atlántico
 * Agrega metadata SEO sin modificar el diseño de la página
 */

export const metadata: Metadata = {
  title: "Ruta 23 | Gastronomía y Artesanías del Atlántico Colombia",
  description:
    "Ruta 23: descubre la gastronomía caribeña auténtica y artesanías del Atlántico. 18 festivales gastronómicos, 900+ artesanos, platos típicos como arepa de huevo, bollo limpio, enyucado. Exportamos a 19 países.",
  keywords: [
    "ruta 23 atlántico",
    "gastronomía barranquilla",
    "gastronomía atlántico colombia",
    "comida típica caribeña",
    "arepa de huevo",
    "bollo limpio atlántico",
    "artesanías colombia",
    "festivales gastronómicos atlántico",
    "comida costeña",
    "sancocho de guandú",
    "enyucado",
  ],
  openGraph: {
    title: "Ruta 23 | Gastronomía y Artesanías del Atlántico",
    description:
      "🍽️ 18 Festivales Gastronómicos | 🎨 900+ Artesanos | 🌎 Exportamos a 19 países. Descubre los sabores auténticos del Caribe colombiano.",
    images: [
      {
        url: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/RUTA23%20-%20IMAGE%201.png?alt=media&token=cd2eebdd-020a-41f8-9703-e1ac3d238534",
        width: 1200,
        height: 630,
        alt: "Ruta 23 - Gastronomía del Atlántico",
      },
    ],
    type: "website",
  },
  alternates: {
    canonical: "/ruta23",
    languages: {
      "es-CO": "/es/ruta23",
      "en-US": "/en/route23",
    },
  },
};

// FAQs sobre Ruta 23 y gastronomía del Atlántico
const ruta23FAQs = [
  {
    question: "¿Qué es la Ruta 23 del Atlántico?",
    answer:
      "La <strong>Ruta 23</strong> es una iniciativa de la Gobernación del Atlántico que conecta los <strong>23 municipios del departamento</strong> a través de su gastronomía tradicional y artesanías. Es un recorrido cultural y gastronómico que promueve los sabores auténticos del Caribe colombiano, con <strong>18 festivales gastronómicos</strong> al año y más de <strong>900 artesanos capacitados</strong>. La Ruta 23 ha logrado exportar productos artesanales a <strong>19 países</strong>, generando más de <strong>$1 millón USD</strong> en exportaciones anuales.",
  },
  {
    question: "¿Cuáles son los platos típicos más famosos del Atlántico?",
    answer:
      "Los platos típicos más emblemáticos del Atlántico son:<br/><br/><strong>1. Arepa de Huevo:</strong> Arepa frita rellena con huevo. El snack más icónico del Caribe colombiano.<br/><br/><strong>2. Bollo Limpio:</strong> Masa de maíz envuelta en hojas de bijao. Se come con queso costeño.<br/><br/><strong>3. Sancocho de Guandú:</strong> Sopa espesa con guandú (frijol), cerdo, yuca y plátano. Plato dominical tradicional.<br/><br/><strong>4. Enyucado:</strong> Postre dulce hecho de yuca rallada con coco y panela.<br/><br/><strong>5. Arroz de Lisa:</strong> Arroz con pescado lisa (mugil), típico de municipios costeros.<br/><br/><strong>6. Carimañola:</strong> Bollo de yuca frito relleno de carne o queso.",
  },
  {
    question: "¿Dónde puedo probar la gastronomía auténtica del Atlántico?",
    answer:
      "Los mejores lugares para probar gastronomía auténtica del Atlántico son:<br/><br/><strong>Festivales Gastronómicos:</strong><br/>🎪 <strong>Festival del Bollo:</strong> Repelón (junio)<br/>🎪 <strong>Festival del Maíz:</strong> Tubará (julio)<br/>🎪 <strong>Festival del Enyucado:</strong> Campo de la Cruz (agosto)<br/><br/><strong>Municipios recomendados:</strong><br/>📍 <strong>Soledad:</strong> Famosa por arepas de huevo y carimañolas<br/>📍 <strong>Galapa:</strong> Bollos y sancocho de guandú<br/>📍 <strong>Tubará:</strong> Platos a base de maíz<br/>📍 <strong>Puerto Colombia:</strong> Pescados y mariscos frescos<br/><br/><strong>Mercados locales:</strong><br/>🏪 Mercado de Soledad<br/>🏪 Plaza de Galapa<br/>🏪 Mercado de Malambo",
  },
  {
    question: "¿Qué artesanías se producen en el Atlántico?",
    answer:
      "El Atlántico es reconocido por sus artesanías tradicionales:<br/><br/><strong>Artesanías en Iraca (palma):</strong><br/>🎨 Sombreros vueltiaos y panameños<br/>🎨 Bolsos, esteras y abanicos<br/>🎨 Figuras decorativas<br/><br/><strong>Municipios productores:</strong><br/>📍 <strong>Usiacurí:</strong> Capital artesanal del Atlántico. Famoso por trabajos en iraca.<br/>📍 <strong>Tubará:</strong> Artesanías en barro y cerámica<br/>📍 <strong>Galapa:</strong> Tejidos tradicionales<br/><br/><strong>Exportaciones:</strong><br/>Las artesanías del Atlántico se exportan a <strong>19 países</strong> incluyendo Estados Unidos, España, Francia, Alemania y Japón. La Gobernación ha capacitado más de <strong>900 artesanos</strong> en técnicas de producción y comercialización internacional.",
  },
  {
    question: "¿Cuándo se celebran los festivales gastronómicos del Atlántico?",
    answer:
      "El Atlántico celebra <strong>18 festivales gastronómicos</strong> durante el año:<br/><br/><strong>Primer Semestre:</strong><br/>🎉 <strong>Enero:</strong> Festival del Sancocho (Malambo)<br/>🎉 <strong>Marzo:</strong> Festival del Mote de Queso (Campo de la Cruz)<br/>🎉 <strong>Abril:</strong> Festival del Arroz de Lisa (Puerto Colombia)<br/>🎉 <strong>Junio:</strong> Festival del Bollo (Repelón)<br/><br/><strong>Segundo Semestre:</strong><br/>🎉 <strong>Julio:</strong> Festival del Maíz (Tubará)<br/>🎉 <strong>Agosto:</strong> Festival del Enyucado (Campo de la Cruz)<br/>🎉 <strong>Septiembre:</strong> Festival de la Butifarra (Soledad)<br/>🎉 <strong>Octubre:</strong> Festival del Suero Costeño (Galapa)<br/><br/><strong>Consejo:</strong> Los festivales son gratuitos y abiertos al público. Incluyen concursos de cocina, degustaciones, música en vivo y venta de productos artesanales.",
  },
  {
    question: "¿Cómo llegar a los municipios de la Ruta 23 desde Barranquilla?",
    answer:
      "Todos los municipios de la Ruta 23 están <strong>a menos de 1 hora</strong> de Barranquilla:<br/><br/><strong>Cercanos (15-30 min):</strong><br/>🚗 <strong>Soledad:</strong> 10 km - Bus desde Portal del Prado ($2,000 COP)<br/>🚗 <strong>Galapa:</strong> 18 km - Bus desde Terminal ($3,000 COP)<br/>🚗 <strong>Puerto Colombia:</strong> 20 km - Bus o taxi ($25,000 COP)<br/><br/><strong>Distancia media (30-50 min):</strong><br/>🚗 <strong>Usiacurí:</strong> 35 km - Bus desde Terminal ($5,000 COP)<br/>🚗 <strong>Tubará:</strong> 42 km - Bus desde Terminal ($6,000 COP)<br/>🚗 <strong>Repelón:</strong> 55 km - Bus desde Terminal ($8,000 COP)<br/><br/><strong>Recomendación:</strong> Alquila un auto para visitar varios municipios en un día. Las carreteras están en buen estado y señalizadas.",
  },
];

export default function Ruta23Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Schema.org FAQs */}
      <FAQSchema faqs={ruta23FAQs} />
      {children}
    </>
  );
}
