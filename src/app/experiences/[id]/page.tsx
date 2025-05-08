// src/app/experiences/[id]/page.tsx
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { notFound } from "next/navigation";
import Image from "next/image";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  // ‼️  params es una Promesa → se hace await
  const { id: experienceId } = await params;
  if (!experienceId) return notFound();

  const docRef = doc(db, "experiences", experienceId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return notFound();

  const data = docSnap.data() as {
    title: string;
    description: string;
    image: string;
    category: string;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-4">{data.title}</h1>
      <div className="mb-6">
        <Image
          src={data.image}
          alt={data.title}
          width={1200}
          height={600}
          className="w-full h-96 object-cover rounded-xl"
          unoptimized
        />
      </div>
      <p className="text-lg text-gray-700 leading-relaxed">
        {data.description}
      </p>
    </div>
  );
}
