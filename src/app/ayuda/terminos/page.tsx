// src/app/ayuda/terminos/page.tsx
"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TerminosPage() {
  return (
    <>
      <Navbar />

      <main className="pt-24 pb-20">
        {/* Hero sin imagen */}
        <section className="relative h-[35vh] bg-gray-800">
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <h1 className="text-4xl md:text-5xl text-white font-fivo">
              Términos &amp; Condiciones
            </h1>
          </div>
        </section>

        {/* Contenido de T&C */}
        <article className="max-w-3xl mx-auto px-6 mt-12 space-y-8 text-sm leading-relaxed text-gray-700">
          <h2 className="text-xl font-semibold">1. Aceptación de los Términos</h2>
          <p>
            Al acceder y utilizar el sitio web <strong>VisitAtlántico</strong> (en adelante, “el Sitio”), declaras que
            has leído, entendido y aceptado estos Términos y Condiciones en su totalidad. Si no estás de acuerdo
            con alguno de ellos, debes abandonar el Sitio inmediatamente.
          </p>

          <h2 className="text-xl font-semibold">2. Definiciones</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Usuario:</strong> Toda persona que accede o utiliza el Sitio.
            </li>
            <li>
              <strong>Contenido:</strong> Información, imágenes, textos, videos y cualquier otro material
              disponible en el Sitio.
            </li>
            <li>
              <strong>Proveedor:</strong> VisitAtlántico S.A.S., responsable de la operación y gestión del Sitio.
            </li>
          </ul>

          <h2 className="text-xl font-semibold">3. Uso del Sitio</h2>
          <p>
            El Usuario se compromete a utilizar el Sitio de conformidad con la ley, la moral, el orden público y estos
            Términos. Queda prohibido:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>Reproducir, distribuir o explotar el Contenido con fines comerciales sin autorización.</li>
            <li>
              Publicar información falsa, engañosa o que viole derechos de terceros (propiedad intelectual, privacidad,
              etc.).
            </li>
            <li>
              Intentar acceder de forma no autorizada a sistemas o cuentas de otros Usuarios o del Sitio.
            </li>
          </ul>

          <h2 className="text-xl font-semibold">4. Propiedad Intelectual</h2>
          <p>
            Todo el Contenido del Sitio, incluyendo diseños, textos, logotipos, gráficos, imágenes y software,
            está protegido por derechos de autor y otras leyes de propiedad intelectual. El Proveedor se reserva
            todos los derechos no concedidos expresamente en estos Términos.
          </p>

          <h2 className="text-xl font-semibold">5. Privacidad y Datos Personales</h2>
          <p>
            El tratamiento de tus datos personales se regirá por nuestra{" "}
            <a href="/ayuda/privacidad" className="text-primary hover:underline">
              Política de Privacidad
            </a>
            , donde explicamos qué información recopilamos, cómo la usamos y tus derechos de acceso, rectificación y
            supresión.
          </p>

          <h2 className="text-xl font-semibold">6. Enlaces a Terceros</h2>
          <p>
            El Sitio puede contener enlaces a sitios web de terceros que no son operados por el Proveedor. El
            acceso a dichos enlaces se realiza bajo tu exclusiva responsabilidad. El Proveedor no controla ni
            asume responsabilidad alguna por el contenido, prácticas de privacidad o disponibilidad de dichos sitios.
          </p>

          <h2 className="text-xl font-semibold">7. Exención de Responsabilidad</h2>
          <p>
            El Sitio y su Contenido se proporcionan “tal cual” y “según disponibilidad”. El Proveedor no garantiza
            la exactitud, integridad o actualidad de la información. En ningún caso el Proveedor será responsable
            por daños directos, indirectos, incidentales, consecuentes o cualquier otro tipo de perjuicio derivado
            del uso o imposibilidad de uso del Sitio.
          </p>

          <h2 className="text-xl font-semibold">8. Limitación de Responsabilidad</h2>
          <p>
            En la medida máxima permitida por la ley aplicable, la responsabilidad total del Proveedor por cualquier
            reclamación relacionada con el Sitio o estos Términos no excederá el monto de <strong>USD 100</strong> o su
            equivalente en monedas locales.
          </p>

          <h2 className="text-xl font-semibold">9. Indemnización</h2>
          <p>
            El Usuario se compromete a indemnizar y mantener indemne al Proveedor frente a cualquier reclamación,
            demanda o daño, incluyendo honorarios de abogados, derivados de su uso indebido del Sitio o violación
            de estos Términos.
          </p>

          <h2 className="text-xl font-semibold">10. Modificaciones de los Términos</h2>
          <p>
            El Proveedor se reserva el derecho de modificar estos Términos en cualquier momento. Las modificaciones
            entrarán en vigor desde su publicación en el Sitio. Se recomienda revisar periódicamente esta sección;
            el uso continuado tras cambios implica aceptación.
          </p>

          <h2 className="text-xl font-semibold">11. Ley Aplicable y Jurisdicción</h2>
          <p>
            Estos Términos se regirán e interpretarán conforme a las leyes de la República de Colombia. Para la
            resolución de cualquier conflicto, las partes se someten a los jueces y tribunales de la ciudad de
            Barranquilla, renunciando a cualquier otro fuero que pudiera corresponderles.
          </p>

          <h2 className="text-xl font-semibold">12. Contacto</h2>
          <p>
            Si tienes dudas o comentarios sobre estos Términos y Condiciones, puedes escribir a:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>
              Email:{" "}
              <a href="mailto:atencionalciudadano@atlantico.gov.co" className="text-primary hover:underline">
                atencionalciudadano@atlantico.gov.co
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
