"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TerminosPage() {
  return (
    <>
      <Navbar />

      <main className="pt-24 pb-20">
        <section className="relative h-[35vh]">
          <img
            src="/images/legal-hero.jpg"
            alt="Términos y condiciones"
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <h1 className="text-4xl md:text-5xl text-white font-fivo">
              Términos & Condiciones
            </h1>
          </div>
        </section>

        <article className="max-w-3xl mx-auto px-6 mt-12 space-y-6 text-sm leading-relaxed text-gray-700">
          <h2 className="text-lg font-semibold">1. Aceptación</h2>
          <p>
            Al acceder a VisitAtlántico aceptas cumplir con estos Términos y
            Condiciones, todas las leyes y regulaciones aplicables...
          </p>

          <h2 className="text-lg font-semibold">2. Uso del Sitio</h2>
          <p>
            Puedes visualizar, descargar y compartir contenidos siempre que no
            elimines créditos o alteres la información...
          </p>

          <h2 className="text-lg font-semibold">3. Limitación de Responsabilidad</h2>
          <p>
            VisitAtlántico no será responsable por daños directos o indirectos
            derivados del uso de la información publicada...
          </p>

          {/* Añade más secciones legales según sea necesario */}
        </article>
      </main>

      <Footer />
    </>
  );
}
