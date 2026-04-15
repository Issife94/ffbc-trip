"use client"

import { useEffect, useState } from "react"
import { TripCard } from "@/components/trip-card"
import { ParticipantSelectionCard } from "@/components/participant-selection-card"
import { ParticipantInfoCard } from "@/components/participant-info-card"
import { PriceEstimateCard } from "@/components/price-estimate-card"
import { ActionButtons } from "@/components/action-buttons"

export interface Participant {
  id: string
  firstName: string
  lastName: string
  phone: string
  email: string
  birthDate: string
  address: string
  isOrganizer: boolean
}

const tripData = {
  destination: "Voyage NBA en famille à New York",
  dateDepart: "15 juin 2026",
  dateRetour: "25 juin 2026",
  price: 2500,
}

// Sample participant for demo (matching the mockup)
const sampleParticipant: Participant = {
  id: "1",
  firstName: "Marie",
  lastName: "Dupont",
  phone: "+33612345678",
  email: "client@example.com",
  birthDate: "15/03/1985",
  address: "123 Rue de Paris, 75001 Paris",
  isOrganizer: true,
}

export default function BookingSummaryPage() {
  // Initialize with 2 participants selected and 1 sample participant (like the mockup shows 0/2 with 1 person)
  const [numberOfParticipants, setNumberOfParticipants] = useState<number | null>(2)
  const [shareRoom, setShareRoom] = useState(false)
  const [participants, setParticipants] = useState<Participant[]>([sampleParticipant])
  const [seaViewRoom, setSeaViewRoom] = useState(false)

  const optionsTotal = seaViewRoom ? 1000 : 0
  const total = (numberOfParticipants ? numberOfParticipants * tripData.price : 0) + optionsTotal
  const deposit = Math.round(total * 0.35)

  const canPay = numberOfParticipants !== null && participants.length >= numberOfParticipants

  const preparePayment = () => {
    const totalVoyage = total
    const acompteMinimum = Math.round(totalVoyage * 0.35)
    const options = seaViewRoom ? [{ label: "Chambre vue sur la mer", price: 1000 }] : []
    const payload = {
      participants: participants.map((p) => `${p.firstName} ${p.lastName}`),
      options,
      total_voyage: totalVoyage,
      deja_paye: 0,
      acompte_minimum: acompteMinimum,
      flux: "inscription" as const,
    }
    window.localStorage.setItem("current_payment", JSON.stringify(payload))
  }

  useEffect(() => {
    preparePayment()
  }, [participants, seaViewRoom, total])

  const addParticipant = (participant: Omit<Participant, "id">) => {
    setParticipants([
      ...participants,
      { ...participant, id: crypto.randomUUID() },
    ])
  }

  const updateParticipant = (id: string, data: Omit<Participant, "id">) => {
    setParticipants(
      participants.map((p) => (p.id === id ? { ...p, ...data } : p)),
    )
  }

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter((p) => p.id !== id))
  }

  return (
    <div className="min-h-screen bg-[#FAFDFD]">
      
      <main className="mx-auto max-w-[640px] px-6 pb-10 sm:pb-12">
        <div className="flex flex-col gap-6">
          <TripCard
            destination={tripData.destination}
            dateDepart={tripData.dateDepart}
            dateRetour={tripData.dateRetour}
            price={tripData.price}
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

          <section className="w-full rounded-[8px] border border-[#0C414933] bg-white p-4 shadow-none sm:p-6">
            <h2 className="mb-4 text-[15px] font-semibold text-[#0C4149]">
              Options de séjour
            </h2>
            <div className="rounded-[8px] border border-[#0C414933] bg-white p-4">
              <label className="flex cursor-pointer items-center justify-between gap-4">
                <span className="inline-flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={seaViewRoom}
                    onChange={(e) => setSeaViewRoom(e.target.checked)}
                    className="size-[18px] cursor-pointer rounded-[4px] border border-[#0C4149] accent-[#0C4149]"
                  />
                  <span className="text-[14px] text-[#0C4149]">Chambre vue sur la mer</span>
                </span>
                <span className="text-[14px] font-bold text-[#0C4149]">+ 1 000€</span>
              </label>
            </div>
          </section>

          <PriceEstimateCard
            numberOfParticipants={numberOfParticipants || 0}
            pricePerPerson={tripData.price}
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
