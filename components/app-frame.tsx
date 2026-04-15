"use client"

import { usePathname } from "next/navigation"
import { Navbar } from "@/components/navbar"

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideNavbar =
    pathname === "/inscription" ||
    pathname === "/connexion" ||
    pathname === "/verification"

  const isDashboard = pathname?.startsWith("/dashboard") ?? false

  return (
    <>
      {!hideNavbar ? <Navbar /> : null}
      <div
        className={
          hideNavbar
            ? ""
            : isDashboard
              ? "pt-6 sm:pt-12"
              : "pt-12"
        }
      >
        {children}
      </div>
    </>
  )
}
