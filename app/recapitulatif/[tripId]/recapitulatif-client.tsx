"use client"

import { useEffect, useState } from "react"
import { TripCard } from "@/components/trip-card"
import { ParticipantSelectionCard } from "@/components/participant-selection-card"
import { ParticipantInfoCard } from "@/components/participant-info-card"
import { PriceEstimateCard } from "@/components/price-estimate-card"
import { ActionButtons } from "@/components/action-buttons"

type Participant = {
  id: string
  firstName: string
  lastName: string
  phone: string
  email: string
  birthDate: string
  address: string
  isOrganizer: boolean
}

type FeaturedOption = {
  nom: string
  description: string | null
  prix: number
}

type RecapitulatifClientProps = {
  tripId: string
  title: string
  dateDepart: string
  dateRetour: string
  pricePerPerson: number
  placesRestantes: number | null
  featuredOption: FeaturedOption | null
}

export function RecapitulatifClient({
  tripId,
  title,
  dateDepart,
  dateRetour,
  pricePerPerson,
  placesRestantes,
  featuredOption,
}: RecapitulatifClientProps) {
  const [numberOfParticipants, setNumberOfParticipants] = useState<number | null>(1)
  const [shareRoom, setShareRoom] = useState(false)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isFeaturedOptionChecked, setIsFeaturedOptionChecked] = useState(false)

  const featuredOptionPrice = featuredOption ? featuredOption.prix / 100 : 0
  const baseTotal = (numberOfParticipants ? numberOfParticipants * pricePerPerson : 0)
  const optionsTotal = isFeaturedOptionChecked ? featuredOptionPrice : 0
  const total = baseTotal + optionsTotal
  const deposit = Math.round(total * 0.35)
  const canPay = numberOfParticipants !== null && participants.length >= numberOfParticipants

  const preparePayment = () => {
    const payload = {
      participants: participants.map((p) => `${p.firstName} ${p.lastName}`),
      options:
        featuredOption && isFeaturedOptionChecked
          ? [{ label: featuredOption.nom, price: featuredOptionPrice }]
          : [],
      total_voyage: total,
      deja_paye: 0,
      acompte_minimum: deposit,
      flux: "inscription" as const,
      trip_id: tripId,
    }
    window.localStorage.setItem("current_payment", JSON.stringify(payload))
  }

  useEffect(() => {
    preparePayment()
  }, [participants, total, isFeaturedOptionChecked, numberOfParticipants])

  const addParticipant = (participant: Omit<Participant, "id">) => {
    setParticipants([...participants, { ...participant, id: crypto.randomUUID() }])
  }

  const updateParticipant = (id: string, data: Omit<Participant, "id">) => {
    setParticipants(participants.map((p) => (p.id === id ? { ...p, ...data } : p)))
  }

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter((p) => p.id !== id))
  }

  return (
    <div className="min-h-screen bg-[#FAFDFD]">
      <main className="mx-auto max-w-[640px] px-6 pb-10 sm:pb-12">
        <div className="flex flex-col gap-6">
          <TripCard
            destination={title}
            dateDepart={dateDepart}
            dateRetour={dateRetour}
            price={pricePerPerson}
            placesRestantes={placesRestantes}
          />

          <ParticipantSelectionCard
            numberOfParticipants={numberOfParticipants}
            setNumberOfParticipants={setNumberOfParticipants}
            shareRoom={shareRoom}
            setShareRoom={setShareRoom}
          />

          <ParticipantInfoCard
            participants={participants}
            numberOfParticipants={numberOfParticipants || 0}
            onAddParticipant={addParticipant}
            onUpdateParticipant={updateParticipant}
            onRemoveParticipant={removeParticipant}
          />

          {featuredOption ? (
            <section className="w-full rounded-[8px] border border-[#0C414933] bg-white p-4 shadow-none sm:p-6">
              <h2 className="mb-4 text-[15px] font-semibold text-[#0C4149]">Options de séjour</h2>
              <div className="rounded-[8px] border border-[#0C414933] bg-white p-4">
                <label className="flex cursor-pointer items-start justify-between gap-4">
                  <span className="inline-flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isFeaturedOptionChecked}
                      onChange={(e) => setIsFeaturedOptionChecked(e.target.checked)}
                      className="mt-[2px] size-[18px] cursor-pointer rounded-[4px] border border-[#0C4149] accent-[#0C4149]"
                    />
                    <span className="flex flex-col gap-1">
                      <span className="text-[14px] text-[#0C4149]">{featuredOption.nom}</span>
                      {featuredOption.description ? (
                        <span className="text-[13px] text-[#0C4149CC]">{featuredOption.description}</span>
                      ) : null}
                    </span>
                  </span>
                  <span className="shrink-0 text-[14px] font-bold text-[#0C4149]">
                    + {featuredOptionPrice}€
                  </span>
                </label>
              </div>
            </section>
          ) : null}

          <PriceEstimateCard
            numberOfParticipants={numberOfParticipants || 0}
            pricePerPerson={pricePerPerson}
            total={total}
            deposit={deposit}
          />

          <ActionButtons
            canPay={canPay}
            paymentHref="/paiement?type=acompte"
            onPayClick={preparePayment}
            payLabel={`Payer l'acompte ${deposit}€`}
          />
        </div>
      </main>
    </div>
  )
}
