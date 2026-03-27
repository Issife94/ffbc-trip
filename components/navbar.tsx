import Image from "next/image"

export function Navbar() {
  return (
    <>
      <header className="h-[90px] border-b border-[#0C414933] bg-white">
        <div className="flex h-full items-center justify-center">
          <div className="flex items-center">
            {/* Ton logo principal de 200x61 */}
            <Image
              src="/logo.png" 
              alt="FFBC Trip Logo"
              width={200}
              height={61}
              className="object-contain"
              priority
            />
          </div>
        </div>
      </header>
      
      {/* Ligne d'accentuation : 1px de haut, couleur #0C4149 à 50% d'opacité */}
      <div className="h-[1px] bg-[#0C4149]/50 w-full" />
    </>
  )
}