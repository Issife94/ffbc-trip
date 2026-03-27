"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

type PaymentOption = {
  label: string
  price: number
}

type CurrentPayment = {
  participants: string[]
  options: PaymentOption[]
  total_voyage: number
  deja_paye: number
  acompte_minimum: number
  flux: "inscription" | "dashboard"
}

export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [promoCode, setPromoCode] = useState("")
  const [appliedPromoCode, setAppliedPromoCode] = useState("")
  const [customAmount, setCustomAmount] = useState("")
  const [paymentData, setPaymentData] = useState<CurrentPayment | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const raw = window.localStorage.getItem("current_payment")
    if (!raw) {
      router.replace("/dashboard")
      return
    }
    try {
      const parsed = JSON.parse(raw) as CurrentPayment
      if (!parsed || !Array.isArray(parsed.participants) || !Array.isArray(parsed.options)) {
        router.replace("/dashboard")
        return
      }
      setPaymentData(parsed)
      setIsReady(true)
    } catch {
      router.replace("/dashboard")
    }
  }, [router])

  useEffect(() => {
    if (!paymentData) return
    if (paymentData.flux === "inscription") {
      setCustomAmount(String(paymentData.acompte_minimum))
      return
    }
    setCustomAmount("")
  }, [paymentData])

  if (!isReady || !paymentData) {
    return null
  }

  const isDashboardFlow = paymentData.flux === "dashboard"
  const isInscriptionFlow = paymentData.flux === "inscription"
  const participantsCount = paymentData.participants.length
  const optionsTotal = paymentData.options.reduce((sum, option) => sum + option.price, 0)
  const participantsBaseTotal = Math.max(paymentData.total_voyage - optionsTotal, 0)
  const totalTripPrice = paymentData.total_voyage
  const paidAlready = paymentData.deja_paye
  const minimumDeposit = paymentData.acompte_minimum
  const soldeRestant = Math.max(totalTripPrice - paidAlready, 0)

  const discountAmount = appliedPromoCode ? 250 : 0
  const finalTotal = Math.max(totalTripPrice - discountAmount, 0)

  const parsedCustomAmount = Number.parseInt(customAmount || "0", 10)
  const minAllowedAmount = isInscriptionFlow ? minimumDeposit : 1
  const maxAllowedAmount = soldeRestant
  const isCustomAmountValid =
    Number.isFinite(parsedCustomAmount) &&
    parsedCustomAmount >= minAllowedAmount &&
    parsedCustomAmount <= maxAllowedAmount
  const showAmountTooHighError = customAmount !== "" && parsedCustomAmount > maxAllowedAmount
  const showAmountTooLowError = customAmount !== "" && parsedCustomAmount < minAllowedAmount

  const defaultEditableAmount = isInscriptionFlow ? minimumDeposit : ""
  const payableAmount = isCustomAmountValid
    ? parsedCustomAmount
    : typeof defaultEditableAmount === "number"
      ? defaultEditableAmount
      : 0

  const handleValidatePayment = () => {
    window.localStorage.removeItem("current_payment")
    if (paymentData.flux === "dashboard") {
      router.push("/dashboard?tab=paiements")
      return
    }
    router.push("/")
  }

  const handleBack = () => {
    const from = searchParams.get("from")
    const tab = searchParams.get("tab")
    if (from === "dashboard" || paymentData.flux === "dashboard") {
      router.push(`/dashboard${tab ? `?tab=${tab}` : "?tab=paiements"}`)
      return
    }
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-[#FAFDFD] pb-20">
      <main className="mx-auto max-w-[1120px] space-y-6 px-6">
        {/* Titre PAIEMENT */}
        <div className="bg-white border border-[#0C414933] p-6 rounded-[8px]">
          <h2 className="text-[15px] font-black uppercase text-[#0C4149]">Paiement</h2>
        </div>

        {/* Modes de paiement */}
        <div className="bg-white border border-[#0C414933] p-6 rounded-[8px]">
          <label className="mb-4 block text-[14px] font-medium text-[#0C4149]">
            Sélectionner le mode paiement
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { id: "card", label: "Carte bancaire" },
              { id: "transfer", label: "Virement" },
              { id: "check", label: "Chèque bancaire" },
              { id: "ancv", label: "ANCV (Chèque vacances)" },
            ].map((method) => {
              const isActive = paymentMethod === method.id
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  className={
                    isActive
                      ? "h-[49px] rounded-[8px] border border-[#0C4149] bg-white px-4 text-left text-[14px] font-bold text-[#0C4149] cursor-pointer"
                      : "h-[49px] rounded-[8px] border border-[#0C414933] bg-white px-4 text-left text-[14px] font-medium text-[#0C4149] transition-colors hover:border-[#0C414966] cursor-pointer"
                  }
                >
                  {method.label}
                </button>
              )
            })}
          </div>
        </div>

        <section className="rounded-[8px] border border-[#0C414933] bg-white p-6">
          <h3 className="text-[15px] font-bold text-[#0C4149]">Votre commande</h3>
          <div className="mt-4 flex items-center justify-between text-[14px] text-[#0C4149]">
            <span>{participantsCount} participant(s)</span>
            <span className="font-bold">{participantsBaseTotal}€</span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {paymentData.participants.map((participant, idx) => (
              <span
                key={`${participant}-${idx}`}
                className="rounded-full border border-[#0C414933] bg-white px-3 py-1 text-[13px] text-[#0C4149]"
              >
                {participant}
              </span>
            ))}
          </div>

          {paymentData.options.length > 0 ? (
            <div className="mt-4 border-t border-[#0C414933] pt-4 space-y-2">
              {paymentData.options.map((option, index) => (
                <div key={`${option.label}-${index}`} className="flex items-center justify-between text-[14px] text-[#0C4149]">
                  <span>{option.label}</span>
                  <span className="font-bold">{option.price}€</span>
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-4 border-t border-[#0C414933] pt-4 space-y-2 text-[14px] text-[#0C4149]">
            <div className="flex items-center justify-between">
              <span>Prix total du voyage</span>
              <span className="font-bold">{totalTripPrice}€</span>
            </div>
            {isDashboardFlow ? (
              <>
                <div className="flex items-center justify-between">
                  <span>Déjà réglé</span>
                  <span className="font-bold">{paidAlready}€</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Solde restant</span>
                  <span className="font-bold">{soldeRestant}€</span>
                </div>
              </>
            ) : null}
          </div>
        </section>

        {/* Contenu Dynamique */}
        <div className="bg-white border border-[#0C414933] p-6 rounded-[8px]">
          {paymentMethod === "card" && (
            <div className="space-y-6">
              <h3 className="text-[14px] font-bold text-[#0C4149]">Prix estimé</h3>
              <div className="flex justify-between items-center text-[15px]">
                <span className="text-[#0C4149] opacity-70">👤 {participantsCount} participant(s)</span>
                <span className="font-bold text-[#0C4149]">{totalTripPrice}€</span>
              </div>

              <div className="space-y-2">
                <label className="block text-[14px] font-medium text-[#0C4149]">Montant</label>
                <input
                  type="number"
                  min={minAllowedAmount}
                  max={maxAllowedAmount}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder={String(defaultEditableAmount)}
                  className="h-[49px] w-full rounded-[8px] border border-[#0C414933] bg-white px-3 text-[14px] text-[#0C4149] outline-none focus:border-[#FA673E] focus:ring-1 focus:ring-[#FA673E]"
                />
                {isDashboardFlow ? (
                  <p className="text-sm italic text-[#0C4149] opacity-70">
                    Solde restant à régler : {soldeRestant} €
                  </p>
                ) : (
                  <p className="text-sm italic text-[#0C4149] opacity-70">
                    Vous pouvez payer le montant souhaité (minimum acompte : {minimumDeposit} €).
                  </p>
                )}
                {showAmountTooHighError ? (
                  <p className="text-sm text-[#C62828]">
                    Le montant ne peut pas dépasser le solde restant de {soldeRestant} €.
                  </p>
                ) : null}
                {showAmountTooLowError ? (
                  <p className="text-sm text-[#C62828]">
                    Le montant minimum est de {minimumDeposit} € pour valider votre réservation.
                  </p>
                ) : null}
              </div>

              <div className="space-y-3">
                <label className="block text-[14px] font-medium text-[#0C4149]">
                  Vous avez un code promo ?
                </label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Code"
                    className="h-[49px] w-full rounded-[8px] border border-[#0C414933] bg-white px-3 text-[14px] text-[#0C4149] outline-none focus:border-[#FA673E] focus:ring-1 focus:ring-[#FA673E]"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAppliedPromoCode(promoCode.trim())}
                    className="h-[49px] w-full rounded-[8px] border-[#0C4149] bg-white px-6 text-[15px] font-bold text-[#0C4149] hover:bg-white hover:text-[#0C4149] sm:w-auto"
                  >
                    Appliquer
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t border-[#0C414911] space-y-3">
                <div className="flex justify-between text-[#0C4149]">
                  <span>Total</span>
                  <span className="font-bold">{totalTripPrice}€</span>
                </div>
                {appliedPromoCode ? (
                  <div className="flex justify-between text-[#C62828]">
                    <span>Remise</span>
                    <span className="font-bold">-{discountAmount}€</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-[#0C4149]">
                  <span>Total final</span>
                  <span className="font-bold">{finalTotal}€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#0C4149]">Acompte (35%)</span>
                  <span className="font-bold text-[#FA673E]">{minimumDeposit}€</span>
                </div>
              </div>
            </div>
          )}

          {paymentMethod === "transfer" && (
            <div className="space-y-6">
              <div>
                <p className="text-[12px] uppercase text-[#0C4149] opacity-60 font-bold mb-1">Titulaire du compte</p>
                <p className="text-[15px] font-bold text-[#0C4149]">FFBC TRIP</p>
              </div>
              <div>
                <p className="text-[12px] uppercase text-[#0C4149] opacity-60 font-bold mb-1">IBAN</p>
                <p className="text-[15px] font-bold text-[#0C4149] tracking-wider">FR76 0562 03354 032654 00</p>
              </div>
              <div>
                <p className="text-[12px] uppercase text-[#0C4149] opacity-60 font-bold mb-1">BIC</p>
                <p className="text-[15px] font-bold text-[#0C4149]">BMPADCDSVVD</p>
              </div>
            </div>
          )}

          {paymentMethod === "check" && (
            <div className="space-y-4 text-[#0C4149]">
              <p className="text-[14px]">Envoyer le chèque à l'adresse suivante :</p>
              <div className="text-[15px] font-bold space-y-1">
                <p>FFBC TRIP</p>
                <p>8 place Léo Lagrange</p>
                <p>33150 Cenon</p>
              </div>
            </div>
          )}

          {paymentMethod === "ancv" && (
            <div className="space-y-4 text-[#0C4149]">
              <p className="text-[14px]">Envoyer vos chèques vacances ANCV à l'adresse suivante :</p>
              <div className="space-y-1 text-[15px] font-bold">
                <p>FFBC TRIP</p>
                <p>8 place Léo Lagrange</p>
                <p>33150 Cenon</p>
              </div>
              <p className="text-[14px] opacity-80">
                Merci de noter votre nom et la référence du voyage au dos de l'envoi.
              </p>
            </div>
          )}
        </div>

        {/* Boutons */}
        {paymentMethod === "card" ? (
          <div className="flex flex-col sm:flex-row gap-8 pt-4">
            <Button
              disabled={!isCustomAmountValid}
              onClick={handleValidatePayment}
              className="flex-1 h-[49px] bg-[#FA673E] hover:bg-[#FF592A] disabled:cursor-not-allowed text-white font-bold rounded-[8px] text-[15px]"
            >
              Payer {payableAmount} € <ArrowRight className="ml-2 size-4" />
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="flex-1 h-[49px] w-full cursor-pointer border-[#0C4149] font-bold text-[#0C4149] hover:border-[#0C414966] hover:bg-[#0C4149]/5 hover:text-[#0C4149] rounded-[8px] text-[15px]"
            >
              Retour
            </Button>
          </div>
        ) : (
          <div className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="h-[49px] w-full cursor-pointer border-[#0C4149] font-bold text-[#0C4149] hover:border-[#0C414966] hover:bg-[#0C4149]/5 hover:text-[#0C4149] rounded-[8px] text-[15px]"
            >
              Retour
            </Button>
          </div>
        )}

      </main>
    </div>
  )
}