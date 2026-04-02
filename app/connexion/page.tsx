"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"

type Step = "email" | "code"

export default function ConnexionPage() {
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const refs = useRef<Array<HTMLInputElement | null>>([])

  const setCodeAt = (index: number, value: string) => {
    const clean = value.replace(/\D/g, "").slice(-1)
    const next = [...code]
    next[index] = clean
    setCode(next)
    if (clean && index < refs.current.length - 1) refs.current[index + 1]?.focus()
  }

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

        {step === "email" ? (
          <>
            <h1 className="text-center text-[32px] font-bold uppercase tracking-wide text-[#0C4149] leading-none">
              Se connecter
            </h1>

            <form className="mt-6 rounded-[8px] border border-[#0C414933] bg-white p-6">
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

              <Link
                href="/verification"
                className="mt-6 h-[49px] w-full rounded-[8px] border border-[#E4603A] bg-[#FA673E] text-[15px] font-bold text-white cursor-pointer inline-flex items-center justify-center"
              >
                Je me connecte →
              </Link>

              <p className="mt-5 text-center text-[14px] text-[#0C4149]">
                Vous n&apos;avez pas de compte ?
              </p>
              <p className="mt-1 text-center text-[14px]">
                <Link href="/inscription" className="font-semibold text-[#E4603A] underline underline-offset-2">
                  Inscrivez-vous
                </Link>
              </p>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-center text-[30px] font-bold uppercase tracking-wide text-[#0C4149]">
              Vérification pour vous connecter
            </h1>
            <p className="mt-2 text-center text-[14px] text-[#0C4149CC]">
              Un code a été envoyé à {email || "votre email"}
            </p>

            <form className="mt-6 rounded-[8px] border border-[#0C414933] bg-white p-6">
              <p className="text-[14px] text-[#0C4149]">Entrez le code reçu par mail</p>

              <div className="mt-4 flex items-center justify-between gap-2">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      refs.current[index] = el
                    }}
                    value={digit}
                    onChange={(e) => setCodeAt(index, e.target.value)}
                    maxLength={1}
                    inputMode="numeric"
                    className="h-12 w-12 rounded-[8px] border border-[#0C414933] text-center text-[18px] font-bold text-[#0C4149] outline-none focus:border-[#FA673E] focus:ring-1 focus:ring-[#FA673E]"
                  />
                ))}
              </div>

              <button
                type="button"
                className="mt-6 h-[49px] w-full rounded-[8px] border border-[#0C4149] bg-transparent text-[15px] font-bold text-[#0C4149] cursor-pointer"
              >
                Vérifier et se connecter →
              </button>

              <button
                type="button"
                onClick={() => setStep("email")}
                className="mt-4 w-full text-center text-[13px] text-[#0C4149] underline underline-offset-2 cursor-pointer"
              >
                Retour
              </button>
            </form>
          </>
        )}

        <div className="mt-4 text-center">
          <Link href="/" className="text-[13px] text-[#0C4149] underline underline-offset-2">
            Retour au récap de voyage
          </Link>
        </div>
      </section>
    </div>
  )
}
