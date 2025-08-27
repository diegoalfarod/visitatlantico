//src/app/itinerary/[shortId]/page.tsx

import { redirect } from "next/navigation";

export default function ItineraryShortPage({
  params,
}: {
  params: { shortId: string };
}) {
  const { shortId } = params;
  if (!shortId || typeof shortId !== "string") {
    redirect("/itinerary");
  }
  redirect(`/itinerary?shortId=${encodeURIComponent(shortId)}`);
}
