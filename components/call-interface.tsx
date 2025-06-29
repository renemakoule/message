"use client"

import { useState } from "react"
import { PhoneOff, Mic, MicOff, Volume2, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useMessagingStore } from "@/lib/store"

export function CallInterface() {
  const { currentCall, endCall } = useMessagingStore()
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [callDuration, setCallDuration] = useState("00:32")

  if (!currentCall) return null

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={currentCall.participant.avatar || "/placeholder.svg"} />
            <AvatarFallback>{currentCall.participant.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium">{currentCall.participant.name}</p>
            <p className="text-xs text-gray-500">{callDuration}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsMinimized(false)}>
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="sm" onClick={endCall}>
            <PhoneOff className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-50">
      {/* Participant */}
      <div className="text-center mb-8">
        <Avatar className="h-32 w-32 mx-auto mb-4">
          <AvatarImage src={currentCall.participant.avatar || "/placeholder.svg"} />
          <AvatarFallback className="text-4xl">{currentCall.participant.name[0]}</AvatarFallback>
        </Avatar>
        <h2 className="text-2xl font-semibold text-white mb-2">{currentCall.participant.name}</h2>
        <p className="text-gray-300">{currentCall.status === "ringing" ? "Appel en cours..." : callDuration}</p>
      </div>

      {/* Contrôles fonctionnels */}
      <div className="flex items-center gap-6">
        <Button
          variant={isMuted ? "destructive" : "secondary"}
          size="lg"
          className="rounded-full w-14 h-14 transition-all hover:scale-105"
          onClick={() => {
            setIsMuted(!isMuted)
            // Feedback audio/visuel
            console.log(isMuted ? "Micro activé" : "Micro coupé")
          }}
        >
          {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </Button>

        <Button
          variant={isSpeakerOn ? "default" : "secondary"}
          size="lg"
          className="rounded-full w-14 h-14 transition-all hover:scale-105"
          onClick={() => {
            setIsSpeakerOn(!isSpeakerOn)
            console.log(isSpeakerOn ? "Haut-parleur désactivé" : "Haut-parleur activé")
          }}
        >
          <Volume2 className="h-6 w-6" />
        </Button>

        <Button
          variant="destructive"
          size="lg"
          className="rounded-full w-16 h-16 hover:scale-105 transition-all"
          onClick={() => {
            endCall()
            // Feedback de fin d'appel
            console.log("Appel terminé")
          }}
        >
          <PhoneOff className="h-7 w-7" />
        </Button>

        <Button
          variant="secondary"
          size="lg"
          className="rounded-full w-14 h-14 transition-all hover:scale-105"
          onClick={() => {
            setIsMinimized(true)
            console.log("Appel minimisé")
          }}
        >
          <Minimize2 className="h-6 w-6" />
        </Button>
      </div>

      {/* Indicateur d'état */}
      <div className="absolute top-4 left-4">
        <div className="flex items-center gap-2 text-white">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm">Appel en cours</span>
        </div>
      </div>
    </div>
  )
}
