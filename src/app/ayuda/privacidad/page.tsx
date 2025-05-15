// src/app/ayuda/privacidad/page.tsx
"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacidadPage() {
  return (
    <>
      <Navbar />

      <main className="pt-24 pb-20">
        {/* Hero sin imagen */}
        <section className="relative h-[35vh] bg-gray-800">
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <h1 className="text-4xl md:text-5xl text-white font-fivo">
              Política de Privacidad
            </h1>
          </div>
        </section>

        {/* Contenido de la Política */}
        <article className="max-w-3xl mx-auto px-6 mt-12 space-y-8 text-sm leading-relaxed text-gray-700">
          
          <h2 className="text-xl font-semibold">1. Información que Recopilamos</h2>
          <p>
            <strong>Datos de Registro:</strong> Cuando te suscribes a nuestro boletín o creas una cuenta, podemos recopilar tu nombre, dirección de correo electrónico y país de residencia.
          </p>
          <p>
            <strong>Datos de Uso:</strong> Recopilamos automáticamente información sobre tu interacción con VisitAtlántico, incluyendo páginas vistas, rutas de navegación, búsquedas y duración de las visitas, mediante cookies y tecnologías similares.
          </p>
          <p>
            <strong>Datos de Dispositivo:</strong> Recogemos información técnica sobre tu dispositivo (tipo de navegador, sistema operativo, dirección IP) para mejorar la seguridad y la compatibilidad.
          </p>

          <h2 className="text-xl font-semibold">2. Cómo Utilizamos Tus Datos</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Mejorar el Servicio:</strong> Personalizamos la experiencia, mostramos destinos recomendados y optimizamos el rendimiento del sitio.
            </li>
            <li>
              <strong>Comunicaciones:</strong> Enviamos boletines, notificaciones de promociones y actualizaciones de nuevos destinos, cuando nos autorizas.
            </li>
            <li>
              <strong>Análisis y Estadísticas:</strong> Usamos datos agregados para entender tendencias de uso y mejorar la oferta de contenido.
            </li>
            <li>
              <strong>Seguridad:</strong> Detectamos actividades sospechosas y protegemos tu cuenta y nuestros sistemas frente a fraudes.
            </li>
          </ul>

          <h2 className="text-xl font-semibold">3. Cookies y Tecnologías Similares</h2>
          <p>
            Utilizamos cookies propias y de terceros para:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>Recordar tus preferencias de idioma y región.</li>
            <li>Analizar el tráfico y el comportamiento de navegación.</li>
            <li>Mostrar anuncios relevantes en VisitAtlántico y en otros sitios.</li>
          </ul>
          <p>
            Puedes <strong>gestionar o desactivar</strong> las cookies desde la configuración de tu navegador, aunque esto puede afectar el funcionamiento del sitio.
          </p>

          <h2 className="text-xl font-semibold">4. Compartir Datos con Terceros</h2>
          <p>
            No vendemos tus datos personales. Podemos compartir información con:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Proveedores de Servicios:</strong> Plataformas de envío de correos, análisis web, servicios de hosting.
            </li>
            <li>
              <strong>Autoridades:</strong> En caso de requerimiento legal o investigación de infracciones.
            </li>
          </ul>

          <h2 className="text-xl font-semibold">5. Derechos del Usuario</h2>
          <p>
            Tienes derecho a:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Acceso:</strong> Solicitar una copia de los datos que tenemos sobre ti.</li>
            <li><strong>Rectificación:</strong> Corregir o actualizar datos inexactos o incompletos.</li>
            <li><strong>Supresión:</strong> Pedir que eliminemos tus datos cuando ya no sean necesarios.</li>
            <li><strong>Portabilidad:</strong> Recibir tus datos en un formato estructurado y trasladarlos a otro servicio.</li>
            <li><strong>Oposición y Limitación:</strong> Oponerte al tratamiento o solicitar su limitación en ciertos casos.</li>
          </ul>
          <p>
            Para ejercer estos derechos, contáctanos en{" "}
            <a href="mailto:privacy@visitatlantico.com" className="text-primary hover:underline">
              privacy@visitatlantico.com
            </a>.
          </p>

          <h2 className="text-xl font-semibold">6. Retención de Datos</h2>
          <p>
            Conservamos tus datos sólo el tiempo necesario para cumplir los fines descritos, o según obligaciones legales. Una vez cumplidos, los eliminamos o anonimamos.
          </p>

          <h2 className="text-xl font-semibold">7. Seguridad de los Datos</h2>
          <p>
            Implementamos medidas técnicas y organizativas (cifrado TLS, acceso restringido, auditorías periódicas) para proteger tus datos contra accesos no autorizados, pérdida o divulgación.
          </p>

          <h2 className="text-xl font-semibold">8. Enlaces Externos</h2>
          <p>
            El Sitio puede contener enlaces a sitios de terceros. Esta Política no cubre sus prácticas de privacidad. Te recomendamos revisar sus propias políticas antes de proporcionar datos.
          </p>

          <h2 className="text-xl font-semibold">9. Cambios en la Política</h2>
          <p>
            Podemos actualizar esta Política de Privacidad. Notificaremos cambios significativos mediante un aviso destacado en el Sitio o un correo electrónico. La fecha de la última actualización aparece al inicio de esta página.
          </p>

          <h2 className="text-xl font-semibold">10. Contacto</h2>
          <p>
            Si tienes preguntas o quejas sobre esta Política, escríbenos a:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>
              Email:{" "}
              <a href="mailto:privacy@visitatlantico.com" className="text-primary hover:underline">
                privacy@visitatlantico.com
              </a>
            </li>
            <li>Dirección: Calle 84 #45-12, Barranquilla, Colombia</li>
            <li>Teléfono: +57 (5) 123 4567</li>
          </ul>
        </article>
      </main>

      <Footer />
    </>
  );
}
