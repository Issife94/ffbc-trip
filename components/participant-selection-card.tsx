"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ParticipantSelectionCardProps {
  numberOfParticipants: number | null
  setNumberOfParticipants: (value: number | null) => void
  shareRoom: boolean
  setShareRoom: (value: boolean) => void
}

export function ParticipantSelectionCard({
  numberOfParticipants,
  setNumberOfParticipants,
  shareRoom,
  setShareRoom,
}: ParticipantSelectionCardProps) {
  const isShareRoomDisabled = numberOfParticipants !== null && numberOfParticipants > 1

  return (
    <Card className="border-[#0C414933] bg-white rounded-[8px] shadow-none">
      <CardContent className="p-6">
        <h2 className="text-[15px] font-semibold text-primary mb-4">
          Sélection des participants
        </h2>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="participants" className="text-[15px] font-medium text-primary">
              Nombre de participants
            </Label>
            <Select
              value={numberOfParticipants?.toString() || ""}
              onValueChange={(value) => {
                const num = parseInt(value)
                setNumberOfParticipants(num)
                if (num > 1) {
                  setShareRoom(false)
                }
              }}
            >
              <SelectTrigger 
                id="participants" 
                className={`w-full h-11 cursor-pointer rounded-lg border-[#0C414933] transition-colors hover:border-[#0C414966] data-[state=open]:border-[#0C4149] ${numberOfParticipants ? 'text-[#0C4149]' : 'text-[#0C4149CC]'}`}
              >
                <SelectValue placeholder="Nombre de participants" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} participant{num > 1 ? "s" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="share-room"
              checked={shareRoom}
              onCheckedChange={(checked) => setShareRoom(checked as boolean)}
              disabled={isShareRoomDisabled}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-border"
            />
            <Label
              htmlFor="share-room"
              className={`text-[14px] cursor-pointer font-normal ${
                isShareRoomDisabled ? "text-muted-foreground" : "text-primary"
              }`}
            >
              Je voyage seul et souhaite partager une chambre
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
