import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Euro } from "lucide-react"

interface TripCardProps {
  destination: string
  dateDepart: string
  dateRetour: string
  price: number
}

export function TripCard({ destination, dateDepart, dateRetour, price }: TripCardProps) {
  return (
    <Card className="border-[#0C414933] bg-white rounded-[8px] shadow-none">
      <CardContent className="p-6">
        <h1 className="text-[17px] font-bold uppercase text-primary tracking-wide mb-4">
          {destination}
        </h1>
        
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary">
            <Calendar className="size-4 opacity-70" />
            <span className="text-[15px]">
              Du {dateDepart} au {dateRetour}
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-primary">
            <Euro className="size-4 opacity-70" />
            <span className="text-[15px]">
              Prix de base : {price}€ par personne
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
