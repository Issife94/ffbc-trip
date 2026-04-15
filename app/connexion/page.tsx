"use client"

import { FormEvent, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/src/lib/supabase/client"

function getConnexionErrorMessage(message: string) {
  const lower = message.toLowerCase()
  if (lower.includes("user") && lower.includes("not")) return "Aucun compte trouvé"
  if (lower.includes("no user")) return "Aucun compte trouvé"
  return "Aucun compte trouvé"
}

export default function ConnexionPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage("")
    setIsSubmitting(true)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    })

    setIsSubmitting(false)

    if (error) {
      setErrorMessage(getConnexionErrorMessage(error.message))
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

        <>
          <h1 className="text-center text-[28px] font-bold uppercase tracking-wide text-[#0C4149] leading-none sm:text-[32px]">
            Se connecter
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

            {errorMessage ? <p className="mt-3 text-[13px] text-[#E4603A]">{errorMessage}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 h-[49px] w-full rounded-[8px] border border-[#E4603A] bg-[#FA673E] text-[15px] font-bold text-white cursor-pointer inline-flex items-center justify-center disabled:opacity-70"
            >
              Je me connecte →
            </button>

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

        <div className="mt-4 text-center">
          <Link href="/" className="text-[13px] text-[#0C4149] underline underline-offset-2">
            Retour au récap de voyage
          </Link>
        </div>
      </section>
    </div>
  )
}
