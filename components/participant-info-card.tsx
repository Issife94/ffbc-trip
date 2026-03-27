"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { AddParticipantModal } from "@/components/add-participant-modal"
import type { Participant } from "@/app/page"

interface ParticipantInfoCardProps {
  participants: Participant[]
  numberOfParticipants: number
  onAddParticipant: (participant: Omit<Participant, "id">) => void
  onUpdateParticipant: (id: string, participant: Omit<Participant, "id">) => void
  onRemoveParticipant: (id: string) => void
}

export function ParticipantInfoCard({
  participants,
  numberOfParticipants,
  onAddParticipant,
  onUpdateParticipant,
  onRemoveParticipant,
}: ParticipantInfoCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null)

  const handleOpenChange = (open: boolean) => {
    setIsModalOpen(open)
    if (!open) setEditingParticipant(null)
  }

  const openAdd = () => {
    setEditingParticipant(null)
    setIsModalOpen(true)
  }

  const openEdit = (participant: Participant) => {
    setEditingParticipant(participant)
    setIsModalOpen(true)
  }

  return (
    <>
      <Card className="border-[#0C414933] bg-white rounded-[8px] shadow-none">
        <CardContent className="p-6">
          <h2 className="text-[15px] font-semibold text-[#0C4149] mb-4">
            Infos des participants {participants.length}/{numberOfParticipants}
          </h2>

          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={openAdd}
              disabled={participants.length >= numberOfParticipants}
              className="text-sm font-medium text-[#0C4149] underline underline-offset-2 cursor-pointer hover:no-underline hover:text-[#0C4149]/90 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Ajouter un participant
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {participants.map((participant, index) => (
              <ParticipantItem
                key={participant.id}
                participant={participant}
                isFirst={index === 0}
                onEdit={() => openEdit(participant)}
                onRemove={() => onRemoveParticipant(participant.id)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <AddParticipantModal
        open={isModalOpen}
        onOpenChange={handleOpenChange}
        participants={participants}
        editingParticipant={editingParticipant}
        onSave={(data, editingId) => {
          if (editingId) {
            onUpdateParticipant(editingId, data)
          } else {
            onAddParticipant(data)
          }
          handleOpenChange(false)
        }}
      />
    </>
  )
}

interface ParticipantItemProps {
  participant: Participant
  isFirst: boolean
  onEdit: () => void
  onRemove: () => void
}

function ParticipantItem({ participant, isFirst, onEdit, onRemove }: ParticipantItemProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onEdit}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onEdit()
        }
      }}
      aria-label={`Modifier le profil de ${participant.firstName} ${participant.lastName}`}
      className="rounded-lg border border-[#0C414933] p-4 cursor-pointer transition-colors hover:bg-gray-50/50 hover:border-[#0C414966] outline-none focus-visible:ring-2 focus-visible:ring-[#0C4149]/30 focus-visible:ring-offset-2"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="font-semibold text-[#0C4149] text-[15px]">
          {participant.firstName} {participant.lastName}
        </span>
        {isFirst && (
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M9 0L11.5 4L16 2.5L14 7L16 12H2L4 7L2 2.5L6.5 4L9 0Z" fill="#DFD400"/>
          </svg>
        )}
      </div>

      <div className="flex flex-col gap-1 text-[14px] text-[#0C4149]">
        <p>Né(e) le : {participant.birthDate}</p>
        <p>Téléphone : {participant.phone}</p>
        <p>Email : {participant.email}</p>
        <p>Adresse : {participant.address}</p>
      </div>

      <div className="flex justify-end mt-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="text-[14px] font-medium text-red-600 underline underline-offset-2 cursor-pointer hover:text-red-800"
        >
          Supprimer
        </button>
      </div>
    </div>
  )
}
