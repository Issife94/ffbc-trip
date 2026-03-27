"use client"

import { usePathname } from "next/navigation"
import { Navbar } from "@/components/navbar"

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideNavbar =
    pathname === "/inscription" ||
    pathname === "/connexion" ||
    pathname === "/verification"

  return (
    <>
      {!hideNavbar ? <Navbar /> : null}
      <div className={hideNavbar ? "" : "pt-12"}>{children}</div>
    </>
  )
}
