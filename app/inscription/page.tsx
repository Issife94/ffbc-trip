"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"

export default function InscriptionPage() {
  const [step, setStep] = useState<"email" | "otp">("email")
  const [email, setEmail] = useState("")

  return (
    <div className="min-h-screen bg-[#FAFDFD] flex items-center justify-center px-4">
      <section className="w-full max-w-[360px]">
        <div className="mb-6 flex justify-center">
          <Image
            src="/logo.png"
            alt="FFBC Trip"
            width={140}
            height={42}
            className="object-contain"
            priority
          />
        </div>

        <h1 className="text-center text-[32px] font-bold uppercase tracking-wide text-[#0C4149] leading-none">
          {step === "email" ? "Créer votre espace" : "Vérification"}
        </h1>

        <form className="mt-6 rounded-[8px] border border-[#0C414933] bg-white p-6">
          {step === "email" ? (
            <>
              <label className="flex flex-col gap-1.5 text-[14px] text-[#0C4149]">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="h-11 rounded-[8px] border border-[#0C414933] px-3 text-[#0C4149] outline-none focus:border-[#FA673E] focus:ring-1 focus:ring-[#FA673E]"
                />
              </label>

              <button
                type="button"
                onClick={() => setStep("otp")}
                className="mt-6 h-[49px] w-full rounded-[8px] border border-[#E4603A] bg-[#FA673E] text-[15px] font-bold text-white cursor-pointer"
              >
                Je m&apos;inscris
              </button>
            </>
          ) : (
            <>
              <p className="text-[14px] text-[#0C4149]">
                Entrez le code reçu par mail
              </p>
              <p className="mt-2 text-sm italic text-[#0C4149] opacity-70">
                Un petit code vient de s&apos;envoler vers votre boîte mail ! Pensez à jeter un oeil aux spams s&apos;il joue à cache-cache.
              </p>

              <input
                type="text"
                placeholder="Code"
                className="mt-4 h-11 w-full rounded-[8px] border border-[#0C414933] px-3 text-[#0C4149] outline-none focus:border-[#FA673E] focus:ring-1 focus:ring-[#FA673E]"
              />

              <button
                type="button"
                className="mt-6 h-[49px] w-full rounded-[8px] border border-[#0C4149] bg-white text-[15px] font-bold text-[#0C4149] cursor-pointer"
              >
                Je me connecte →
              </button>

              <button
                type="button"
                onClick={() => setStep("email")}
                className="mt-4 w-full text-center text-[13px] text-[#0C4149] underline underline-offset-2 cursor-pointer"
              >
                Retour
              </button>
            </>
          )}

          <p className="mt-5 text-center text-[14px] text-[#0C4149]">
            Vous avez déjà un compte ?
          </p>
          <p className="mt-1 text-center text-[14px]">
            <Link href="/connexion" className="font-semibold text-[#E4603A] underline underline-offset-2">
              Connectez-vous
            </Link>
          </p>

          <div className="mt-8 border-t border-[#0C414933] pt-8">
            <p className="text-center text-sm italic text-[#0C4149] opacity-80">
              Un code vous sera envoyé !
            </p>
            <p className="mt-2 text-center text-sm italic text-[#0C4149] opacity-80">
              Vérifiez votre boîte de réception et vos spams
            </p>
          </div>
        </form>
      </section>
    </div>
  )
}
