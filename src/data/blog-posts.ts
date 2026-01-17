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
  {
    slug: "guia-hospedaje-barranquilla-carnaval",
    title: "Dónde Hospedarse en Barranquilla para el Carnaval: Guía por Zonas",
    description:
      "Encuentra el hospedaje perfecto para el Carnaval de Barranquilla. Comparamos hoteles, Airbnb y hostales por zonas, con precios reales y consejos de reserva.",
    image: "/images/blog/hospedaje-carnaval.jpg",
    category: "Consejos de Viaje",
    author: "VisitAtlántico",
    date: "2026-01-12",
    readTime: "7 min",
    keywords: [
      "hospedaje carnaval barranquilla",
      "hoteles carnaval barranquilla",
      "donde quedarse carnaval",
      "airbnb carnaval barranquilla",
    ],
    content: `
      <article class="prose prose-lg max-w-none">
        <p class="lead">
          Conseguir hospedaje durante el Carnaval de Barranquilla puede ser un reto si no planeas con anticipación. Los hoteles se llenan rápido y los precios se triplican. Esta guía te ayudará a encontrar el mejor lugar para quedarte según tu presupuesto y necesidades.
        </p>

        <div class="bg-yellow-50 border-l-4 border-yellow-500 p-6 my-8 rounded-r-lg">
          <h3 class="text-lg font-bold text-gray-900 mb-2">⏰ Consejo Clave</h3>
          <p class="text-gray-700 mb-0">
            Reserva con <strong>4-6 meses de anticipación</strong>. Para el Carnaval 2026 (14-17 febrero), lo ideal es reservar antes de octubre 2025. Después de diciembre, las opciones se reducen drásticamente.
          </p>
        </div>

        <h2>🏙️ Zona Norte (Cerca de los Desfiles) - Opción Premium</h2>
        <p>
          Esta es la zona más conveniente para el Carnaval porque estás a 5-15 minutos caminando de la Vía 40, donde pasan los desfiles principales.
        </p>

        <h3>Hoteles Recomendados</h3>
        <ul>
          <li>
            <strong>Hilton Garden Inn Barranquilla</strong> (Calle 74 con Carrera 59)
            <br/>Precio Carnaval: $400,000-550,000 COP/noche (normalmente $150,000)
            <br/>✅ A 10 minutos de la Vía 40
            <br/>✅ Desayuno incluido, piscina, gimnasio
            <br/>✅ Shuttle al Carnaval (algunos años)
          </li>
          <li>
            <strong>GHL Hotel Barranquilla</strong> (Carrera 51B con Calle 79)
            <br/>Precio Carnaval: $450,000-600,000 COP/noche
            <br/>✅ Vista a la ciudad desde piso alto
            <br/>✅ Restaurante en el hotel (importante - muchos lugares cierran durante Carnaval)
          </li>
          <li>
            <strong>Sonesta Hotel Barranquilla</strong> (Calle 106 con Carrera 50)
            <br/>Precio Carnaval: $380,000-500,000 COP/noche
            <br/>✅ Más alejado pero con mejor precio
            <br/>⚠️ Necesitarás taxi al Carnaval ($15,000-20,000 COP)
          </li>
        </ul>

        <h2>🏘️ El Poblado / Alto Prado - Opción Intermedia</h2>
        <p>
          Barrios residenciales seguros y tranquilos. Perfectos si quieres descansar bien después del Carnaval pero no te importa tomar taxi.
        </p>

        <h3>Opciones Airbnb</h3>
        <ul>
          <li>
            <strong>Apartamentos completos:</strong> $250,000-400,000 COP/noche
            <br/>✅ Cocina (puedes preparar desayuno y ahorrar)
            <br/>✅ Más espacio para grupos (2-4 personas)
            <br/>⚠️ Verifica reseñas - algunos propietarios cancelan último momento
          </li>
          <li>
            <strong>Habitaciones privadas:</strong> $120,000-200,000 COP/noche
            <br/>✅ Más económico
            <br/>✅ Anfitriones locales con tips del Carnaval
          </li>
        </ul>

        <h3>Tip de Local</h3>
        <p>
          Los apartamentos en Alto Prado (alrededor de la Calle 84-93) son ideales. Está cerca de restaurantes y supermercados, y puedes llegar al Carnaval en taxi por $20,000-25,000 COP.
        </p>

        <h2>💰 Buenavista - Opción Económica</h2>
        <p>
          Zona moderna en desarrollo con opciones más económicas. Segura y con buenos restaurantes.
        </p>

        <h3>Hostales y Hoteles Económicos</h3>
        <ul>
          <li>
            <strong>Hostal Casa Amarilla</strong> (ficción - ejemplo)
            <br/>Precio: $80,000-120,000 COP/noche habitación privada
            <br/>Dormitorio compartido: $35,000-50,000 COP/noche
            <br/>✅ Ambiente joven e internacional
            <br/>✅ Tours organizados al Carnaval
          </li>
          <li>
            <strong>Hotel Girasol Plaza</strong> (Buenavista)
            <br/>Precio: $150,000-220,000 COP/noche
            <br/>✅ Limpio y funcional
            <br/>⚠️ Sin desayuno incluido
          </li>
        </ul>

        <h2>🚫 Zonas a Evitar</h2>
        <p>Aunque Barranquilla es generalmente segura durante el Carnaval (mucha policía), evita hospedarte en:</p>
        <ul>
          <li><strong>Centro histórico:</strong> Muy ruidoso 24/7 durante Carnaval. Imposible dormir.</li>
          <li><strong>Sur de Barranquilla:</strong> Muy alejado. Taxis escasean y son caros.</li>
          <li><strong>Soledad:</strong> Aunque es municipio vecino, el tráfico de regreso a Barranquilla es terrible.</li>
        </ul>

        <h2>📋 Checklist Antes de Reservar</h2>
        <ul>
          <li>✅ Política de cancelación (flexible preferiblemente)</li>
          <li>✅ Aire acondicionado (hace MUCHO calor - 30-35°C)</li>
          <li>✅ Agua caliente (para ducharse después del Carnaval)</li>
          <li>✅ WiFi (para coordinar con grupo)</li>
          <li>✅ Caja fuerte (para guardar objetos de valor)</li>
          <li>✅ Distancia a la Vía 40 (donde pasan desfiles)</li>
          <li>✅ Restaurantes cercanos (muchos cierran durante Carnaval)</li>
        </ul>

        <h2>💡 Consejos de Alguien Que Ha Ido 10 Veces</h2>

        <h3>1. Reserva Ahora o Llora Después</h3>
        <p>
          En serio. En diciembre, la mayoría de hoteles ya tienen 70% de ocupación. En enero, solo quedan opciones malas o carísimas.
        </p>

        <h3>2. Considera Hospedaje por Noches</h3>
        <p>
          El Carnaval es solo de viernes a martes, pero muchos hoteles exigen mínimo 4-5 noches. Si tu presupuesto es ajustado:
        </p>
        <ul>
          <li><strong>Opción A:</strong> Llega jueves, quédate hasta miércoles (5 noches)</li>
          <li><strong>Opción B:</strong> Llega viernes, sal martes (4 noches mínimo)</li>
        </ul>

        <h3>3. Airbnb vs Hotel</h3>
        <p><strong>Airbnb es mejor si:</strong></p>
        <ul>
          <li>Viajas en grupo (2-6 personas)</li>
          <li>Quieres cocinar para ahorrar</li>
          <li>No necesitas servicio diario</li>
        </ul>
        <p><strong>Hotel es mejor si:</strong></p>
        <ul>
          <li>Viajas solo o en pareja</li>
          <li>Quieres desayuno incluido</li>
          <li>Prefieres seguridad 24/7</li>
        </ul>

        <h3>4. El Secreto Local: Barrios Residenciales</h3>
        <p>
          Muchos barranquilleros rentan sus casas durante Carnaval y se van a la playa. Busca en Facebook "Arriendo casa Carnaval Barranquilla" - encontrarás ofertas directas de propietarios sin comisión de Airbnb.
        </p>

        <h2>🔑 Precios Reales (Estimados Carnaval 2026)</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full border border-gray-300">
            <thead class="bg-gray-100">
              <tr>
                <th class="border border-gray-300 px-4 py-2">Tipo</th>
                <th class="border border-gray-300 px-4 py-2">Precio Normal</th>
                <th class="border border-gray-300 px-4 py-2">Precio Carnaval</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border border-gray-300 px-4 py-2">Hotel 5 estrellas</td>
                <td class="border border-gray-300 px-4 py-2">$200,000 COP</td>
                <td class="border border-gray-300 px-4 py-2">$500,000-700,000 COP</td>
              </tr>
              <tr>
                <td class="border border-gray-300 px-4 py-2">Hotel 4 estrellas</td>
                <td class="border border-gray-300 px-4 py-2">$150,000 COP</td>
                <td class="border border-gray-300 px-4 py-2">$350,000-500,000 COP</td>
              </tr>
              <tr>
                <td class="border border-gray-300 px-4 py-2">Airbnb apartamento</td>
                <td class="border border-gray-300 px-4 py-2">$120,000 COP</td>
                <td class="border border-gray-300 px-4 py-2">$250,000-400,000 COP</td>
              </tr>
              <tr>
                <td class="border border-gray-300 px-4 py-2">Hostal privado</td>
                <td class="border border-gray-300 px-4 py-2">$50,000 COP</td>
                <td class="border border-gray-300 px-4 py-2">$100,000-150,000 COP</td>
              </tr>
              <tr>
                <td class="border border-gray-300 px-4 py-2">Hostal compartido</td>
                <td class="border border-gray-300 px-4 py-2">$25,000 COP</td>
                <td class="border border-gray-300 px-4 py-2">$40,000-60,000 COP</td>
              </tr>
            </tbody>
          </table>
        </div>

        <hr />

        <h2>Conclusión</h2>
        <p>
          El hospedaje para Carnaval es caro, pero planificando con tiempo puedes encontrar buenas opciones. Mi recomendación personal: <strong>Airbnb en Alto Prado</strong> si viajas en grupo, o <strong>GHL Hotel</strong> si quieres comodidad sin complicaciones.
        </p>

        <p>
          Y recuerda: lo importante no es dónde duermes, sino vivir el Carnaval al máximo. ¡Quien lo vive es quien lo goza!
        </p>

        <div class="bg-orange-50 border-l-4 border-orange-500 p-6 my-8 rounded-r-lg">
          <h3 class="text-xl font-bold text-gray-900 mb-2">¿Primera vez en el Carnaval?</h3>
          <p class="text-gray-700 mb-4">
            Lee nuestra guía completa con todo lo que necesitas saber: fechas, eventos, qué llevar y consejos de seguridad.
          </p>
          <a href="/carnaval" class="inline-flex items-center px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors">
            Ver Guía del Carnaval 2026 →
          </a>
        </div>
      </article>
    `,
  },
  {
    slug: "puerto-velero-guia-kitesurf",
    title: "Puerto Velero: El Paraíso del Kitesurf en el Caribe Colombiano",
    description:
      "Guía completa para hacer kitesurf en Puerto Velero. Mejor época, escuelas, precios, dónde hospedarse y qué esperar de este spot caribeño.",
    image: "/images/blog/puerto-velero-kitesurf.jpg",
    category: "Deportes y Aventura",
    author: "VisitAtlántico",
    date: "2026-01-08",
    readTime: "6 min",
    keywords: [
      "puerto velero kitesurf",
      "kitesurf colombia",
      "escuelas kitesurf barranquilla",
      "mejor epoca kitesurf puerto velero",
    ],
    content: `
      <article class="prose prose-lg max-w-none">
        <p class="lead">
          Puerto Velero se ha convertido en uno de los mejores spots de kitesurf del Caribe colombiano. Vientos constantes, aguas tibias y una comunidad creciente de riders hacen de este lugar un destino imperdible para kitesurfistas de todos los niveles.
        </p>

        <h2>🪁 ¿Por Qué Puerto Velero Es Ideal para Kitesurf?</h2>
        <p>Puerto Velero tiene condiciones casi perfectas:</p>
        <ul>
          <li><strong>Vientos constantes:</strong> 15-25 nudos, especialmente de diciembre a abril</li>
          <li><strong>Spot de aguas planas:</strong> Ideal para principiantes y freestyle</li>
          <li><strong>Temperatura del agua:</strong> 27-29°C todo el año (no necesitas wetsuit)</li>
          <li><strong>Poca gente:</strong> El spot no está saturado como otros en Brasil o Cabarete</li>
          <li><strong>Fácil acceso:</strong> A solo 40 minutos de Barranquilla</li>
        </ul>

        <h2>📅 Mejor Época para Hacer Kitesurf</h2>

        <h3>Temporada Alta (Diciembre - Abril)</h3>
        <p>
          Esta es la <strong>mejor época</strong> para kitesurf en Puerto Velero:
        </p>
        <ul>
          <li>✅ Vientos consistentes 18-25 nudos</li>
          <li>✅ Clima seco y soleado</li>
          <li>✅ Kite: 9-12m dependiendo del día</li>
          <li>⚠️ Más gente en el spot (pero aún manejable)</li>
          <li>⚠️ Precios más altos en hospedaje</li>
        </ul>

        <h3>Temporada Media (Mayo - Junio / Noviembre)</h3>
        <ul>
          <li>✅ Vientos variables 12-20 nudos</li>
          <li>✅ Menos gente, spot casi vacío</li>
          <li>✅ Precios de hospedaje más bajos</li>
          <li>⚠️ Lluvias ocasionales (aguaceros cortos)</li>
        </ul>

        <h3>Temporada Baja (Julio - Octubre)</h3>
        <ul>
          <li>⚠️ Vientos débiles e inconsistentes (8-15 nudos)</li>
          <li>⚠️ Época de lluvias</li>
          <li>✅ Perfecto para aprender (vientos suaves)</li>
        </ul>

        <h2>🏫 Escuelas de Kitesurf Recomendadas</h2>

        <h3>1. Kite Colombia (La más establecida)</h3>
        <ul>
          <li><strong>Ubicación:</strong> Playa de Puerto Velero</li>
          <li><strong>Precios:</strong>
            <ul>
              <li>Curso completo (10-12 horas): $1,200,000-1,500,000 COP</li>
              <li>Clase de 2 horas: $250,000 COP</li>
              <li>Rental equipo: $150,000 COP/día</li>
            </ul>
          </li>
          <li><strong>Incluye:</strong> Equipos IKO, instructores certificados, seguro</li>
          <li><strong>Idiomas:</strong> Español, inglés</li>
        </ul>

        <h3>2. Velero Kite School</h3>
        <ul>
          <li><strong>Opción local más económica</strong></li>
          <li>Curso completo: $950,000-1,200,000 COP</li>
          <li>Instructores locales experimentados</li>
          <li>Grupos pequeños (máximo 3 estudiantes por instructor)</li>
        </ul>

        <h3>3. Clases Privadas con Locales</h3>
        <p>
          En la playa encontrarás instructores independientes que ofrecen clases por $150,000-200,000 COP/hora. Pregunta por referencias antes de contratar.
        </p>

        <h2>🏠 Dónde Hospedarse</h2>

        <h3>En Puerto Velero (Opción Conveniente)</h3>
        <ul>
          <li>
            <strong>Villas frente al mar:</strong> $250,000-400,000 COP/noche
            <br/>✅ Caminas al spot en 2 minutos
            <br/>✅ Cocina equipada (puedes cocinar)
            <br/>⚠️ Limitadas opciones de restaurantes
          </li>
          <li>
            <strong>Airbnb apartamentos:</strong> $150,000-280,000 COP/noche
            <br/>✅ Más económico para grupos
          </li>
        </ul>

        <h3>En Barranquilla (Opción con Más Servicios)</h3>
        <ul>
          <li>Hospédarte en Barranquilla y manejar 40 min al spot cada día</li>
          <li>✅ Más opciones de restaurantes y vida nocturna</li>
          <li>✅ Precios más competitivos</li>
          <li>⚠️ Necesitas auto o taxi diario ($50,000-70,000 COP ida y vuelta)</li>
        </ul>

        <h2>💰 Presupuesto Estimado (3 Días de Kitesurf)</h2>

        <h3>Opción Económica (~$800,000 COP total)</h3>
        <ul>
          <li>Hospedaje Airbnb Puerto Velero: $150,000 x 3 = $450,000</li>
          <li>Clases (6 horas): $600,000</li>
          <li>Comidas (cocinas tú): $100,000</li>
          <li>Transporte desde Barranquilla: $80,000</li>
        </ul>

        <h3>Opción Media (~$1,500,000 COP total)</h3>
        <ul>
          <li>Hospedaje villa frente al mar: $300,000 x 3 = $900,000</li>
          <li>Curso completo (10 horas): $1,200,000</li>
          <li>Comidas en restaurantes: $200,000</li>
          <li>Transporte: $80,000</li>
        </ul>

        <h2>🍽️ Dónde Comer</h2>
        <p>
          Puerto Velero es pequeño, con opciones limitadas pero buenas:
        </p>
        <ul>
          <li><strong>Restaurante La Vela:</strong> Frente al mar. Pescado frito, arroz de coco. $35,000-50,000 COP/plato</li>
          <li><strong>Kioscos en la playa:</strong> Comida rápida, empanadas, jugos. $15,000-25,000 COP</li>
          <li><strong>Supermercado pequeño:</strong> Para comprar y cocinar en tu apartamento</li>
        </ul>

        <p><strong>Tip:</strong> Muchos kiters compran comida en Barranquilla y la llevan. Hay un Éxito (supermercado) camino a Puerto Velero.</p>

        <h2>📝 Qué Llevar</h2>
        <ul>
          <li>🧴 <strong>Protector solar FPS 50+:</strong> El sol caribeño no perdona</li>
          <li>🕶️ <strong>Lentes de sol con correa:</strong> Para no perderlos en el agua</li>
          <li>🧢 <strong>Gorra/sombrero:</strong> Para cuando no estés en el agua</li>
          <li>👙 <strong>Traje de baño lycra/rashguard:</strong> Protege del roce del arnés</li>
          <li>🩴 <strong>Sandalias acuáticas:</strong> La playa tiene algunas piedras</li>
          <li>💊 <strong>Botiquín básico:</strong> Curitas para ampollas, analgésicos</li>
          <li>💧 <strong>Botella de agua reutilizable:</strong> Hidrátate constantemente</li>
          <li>📱 <strong>Bolsa impermeable:</strong> Para celular y documentos</li>
        </ul>

        <h2>⚠️ Consejos de Seguridad</h2>
        <ul>
          <li>✅ Siempre kitesurf con alguien más en el agua (buddy system)</li>
          <li>✅ Revisa el pronóstico de viento antes de salir</li>
          <li>✅ Si eres principiante, NO salgas con vientos > 20 nudos</li>
          <li>✅ Usa leash de seguridad</li>
          <li>✅ Conoce las señales de mano universales de kitesurf</li>
          <li>⚠️ Cuidado con las corrientes cerca de las rocas (norte del spot)</li>
        </ul>

        <h2>🌊 Condiciones del Spot</h2>

        <h3>Tipo de Spot</h3>
        <ul>
          <li><strong>Flat water:</strong> Aguas planas, perfecto para principiantes y freestyle</li>
          <li><strong>Fondo arenoso:</strong> Seguro para principiantes</li>
          <li><strong>Profundidad:</strong> Puedes caminar hasta 50m mar adentro</li>
        </ul>

        <h3>Dirección del Viento</h3>
        <ul>
          <li>Viento predominante: <strong>Noreste</strong> (diciembre-abril)</li>
          <li>Tipo: <strong>Side-shore</strong> (ideal para kitesurf)</li>
          <li>Rachas: Moderadas, no muy gusty</li>
        </ul>

        <hr />

        <h2>Conclusión</h2>
        <p>
          Puerto Velero es un spot increíble que todavía no está masificado. Si estás pensando en aprender kitesurf o mejorar tu técnica, este es el lugar. Los vientos son consistentes, el agua está caliente y la comunidad de kiters es súper amigable.
        </p>

        <p>
          <strong>Mi recomendación personal:</strong> Ve entre febrero y marzo, cuando los vientos están en su punto máximo y el clima es perfecto.
        </p>

        <div class="bg-blue-50 border-l-4 border-blue-500 p-6 my-8 rounded-r-lg">
          <h3 class="text-xl font-bold text-gray-900 mb-2">Descubre Más Playas del Atlántico</h3>
          <p class="text-gray-700 mb-4">
            Puerto Velero es solo una de las increíbles playas del Atlántico. Explora Salinas del Rey (Blue Flag) y Playa Mendoza.
          </p>
          <a href="/playas" class="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            Ver Guía de Playas →
          </a>
        </div>
      </article>
    `,
  },
  {
    slug: "fin-de-semana-barranquilla-itinerario",
    title: "Itinerario Perfecto: Fin de Semana en Barranquilla (Viernes a Domingo)",
    description:
      "Plan completo para aprovechar al máximo un fin de semana en Barranquilla. Qué hacer, dónde comer, vida nocturna y excursiones a playas cercanas.",
    image: "/images/blog/fin-de-semana-barranquilla.jpg",
    category: "Guías de Viaje",
    author: "VisitAtlántico",
    date: "2026-01-05",
    readTime: "8 min",
    keywords: [
      "fin de semana barranquilla",
      "que hacer barranquilla 3 dias",
      "itinerario barranquilla",
      "plan fin de semana barranquilla",
    ],
    content: `
      <article class="prose prose-lg max-w-none">
        <p class="lead">
          ¿Tienes un fin de semana libre y quieres conocer Barranquilla? Este itinerario te ayudará a aprovechar al máximo 3 días en la ciudad, combinando cultura, gastronomía, playa y vida nocturna. Basado en experiencias reales de locales y viajeros.
        </p>

        <h2>🗓️ Viernes: Llegada y Primera Impresión</h2>

        <h3>Tarde (3:00 PM - 7:00 PM)</h3>
        <p><strong>Llegada y Check-in</strong></p>
        <ul>
          <li>Llega al aeropuerto Ernesto Cortissoz</li>
          <li>Taxi al hotel: $35,000-50,000 COP (30-40 minutos dependiendo de la zona)</li>
          <li>Check-in en tu hotel (recomendado: zona Norte o Alto Prado)</li>
        </ul>

        <p><strong>4:30 PM - Paseo por el Malecón</strong></p>
        <p>
          Date una vuelta por el <strong>Malecón del Río</strong>. No es el malecón más bonito del mundo, pero es icónico y perfecto para tu primera tarde. Camina, toma fotos con el letrero "Barranquilla" y siente la brisa del río Magdalena.
        </p>
        <ul>
          <li>📍 Ubicación: Carrera 38 con Calle 34 (frente al Centro Comercial Washington)</li>
          <li>⏰ Mejor hora: 5:00-6:30 PM (atardecer)</li>
          <li>🎫 Gratis</li>
        </ul>

        <h3>Noche (7:00 PM - 11:00 PM)</h3>
        <p><strong>7:30 PM - Cena en La Trattoria (Zona Rosa)</strong></p>
        <p>
          Empieza el fin de semana con una buena cena italiana-caribeña en la Zona Rosa (Calle 84 con Carrera 53).
        </p>
        <ul>
          <li>Plato recomendado: Pasta al pesto con camarones ($45,000 COP)</li>
          <li>Ambiente: Casual elegante</li>
          <li>Reserva: No necesaria un viernes normal</li>
        </ul>

        <p><strong>9:00 PM - Drinks en la Zona Rosa</strong></p>
        <p>
          Después de cenar, camina por la Zona Rosa. Hay varios bares:
        </p>
        <ul>
          <li><strong>El Patio:</strong> Ambiente relajado, cerveza artesanal</li>
          <li><strong>Rooftop Bar del Hilton:</strong> Vista panorámica de la ciudad</li>
          <li><strong>Henry's Café:</strong> Más tranquilo, para conversar</li>
        </ul>

        <p><em>Tip: No trasnoches mucho. Mañana empieza temprano.</em></p>

        <hr />

        <h2>🗓️ Sábado: Día de Playa y Gastronomía</h2>

        <h3>Mañana (8:00 AM - 1:00 PM)</h3>
        <p><strong>8:30 AM - Desayuno Costeño</strong></p>
        <p>
          Desayuna como un barranquillero de verdad:
        </p>
        <ul>
          <li><strong>Bollo con queso costeño:</strong> En cualquier panadería ($6,000 COP)</li>
          <li><strong>Arepa de huevo:</strong> En puestos callejeros ($4,000 COP)</li>
          <li><strong>Jugo de corozo:</strong> Frutal y refrescante ($3,000 COP)</li>
        </ul>

        <p><strong>9:30 AM - Excursión a Salinas del Rey (Playa Blue Flag)</strong></p>
        <ul>
          <li>🚗 Uber/taxi: $40,000-50,000 COP (25 minutos)</li>
          <li>🏖️ Actividad: Playa, kitesurf, snorkel</li>
          <li>💵 Entrada: Gratis (playa pública)</li>
          <li>🍽️ Almuerzo en la playa: $35,000-50,000 COP</li>
        </ul>

        <p><strong>Qué hacer en Salinas:</strong></p>
        <ul>
          <li>Relajarte en la playa (lleva protector solar FPS 50+)</li>
          <li>Clase de kitesurf si tienes energía ($250,000 COP 2 horas)</li>
          <li>Comer pescado frito con patacones frente al mar</li>
          <li>Tomar muchas fotos - la bandera azul es icónica</li>
        </ul>

        <h3>Tarde (2:00 PM - 7:00 PM)</h3>
        <p><strong>2:30 PM - Regreso a Barranquilla</strong></p>
        <p>Uber de regreso al hotel. Ducha y descanso (1-2 horas).</p>

        <p><strong>5:00 PM - Tour por el Centro Histórico</strong></p>
        <p>
          El centro de Barranquilla no es tan turístico como Cartagena, pero tiene su encanto:
        </p>
        <ul>
          <li><strong>Catedral Metropolitana:</strong> Arquitectura neogótica impresionante</li>
          <li><strong>Paseo Bolívar:</strong> Camina por el bulevar peatonal</li>
          <li><strong>Museo del Caribe:</strong> Si tienes tiempo (cierra 6:00 PM, $15,000 COP)</li>
        </ul>

        <p><em>Consejo: El centro se vacía después de las 6 PM. No te quedes muy tarde.</em></p>

        <h3>Noche (7:00 PM - 2:00 AM)</h3>
        <p><strong>7:30 PM - Cena en Sozza (Cocina de Autor)</strong></p>
        <p>
          Si quieres experiencia gourmet, <strong>Sozza</strong> es el mejor restaurante de Barranquilla.
        </p>
        <ul>
          <li>Reserva: <strong>Obligatoria</strong> (llama con 2-3 días de anticipación)</li>
          <li>Precio: $120,000-180,000 COP por persona</li>
          <li>Plato estrella: Pargo rojo en salsa de maracuyá</li>
          <li>Ubicación: Calle 93 con Carrera 53</li>
        </ul>

        <p><strong>10:00 PM - Rumba en La Troja o Frogg Leggs</strong></p>
        <p>
          Barranquilla es la capital de la rumba costeña. No puedes irte sin bailar:
        </p>
        <ul>
          <li>
            <strong>La Troja:</strong> El lugar de salsa y vallenato. Más auténtico, menos turístico.
            <br/>Cover: $30,000-40,000 COP
            <br/>Código: Casual (jeans y camisa está bien)
          </li>
          <li>
            <strong>Frogg Leggs:</strong> Más reggaeton y música electrónica. Más joven.
            <br/>Cover: $40,000-60,000 COP
          </li>
        </ul>

        <p><em>Tip de seguridad: Uber para ir y volver. No camines de noche en zonas desconocidas.</em></p>

        <hr />

        <h2>🗓️ Domingo: Cultura y Despedida</h2>

        <h3>Mañana (9:00 AM - 1:00 PM)</h3>
        <p><strong>9:30 AM - Desayuno en Café del Parque</strong></p>
        <p>
          Desayuno tardío y relajado. Prueba el <strong>sancocho de costilla</strong> (típico desayuno dominical, $25,000 COP).
        </p>

        <p><strong>11:00 AM - Museo del Caribe (Si no fuiste el sábado)</strong></p>
        <ul>
          <li>📍 Calle 36 con Carrera 46</li>
          <li>⏰ Abierto domingos 9:00 AM - 5:00 PM</li>
          <li>🎫 Entrada: $15,000 COP</li>
          <li>⏱️ Tiempo: 2 horas</li>
        </ul>

        <p><strong>Qué ver:</strong></p>
        <ul>
          <li>Sala del Carnaval (con disfraces y máscaras reales)</li>
          <li>Historia de la música caribeña</li>
          <li>Exposiciones de Shakira y otros artistas barranquilleros</li>
        </ul>

        <h3>Tarde (1:00 PM - 5:00 PM)</h3>
        <p><strong>1:30 PM - Almuerzo en La Bonga del Sinú</strong></p>
        <p>
          Termina el fin de semana con gastronomía tradicional costeña:
        </p>
        <ul>
          <li>Mote de queso ($32,000 COP)</li>
          <li>Arroz de lisa ($45,000 COP)</li>
          <li>Sancocho trifásico ($38,000 COP)</li>
        </ul>

        <p><strong>3:00 PM - Compras de Último Minuto</strong></p>
        <p>
          Si quieres llevar recuerdos:
        </p>
        <ul>
          <li><strong>Artesanías:</strong> Mochilas wayúu, sombreros vueltiaos (CC Buenavista)</li>
          <li><strong>Dulces típicos:</strong> Cocadas, alegrías de coco (Aeropuerto o supermercados)</li>
          <li><strong>Café colombiano:</strong> Juan Valdez (cualquier mall)</li>
        </ul>

        <p><strong>4:30 PM - Check-out y traslado al aeropuerto</strong></p>
        <p>Taxi: $35,000-45,000 COP (30-40 minutos)</p>

        <hr />

        <h2>💰 Presupuesto Total Estimado</h2>

        <h3>Opción Económica (~$800,000 COP por persona)</h3>
        <ul>
          <li>Hospedaje hostal (2 noches): $200,000</li>
          <li>Comidas económicas: $250,000</li>
          <li>Transporte (taxis/Uber): $150,000</li>
          <li>Entradas/actividades: $50,000</li>
          <li>Vida nocturna: $150,000</li>
        </ul>

        <h3>Opción Media (~$1,500,000 COP por persona)</h3>
        <ul>
          <li>Hospedaje hotel 4 estrellas (2 noches): $600,000</li>
          <li>Comidas en restaurantes: $450,000</li>
          <li>Transporte: $200,000</li>
          <li>Entradas/actividades: $100,000</li>
          <li>Vida nocturna: $150,000</li>
        </ul>

        <h2>📝 Lista de Empaque</h2>
        <ul>
          <li>🩳 Ropa ligera (hace MUCHO calor - 30-35°C)</li>
          <li>👙 Traje de baño</li>
          <li>🕶️ Lentes de sol</li>
          <li>🧴 Protector solar FPS 50+</li>
          <li>🧢 Gorra/sombrero</li>
          <li>👟 Zapatos cómodos para caminar</li>
          <li>👠 Zapatos/outfit para salir de rumba (sábado noche)</li>
          <li>💊 Medicamentos básicos (analgésicos, antiácidos)</li>
          <li>💵 Efectivo (muchos lugares pequeños no aceptan tarjeta)</li>
        </ul>

        <hr />

        <h2>Conclusión</h2>
        <p>
          Un fin de semana en Barranquilla es perfecto para probar la cultura caribeña sin el turismo masivo de Cartagena. Combinas playa, gastronomía, rumba y cultura en solo 3 días.
        </p>

        <p>
          <strong>Mi consejo personal:</strong> No trates de hacer TODO. Barranquilla se disfruta con calma. Si algo no te da tiempo, ya tienes excusa para volver.
        </p>

        <div class="bg-green-50 border-l-4 border-green-500 p-6 my-8 rounded-r-lg">
          <h3 class="text-xl font-bold text-gray-900 mb-2">¿Vienes en Febrero?</h3>
          <p class="text-gray-700 mb-4">
            Si tu fin de semana cae durante el Carnaval (14-17 febrero 2026), este itinerario cambia completamente. Todo gira alrededor del Carnaval.
          </p>
          <a href="/carnaval" class="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors">
            Ver Guía del Carnaval →
          </a>
        </div>
      </article>
    `,
  },
  {
    slug: "usiacuri-artesanias-iraca",
    title: "Usiacurí: El Pueblo de las Artesanías en Iraca",
    description:
      "Descubre Usiacurí, el pueblo artesanal más bonito del Atlántico. Cómo llegar, qué comprar, precios y la historia detrás de los sombreros vueltiaos.",
    image: "/images/blog/usiacuri-artesanias.jpg",
    category: "Destinos",
    author: "VisitAtlántico",
    date: "2026-01-03",
    readTime: "5 min",
    keywords: [
      "usiacurí atlántico",
      "artesanías iraca colombia",
      "sombrero vueltiao usiacurí",
      "pueblos patrimonio atlántico",
    ],
    content: `
      <article class="prose prose-lg max-w-none">
        <p class="lead">
          Usiacurí es un pueblo pequeño a 35 km de Barranquilla que ha preservado por generaciones la tradición de tejer artesanías en iraca (palma de caña flecha). Si buscas autenticidad, artesanías hechas a mano y un día tranquilo fuera de la ciudad, este es el lugar perfecto.
        </p>

        <h2>📍 ¿Dónde Queda Usiacurí?</h2>
        <ul>
          <li><strong>Distancia desde Barranquilla:</strong> 35 km (40-50 minutos)</li>
          <li><strong>Población:</strong> ~9,000 habitantes</li>
          <li><strong>Altitud:</strong> 120 metros (clima cálido pero ventilado)</li>
        </ul>

        <h3>Cómo Llegar</h3>
        <ul>
          <li>
            <strong>En auto propio/rental:</strong> Toma la Vía al Mar, luego desvío hacia Usiacurí (bien señalizado)
          </li>
          <li>
            <strong>Bus público:</strong> Desde Terminal de Barranquilla, buses a Usiacurí cada hora ($5,000 COP, 1 hora)
          </li>
          <li>
            <strong>Tour organizado:</strong> Algunas agencias ofrecen tours de día ($80,000-120,000 COP incluye transporte y guía)
          </li>
        </ul>

        <h2>🎨 ¿Qué Es la Iraca?</h2>
        <p>
          La <strong>iraca</strong> (también llamada caña flecha) es una palma que crece en la región. Los artesanos secan las hojas, las tiñen con tintes naturales y las tejen para crear:
        </p>
        <ul>
          <li>Sombreros vueltiaos (el símbolo de Colombia)</li>
          <li>Bolsos y carteras</li>
          <li>Esteras (tapetes)</li>
          <li>Abanicos</li>
          <li>Figuras decorativas</li>
        </ul>

        <p>
          El proceso es 100% manual y puede tomar <strong>días o semanas</strong> dependiendo de la complejidad de la pieza.
        </p>

        <h2>🛍️ Qué Comprar (y Precios Reales)</h2>

        <h3>Sombreros Vueltiaos</h3>
        <p>El producto estrella. El precio depende del número de "vueltas" (líneas en el tejido):</p>
        <ul>
          <li><strong>12 vueltas (básico):</strong> $80,000-120,000 COP</li>
          <li><strong>19 vueltas (calidad media):</strong> $150,000-250,000 COP</li>
          <li><strong>21 vueltas (alta calidad):</strong> $300,000-500,000 COP</li>
          <li><strong>23-27 vueltas (premium):</strong> $600,000-1,200,000 COP</li>
        </ul>

        <p><em>Tip: Entre más vueltas, más fino el tejido y más tiempo de elaboración. Los de 21+ vueltas son obras de arte.</em></p>

        <h3>Bolsos y Carteras</h3>
        <ul>
          <li>Bolsos pequeños: $40,000-80,000 COP</li>
          <li>Bolsos medianos: $90,000-150,000 COP</li>
          <li>Bolsos grandes (tipo tote): $180,000-280,000 COP</li>
        </ul>

        <h3>Abanicos y Decoración</h3>
        <ul>
          <li>Abanicos: $15,000-30,000 COP</li>
          <li>Esteras pequeñas: $50,000-100,000 COP</li>
          <li>Figuras decorativas: $20,000-60,000 COP</li>
        </ul>

        <h2>🏛️ Qué Hacer en Usiacurí</h2>

        <h3>1. Visita la Casa de la Cultura</h3>
        <ul>
          <li>📍 Plaza principal del pueblo</li>
          <li>🎫 Entrada gratis</li>
          <li>⏰ Lunes a domingo 9:00 AM - 5:00 PM</li>
        </ul>
        <p>
          Aquí encuentras:
        </p>
        <ul>
          <li>Exposición de artesanías históricas</li>
          <li>Demostración de cómo tejen (¡puedes intentarlo!)</li>
          <li>Venta directa de artesanos locales (mejores precios)</li>
        </ul>

        <h3>2. Recorre el Pueblo a Pie</h3>
        <p>
          Usiacurí es PEQUEÑO. Puedes caminarlo completo en 30 minutos:
        </p>
        <ul>
          <li>Iglesia de San Judas Tadeo (arquitectura colonial)</li>
          <li>Plaza principal con árboles centenarios</li>
          <li>Calles empedradas con casas coloridas</li>
          <li>Talleres artesanales (muchos artesanos trabajan desde sus casas - toca la puerta y pregunta)</li>
        </ul>

        <h3>3. Visita un Taller Artesanal</h3>
        <p>
          Algunos artesanos abren sus talleres al público. Pregunta en la Casa de la Cultura por:
        </p>
        <ul>
          <li><strong>Don José (ejemplo):</strong> Hace sombreros vueltiaos desde hace 40 años</li>
          <li><strong>Doña María (ejemplo):</strong> Especialista en bolsos</li>
        </ul>

        <p><em>Tip: Si compras directo al artesano, negocia con respeto. Recuerda que es trabajo manual de semanas.</em></p>

        <h3>4. Almuerza Comida Típica</h3>
        <p>
          En la plaza hay 2-3 restaurantes familiares que sirven:
        </p>
        <ul>
          <li>Sancocho de guandú ($18,000 COP)</li>
          <li>Arroz de lisa ($22,000 COP)</li>
          <li>Bollo con queso ($5,000 COP)</li>
        </ul>

        <p>Ambiente: Super casero, como comer en casa de tu abuela.</p>

        <h2>📅 Mejor Época para Visitar</h2>

        <h3>Festival de la Iraca (Julio)</h3>
        <p>
          El pueblo celebra el <strong>Festival de la Iraca</strong> cada julio:
        </p>
        <ul>
          <li>Concursos de tejido</li>
          <li>Venta de artesanías con descuentos</li>
          <li>Música vallenata en vivo</li>
          <li>Comida típica</li>
        </ul>

        <h3>Visitas Regulares</h3>
        <p>
          Cualquier día está bien, pero <strong>sábados y domingos</strong> hay más movimiento:
        </p>
        <ul>
          <li>Más artesanos abiertos</li>
          <li>Mercado en la plaza</li>
          <li>Más turismo local (ambiente más animado)</li>
        </ul>

        <h2>💡 Consejos Prácticos</h2>

        <h3>1. Lleva Efectivo</h3>
        <p>
          Usiacurí es un pueblo pequeño. <strong>NO hay cajeros</strong>. Los artesanos NO aceptan tarjeta. Lleva efectivo suficiente.
        </p>

        <h3>2. Negocia con Respeto</h3>
        <p>
          Sí puedes regatear, pero con respeto. Estos son artesanos, no grandes comerciantes. Un descuento de 10-15% es razonable si compras varias piezas.
        </p>

        <h3>3. Verifica la Autenticidad</h3>
        <p>
          Artesanía REAL en iraca vs imitaciones plásticas:
        </p>
        <ul>
          <li>✅ Iraca: Huele a natural, se siente áspera al tacto</li>
          <li>❌ Plástico: Sin olor, superficie lisa y brillante</li>
        </ul>

        <h3>4. Qué Llevar</h3>
        <ul>
          <li>🧴 Protector solar (hace calor)</li>
          <li>🧢 Gorra (o compra un vueltiao allá 😄)</li>
          <li>💧 Agua embotellada</li>
          <li>📱 Batería externa (para fotos)</li>
          <li>💵 Efectivo (repito: NO hay cajeros)</li>
        </ul>

        <h2>🕐 Itinerario Recomendado (Día Completo)</h2>

        <p><strong>9:00 AM:</strong> Salida desde Barranquilla</p>
        <p><strong>10:00 AM:</strong> Llegada a Usiacurí, visita Casa de la Cultura</p>
        <p><strong>11:00 AM:</strong> Recorrido por talleres artesanales</p>
        <p><strong>12:30 PM:</strong> Almuerzo en restaurante local</p>
        <p><strong>2:00 PM:</strong> Compra de artesanías</p>
        <p><strong>3:30 PM:</strong> Fotos en plaza principal</p>
        <p><strong>4:00 PM:</strong> Regreso a Barranquilla</p>

        <h2>💰 Presupuesto Estimado</h2>

        <h3>Por Persona (Solo Visita)</h3>
        <ul>
          <li>Transporte (ida y vuelta): $10,000 COP bus público o $60,000 taxi compartido</li>
          <li>Almuerzo: $20,000 COP</li>
          <li>Artesanías: $100,000-300,000 COP (depende de qué compres)</li>
          <li><strong>Total: $130,000-380,000 COP</strong></li>
        </ul>

        <hr />

        <h2>Conclusión</h2>
        <p>
          Usiacurí es un escape perfecto de Barranquilla. En medio día conoces el pueblo completo, compras artesanías auténticas y apoyas a los artesanos locales.
        </p>

        <p>
          <strong>Mi recomendación:</strong> Combina la visita con un almuerzo en el pueblo. La comida es casera, deliciosa y económica.
        </p>

        <div class="bg-purple-50 border-l-4 border-purple-500 p-6 my-8 rounded-r-lg">
          <h3 class="text-xl font-bold text-gray-900 mb-2">Descubre Más Municipios del Atlántico</h3>
          <p class="text-gray-700 mb-4">
            Usiacurí es uno de los 23 municipios del Atlántico. Explora Tubará, Galapa, Repelón y más destinos auténticos.
          </p>
          <a href="/destinations" class="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors">
            Ver Todos los Destinos →
          </a>
        </div>
      </article>
    `,
  },
  {
    slug: "transporte-barranquilla-guia-completa",
    title: "Cómo Moverse en Barranquilla: Guía de Transporte para Turistas",
    description:
      "Guía práctica de transporte en Barranquilla: Uber, taxis, Transmetro, apps y consejos de seguridad. Precios reales y rutas útiles actualizadas 2026.",
    image: "/images/blog/transporte-barranquilla.jpg",
    category: "Consejos de Viaje",
    author: "VisitAtlántico",
    date: "2026-01-01",
    readTime: "6 min",
    keywords: [
      "transporte barranquilla",
      "uber barranquilla",
      "transmetro barranquilla",
      "como moverse barranquilla",
      "taxis barranquilla",
    ],
    content: `
      <article class="prose prose-lg max-w-none">
        <p class="lead">
          Moverte en Barranquilla es fácil si sabes qué opciones usar. Esta guía te ayudará a elegir el mejor transporte según tu destino, presupuesto y nivel de comodidad. Precios actualizados 2026 y consejos de seguridad incluidos.
        </p>

        <h2>🚗 Uber / DiDi / InDriver - La Opción Más Recomendada</h2>

        <h3>¿Por Qué Apps de Transporte?</h3>
        <ul>
          <li>✅ <strong>Seguridad:</strong> Registra el viaje, compartes ubicación en tiempo real</li>
          <li>✅ <strong>Precio fijo:</strong> Sabes cuánto pagarás antes de subirte</li>
          <li>✅ <strong>Cómodo:</strong> Aire acondicionado (importante con el calor)</li>
          <li>✅ <strong>Sin regateo:</strong> No necesitas negociar</li>
          <li>✅ <strong>Pago digital:</strong> Tarjeta o efectivo</li>
        </ul>

        <h3>Apps Disponibles</h3>

        <p><strong>1. Uber (La más popular)</strong></p>
        <ul>
          <li>Cobertura: Toda la ciudad</li>
          <li>Tiempo de espera: 3-8 minutos promedio</li>
          <li>Tipos: UberX, Comfort, Black</li>
          <li>✅ Más confiable en zonas residenciales</li>
        </ul>

        <p><strong>2. DiDi (Alternativa competitiva)</strong></p>
        <ul>
          <li>Similar a Uber pero a veces más económico</li>
          <li>Promociones frecuentes para nuevos usuarios</li>
          <li>✅ Buena opción si Uber está saturado</li>
        </ul>

        <p><strong>3. InDriver (La más económica)</strong></p>
        <ul>
          <li><strong>TÚ propones el precio</strong> y conductores aceptan o contraofrecen</li>
          <li>Hasta 30% más barato que Uber</li>
          <li>⚠️ Menos conductores disponibles</li>
          <li>⚠️ Espera puede ser más larga (10-15 min)</li>
        </ul>

        <h3>Precios Aproximados (Uber/DiDi)</h3>
        <ul>
          <li>Aeropuerto → Centro Norte: $35,000-45,000 COP</li>
          <li>Hotel Norte → Zona Rosa: $12,000-18,000 COP</li>
          <li>Barranquilla → Puerto Colombia (playa): $45,000-55,000 COP</li>
          <li>Barranquilla → Puerto Velero: $60,000-75,000 COP</li>
          <li>Dentro de la misma zona: $8,000-15,000 COP</li>
        </ul>

        <h2>🚕 Taxis Tradicionales</h2>

        <h3>Cuándo Usar Taxi</h3>
        <ul>
          <li>Si no tienes internet/datos</li>
          <li>En zonas donde apps no llegan</li>
          <li>Si prefieres pagar solo en efectivo</li>
        </ul>

        <h3>⚠️ Precauciones con Taxis</h3>
        <ul>
          <li>
            <strong>SIEMPRE usa taxímetro</strong>
            <br/>Si el conductor dice "está dañado", bájate y busca otro.
          </li>
          <li>
            <strong>Tarifa base 2026:</strong> $5,500 COP
            <br/>Cada km adicional: ~$2,000 COP
          </li>
          <li>
            <strong>Taxis del aeropuerto:</strong> Precio fijo $50,000 COP al centro (negociable)
            <br/>Tip: Camina 2 minutos fuera del aeropuerto y pide Uber ($35,000)
          </li>
        </ul>

        <h3>Cómo Identificar un Taxi Seguro</h3>
        <ul>
          <li>✅ Color amarillo con número de empresa visible</li>
          <li>✅ Taxímetro funcionando y visible</li>
          <li>✅ Conductor con identificación visible</li>
          <li>❌ Evita taxis "piratas" (informales, sin logo de empresa)</li>
        </ul>

        <h2>🚌 Transmetro (Sistema de Bus Rápido)</h2>

        <h3>¿Qué Es?</h3>
        <p>
          Sistema de transporte masivo similar a TransMilenio (Bogotá). Buses articulados que circulan por carriles exclusivos.
        </p>

        <h3>Rutas Útiles para Turistas</h3>
        <ul>
          <li>
            <strong>Troncal Murillo:</strong> Conecta el sur con el norte de la ciudad
            <br/>Útil para: Ir del centro al norte
          </li>
          <li>
            <strong>Troncal Olaya Herrera:</strong> Cruza la ciudad de este a oeste
            <br/>Útil para: Ir a centros comerciales
          </li>
        </ul>

        <h3>Cómo Funciona</h3>
        <ol>
          <li>Compra tarjeta Transmetro en estaciones ($5,000 COP - recargable)</li>
          <li>Recarga saldo (mínimo $3,000 COP)</li>
          <li>Costo por viaje: $2,700 COP (2026)</li>
          <li>Pasa la tarjeta en torniquete y aborda el bus</li>
        </ol>

        <h3>Pros y Contras</h3>
        <p><strong>Ventajas:</strong></p>
        <ul>
          <li>✅ MUY económico ($2,700 vs $12,000 Uber)</li>
          <li>✅ Rápido en horas pico (carril exclusivo)</li>
          <li>✅ Seguro (estaciones con vigilancia)</li>
        </ul>

        <p><strong>Desventajas:</strong></p>
        <ul>
          <li>⚠️ Rutas limitadas (no cubre toda la ciudad)</li>
          <li>⚠️ Buses llenos en hora pico (7-9 AM, 5-7 PM)</li>
          <li>⚠️ Sin aire acondicionado (calor intenso)</li>
          <li>⚠️ Confuso para turistas (no hay mapas claros en español)</li>
        </ul>

        <p><strong>Mi Recomendación:</strong> Solo usa Transmetro si viajas con presupuesto MUY ajustado. Para turistas, Uber es más práctico.</p>

        <h2>🚌 Buses Públicos Tradicionales</h2>

        <h3>Realidad:</h3>
        <p>
          Los buses públicos tradicionales son caóticos, incómodos y difíciles de entender para turistas.
        </p>

        <ul>
          <li>❌ No tienen paradas fijas (paran donde tú pidas)</li>
          <li>❌ Rutas confusas (sin mapas ni señalización clara)</li>
          <li>❌ Muy llenos y calurosos</li>
          <li>❌ Alto riesgo de robos</li>
        </ul>

        <p><strong>Consejo:</strong> <strong>NO los uses como turista.</strong> Uber/DiDi son mucho mejores opciones por seguridad y comodidad.</p>

        <h2>🚴 Bicicletas y Scooters Eléctricos</h2>

        <h3>Situación Actual</h3>
        <p>
          Barranquilla NO tiene sistema de bicicletas públicas como otras ciudades. Las opciones de micromovilidad son limitadas:
        </p>
        <ul>
          <li>⚠️ Pocas ciclorrutas (infraestructura limitada)</li>
          <li>⚠️ Calor extremo (30-35°C) hace difícil andar en bici</li>
          <li>⚠️ Tráfico agresivo</li>
        </ul>

        <p><strong>Conclusión:</strong> Bicicleta no es práctica para turistas en Barranquilla.</p>

        <h2>🚗 Renta de Auto</h2>

        <h3>¿Cuándo Rentar Auto?</h3>
        <p>
          Vale la pena si:
        </p>
        <ul>
          <li>✅ Planeas visitar pueblos cercanos (Usiacurí, Tubará, playas)</li>
          <li>✅ Viajas en grupo (4-6 personas) - sale más barato que Uber</li>
          <li>✅ Te quedas más de 3 días</li>
        </ul>

        <h3>Precios de Renta</h3>
        <ul>
          <li>Auto económico: $120,000-180,000 COP/día</li>
          <li>Auto mediano: $180,000-250,000 COP/día</li>
          <li>SUV: $280,000-400,000 COP/día</li>
          <li>+ Seguro obligatorio: $30,000-50,000 COP/día</li>
        </ul>

        <h3>Empresas Confiables</h3>
        <ul>
          <li>Hertz (Aeropuerto y Centro)</li>
          <li>Avis (Aeropuerto)</li>
          <li>Localiza (Varias sucursales)</li>
        </ul>

        <h3>⚠️ Consejos si Rentas</h3>
        <ul>
          <li>Gasolina es cara ($11,000-13,000 COP/galón)</li>
          <li>Estacionamiento en centros comerciales: Gratis primeras 2 horas</li>
          <li>Estacionamiento en zona rosa: $3,000-5,000 COP/hora</li>
          <li>Maneja defensivo (tráfico puede ser caótico)</li>
        </ul>

        <h2>💡 Consejos de Seguridad en Transporte</h2>

        <h3>General</h3>
        <ul>
          <li>✅ Usa Uber/DiDi en lugar de taxis callejeros</li>
          <li>✅ Comparte tu ubicación con un amigo/familiar</li>
          <li>✅ Verifica que la placa del auto coincida con la app</li>
          <li>✅ Siéntate atrás (no adelante con el conductor)</li>
          <li>❌ No muestres objetos de valor (celular, cámara) en la calle</li>
          <li>❌ Evita tomar transporte tarde en la noche (después 11 PM)</li>
        </ul>

        <h3>En Uber/DiDi</h3>
        <ul>
          <li>✅ Confirma el nombre del conductor antes de subir</li>
          <li>✅ Pide que confirmen tu nombre ("¿A nombre de quién es el viaje?")</li>
          <li>✅ Califica bien a conductores educados (ayuda a otros usuarios)</li>
          <li>❌ No compartas información personal con conductores</li>
        </ul>

        <h2>📱 Apps Útiles</h2>
        <ul>
          <li><strong>Uber:</strong> Principal app de transporte</li>
          <li><strong>DiDi:</strong> Alternativa a Uber</li>
          <li><strong>InDriver:</strong> Opción económica</li>
          <li><strong>Google Maps:</strong> Rutas y tiempos de viaje</li>
          <li><strong>Waze:</strong> Navegación con alertas de tráfico en tiempo real</li>
        </ul>

        <hr />

        <h2>Resumen: ¿Qué Transporte Usar?</h2>

        <div class="overflow-x-auto">
          <table class="min-w-full border border-gray-300">
            <thead class="bg-gray-100">
              <tr>
                <th class="border border-gray-300 px-4 py-2">Situación</th>
                <th class="border border-gray-300 px-4 py-2">Mejor Opción</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border border-gray-300 px-4 py-2">Moverse dentro de Barranquilla</td>
                <td class="border border-gray-300 px-4 py-2">Uber / DiDi</td>
              </tr>
              <tr>
                <td class="border border-gray-300 px-4 py-2">Ir a playas cercanas (Puerto Colombia)</td>
                <td class="border border-gray-300 px-4 py-2">Uber / DiDi</td>
              </tr>
              <tr>
                <td class="border border-gray-300 px-4 py-2">Visitar varios pueblos en 1 día</td>
                <td class="border border-gray-300 px-4 py-2">Renta de auto</td>
              </tr>
              <tr>
                <td class="border border-gray-300 px-4 py-2">Presupuesto MUY ajustado</td>
                <td class="border border-gray-300 px-4 py-2">Transmetro</td>
              </tr>
              <tr>
                <td class="border border-gray-300 px-4 py-2">Viaje en grupo (4-6 personas)</td>
                <td class="border border-gray-300 px-4 py-2">Uber XL o Renta de auto</td>
              </tr>
            </tbody>
          </table>
        </div>

        <hr />

        <h2>Conclusión</h2>
        <p>
          Moverse en Barranquilla es fácil y seguro si usas las apps de transporte. <strong>Uber es tu mejor amigo.</strong> Olvídate de buses públicos y usa taxi tradicional solo si no tienes otra opción.
        </p>

        <p>
          Con un presupuesto de $50,000-80,000 COP/día en transporte, puedes moverte cómodamente por toda la ciudad.
        </p>

        <div class="bg-blue-50 border-l-4 border-blue-500 p-6 my-8 rounded-r-lg">
          <h3 class="text-xl font-bold text-gray-900 mb-2">¿Primera Vez en Barranquilla?</h3>
          <p class="text-gray-700 mb-4">
            Lee nuestro itinerario completo de fin de semana con plan día por día, restaurantes recomendados y consejos de local.
          </p>
          <a href="/blog/fin-de-semana-barranquilla-itinerario" class="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            Ver Itinerario Completo →
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
