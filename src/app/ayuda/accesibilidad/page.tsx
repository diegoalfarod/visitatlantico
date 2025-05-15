// src/app/ayuda/accesibilidad/page.tsx
"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AccesibilidadPage() {
  return (
    <>
      <Navbar />

      <main className="pt-24 pb-20">
        {/* Hero without image */}
        <section className="relative h-[35vh] bg-gray-800">
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <h1 className="text-4xl md:text-5xl text-white font-fivo">
              Accesibilidad
            </h1>
          </div>
        </section>

        {/* Contenido de Accesibilidad */}
        <article className="max-w-3xl mx-auto px-6 mt-12 space-y-8 text-sm leading-relaxed text-gray-700">
          
          <h2 className="text-xl font-semibold">1. Compromiso con la Accesibilidad</h2>
          <p>
            VisitAtlántico se adhiere a las <strong>WCAG 2.1 Nivel AA</strong> para garantizar que nuestro sitio sea
            accesible a usuarios con discapacidades visuales, auditivas, motrices y cognitivas.
          </p>

          <h2 className="text-xl font-semibold">2. Contraste y Legibilidad</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Contraste mínimo de <strong>4.5:1</strong> para textos normales y <strong>3:1</strong> para elementos UI.</li>
            <li>Fuente redimensionable hasta <em>200%</em> sin roturas de diseño.</li>
          </ul>

          <h2 className="text-xl font-semibold">3. Navegación por Teclado</h2>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Tab:</strong> Avanza al siguiente elemento interactivo.</li>
            <li><strong>Shift + Tab:</strong> Retrocede al elemento anterior.</li>
            <li><strong>Enter/Espacio:</strong> Activa botones y enlaces.</li>
            <li>Indicadores de foco visibles en todos los elementos interactivos.</li>
          </ul>

          <h2 className="text-xl font-semibold">4. Texto Alternativo y Multimedia</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Cada imagen incluye atributo <code>alt</code> descriptivo.</li>
            <li>Videos y audios cuentan con subtítulos y transcripciones cuando es necesario.</li>
          </ul>

          <h2 className="text-xl font-semibold">5. Estructura Semántica y ARIA</h2>
          <p>
            Utilizamos HTML5 semántico (<code>&lt;header&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;main&gt;</code>, <code>&lt;footer&gt;</code>)
            y roles ARIA (<code>role=&quot;banner&quot;</code>, <code>role=&quot;navigation&quot;</code>, <code>role=&quot;main&quot;</code>) para que
            los lectores de pantalla interpreten correctamente la página.
          </p>

          <h2 className="text-xl font-semibold">6. Formularios y Contenido Dinámico</h2>
          <p>
            Todos los campos de formulario incluyen etiquetas (<code>&lt;label&gt;</code>) y estados de validación
            accesibles, y actualizamos el ARIA <code>aria-live</code> para notificar a tecnologías asistivas.
          </p>

          <h2 className="text-xl font-semibold">7. Evitar Barreras de Tiempo</h2>
          <p>
            No imponemos límites de tiempo estrictos para completar formularios ni interacciones. Si fuese necesario,
            ofrecemos una extensión o una alternativa accesible.
          </p>

          <h2 className="text-xl font-semibold">8. Pruebas y Auditorías</h2>
          <p>
            Realizamos pruebas automáticas (axe, Lighthouse) y manuales con lectores de pantalla (NVDA, VoiceOver)
            y usuarios reales para asegurar la conformidad continua.
          </p>

          <h2 className="text-xl font-semibold">9. Reportar Problemas</h2>
          <p>
            Si encuentras alguna barrera de accesibilidad, por favor contáctanos:
            <br />
            <a
              href="mailto:accesibilidad@visitatlantico.co"
              className="text-primary hover:underline"
            >
              accesibilidad@visitatlantico.co
            </a>
          </p>

          <h2 className="text-xl font-semibold">10. Actualizaciones de Accesibilidad</h2>
          <p>
            Esta página se revisa y actualiza periódicamente para reflejar mejoras y nuevas prácticas. Fecha de última
            actualización: <strong>15 de mayo de 2025</strong>.
          </p>
        </article>
      </main>

      <Footer />
    </>
  );
}
