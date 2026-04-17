"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

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

const emptyForm = {
  lastName: "",
  firstName: "",
  phone: "",
  email: "",
  birthDate: "",
  address: "",
  isOrganizer: false,
}

interface AddParticipantModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  participants: Participant[]
  editingParticipant: Participant | null
  onSave: (data: Omit<Participant, "id">, editingId: string | null) => void
}

export function AddParticipantModal({
  open,
  onOpenChange,
  participants,
  editingParticipant,
  onSave,
}: AddParticipantModalProps) {
  const [formData, setFormData] = useState(emptyForm)
  const [addressSearchTerm, setAddressSearchTerm] = useState("")
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([])

  useEffect(() => {
    if (!open) return
    if (editingParticipant) {
      setFormData({
        lastName: editingParticipant.lastName,
        firstName: editingParticipant.firstName,
        phone: editingParticipant.phone,
        email: editingParticipant.email,
        birthDate: editingParticipant.birthDate,
        address: editingParticipant.address,
        isOrganizer: editingParticipant.isOrganizer,
      })
    } else {
      setFormData(emptyForm)
    }
    setAddressSearchTerm("")
    setAddressSuggestions([])
  }, [open, editingParticipant])

  useEffect(() => {
    const query = addressSearchTerm.trim()

    if (query.length < 3) {
      setAddressSuggestions([])
      return
    }

    const controller = new AbortController()

    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`,
          { signal: controller.signal },
        )

        if (!response.ok) {
          setAddressSuggestions([])
          return
        }

        const data: {
          features?: Array<{ properties?: { label?: string } }>
        } = await response.json()

        const suggestions = (data.features ?? [])
          .map((feature) => feature.properties?.label ?? "")
          .filter((label) => label.length > 0)
          .slice(0, 5)

        setAddressSuggestions(suggestions)
      } catch {
        setAddressSuggestions([])
      }
    }, 300)

    return () => {
      window.clearTimeout(timeoutId)
      controller.abort()
    }
  }, [addressSearchTerm])

  const editingId = editingParticipant?.id ?? null
  const isEditMode = editingId !== null

  const hasOtherOrganizer = participants.some(
    (p) => p.isOrganizer && p.id !== editingId,
  )
  const organizerCheckboxDisabled =
    (!isEditMode && participants.some((p) => p.isOrganizer)) ||
    (isEditMode && !formData.isOrganizer && hasOtherOrganizer)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData, editingId)
    setFormData(emptyForm)
    setAddressSearchTerm("")
    setAddressSuggestions([])
  }

  const isFormValid =
    formData.lastName &&
    formData.firstName &&
    formData.phone &&
    formData.email &&
    formData.birthDate &&
    formData.address

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-[#0C414933] bg-white">
        <DialogHeader>
          <DialogTitle className="text-[#0C4149]">
            {isEditMode ? "Modifier le profil" : "Ajouter un participant"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="lastName" className="text-sm font-medium text-[#0C4149]">
              Nom
            </Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="Dupont"
              className="border-[#0C414933]"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="firstName" className="text-sm font-medium text-[#0C4149]">
              Prénom
            </Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="Marie"
              className="border-[#0C414933]"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="phone" className="text-sm font-medium text-[#0C4149]">
              Téléphone
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+33612345678"
              className="border-[#0C414933]"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-sm font-medium text-[#0C4149]">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="marie@example.com"
              className="border-[#0C414933]"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="birthDate" className="text-sm font-medium text-[#0C4149]">
              Date de naissance (âge)
            </Label>
            <Input
              id="birthDate"
              type="text"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              placeholder="15/03/1985"
              className="border-[#0C414933]"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="address" className="text-sm font-medium text-[#0C4149]">
              Adresse
            </Label>
            <div className="relative">
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => {
                  const value = e.target.value
                  setFormData({ ...formData, address: value })
                  setAddressSearchTerm(value)
                }}
                placeholder="123 Rue de Paris, 75001 Paris"
                className="border-[#0C414933]"
                required
              />

              {addressSuggestions.length > 0 ? (
                <ul className="absolute top-full z-50 mt-1 w-full overflow-hidden rounded-[8px] border border-[#0C414933] bg-white">
                  {addressSuggestions.map((suggestion) => (
                    <li key={suggestion}>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, address: suggestion })
                          setAddressSearchTerm("")
                          setAddressSuggestions([])
                        }}
                        className="w-full px-4 py-[10px] text-left text-[14px] text-[#0C4149] hover:bg-[#FAFDFD]"
                      >
                        {suggestion}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="isOrganizer"
              checked={formData.isOrganizer}
              disabled={organizerCheckboxDisabled}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isOrganizer: checked === true })
              }
              className="data-[state=checked]:bg-[#0C4149] data-[state=checked]:border-[#0C4149] border-[#0C414933] disabled:opacity-50"
            />
            <Label
              htmlFor="isOrganizer"
              className={`text-sm cursor-pointer text-[#0C4149] ${organizerCheckboxDisabled ? "opacity-50" : ""}`}
            >
              Je m&apos;occupe de la réservation
            </Label>
          </div>

          <Button
            type="submit"
            disabled={!isFormValid}
            className="w-full h-[49px] bg-[#FA673E] hover:bg-[#FF592A] disabled:cursor-not-allowed text-white font-bold rounded-[8px] text-[15px] mt-2"
          >
            {isEditMode ? "Enregistrer les modifications" : "Ajouter →"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
