"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AccesibilidadPage() {
  return (
    <>
      <Navbar />

      <main className="pt-24 pb-20">
        <section className="relative h-[35vh]">
          <img
            src="/images/accessibility-hero.jpg"
            alt="Accesibilidad"
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <h1 className="text-4xl md:text-5xl text-white font-fivo">
              Accesibilidad
            </h1>
          </div>
        </section>

        <article className="max-w-3xl mx-auto px-6 mt-12 space-y-6 text-sm leading-relaxed text-gray-700">
          <p>
            VisitAtlántico se compromete a ofrecer un sitio web accesible para
            todos. Trabajamos siguiendo las directrices WCAG 2.1 AA...
          </p>

          <h2 className="text-lg font-semibold">Teclas de Navegación</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><b>Tab</b> – Avanza al siguiente elemento interactivo.</li>
            <li><b>Shift + Tab</b> – Retrocede al elemento anterior.</li>
          </ul>

          <h2 className="text-lg font-semibold">Reportar Problemas</h2>
          <p>
            Si encuentras alguna barrera de accesibilidad, escribe a
            accesibilidad@visitatlantico.co y la solucionaremos a la mayor
            brevedad.
          </p>
        </article>
      </main>

      <Footer />
    </>
  );
}
