"use client"

import { FormEvent, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/src/lib/supabase/client"

function getInscriptionErrorMessage(message: string) {
  const lower = message.toLowerCase()
  if (lower.includes("already") || lower.includes("registered") || lower.includes("exists")) {
    return "Un compte existe déjà"
  }
  return "Un compte existe déjà"
}

function generatePassword() {
  return `FFBC-${crypto.randomUUID()}`
}

export default function InscriptionPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage("")
    setIsSubmitting(true)

    const { error } = await supabase.auth.signUp({
      email,
      password: generatePassword(),
    })

    setIsSubmitting(false)

    if (error) {
      setErrorMessage(getInscriptionErrorMessage(error.message))
      return
    }

    router.push(`/verification?email=${encodeURIComponent(email)}`)
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
          Créer votre espace
        </h1>

        <form onSubmit={handleSubmit} className="mt-6 rounded-[8px] border border-[#0C414933] bg-white p-5 sm:p-6">
          <label className="flex flex-col gap-1.5 text-[14px] text-[#0C4149]">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="h-11 rounded-[8px] border border-[#0C414933] px-3 text-[#0C4149] outline-none focus:border-[#FA673E] focus:ring-1 focus:ring-[#FA673E]"
            />
          </label>

          <label className="mt-4 flex items-start gap-2 text-[13px] text-[#0C4149]">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              required
              className="mt-[2px] h-4 w-4 accent-[#FA673E]"
            />
            <span>J&apos;accepte les CGU</span>
          </label>

          {errorMessage ? <p className="mt-3 text-[13px] text-[#E4603A]">{errorMessage}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting || !acceptedTerms}
            className="mt-6 h-[49px] w-full rounded-[8px] border border-[#E4603A] bg-[#FA673E] text-[15px] font-bold text-white cursor-pointer disabled:opacity-70"
          >
            Je crée mon compte
          </button>

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
