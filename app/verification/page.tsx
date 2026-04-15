"use client"

import { FormEvent, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/src/lib/supabase/client"

function getVerificationErrorMessage() {
  return "Code incorrect ou expiré"
}

export default function VerificationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const email = searchParams.get("email") ?? ""
  const [code, setCode] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage("")
    setIsSubmitting(true)

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    })

    setIsSubmitting(false)

    if (error) {
      setErrorMessage(getVerificationErrorMessage())
      return
    }

    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-[#FAFDFD] flex items-center justify-center px-6 py-8 sm:py-10">
      <section className="w-full max-w-[360px] sm:max-w-[380px]">
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

        <h1 className="text-center text-[28px] font-bold uppercase tracking-wide text-[#0C4149] leading-none sm:text-[32px]">
          Vérification
        </h1>

        <form onSubmit={handleSubmit} className="mt-6 rounded-[8px] border border-[#0C414933] bg-white p-5 sm:p-6">
          <p className="text-[14px] text-[#0C4149]">
            Entrez le code reçu par mail pour vous connecter
          </p>
          {email ? (
            <p className="mt-2 text-[13px] text-[#0C4149CC]">
              Code envoyé à {email}
            </p>
          ) : null}

          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Code"
            required
            className="mt-4 h-11 w-full rounded-[8px] border border-[#0C414933] px-3 text-[#0C4149] outline-none focus:border-[#FA673E] focus:ring-1 focus:ring-[#FA673E]"
          />

          {errorMessage ? <p className="mt-3 text-[13px] text-[#E4603A]">{errorMessage}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting || !email}
            className="mt-6 h-[49px] w-full rounded-[8px] border border-[#E4603A] bg-[#FA673E] text-[15px] font-bold text-white cursor-pointer"
          >
            Vérifier →
          </button>

          <p className="mt-5 text-center text-[14px]">
            <Link href="/connexion" className="font-semibold text-[#E4603A] underline underline-offset-2">
              Retour à la page connexion
            </Link>
          </p>
        </form>
      </section>
    </div>
  )
}
