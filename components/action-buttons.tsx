import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

interface ActionButtonsProps {
  canPay: boolean
  paymentHref?: string
  onPayClick?: () => void
  payLabel?: string
}

export function ActionButtons({
  canPay,
  paymentHref = "/paiement",
  onPayClick,
  payLabel = "Payer",
}: ActionButtonsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-[32px] mt-4">
      {canPay ? (
        <Link href={paymentHref} onClick={onPayClick} className="flex-1 cursor-pointer">
          <Button className="w-full h-[49px] bg-[#FA673E] hover:bg-[#FF592A] text-white font-bold rounded-[8px] text-[15px]">
            {payLabel}
            <ArrowRight className="size-4 ml-1" />
          </Button>
        </Link>
      ) : (
        <Button
          disabled
          className="flex-1 w-full h-[49px] bg-[#FA673E] hover:bg-[#FF592A] text-white font-bold rounded-[8px] text-[15px] disabled:opacity-100 disabled:cursor-not-allowed"
        >
          {payLabel}
          <ArrowRight className="size-4 ml-1" />
        </Button>
      )}
      
      <Button
        variant="outline"
        className="flex-1 w-full h-[49px] border-[#0C4149] text-[#0C4149] hover:bg-[#0C4149]/5 hover:text-[#0C4149] hover:border-[#0C414966] font-bold rounded-[8px] text-[15px]"
      >
        Retour
      </Button>
    </div>
  )
}
