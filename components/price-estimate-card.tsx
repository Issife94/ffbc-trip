import { Card, CardContent } from "@/components/ui/card"
import { Users } from "lucide-react"

interface PriceEstimateCardProps {
  numberOfParticipants: number
  pricePerPerson: number
  total: number
  deposit: number
}

export function PriceEstimateCard({
  numberOfParticipants,
  total,
  deposit,
}: PriceEstimateCardProps) {
  return (
    <Card className="border-[#0C414933] bg-white rounded-[8px] shadow-none">
      <CardContent className="p-6">
        <h2 className="text-[15px] font-semibold text-primary mb-4">
          Prix estimé
        </h2>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <Users className="size-5 opacity-70" />
              <span className="text-[14px]">
                {numberOfParticipants} participant(s)
              </span>
            </div>
            <span className="text-[16px] font-bold text-primary">
              {total}€
            </span>
          </div>

          <div className="border-t border-border pt-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-primary">Total</span>
              <span className="text-[16px] font-bold text-primary">
                {total}€
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[14px] text-primary">Acompte (35%)</span>
              <span className="text-[16px] font-bold text-[#FA673E]">
                {deposit}€
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
