"use client"

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowRight, Calendar, Check, Clock3, LogOut, Mail, Phone, Trash2, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddParticipantModal } from "@/components/add-participant-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Participant } from "@/app/page"

const ADULT_PRICE = 1500
const CHILD_PRICE = 1000

const trip = {
  title: "VOYAGE NBA EN FAMILLE À NEW YORK",
  dateDepart: "15 juin 2026",
  dateRetour: "25 juin 2026",
}

type TabId =
  | "participants"
  | "paiements"
  | "options"
  | "contrat"
  | "documents"
  | "details"
  | "contact"

const TABS: { id: TabId; label: string }[] = [
  { id: "participants", label: "Participants" },
  { id: "paiements", label: "Paiements" },
  { id: "options", label: "Options" },
  { id: "contrat", label: "Contrat de vente" },
  { id: "documents", label: "Documents" },
  { id: "details", label: "Détails" },
  { id: "contact", label: "Contact" },
]

const initialParticipants: Participant[] = [
  {
    id: "1",
    firstName: "Marie",
    lastName: "Dupont",
    phone: "+33612345678",
    email: "client@example.com",
    birthDate: "15/03/1985",
    address: "123 Rue de Paris, 75001 Paris",
    isOrganizer: true,
  },
  {
    id: "2",
    firstName: "Jean",
    lastName: "Dupont",
    phone: "+33698765432",
    email: "jean@example.com",
    birthDate: "20/05/1988",
    address: "123 Rue de Paris, 75001 Paris",
    isOrganizer: false,
  },
]

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = searchParams.get("tab")
  const getTabFromQuery = (): TabId => {
    if (initialTab && TABS.some((tab) => tab.id === initialTab)) {
      return initialTab as TabId
    }
    return "participants"
  }
  const [activeTab, setActiveTab] = useState<TabId>(getTabFromQuery)
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null)
  const [optionQty, setOptionQty] = useState(1)
  // Logique PocketBase : sync avec la collection 'participants'

  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && TABS.some((item) => item.id === tab) && tab !== activeTab) {
      setActiveTab(tab as TabId)
    }
  }, [searchParams, activeTab])

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId)
    router.replace(`/dashboard?tab=${tabId}`, { scroll: false })
  }

  const getAgeFromBirthDate = (birthDate: string) => {
    const match = birthDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
    if (!match) return null
    const day = Number(match[1])
    const month = Number(match[2]) - 1
    const year = Number(match[3])
    const birth = new Date(year, month, day)
    if (Number.isNaN(birth.getTime())) return null
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age -= 1
    }
    return age
  }

  const getParticipantPrice = (participant: Participant) => {
    const age = getAgeFromBirthDate(participant.birthDate)
    if (age !== null && age < 12) return CHILD_PRICE
    return ADULT_PRICE
  }

  const totalPrice = participants.reduce((sum, p) => sum + getParticipantPrice(p), 0)
  const depositAmount = Math.round(totalPrice * 0.35)
  const paidAmount = depositAmount
  const remainingAmount = Math.max(totalPrice - paidAmount, 0)

  useEffect(() => {
    const payload = {
      participants,
      options:
        optionQty > 0
          ? [{ id: "helicopter", label: "Tour en hélicoptère", unitPrice: 2500, quantity: optionQty }]
          : [],
      paidAlready: paidAmount,
    }
    window.localStorage.setItem("ffbc_active_booking", JSON.stringify(payload))
  }, [participants, optionQty, paidAmount])

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

  const addParticipant = (data: Omit<Participant, "id">) => {
    setParticipants((prev) => [...prev, { ...data, id: crypto.randomUUID() }])
  }

  const updateParticipant = (id: string, data: Omit<Participant, "id">) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p)),
    )
  }

  const removeParticipant = (id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id))
  }

  const preparePayment = () => {
    const options =
      optionQty > 0
        ? [{ label: "Tour en hélicoptère", price: 2500 * optionQty }]
        : []
    const payload = {
      participants: participants.map((p) => `${p.firstName} ${p.lastName}`),
      options,
      total_voyage: totalPrice + options.reduce((sum, opt) => sum + opt.price, 0),
      deja_paye: paidAmount,
      acompte_minimum: remainingAmount,
      flux: "dashboard" as const,
    }
    window.localStorage.setItem("current_payment", JSON.stringify(payload))
  }

  return (
    <div className="min-h-screen bg-[#FAFDFD] font-sans text-[#0C4149] antialiased">
      <main className="mx-auto max-w-[1000px] px-6 pb-16 pt-8 sm:px-8 sm:pt-10">
        <header>
          <h1 className="text-2xl font-bold uppercase leading-tight tracking-wide text-[#0C4149]">
            {trip.title}
          </h1>
          <div className="mt-1 flex items-center gap-2 text-[15px] font-normal text-[#0C4149]">
            <Calendar className="size-4 shrink-0 text-[#0C4149]" strokeWidth={2} aria-hidden />
            <span>Du {trip.dateDepart} au {trip.dateRetour}</span>
          </div>
        </header>

        <section
          className="mt-5 mb-8 rounded-[8px] border border-[#0C414933] bg-white px-5 py-7 shadow-none sm:mt-6 sm:px-8 sm:py-8"
          aria-label="Statut de la réservation"
        >
          <h2 className="mb-8 text-[15px] font-bold text-[#0C4149]">
            Statut de votre réservation
          </h2>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:items-start lg:gap-x-6 lg:gap-y-0">
            <ReservationStatusStep
              done
              title="Inscrit"
              subtitle="Réservation créée"
              subtitleTone="muted"
            />
            <ReservationStatusStep
              done
              title="Acompte payé"
              subtitle={`${depositAmount}€`}
              subtitleTone="amount"
            />
            <ReservationStatusStep
              done={false}
              title="Solde restant"
              subtitle={`${remainingAmount}€`}
              subtitleTone="amount"
            />
            <ReservationStatusStep
              done={false}
              title="Confirmé"
              badge="En attente"
            />
          </div>
        </section>

        <nav
          className="mb-6 flex flex-wrap gap-6 sm:gap-8"
          role="tablist"
          aria-label="Navigation du tableau de bord"
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleTabChange(tab.id)}
                className={
                  isActive
                    ? "cursor-pointer border-b-4 border-[#FA673E] bg-transparent pb-2 text-left text-[14px] font-medium text-[#0C4149]"
                    : "cursor-pointer border-b-4 border-transparent bg-transparent pb-2 text-left text-[14px] font-medium text-[#0C4149]"
                }
              >
                {tab.label}
              </button>
            )
          })}
        </nav>

        <div
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
        >
          {activeTab === "participants" ? (
            <section className="w-full max-w-[1120px] rounded-[8px] border border-[#0C414933] bg-white p-5 shadow-none sm:p-6">
              <h2 className="text-[16px] font-bold text-[#0C4149]">Participants</h2>
              <p className="mt-1 text-[14px] text-[#0C4149]">
                Gérez les participants à votre voyage ({participants.length})
              </p>

              <ul className="mt-6 flex list-none flex-col gap-6 p-0">
                {participants.map((participant) => (
                  <li key={participant.id}>
                    <DashboardParticipantCard
                      participant={participant}
                      onEdit={() => openEdit(participant)}
                      onRemove={() => removeParticipant(participant.id)}
                    />
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={openAdd}
                  className="h-[49px] w-full rounded-[8px] border-[#0C4149] bg-white text-[15px] font-bold text-[#0C4149] shadow-none hover:bg-white hover:text-[#0C4149] sm:w-auto sm:min-w-[260px]"
                >
                  Ajouter un participant +
                </Button>
              </div>
            </section>
          ) : activeTab === "paiements" ? (
            <DashboardPaymentsPanel
              totalPrice={totalPrice}
              depositAmount={depositAmount}
              paidAmount={paidAmount}
              remainingAmount={remainingAmount}
              onPreparePayment={preparePayment}
            />
          ) : activeTab === "options" ? (
            <DashboardOptionsPanel
              optionQty={optionQty}
              setOptionQty={setOptionQty}
            />
          ) : activeTab === "contrat" ? (
            <DashboardContractPanel />
          ) : activeTab === "documents" ? (
            <DashboardDocumentsPanel />
          ) : activeTab === "contact" ? (
            <DashboardContactPanel />
          ) : (
            <section className="rounded-[8px] border border-[#0C414933] bg-white p-8 text-center text-[14px] text-[#0C4149] shadow-none">
              Contenu de l’onglet «{" "}
              {TABS.find((t) => t.id === activeTab)?.label} » à venir.
            </section>
          )}
        </div>

        <AddParticipantModal
          open={isModalOpen}
          onOpenChange={handleOpenChange}
          participants={participants}
          editingParticipant={editingParticipant}
          onSave={(data, editingId) => {
            if (editingId) {
              updateParticipant(editingId, data)
            } else {
              addParticipant(data)
            }
            handleOpenChange(false)
          }}
        />

        <footer className="mt-14 border-t border-[#0C414933] pt-8">
          <button
            type="button"
            onClick={() => {
              /* auth */
            }}
            className="ml-auto flex cursor-pointer items-center gap-2 bg-transparent text-sm font-medium text-[#0C4149] underline underline-offset-[3px] decoration-[#0C4149]"
          >
            <LogOut className="size-4 shrink-0 text-[#0C4149]" strokeWidth={2} aria-hidden />
            Se déconnecter
          </button>
        </footer>
      </main>
    </div>
  )
}

function DashboardPaymentsPanel({
  totalPrice,
  depositAmount,
  paidAmount,
  remainingAmount,
  onPreparePayment,
}: {
  totalPrice: number
  depositAmount: number
  paidAmount: number
  remainingAmount: number
  onPreparePayment: () => void
}) {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="min-w-0">
        <h2 className="mb-4 text-[16px] font-bold text-[#0C4149]">
          Résumé des paiements
        </h2>
        <div className="rounded-[8px] border border-[#0C414933] bg-white p-5 shadow-none sm:p-6">
          <div className="divide-y divide-[#0C414933]">
            <div className="flex items-baseline justify-between gap-4 py-3 first:pt-0">
              <span className="text-[14px] font-normal text-[#0C4149]">Prix total :</span>
              <span className="text-right text-[14px] font-bold text-[#0C4149]">{totalPrice}€</span>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-3">
              <span className="text-[14px] font-normal text-[#0C4149]">Acompte (35%) :</span>
              <span className="text-right text-[14px] font-bold text-[#0C4149]">{depositAmount}€</span>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-3">
              <span className="text-[14px] font-normal text-[#0C4149]">Total payé :</span>
              <span className="text-right text-[14px] font-bold text-[#0DBF78]">{paidAmount}€</span>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-3 last:pb-0">
              <span className="text-[14px] font-normal text-[#0C4149]">Solde restant :</span>
              <span className="text-right text-[14px] font-bold text-[#0C4149]">{remainingAmount}€</span>
            </div>
          </div>
        </div>
      </div>

      <div className="min-w-0">
        <h2 className="mb-4 text-[16px] font-bold text-[#0C4149]">
          Historique des paiements
        </h2>
        <div className="flex flex-col rounded-[8px] border border-[#0C414933] bg-white p-5 shadow-none sm:p-6">
          <div className="rounded-[8px] border border-[#0C414933] bg-white p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <span className="text-[18px] font-bold text-[#0C4149]">{depositAmount}€</span>
              <Check
                className="size-5 shrink-0 text-[#0DBF78]"
                strokeWidth={2.5}
                aria-hidden
              />
            </div>
            <ul className="mt-4 space-y-2 text-[14px] text-[#0C4149]">
              <li>
                <span className="font-normal">Date :</span>{" "}
                <span>15/03/2026</span>
              </li>
              <li>
                <span className="font-normal">Montant :</span>{" "}
                <span className="font-bold">{depositAmount}€</span>
              </li>
              <li>
                <span className="font-normal">Méthode :</span>{" "}
                <span>Carte bancaire</span>
              </li>
            </ul>
          </div>

          <Button
            asChild
            variant="outline"
            className="mt-6 h-[49px] w-full rounded-[8px] border-[#0C4149] bg-white text-[15px] font-bold text-[#0C4149] shadow-none hover:bg-white hover:text-[#0C4149]"
          >
            <Link
              href="/paiement?from=dashboard&tab=paiements"
              onClick={onPreparePayment}
              className="inline-flex w-full cursor-pointer items-center justify-center"
            >
              Ajouter un paiement
              <ArrowRight className="ml-2 size-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

function DashboardOptionsPanel({
  optionQty,
  setOptionQty,
}: {
  optionQty: number
  setOptionQty: Dispatch<SetStateAction<number>>
}) {
  const pricePer = 2500
  const total = optionQty * pricePer

  // Pour correspondre au design : le dropdown affiche un placeholder au départ,
  // tandis que le total est calculé via `optionQty`.
  const [selectValue, setSelectValue] = useState<string>("")

  return (
    <section className="max-w-[1120px]">
      <h2 className="text-[16px] font-bold text-[#0C4149]">
        Options disponibles
      </h2>
      <p className="mt-1 text-[14px] text-[#0C414980]">
        Personnalisez votre voyage avec des options supplémentaires
      </p>

      <div className="mt-6 rounded-[8px] border border-[#0C414933] bg-white shadow-none">
        <div className="p-6">
          <h3 className="text-[15px] font-bold text-[#0C4149]">
            Tour en hélicoptère
          </h3>
          <p className="mt-1 text-[14px] text-[#0C414980]">
            Survol du parc en hélicoptère (30 min)
          </p>
          <div className="mt-4 text-[15px] font-bold text-[#0C4149]">
            {pricePer}€
          </div>

          <div className="mt-7 border-t border-[#0C414933] pt-5">
            <div className="text-[14px] font-normal text-[#0C414980]">
              Nombre de participants
            </div>

            <div className="mt-3">
              <Select
                value={selectValue}
                onValueChange={(v) => {
                  setSelectValue(v)
                  setOptionQty(Number.parseInt(v, 10))
                }}
              >
                <SelectTrigger className="w-full h-12 border-[#0C414933] text-[#0C4149] cursor-pointer">
                  <SelectValue placeholder="Nombre de participants" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#0C414933] px-6 py-4">
          <span className="text-[14px] font-normal text-[#0C414980]">
            Total
          </span>
          <span className="text-[15px] font-bold text-[#0C4149]">
            {total}€
          </span>
        </div>
      </div>
    </section>
  )
}

function DashboardContractPanel() {
  return (
    <section className="w-full max-w-[1120px] rounded-[8px] border border-[#0C414933] bg-white p-6 shadow-none">
      <h2 className="text-[16px] font-bold text-[#0C4149]">Contrat de vente et CGV</h2>

      <div className="mt-5 max-h-[500px] overflow-y-auto rounded-[8px] border border-[#0C414933] bg-white p-5 text-[14px] leading-relaxed text-[#0C4149]">
        {/* Ce contenu sera récupéré via PocketBase */}
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
          pellentesque volutpat odio, vitae feugiat lorem varius a. Integer
          sollicitudin risus a libero posuere, vitae facilisis erat aliquet.
        </p>
        <p className="mt-4">
          Sed ultricies efficitur erat, in malesuada elit volutpat sed. Duis
          fringilla finibus magna, ac scelerisque mauris consectetur ac.
          Curabitur non vestibulum lorem. Morbi eleifend, erat in tristique
          commodo, enim risus bibendum velit, id luctus augue nibh a mauris.
        </p>
        <p className="mt-4">
          Aenean posuere ligula eget neque dictum, quis varius est posuere.
          Integer faucibus faucibus lorem, nec interdum tortor euismod sed.
          Nullam et justo nec erat ultrices feugiat. Sed luctus, ligula sit
          amet ultricies luctus, purus orci congue lectus, at commodo massa
          augue ac mauris.
        </p>
        <p className="mt-4">
          Praesent vulputate luctus nisl, vel commodo nulla pharetra quis.
          Mauris eget feugiat augue. Pellentesque habitant morbi tristique
          senectus et netus et malesuada fames ac turpis egestas.
        </p>
      </div>

      <label className="mt-5 flex items-start gap-3 text-[14px] text-[#0C4149]">
        <input
          type="checkbox"
          className="mt-[2px] size-[18px] cursor-pointer rounded-[4px] border border-[#0C4149] accent-[#0C4149]"
        />
        <span>
          Je reconnais avoir pris connaissance du contrat de vente et des
          conditions générales de vente, et je les accepte sans réserve.
        </span>
      </label>
    </section>
  )
}

type DocumentStatus = "pending" | "valid" | "missing"

function DashboardDocumentsPanel() {
  const [selectedParticipant, setSelectedParticipant] = useState("Carl Winslow")
  const filePickerRef = useRef<HTMLInputElement>(null)

  const participants = ["Carl Winslow", "Marie Dupont", "John Doe"]
  const documentsByParticipant: Record<
    string,
    Array<{ name: string; status: DocumentStatus; action: "replace" | "upload" }>
  > = {
    "Carl Winslow": [
      { name: "Passeport", status: "pending", action: "replace" },
      { name: "Visa", status: "valid", action: "upload" },
      { name: "Carnet de vaccination", status: "missing", action: "upload" },
      { name: "Assurance voyage", status: "missing", action: "upload" },
      {
        name: "ESTA (Autorisation électronique de voyage)",
        status: "missing",
        action: "upload",
      },
    ],
    "Marie Dupont": [
      { name: "Passeport", status: "valid", action: "replace" },
      { name: "Visa", status: "pending", action: "upload" },
      { name: "Carnet de vaccination", status: "missing", action: "upload" },
      { name: "Assurance voyage", status: "valid", action: "replace" },
      { name: "ESTA (Autorisation électronique de voyage)", status: "pending", action: "upload" },
    ],
    "John Doe": [
      { name: "Passeport", status: "missing", action: "upload" },
      { name: "Visa", status: "missing", action: "upload" },
      { name: "Carnet de vaccination", status: "pending", action: "upload" },
      { name: "Assurance voyage", status: "missing", action: "upload" },
      { name: "ESTA (Autorisation électronique de voyage)", status: "missing", action: "upload" },
    ],
  }

  const docs = documentsByParticipant[selectedParticipant] ?? []

  const statusBadgeClasses: Record<DocumentStatus, string> = {
    pending: "text-[#F59E0B] bg-[#FEF3C7]",
    valid: "text-[#10B981] bg-[#D1FAE5]",
    missing: "text-[#EF4444] bg-[#FEE2E2]",
  }

  const statusText: Record<DocumentStatus, string> = {
    pending: "En attente de validation",
    valid: "Valide",
    missing: "Manquant",
  }

  const triggerFileAction = () => {
    filePickerRef.current?.click()
  }

  return (
    <section className="w-full max-w-[1120px] rounded-[8px] border border-[#0C414933] bg-white p-5 shadow-none sm:p-6">
      <h2 className="text-[16px] font-bold text-[#0C4149]">Documents requis</h2>
      <p className="mt-1 text-[14px] text-[#0C414980]">
        Téléchargez les documents nécessaires pour votre voyage
      </p>

      <div className="mt-5 overflow-x-auto whitespace-nowrap snap-x snap-mandatory scrollbar-hide [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="inline-flex gap-2">
          {participants.map((participant) => {
            const isActive = participant === selectedParticipant
            return (
              <button
                key={participant}
                type="button"
                onClick={() => setSelectedParticipant(participant)}
                className={`snap-start rounded-[8px] border border-[#0C414933] px-3 py-2 text-[13px] ${
                  isActive
                    ? "font-bold text-[#0C4149] underline decoration-[#FA673E] underline-offset-4"
                    : "font-medium text-[#0C4149]"
                }`}
              >
                {participant}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {docs.map((doc) => (
          <div
            key={doc.name}
            className="flex flex-col gap-3 rounded-[8px] border border-[#0C414933] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-bold text-[#0C4149]">{doc.name}</p>
              <span
                className={`mt-2 inline-flex rounded-full px-3 py-1 text-[12px] font-medium ${statusBadgeClasses[doc.status]}`}
              >
                {statusText[doc.status]}
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={triggerFileAction}
              className="h-[40px] w-full rounded-[8px] border-[#0C4149] bg-white text-[#0C4149] shadow-none hover:bg-white hover:text-[#0C4149] sm:w-auto"
            >
              {doc.action === "replace" ? "Remplacer" : "Télécharger"}
            </Button>
          </div>
        ))}
      </div>

      <input
        ref={filePickerRef}
        type="file"
        className="hidden"
        aria-hidden
      />
    </section>
  )
}

function DashboardContactPanel() {
  return (
    <section className="w-full max-w-[1120px] rounded-[8px] border border-[#0C414933] bg-white p-6 shadow-none">
      <h2 className="text-[16px] font-bold text-[#0C4149]">Informations de contact</h2>

      <div className="mt-5 flex flex-col gap-4">
        <ContactRow
          icon={Mail}
          title="Email"
          value="contact@voyages-aventure.fr"
          note="Réponse sous 24h en semaine"
        />
        <ContactRow
          icon={Phone}
          title="Téléphone"
          value="+33 1 23 45 67 89"
          note="Lundi - Vendredi: 9h-18h"
        />
        <ContactRow
          icon={Clock3}
          title="Horaires d'ouverture"
          value="Lundi - Vendredi: 9h-18h"
          note="Samedi & Dimanche: Fermé"
        />
      </div>
    </section>
  )
}

function ContactRow({
  icon: Icon,
  title,
  value,
  note,
}: {
  icon: typeof Mail
  title: string
  value: string
  note: string
}) {
  return (
    <div className="rounded-[8px] border border-[#0C414933] bg-white p-4 sm:p-5">
      <div className="flex items-start gap-4">
        <Icon className="size-5 shrink-0 text-[#0C4149]" strokeWidth={1.8} aria-hidden />
        <div className="min-w-0">
          <h3 className="text-[16px] font-bold text-[#0C4149]">{title}</h3>
          <p className="mt-2 text-[15px] font-medium text-[#0C4149]">{value}</p>
          <p className="mt-1 text-[14px] text-[#0C414980]">{note}</p>
        </div>
      </div>
    </div>
  )
}

/** Icône : cercle vert + check (étape faite) ou cercle vide fin (à venir) — comme le design joint. */
function ReservationStatusIcon({ done }: { done: boolean }) {
  if (done) {
    return (
      <div
        className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#0DBF78]"
        aria-hidden
      >
        <Check className="size-3 text-white" strokeWidth={3} />
      </div>
    )
  }
  return (
    <div
      className="box-border size-5 shrink-0 rounded-full border-2 border-[#0C414933] bg-white"
      aria-hidden
    />
  )
}

type SubtitleTone = "muted" | "amount"

function ReservationStatusStep({
  done,
  title,
  subtitle,
  subtitleTone,
  badge,
}: {
  done: boolean
  title: string
  subtitle?: string
  subtitleTone?: SubtitleTone
  badge?: string
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <ReservationStatusIcon done={done} />
      <div className="min-w-0">
        <p className="text-[14px] font-normal leading-snug text-[#0C4149]">{title}</p>
        {subtitle != null && subtitleTone === "muted" ? (
          <p className="mt-1 text-[12px] font-normal leading-snug text-[#0C414980]">
            {subtitle}
          </p>
        ) : null}
        {subtitle != null && subtitleTone === "amount" ? (
          <p className="mt-1 text-[13px] font-bold leading-snug text-[#0C4149]">{subtitle}</p>
        ) : null}
        {badge ? (
          <span className="mt-1 inline-block rounded-full border border-[#0C414933] bg-[#F4F8F8] px-2.5 py-1 text-[12px] font-normal text-[#0C4149]">
            {badge}
          </span>
        ) : null}
      </div>
    </div>
  )
}

function CrownIcon() {
  return (
    <svg
      width="18"
      height="14"
      viewBox="0 0 18 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M9 0L11.5 4L16 2.5L14 7L16 12H2L4 7L2 2.5L6.5 4L9 0Z"
        fill="#DFD400"
      />
    </svg>
  )
}

function DashboardParticipantCard({
  participant,
  onEdit,
  onRemove,
}: {
  participant: Participant
  onEdit: () => void
  onRemove: () => void
}) {
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
      className="cursor-pointer rounded-[8px] border border-[#0C414933] bg-white p-5 shadow-none outline-none transition-colors hover:border-[#0C4149] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0C4149]"
    >
      <div className="flex gap-4">
        <div
          className="flex size-12 shrink-0 items-center justify-center rounded-full border border-[#0C414933] bg-white"
          aria-hidden
        >
          <UserRound className="size-7 text-[#0C4149]" strokeWidth={1.5} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 gap-y-1">
            <span className="text-[15px] font-bold text-[#0C4149]">
              {participant.firstName} {participant.lastName}
            </span>
            {participant.isOrganizer ? <CrownIcon /> : null}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onRemove()
              }}
              className="ml-auto inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-[6px] border border-[#0C414933] bg-white text-[#0C4149] hover:border-[#0C4149] hover:bg-[#0C414905]"
              aria-label={`Supprimer ${participant.firstName} ${participant.lastName}`}
            >
              <Trash2 className="size-4" aria-hidden />
            </button>
          </div>
          <p className="mt-1 text-[13px] text-[#0C4149]">
            {participant.isOrganizer ? "Chef de famille" : "Participant"}
          </p>
          <div className="mt-3 flex flex-col gap-1.5 text-[14px] text-[#0C4149]">
            <p>
              <span className="text-[#0C4149]">Né(e) le :</span> {participant.birthDate}
            </p>
            <p>
              <span className="text-[#0C4149]">Téléphone :</span> {participant.phone}
            </p>
            <p>
              <span className="text-[#0C4149]">Email :</span> {participant.email}
            </p>
            <p>
              <span className="text-[#0C4149]">Adresse :</span> {participant.address}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
