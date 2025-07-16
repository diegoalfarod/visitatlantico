// src/pages/api/photo.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ref = req.query.ref as string;
  if (!ref) return res.status(400).send("Missing ref");

  const url =
    "https://maps.googleapis.com/maps/api/place/photo?" +
    new URLSearchParams({
      maxwidth: "700",
      photo_reference: ref,
      key: process.env.GOOGLE_PLACES_API_KEY!,
    });

  // Pedimos solo los headers para obtener la redirección
  const resp = await fetch(url, { redirect: "manual" });
  const redirect = resp.headers.get("location");

  if (!redirect) return res.status(500).send("Cannot resolve photo");

  // Redirigimos al cliente a la URL definitiva (lh3.googleusercontent.com/…)
  res.setHeader("Cache-Control", "public, max-age=86400");
  return res.redirect(307, redirect);
}
