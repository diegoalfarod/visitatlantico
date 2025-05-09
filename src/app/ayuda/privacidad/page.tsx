"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacidadPage() {
  return (
    <>
      <Navbar />

      <main className="pt-24 pb-20">
        <section className="relative h-[35vh]">
          <img
            src="/images/privacy-hero.jpg"
            alt="Política de privacidad"
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <h1 className="text-4xl md:text-5xl text-white font-fivo">
              Política de Privacidad
            </h1>
          </div>
        </section>

        <article className="max-w-3xl mx-auto px-6 mt-12 space-y-6 text-sm leading-relaxed text-gray-700">
          <h2 className="text-lg font-semibold">1. Datos que Recopilamos</h2>
          <p>
            Al suscribirte recopilamos tu nombre y correo electrónico para
            enviarte boletines de viaje...
          </p>

          <h2 className="text-lg font-semibold">2. Uso de la Información</h2>
          <p>
            Utilizamos tus datos para mejorar la experiencia de usuario y
            mantenerte informado sobre nuevos destinos...
          </p>

          <h2 className="text-lg font-semibold">3. Derechos del Usuario</h2>
          <p>
            Puedes solicitar la eliminación o modificación de tus datos en
            cualquier momento escribiendo a info@visitatlantico.co.
          </p>
        </article>
      </main>

      <Footer />
    </>
  );
}
