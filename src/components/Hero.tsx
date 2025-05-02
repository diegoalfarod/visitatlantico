"use client";

import Image from "next/image";
import AnimatedSection from "@/components/AnimatedSection";

interface HeroProps {
  title: string;
  subtitle: string;
  buttonText: string;
}

export default function Hero({ title, subtitle, buttonText }: HeroProps) {
  return (
    <section className="relative w-full h-[90vh] flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/hero.jpg"
          alt="Atlántico desde el aire"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-primary opacity-70" />
      </div>

      {/* Content */}
      <AnimatedSection>
        <div className="relative z-10 text-center text-white px-6">
          <h1 className="text-3xl md:text-6xl font-heading font-bold mb-4">
            {title}
          </h1>
          <p className="text-base md:text-2xl font-sans mb-8">{subtitle}</p>
          <button className="px-6 py-3 rounded-full bg-accent text-background font-bold transition-all duration-300 transform hover:bg-dark hover:scale-105">
            {buttonText}
          </button>
        </div>
      </AnimatedSection>
    </section>
  );
}
