// src/app/contacto/page.tsx
"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Send } from "lucide-react";

export default function ContactoPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: enviar a tu backend / servicio de correo
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <>
      <Navbar />

      <main className="pt-24 pb-20">
        {/* Hero sin imagen */}
        <section className="relative h-[35vh] bg-gray-800">
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <h1 className="text-4xl md:text-5xl text-white font-fivo">
              Contáctanos
            </h1>
          </div>
        </section>

        <section className="max-w-xl mx-auto px-6 mt-12">
          <form
            onSubmit={handleSubmit}
            className="space-y-4 bg-white p-6 rounded-2xl shadow-md"
          >
            <input
              type="text"
              required
              placeholder="Tu Nombre"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
            <input
              type="email"
              required
              placeholder="Correo Electrónico"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
            <textarea
              required
              placeholder="Mensaje"
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="flex items-center gap-2 bg-[#E40E20] text-white px-5 py-2 rounded-full hover:bg-[#c91a29] transition"
            >
              <Send size={16} /> Enviar mensaje
            </button>
            {sent && (
              <p className="text-sm text-green-600 mt-2">
                ¡Mensaje enviado correctamente!
              </p>
            )}
          </form>
        </section>
      </main>

      <Footer />
    </>
  );
}
