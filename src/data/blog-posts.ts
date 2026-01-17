/**
 * Blog Posts Data
 *
 * Artículos del blog optimizados para SEO
 * Formato: JSON con contenido en HTML para facilidad de edición
 */

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  image: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  keywords: string[];
  content: string; // HTML content
}

export const blogPosts: BlogPost[] = [
  {
    slug: "10-cosas-carnaval-barranquilla",
    title: "10 Cosas Que No Sabías del Carnaval de Barranquilla",
    description:
      "Descubre curiosidades fascinantes sobre el segundo carnaval más grande del mundo. Historia, tradiciones y datos sorprendentes del Carnaval de Barranquilla.",
    image: "/images/blog/carnaval-curiosidades.jpg",
    category: "Cultura",
    author: "VisitAtlántico",
    date: "2026-01-15",
    readTime: "6 min",
    keywords: [
      "carnaval de barranquilla curiosidades",
      "carnaval barranquilla datos",
      "historia carnaval barranquilla",
      "patrimonio unesco carnaval",
    ],
    content: `
      <article class="prose prose-lg max-w-none">
        <p class="lead">
          El Carnaval de Barranquilla es mucho más que desfiles y disfraces. Es una celebración con más de 100 años de historia, llena de curiosidades que probablemente no conocías. Aquí te revelamos 10 datos fascinantes sobre esta fiesta declarada Patrimonio de la Humanidad por la UNESCO.
        </p>

        <h2>1. Es el Segundo Carnaval Más Grande del Mundo</h2>
        <p>
          El Carnaval de Barranquilla es el <strong>segundo más grande del mundo</strong>, solo superado por el de Río de Janeiro. Atrae más de <strong>1.5 millones de visitantes</strong> cada año, incluyendo turistas de más de 50 países.
        </p>

        <h2>2. La Batalla de Flores No Siempre Fue el Evento Principal</h2>
        <p>
          Aunque hoy la Batalla de Flores es el desfile más importante (inaugurado en 1903), originalmente el evento principal era la <strong>Guacherna</strong>, un desfile nocturno con antorchas que se celebraba el sábado por la noche. La Batalla de Flores se creó como una alternativa "civilizada" a las guerras de agua y harina que antes dominaban el Carnaval.
        </p>

        <h2>3. El Rey Momo No Siempre Existió</h2>
        <p>
          El personaje del <strong>Rey Momo</strong> (el rey del Carnaval) se incorporó oficialmente en <strong>1888</strong>, inspirado en los carnavales europeos. Antes de eso, el Carnaval no tenía una figura central que lo representara. El Rey Momo simboliza la alegría y el desenfreno de la celebración.
        </p>

        <h2>4. Patrimonio UNESCO Desde 2003</h2>
        <p>
          En <strong>2003</strong>, el Carnaval de Barranquilla fue declarado <strong>Obra Maestra del Patrimonio Oral e Intangible de la Humanidad</strong> por la UNESCO. Es uno de solo tres carnavales en el mundo con este reconocimiento (junto con Río de Janeiro y Venecia).
        </p>
        <p>
          La UNESCO lo reconoció por:
        </p>
        <ul>
          <li>Preservar tradiciones de más de 100 años</li>
          <li>Fusionar culturas indígenas, africanas y europeas</li>
          <li>Mantener vivas danzas folclóricas únicas</li>
          <li>Ser un evento participativo donde toda la comunidad se involucra</li>
        </ul>

        <h2>5. El Garabato Representa la Muerte</h2>
        <p>
          Una de las danzas más icónicas es el <strong>Garabato</strong>, donde los bailarines usan un palo con forma de gancho. Este baile representa la <strong>lucha entre la vida y la muerte</strong>, siendo el garabato el instrumento con el que la muerte "atrapa" a las personas. Es una tradición de origen africano que se ha preservado por generaciones.
        </p>

        <h2>6. La Reina del Carnaval Gana Más Que un Concurso de Belleza</h2>
        <p>
          A diferencia de otros concursos de belleza, ser <strong>Reina del Carnaval de Barranquilla</strong> no solo se trata de apariencia física. Las candidatas deben demostrar:
        </p>
        <ul>
          <li>Conocimiento profundo de la historia del Carnaval</li>
          <li>Habilidades de baile en danzas folclóricas</li>
          <li>Capacidad para representar la cultura caribeña</li>
          <li>Carisma y conexión con la comunidad</li>
        </ul>
        <p>
          La reina se convierte en <strong>embajadora cultural</strong> de Barranquilla durante todo el año.
        </p>

        <h2>7. El Mapalé Es Más Antiguo Que el Carnaval Mismo</h2>
        <p>
          El <strong>Mapalé</strong> es una danza de origen africano que llegó a Colombia con los esclavizados en el siglo XVII, mucho antes de que el Carnaval se formalizara. Originalmente era un baile de pescadores que imitaba el movimiento de los peces fuera del agua. Hoy es una de las danzas más vigorosas y sensuales del Carnaval.
        </p>

        <h2>8. La Cumbia Es Patrimonio Cultural de Múltiples Países</h2>
        <p>
          Aunque la <strong>cumbia</strong> es emblema del Carnaval de Barranquilla, su origen es disputado entre Colombia, Panamá y otros países caribeños. Lo que sí es seguro es que la cumbia colombiana, tal como se baila en Barranquilla, es única y diferente de las variantes de otros países. La versión barranquillera conserva la instrumentación tradicional con <strong>tambores, maracas y gaitas</strong>.
        </p>

        <h2>9. El Carnaval Alguna Vez Fue Prohibido</h2>
        <p>
          A principios del siglo XX, hubo varios intentos de las autoridades por <strong>prohibir o limitar el Carnaval</strong> debido a los excesos y desórdenes públicos. Sin embargo, la presión popular fue tan fuerte que las prohibiciones nunca prosperaron. Hoy el Carnaval está altamente regulado, pero mantiene su espíritu de libertad y celebración.
        </p>

        <h2>10. Genera Más de $100 Millones USD en Ingresos</h2>
        <p>
          El Carnaval de Barranquilla es un <strong>motor económico</strong> para la ciudad. Según estudios recientes, genera más de <strong>$100 millones de dólares</strong> en ingresos anuales, incluyendo:
        </p>
        <ul>
          <li>Turismo y hospedaje (hoteles aumentan tarifas 3x)</li>
          <li>Venta de disfraces y artesanías</li>
          <li>Gastronomía y entretenimiento</li>
          <li>Empleo temporal para más de 10,000 personas</li>
        </ul>

        <hr />

        <h2>Conclusión</h2>
        <p>
          El Carnaval de Barranquilla es mucho más que una fiesta: es un <strong>patrimonio vivo</strong> que fusiona historia, cultura y tradición. Cada danza, cada disfraz y cada ritual tiene siglos de historia detrás. Si aún no lo has vivido, el <strong>Carnaval 2026 (14-17 de febrero)</strong> es tu oportunidad para ser parte de esta magia.
        </p>

        <div class="bg-orange-50 border-l-4 border-orange-500 p-6 my-8 rounded-r-lg">
          <h3 class="text-xl font-bold text-gray-900 mb-2">¿Listo para el Carnaval 2026?</h3>
          <p class="text-gray-700 mb-4">
            Explora nuestra guía completa del Carnaval de Barranquilla con fechas, eventos, consejos de hospedaje y todo lo que necesitas saber.
          </p>
          <a href="/carnaval" class="inline-flex items-center px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors">
            Ver Guía del Carnaval 2026 →
          </a>
        </div>
      </article>
    `,
  },
  {
    slug: "donde-comer-barranquilla",
    title: "Guía Completa: Dónde Comer en Barranquilla",
    description:
      "Los mejores restaurantes y sitios para comer en Barranquilla. Descubre gastronomía caribeña auténtica, desde comida callejera hasta fine dining. Guía por zonas y presupuesto.",
    image: "/images/blog/restaurantes-barranquilla.jpg",
    category: "Gastronomía",
    author: "VisitAtlántico",
    date: "2026-01-10",
    readTime: "8 min",
    keywords: [
      "restaurantes barranquilla",
      "donde comer barranquilla",
      "gastronomía barranquilla",
      "comida típica barranquilla",
      "mejores restaurantes barranquilla",
    ],
    content: `
      <article class="prose prose-lg max-w-none">
        <p class="lead">
          Barranquilla es una ciudad llena de sabor. Desde arepas de huevo en la esquina hasta restaurantes gourmet con fusión caribeña, la oferta gastronómica es tan diversa como deliciosa. Esta guía te llevará por los mejores lugares para comer en Barranquilla, organizados por zonas y presupuesto.
        </p>

        <h2>🏙️ Centro Norte - Zona Exclusiva</h2>
        <p>
          El Centro Norte es la zona moderna y exclusiva de Barranquilla, con los mejores restaurantes de alta cocina y opciones internacionales.
        </p>

        <h3>Alta Cocina ($$$)</h3>
        <ul>
          <li>
            <strong>Restaurante Sozza (Fusión Caribeña):</strong> Considerado el mejor restaurante de Barranquilla. Cocina de autor con ingredientes locales. Plato estrella: Pargo rojo en salsa de maracuyá. Precio promedio: $80,000-120,000 COP por persona.
          </li>
          <li>
            <strong>Misia (Cocina del Caribe Contemporánea):</strong> Ambiente elegante, terraza con vista. Especialidad: risotto de camarones con coco. Precio: $70,000-100,000 COP.
          </li>
          <li>
            <strong>La Bonga del Sinú (Alta Cocina Costeña):</strong> Restaurante icónico con más de 20 años. Sancocho trifásico y mote de queso excepcionales. Precio: $60,000-90,000 COP.
          </li>
        </ul>

        <h3>Opciones Medias ($$)</h3>
        <ul>
          <li>
            <strong>Nuestro Sazón (Comida Típica):</strong> Auténtica comida costeña en ambiente familiar. Sancocho de guandú, arroz de lisa, pescado frito. Precio: $30,000-45,000 COP.
          </li>
          <li>
            <strong>Varadero (Mariscos):</strong> Especializado en mariscos frescos. Ceviche, cazuela de mariscos, langosta al ajillo. Precio: $40,000-60,000 COP.
          </li>
        </ul>

        <h2>🏖️ El Poblado y Alto Prado - Barrios Residenciales</h2>
        <p>
          Zonas seguras y tradicionales con opciones familiares y buena relación calidad-precio.
        </p>

        <h3>Recomendados</h3>
        <ul>
          <li>
            <strong>Casa Tere (Comida Casera Costeña):</strong> Favorito de los locales. Cazuela de mariscos, sancocho de bocachico, arroz de coco con camarones. Ambiente sencillo pero delicioso. Precio: $25,000-40,000 COP.
          </li>
          <li>
            <strong>El Boliche Cebichería (Ceviches y Mariscos):</strong> Ceviche peruano-caribeño, tiraditos, causa limeña. Fresco y económico. Precio: $20,000-35,000 COP.
          </li>
          <li>
            <strong>Donde Chucho (Parrilla y Carnes):</strong> Asados argentinos con toque caribeño. Churrasco, costillas BBQ, arepas rellenas. Precio: $35,000-50,000 COP.
          </li>
        </ul>

        <h2>🌮 Comida Callejera y Económica ($)</h2>
        <p>
          La comida callejera de Barranquilla es una experiencia imperdible. Auténtica, deliciosa y económica.
        </p>

        <h3>Imperdibles</h3>
        <ul>
          <li>
            <strong>Arepas de Huevo:</strong> En cualquier esquina, especialmente en el Centro. La arepa se fríe, se abre, se le pone huevo y se vuelve a freír. $3,000-5,000 COP.
          </li>
          <li>
            <strong>Carimañolas:</strong> Bollo de yuca frito relleno de carne o queso. Encuentra las mejores en Soledad (municipio vecino). $2,500-4,000 COP.
          </li>
          <li>
            <strong>Raspao (Granizado):</strong> Hielo raspado con jarabe de frutas tropicales. Perfecto para el calor. $2,000-3,000 COP.
          </li>
          <li>
            <strong>Bollo Limpio con Queso Costeño:</strong> Desayuno típico. Bollo de maíz caliente con queso salado. En mercados y tiendas de barrio. $4,000-6,000 COP.
          </li>
        </ul>

        <h3>Puestos Recomendados</h3>
        <ul>
          <li><strong>Arepas Luisa:</strong> Frente al Estadio Metropolitano. Arepas de huevo legendarias.</li>
          <li><strong>Jugos La 72:</strong> Calle 72 con Carrera 46. Jugos naturales y empanadas.</li>
          <li><strong>Fritos Doña Rosa:</strong> Mercado de Barranquillita. Carimañolas, empanadas, buñuelos.</li>
        </ul>

        <h2>🍹 Zona Rosa - Vida Nocturna y Bares</h2>
        <p>
          La Zona Rosa (alrededor de la Calle 84 y 93) es el epicentro de bares, discotecas y restaurantes nocturnos.
        </p>

        <h3>Destacados</h3>
        <ul>
          <li>
            <strong>El Patio (Bar y Parrilla):</strong> Ambiente relajado, cerveza artesanal, hamburguesas gourmet. Precio: $30,000-50,000 COP.
          </li>
          <li>
            <strong>La Trattoria (Italiano):</strong> Pasta fresca, pizzas al horno de leña, vinos. Precio: $40,000-60,000 COP.
          </li>
          <li>
            <strong>Wok (Cocina Asiática):</strong> Sushi, pad thai, curry tailandés. Fusión asiática-caribeña. Precio: $35,000-55,000 COP.
          </li>
        </ul>

        <h2>🐟 Especialidades Imperdibles de Barranquilla</h2>

        <h3>1. Sancocho de Guandú</h3>
        <p>
          Sopa espesa con frijol guandú, cerdo, yuca, plátano, ñame y cilantro. Plato dominical tradicional. Mejor lugar: <strong>Nuestro Sazón</strong> o <strong>Casa Tere</strong>.
        </p>

        <h3>2. Arroz de Lisa</h3>
        <p>
          Arroz cocinado con pescado lisa (mugil), coco y especias. Típico de Puerto Colombia. Mejor lugar: <strong>La Bonga del Sinú</strong> o <strong>Varadero</strong>.
        </p>

        <h3>3. Cazuela de Mariscos</h3>
        <p>
          Mezcla cremosa de camarones, calamares, pulpo, almeja y langosta en salsa de coco. Mejor lugar: <strong>Varadero</strong> o <strong>Casa Tere</strong>.
        </p>

        <h3>4. Posta Negra Cartagenera</h3>
        <p>
          Carne de res en salsa dulce oscura (panela, especias). No es exclusiva de Barranquilla pero la encontrarás en muchos restaurantes tradicionales.
        </p>

        <h2>☕ Desayunos Típicos</h2>
        <ul>
          <li><strong>Bollo con queso costeño:</strong> El desayuno más tradicional ($4,000-6,000 COP)</li>
          <li><strong>Arepa con huevo y café:</strong> Desayuno express ($5,000-8,000 COP)</li>
          <li><strong>Carimañola con suero costeño:</strong> Versión salada del desayuno ($6,000-9,000 COP)</li>
          <li><strong>Sancocho de costilla:</strong> Para domingos especiales ($15,000-25,000 COP)</li>
        </ul>

        <h2>🍰 Postres y Dulces</h2>
        <ul>
          <li><strong>Enyucado:</strong> Postre de yuca rallada con coco y panela. Dulce y jugoso.</li>
          <li><strong>Cocadas:</strong> Dulce de coco en forma de bolitas. Vendidas en calles y mercados.</li>
          <li><strong>Raspao:</strong> Granizado con jarabe de frutas tropicales (tamarindo, corozo, guanábana).</li>
          <li><strong>Alegría:</strong> Dulce de semillas de ajonjolí con panela. Crujiente y dulce.</li>
        </ul>

        <h2>💡 Consejos Prácticos</h2>

        <h3>Horarios</h3>
        <ul>
          <li><strong>Desayuno:</strong> 6:00 AM - 10:00 AM</li>
          <li><strong>Almuerzo:</strong> 12:00 PM - 3:00 PM (hora pico: 1:00 PM)</li>
          <li><strong>Cena:</strong> 7:00 PM - 11:00 PM</li>
        </ul>

        <h3>Presupuesto Diario</h3>
        <ul>
          <li><strong>Económico:</strong> $20,000-35,000 COP (comida callejera + restaurantes sencillos)</li>
          <li><strong>Medio:</strong> $50,000-80,000 COP (restaurantes casuales)</li>
          <li><strong>Alto:</strong> $100,000-150,000 COP (alta cocina)</li>
        </ul>

        <h3>Propinas</h3>
        <p>
          La propina estándar es <strong>10%</strong> del total de la cuenta. En restaurantes de alta cocina puede ser del 15%.
        </p>

        <h3>Seguridad Alimentaria</h3>
        <ul>
          <li>Come en lugares concurridos (señal de frescura)</li>
          <li>Evita mariscos en puestos callejeros si tienes estómago sensible</li>
          <li>Bebe agua embotellada</li>
          <li>Los restaurantes formales cumplen estrictas normas de higiene</li>
        </ul>

        <hr />

        <h2>Conclusión</h2>
        <p>
          Barranquilla es un <strong>paraíso gastronómico</strong> donde conviven la tradición caribeña y la innovación culinaria. Desde las arepas de huevo de $3,000 hasta los restaurantes gourmet de $120,000, hay opciones para todos los gustos y presupuestos.
        </p>
        <p>
          Lo más importante: <strong>atrévete a probar</strong>. La mejor comida a veces está en el puesto callejero que menos esperas.
        </p>

        <div class="bg-green-50 border-l-4 border-green-500 p-6 my-8 rounded-r-lg">
          <h3 class="text-xl font-bold text-gray-900 mb-2">Descubre la Ruta 23</h3>
          <p class="text-gray-700 mb-4">
            Explora la gastronomía de los 23 municipios del Atlántico con festivales, platos típicos y artesanías tradicionales.
          </p>
          <a href="/ruta23" class="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors">
            Ver Ruta Gastronómica →
          </a>
        </div>
      </article>
    `,
  },
];

// Helper para obtener un post por slug
export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

// Helper para obtener posts por categoría
export function getPostsByCategory(category: string): BlogPost[] {
  return blogPosts.filter((post) => post.category === category);
}

// Helper para obtener todas las categorías
export function getAllCategories(): string[] {
  return [...new Set(blogPosts.map((post) => post.category))];
}
