"use client"

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowRight, Calendar, Check, Clock3, LogOut, Mail, Phone, Trash2, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { AddParticipantModal } from "@/components/add-participant-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Participant } from "@/app/page"

const ADULT_PRICE = 1500
const CHILD_PRICE = 1000

const mockOptionsSupp = [
  {
    id: 2,
    nom: "Promenade à cheval",
    description: "Balade guidée en pleine nature",
    prix: 15000, // 150€
  },
  {
    id: 3,
    nom: "Workout avec un coach sportif",
    description: "Session fitness personnalisée",
    prix: 10000, // 100€
  },
  {
    id: 4,
    nom: "Virée en jet ski",
    description: "Session jet ski 30 minutes",
    prix: 13000, // 130€
  },
] as const

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
  type RightOptionId = (typeof mockOptionsSupp)[number]["id"]
  const [optionsSuppState, setOptionsSuppState] = useState<
    Record<RightOptionId, { checked: boolean; qty: number }>
  >({
    2: { checked: false, qty: 1 },
    3: { checked: false, qty: 1 },
    4: { checked: false, qty: 1 },
  })
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

  const baseTravelPrice = participants.reduce(
    (sum, p) => sum + getParticipantPrice(p),
    0,
  )

  const helicopterTotal = optionQty * 2500

  const rightOptionsTotal = mockOptionsSupp.reduce((sum, opt) => {
    const state = optionsSuppState[opt.id]
    if (!state?.checked) return sum
    return sum + (opt.prix / 100) * state.qty
  }, 0)

  const totalOptionsGeneral = helicopterTotal + rightOptionsTotal

  const totalPrice = baseTravelPrice + helicopterTotal + rightOptionsTotal

  const depositAmount = Math.round(totalPrice * 0.35)
  const paidAmount = depositAmount
  const remainingAmount = Math.max(totalPrice - paidAmount, 0)

  useEffect(() => {
    const payload = {
      participants,
      options: [
        optionQty > 0
          ? {
              id: "helicopter",
              label: "Tour en hélicoptère",
              unitPrice: 2500,
              quantity: optionQty,
            }
          : null,
        ...mockOptionsSupp
          .filter((opt) => optionsSuppState[opt.id].checked)
          .map((opt) => ({
            id: String(opt.id),
            label: opt.nom,
            unitPrice: opt.prix / 100,
            quantity: optionsSuppState[opt.id].qty,
          })),
      ].filter(Boolean),
      paidAlready: paidAmount,
    }
    window.localStorage.setItem("ffbc_active_booking", JSON.stringify(payload))
  }, [participants, optionQty, optionsSuppState, paidAmount])

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
    const options = [
      optionQty > 0
        ? { label: "Tour en hélicoptère", price: 2500 * optionQty }
        : null,
      ...mockOptionsSupp
        .filter((opt) => optionsSuppState[opt.id].checked)
        .map((opt) => ({
          label: opt.nom,
          price: (opt.prix / 100) * optionsSuppState[opt.id].qty,
        })),
    ].filter(Boolean)
    const payload = {
      participants: participants.map((p) => `${p.firstName} ${p.lastName}`),
      options,
      total_voyage: totalPrice,
      deja_paye: paidAmount,
      acompte_minimum: depositAmount,
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
              optionsSuppState={optionsSuppState}
              setOptionsSuppState={setOptionsSuppState}
              totalOptionsGeneral={totalOptionsGeneral}
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
  optionsSuppState,
  setOptionsSuppState,
  totalOptionsGeneral,
}: {
  optionQty: number
  setOptionQty: Dispatch<SetStateAction<number>>
  optionsSuppState: Record<
    (typeof mockOptionsSupp)[number]["id"],
    { checked: boolean; qty: number }
  >
  setOptionsSuppState: Dispatch<
    SetStateAction<
      Record<(typeof mockOptionsSupp)[number]["id"], { checked: boolean; qty: number }>
    >
  >
  totalOptionsGeneral: number
}) {
  const pricePer = 2500
  const total = optionQty * pricePer

  // Pour correspondre au design : le dropdown affiche un placeholder au départ,
  // tandis que le total est calculé via `optionQty`.
  const [selectValue, setSelectValue] = useState<string>("")

  return (
    <section className="max-w-[1120px]">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start items-start">
        {/* Colonne gauche */}
        <div
          className="min-w-0 max-h-[500px] overflow-y-auto pr-2"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#0C414933 transparent" }}
        >
          <h2 className="text-[16px] font-bold text-[#0C4149]">
            Options disponibles
          </h2>
          <p className="mt-1 text-[14px] text-[#0C4149CC]">
            Personnalisez votre voyage avec des options supplémentaires
          </p>

          <div className="mt-6 rounded-[8px] border border-[#0C414933] bg-white shadow-none">
            <div className="p-6">
              <h3 className="text-[15px] font-bold text-[#0C4149]">
                Tour en hélicoptère
              </h3>
              <p className="mt-1 text-[14px] text-[#0C4149CC]">
                Survol du parc en hélicoptère (30 min)
              </p>
              <div className="mt-4 text-[15px] font-bold text-[#0C4149]">
                {pricePer}€
              </div>

              <div className="mt-7 border-t border-[#0C414933] pt-5">
                <div className="text-[14px] font-normal text-[#0C4149CC]">
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
              <span className="text-[14px] font-normal text-[#0C4149CC]">
                Total
              </span>
              <span className="text-[15px] font-bold text-[#0C4149]">
                {total}€
              </span>
            </div>
          </div>

          <div className="mt-6 rounded-[8px] border border-[#0C414933] bg-white">
            <div className="flex items-center justify-between px-6 py-4">
              <span className="text-[14px] font-normal text-[#0C4149CC]">
                Total général des options
              </span>
              <span className="text-[15px] font-bold text-[#0C4149]">
                {totalOptionsGeneral}€
              </span>
            </div>
          </div>
        </div>

        {/* Colonne droite */}
        <div
          className="min-w-0 max-h-[500px] overflow-y-auto pr-2"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#0C414933 transparent" }}
        >
          <h3 className="mt-0 text-[15px] font-bold text-[#0C4149]">
            Options supplémentaires
          </h3>
          <p className="mt-1 text-[14px] text-[#0C4149CC]">
            Cochez les options souhaitées
          </p>

          <div className="mt-6 flex flex-col gap-4">
            {mockOptionsSupp.map((opt) => {
              const state = optionsSuppState[opt.id]
              const checked = state?.checked ?? false
              const qty = state?.qty ?? 1
              const optionPriceEuro = opt.prix / 100
              const optionTotal = checked ? optionPriceEuro * qty : 0

              return (
                <div
                  key={opt.id}
                  className="rounded-[8px] border border-[#0C414933] bg-white p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) => {
                          const isChecked = v === true
                          setOptionsSuppState((prev) => ({
                            ...prev,
                            [opt.id]: { checked: isChecked, qty },
                          }))
                        }}
                        className="border-[#0C414933] data-[state=checked]:bg-[#0C4149] data-[state=checked]:border-[#0C4149]"
                        aria-label={`Option ${opt.nom}`}
                      />
                      <span className="text-[14px] font-semibold text-[#0C4149]">
                        {opt.nom}
                      </span>
                    </div>

                    <span className="text-[14px] font-bold text-[#0C4149]">
                      {optionPriceEuro}€
                    </span>
                  </div>

                  {checked ? (
                    <div className="mt-4">
                      <div className="text-[14px] font-normal text-[#0C4149CC]">
                        Nombre de participants
                      </div>
                      <div className="mt-3">
                        <Select
                          value={String(qty)}
                          onValueChange={(v) => {
                            const nextQty = Number.parseInt(v, 10)
                            setOptionsSuppState((prev) => ({
                              ...prev,
                              [opt.id]: { checked: true, qty: nextQty },
                            }))
                          }}
                        >
                          <SelectTrigger className="w-full h-12 border-[#0C414933] text-[#0C4149] cursor-pointer">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                              <SelectItem key={n} value={String(n)}>
                                {n}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-4 border-t border-[#0C414933] pt-4 flex items-center justify-between">
                    <span className="text-[14px] font-normal text-[#0C4149CC]">
                      Total
                    </span>
                    <span className="text-[15px] font-bold text-[#0C4149]">
                      {optionTotal}€
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function DashboardContractPanel() {
  const [accepted, setAccepted] = useState(false)
  const [signedAt, setSignedAt] = useState<string | null>(null)

  const handleSign = () => {
    if (!accepted || signedAt) return
    const formatted = new Date().toLocaleDateString("fr-FR")
    setSignedAt(formatted)
  }

  return (
    <section className="w-full max-w-[1120px] rounded-[8px] border border-[#0C414933] bg-white p-6 shadow-none">
      <h2 className="text-[16px] font-bold text-[#0C4149]">Contrat de vente et CGV</h2>

      <div className="mt-5 max-h-[400px] overflow-y-auto rounded-[8px] border border-[#0C414933] bg-white p-6 text-[14px] leading-[1.6] text-[#0C4149CC]">
        <h3 className="font-semibold text-[#0C4149] text-[15px] leading-[1.6] mb-4">
          CONTRAT DE VENTE DE SEJOURS NBA
        </h3>

        <div className="space-y-4">
          <div>
            <span className="font-semibold text-[#0C4149]">Vendeur : </span>
            <div className="mt-1">
              <div>SARL F.F.B. Camps</div>
              <div>1 Impasse du PEBE</div>
              <div>64121 Serres Castet</div>
              <div>SIRET : 49501277500021</div>
              <div>Licence d'agence de voyage : IM64240002</div>
              <div>
                Assurance responsabilite civile professionnelle :
              </div>
              <div>
                Assurance Hiscox France, 19 rue Louis le Grand 75002 Paris
              </div>
              <div>
                (Titulaire du contrat n°HSXIN320044454A souscrit au
                auprès de la compagnie)
              </div>
              <div>Représentée par : Olivier Coustal</div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-[#0C4149] text-[14px]">
              1. Objet du contrat
            </h4>
            <p className="mt-2">
              Le present contrat a pour objet la vente d'un sejour organise par
              l'Agence aux Etats-Unis, principalement a Los Angeles et/ou New
              York, axe sur le theme du basketball, comprenant les vols,
              l'hebergement, les billets pour les matchs, les transferts, les
              activites en fonction des sejours.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-[#0C4149] text-[14px]">
              2. Description du séjour
            </h4>
            <p className="mt-2 mb-2">
              Le sejour comprend :
            </p>
            <ul className="list-disc pl-5">
              <li>
                Hébergement : hôtel 3/4 étoiles à proximité des sites d'intérêt
              </li>
              <li>
                Activités : billets pour matchs de basketball (visites guidées
                en fonction des séjours)
              </li>
              <li>
                Transport : vols aller-retour, transferts aéroport/hôtel
              </li>
              <li>
                Assurance : assurance optionnelle via Chapka
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#0C4149] text-[14px]">
              3. Prix et modalités de paiement
            </h4>
            <ul className="list-disc pl-5 mt-2">
              <li>Prix total du séjour : TTC</li>
              <li>Acompte à verser à la réservation : 35%</li>
              <li>Solde à payer : 40 jours avant le départ</li>
              <li>
                Modalités de paiement : CB, virement, chèque, ANCV à hauteur de
                500€
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#0C4149] text-[14px]">
              4. Droit de rétractation
            </h4>
            <p className="mt-2">
              Conformément à l'article L.221-28 du Code de la consommation, le
              Client ne dispose pas d'un droit de rétractation pour les
              prestations de services d'hébergement, de transport, de
              restauration ou de loisirs réservées à une date ou une période
              déterminée.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-[#0C4149] text-[14px]">
              5. Modification et annulation
            </h4>
            <p className="mt-2 font-normal">
              Annulation par le Client :
            </p>
            <ul className="list-disc pl-5">
              <li>Plus de 80 jours avant le départ : 50% du prix total TTC</li>
              <li>
                De 80 à 41 jours avant le départ : 80% du prix total TTC
              </li>
              <li>
                Moins de 40 jours avant le départ : 100% du prix total TTC
              </li>
            </ul>
            <p className="mt-2">
              Toute demande d'annulation doit être notifiée par écrit.
            </p>
            <p className="mt-2">
              Annulation ou modification par l'Agence :
            </p>
            <p className="mt-2">
              En cas d'impossibilité d'exécuter le séjour en raison de
              circonstances exceptionnelles, l'Agence proposera une solution
              alternative ou un remboursement intégral.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-[#0C4149] text-[14px]">
              6. Assurance et responsabilité
            </h4>
            <p className="mt-2">
              L'Agence recommande au Client de souscrire une assurance annulation,
              assistance et rapatriement (Chapka Assurances).
            </p>
            <p className="mt-2">
              L'Agence ne pourra être tenue responsable en cas de force majeure
              (catastrophes naturelles, grèves, épidémies).
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-[#0C4149] text-[14px]">
              7. Données personnelles
            </h4>
            <p className="mt-2">
              Les données personnelles du Client sont collectées conformément au
              RGPD. Elles sont utilisées uniquement dans le cadre de la réservation
              et de l'exécution du séjour.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-[#0C4149] text-[14px]">
              8. Règlement des litiges
            </h4>
            <p className="mt-2">
              En cas de litige, les parties s'efforceront de trouver une solution
              amiable. À défaut, le litige sera soumis aux tribunaux compétents.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-[#0C4149] text-[14px]">
              9. Mentions légales obligatoires
            </h4>
            <p className="mt-2">
              Garant financier : APST 15, avenue Carnot 75017 Paris
              <br />
              Organisme de médiation : Médiateur du Tourisme et du Voyage.
              <br />
              Plateforme de règlement en ligne :
              <br />
              https://webgate.ec.europa.eu/odr
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-[#0C4149] text-[14px]">
              10. Acceptation
            </h4>
            <p className="mt-2">
              Le Client reconnaît avoir pris connaissance et accepté les termes du
              présent contrat ainsi que les conditions générales de vente annexées.
            </p>
          </div>
        </div>
      </div>

      <label className="mt-5 flex cursor-pointer items-start gap-3 text-[14px] text-[#0C4149]">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          disabled={signedAt != null}
          className="mt-[2px] size-[18px] cursor-pointer rounded-[4px] border border-[#0C4149] accent-[#0C4149]"
        />
        <span>
          Je reconnais avoir pris connaissance du contrat de vente et des
          conditions générales de vente, et je les accepte sans réserve.
        </span>
      </label>

      <div className="mt-4">
        <Button
          type="button"
          disabled={!accepted || signedAt != null}
          onClick={handleSign}
          className="h-[49px] w-full rounded-[8px] bg-[#FA673E] hover:bg-[#FF592A] text-[15px] font-bold shadow-none"
        >
          Valider et signer
        </Button>

        {signedAt ? (
          <div className="mt-4 inline-flex w-full justify-center rounded-full bg-[#0DBF78] px-4 py-1 text-[12px] font-semibold text-white">
            Contrat signé le {signedAt}
          </div>
        ) : null}
      </div>
    </section>
  )
}

type DocumentStatus = "pending" | "valid" | "missing"

function DashboardDocumentsPanel() {
  const filePickerRef = useRef<HTMLInputElement>(null)
  const [selectedParticipant, setSelectedParticipant] = useState("Carl Winslow")

  const DOCUMENTS_PAR_TYPE = {
    famille: ["Passeport", "ESTA (Autorisation électronique de voyage)"],
    adulte: ["Passeport", "ESTA (Autorisation électronique de voyage)"],
    ado: [
      "Passeport",
      "ESTA (Autorisation électronique de voyage)",
      "Livret de famille",
      "AST (Autorisation de Sortie du Territoire)",
      "CNI ou Passeport du parent signataire de l'AST",
      "Copie carnet de santé avec vaccins à jour",
      "Fiche sanitaire de liaison",
    ],
  } as const

  const mockTrip = {
    type: "famille",
  } as const

  type DocStatus = "valide" | "en_attente" | "manquant"

  const statusBadgeClasses: Record<
    DocStatus,
    { bg: string; text: string; label: string }
  > = {
    valide: { bg: "bg-[#0DBF7820]", text: "text-[#0DBF78]", label: "Validé" },
    en_attente: {
      bg: "bg-[#F59E0B20]",
      text: "text-[#F59E0B]",
      label: "En attente de validation",
    },
    manquant: {
      bg: "bg-[#D800121A]",
      text: "text-[#D80012]",
      label: "Manquant",
    },
  }

  const mockParticipants = [
    {
      id: 1,
      nom: "Carl Winslow",
      documents: [
        { nom: "Passeport", statut: "en_attente" as const },
        { nom: "ESTA", statut: "manquant" as const },
      ],
    },
    {
      id: 2,
      nom: "Marie Dupont",
      documents: [
        { nom: "Passeport", statut: "valide" as const },
        { nom: "ESTA", statut: "manquant" as const },
      ],
    },
    {
      id: 3,
      nom: "John Doe",
      documents: [
        { nom: "Passeport", statut: "manquant" as const },
        { nom: "ESTA", statut: "manquant" as const },
      ],
    },
  ]

  const triggerFileAction = () => {
    filePickerRef.current?.click()
  }

  const participant = mockParticipants.find((p) => p.nom === selectedParticipant)

  const isSameDoc = (docFromParticipant: string, docFromType: string) => {
    if (docFromParticipant === docFromType) return true
    if (docFromParticipant === "ESTA" && docFromType.startsWith("ESTA")) return true
    return false
  }

  const docsToRender = DOCUMENTS_PAR_TYPE[mockTrip.type]

  return (
    <section className="w-full max-w-[1120px] rounded-[8px] border border-[#0C414933] bg-white p-5 shadow-none sm:p-6">
      <h2 className="text-[16px] font-bold text-[#0C4149]">Documents requis</h2>
      <p className="mt-1 text-[14px] text-[#0C4149CC]">
        Téléchargez les documents nécessaires pour votre voyage
      </p>

      <div className="mt-5 overflow-x-auto whitespace-nowrap scrollbar-hide [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="inline-flex gap-2">
          {mockParticipants.map((p) => {
            const isActive = p.nom === selectedParticipant
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedParticipant(p.nom)}
                className={`snap-start rounded-[8px] border px-3 py-2 text-[13px] ${
                  isActive
                    ? "bg-[#0C4149] border-[#0C4149] text-white"
                    : "border-[#0C414933] bg-white text-[#0C4149]"
                }`}
              >
                {p.nom}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {docsToRender.map((docName) => {
          // Visa n'est plus requis : ne figure pas dans DOCUMENTS_PAR_TYPE
          const docFromParticipant = participant?.documents.find((d) =>
            isSameDoc(d.nom, docName),
          )
          const status = docFromParticipant?.statut ?? ("manquant" as const)
          const badge = statusBadgeClasses[status]
          const actionLabel =
            status === "manquant" ? "Télécharger" : "Remplacer"

          return (
            <div
              key={docName}
              className="flex flex-col gap-3 rounded-[8px] border border-[#0C414933] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <FileTextIcon />
                  <p className="truncate text-[15px] font-semibold text-[#0C4149]">
                    {docName}
                  </p>
                </div>

                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-[12px] font-medium ${badge.bg} ${badge.text}`}
                >
                  {badge.label}
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={triggerFileAction}
                className="h-[40px] w-full rounded-[8px] border-[#0C4149] bg-white text-[#0C4149] shadow-none hover:bg-white hover:text-[#0C4149] sm:w-auto"
              >
                {actionLabel}
              </Button>
            </div>
          )
        })}
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

function FileTextIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M7.2 2.9H12.2L16 6.7V15.8C16 16.3 15.6 16.7 15.1 16.7H7.2C6.7 16.7 6.3 16.3 6.3 15.8V3.8C6.3 3.3 6.7 2.9 7.2 2.9Z"
        stroke="#0C4149"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M12.1 2.9V6.2C12.1 6.5 12.4 6.8 12.7 6.8H16"
        stroke="#0C4149"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M8 10H12.4"
        stroke="#0C4149"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M8 12.7H11.3"
        stroke="#0C4149"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
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
          <p className="mt-1 text-[14px] text-[#0C4149CC]">{note}</p>
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
          <p className="mt-1 text-[12px] font-normal leading-snug text-[#0C4149CC]">
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
