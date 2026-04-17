import { createClient } from "@/lib/supabase/server"
import { RecapitulatifClient } from "./recapitulatif-client"

type TripOption = {
  id: string
  nom: string
  description: string | null
  prix: number
  is_featured: boolean
  is_active: boolean
}

type Trip = {
  id: string
  title: string
  date_depart: string
  date_retour: string
  price: number
  trip_options: TripOption[]
}

function formatDate(date: string) {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export default async function RecapPage({
  params,
}: {
  params: Promise<{ tripId: string }>
}) {
  const { tripId } = await params
  const supabase = await createClient()

  const { data: trip, error } = await supabase
    .from("trips")
    .select(
      `
      *,
      trip_options(*)
    `
    )
    .eq("id", tripId)
    .eq("is_active", true)
    .single()

  console.log("tripId:", tripId)
  console.log("trip trouvé:", trip)
  console.log("erreur:", error)

  if (error || !trip) {
    return (
      <div>
        Voyage introuvable — tripId: {tripId} — erreur: {error?.message}
      </div>
    )
  }

  const typedTrip = {
    ...(trip as Trip),
    trip_options: Array.isArray((trip as Trip).trip_options) ? (trip as Trip).trip_options : [],
  }

  const featuredOption = typedTrip.trip_options.find(
    (opt) => opt.is_featured && opt.is_active
  )

  const { data: tripAvailability } = await supabase
    .from("trips_with_availability")
    .select("places_restantes")
    .eq("id", tripId)
    .single()

  return (
    <RecapitulatifClient
      tripId={typedTrip.id}
      title={typedTrip.title}
      dateDepart={formatDate(typedTrip.date_depart)}
      dateRetour={formatDate(typedTrip.date_retour)}
      pricePerPerson={typedTrip.price / 100}
      placesRestantes={tripAvailability?.places_restantes ?? null}
      featuredOption={
        featuredOption
          ? {
              nom: featuredOption.nom,
              description: featuredOption.description,
              prix: featuredOption.prix,
            }
          : null
      }
    />
  )
}
