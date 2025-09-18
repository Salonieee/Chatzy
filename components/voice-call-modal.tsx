"use client"

import { useState, useEffect, useRef } from "react"
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Contact } from "@/types/chat"

interface VoiceCallModalProps {
  contact: Contact
  isIncoming?: boolean
  onEndCall: (duration?: number) => void
  onAcceptCall?: () => void
  onDeclineCall?: () => void
}

export function VoiceCallModal({
  contact,
  isIncoming = false,
  onEndCall,
  onAcceptCall,
  onDeclineCall,
}: VoiceCallModalProps) {
  const [callStatus, setCallStatus] = useState<"ringing" | "connecting" | "connected" | "ended">(
    isIncoming ? "ringing" : "connecting",
  )
  const [callDuration, setCallDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!isIncoming) {
      // Simulate outgoing call connection
      const connectTimer = setTimeout(
        () => {
          setCallStatus("connected")
          startCallTimer()
        },
        2000 + Math.random() * 3000,
      ) // 2-5 seconds to connect

      return () => clearTimeout(connectTimer)
    }
  }, [isIncoming])

  const startCallTimer = () => {
    intervalRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1)
    }, 1000)
  }

  const handleAcceptCall = () => {
    if (onAcceptCall) onAcceptCall()
    setCallStatus("connected")
    startCallTimer()
  }

  const handleDeclineCall = () => {
    if (onDeclineCall) onDeclineCall()
    setCallStatus("ended")
    setTimeout(() => onEndCall(0), 1000)
  }

  const handleEndCall = () => {
    setCallStatus("ended")
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    setTimeout(() => onEndCall(callDuration), 1000)
  }

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getCallStatusText = () => {
    switch (callStatus) {
      case "ringing":
        return isIncoming ? "Incoming call..." : "Ringing..."
      case "connecting":
        return "Connecting..."
      case "connected":
        return formatCallDuration(callDuration)
      case "ended":
        return "Call ended"
      default:
        return ""
    }
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 to-blue-700 flex flex-col items-center justify-center z-50">
      {/* Call Status */}
      <div className="text-center mb-8">
        <div className="relative mb-6">
          <Avatar className="h-32 w-32 mx-auto border-4 border-white/20">
            <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
            <AvatarFallback className="bg-blue-500 text-white text-4xl">
              {contact.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          {/* Pulse animation for ringing */}
          {(callStatus === "ringing" || callStatus === "connecting") && (
            <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping" />
          )}
        </div>

        <h2 className="text-2xl font-semibold text-white mb-2">{contact.name}</h2>
        <p className="text-blue-200 text-lg">{getCallStatusText()}</p>
      </div>

      {/* Call Controls */}
      <div className="flex items-center gap-6">
        {callStatus === "ringing" && isIncoming ? (
          // Incoming call controls
          <>
            <Button
              onClick={handleDeclineCall}
              className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 w-16 h-16"
            >
              <PhoneOff className="h-8 w-8" />
            </Button>
            <Button
              onClick={handleAcceptCall}
              className="bg-green-600 hover:bg-green-700 text-white rounded-full p-4 w-16 h-16"
            >
              <Phone className="h-8 w-8" />
            </Button>
          </>
        ) : callStatus === "connected" ? (
          // Active call controls
          <>
            <Button
              onClick={() => setIsMuted(!isMuted)}
              className={`${
                isMuted ? "bg-red-600 hover:bg-red-700" : "bg-white/20 hover:bg-white/30"
              } text-white rounded-full p-3`}
            >
              {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>

            <Button
              onClick={handleEndCall}
              className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 w-16 h-16"
            >
              <PhoneOff className="h-8 w-8" />
            </Button>

            <Button
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`${
                isSpeakerOn ? "bg-blue-600 hover:bg-blue-700" : "bg-white/20 hover:bg-white/30"
              } text-white rounded-full p-3`}
            >
              {isSpeakerOn ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
            </Button>
          </>
        ) : (
          // Connecting or ended state
          <Button
            onClick={handleEndCall}
            className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 w-16 h-16"
            disabled={callStatus === "ended"}
          >
            <PhoneOff className="h-8 w-8" />
          </Button>
        )}
      </div>

      {/* Call quality indicator */}
      {callStatus === "connected" && (
        <div className="mt-8 flex items-center gap-2 text-white/70">
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((bar) => (
              <div
                key={bar}
                className={`w-1 bg-white/50 rounded-full transition-all duration-300 ${
                  bar <= 3 ? "h-3 bg-green-400" : "h-2"
                }`}
              />
            ))}
          </div>
          <span className="text-sm">Good connection</span>
        </div>
      )}
    </div>
  )
}
