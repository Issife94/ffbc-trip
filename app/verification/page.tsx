"use client"

import Image from "next/image"
import Link from "next/link"

export default function VerificationPage() {
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
          Vérification
        </h1>

        <form className="mt-6 rounded-[8px] border border-[#0C414933] bg-white p-6">
          <p className="text-[14px] text-[#0C4149]">
            Entrez le code reçu par mail pour vous connecter
          </p>

          <input
            type="text"
            placeholder="Code"
            className="mt-4 h-11 w-full rounded-[8px] border border-[#0C414933] px-3 text-[#0C4149] outline-none focus:border-[#FA673E] focus:ring-1 focus:ring-[#FA673E]"
          />

          <button
            type="button"
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
