"use client"

import { useState, useEffect } from "react"
import { Phone, PhoneOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Contact } from "@/types/chat"

interface IncomingCallNotificationProps {
  contact: Contact
  onAccept: () => void
  onDecline: () => void
}

export function IncomingCallNotification({ contact, onAccept, onDecline }: IncomingCallNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Auto-decline after 30 seconds
    const timer = setTimeout(() => {
      onDecline()
    }, 30000)

    return () => clearTimeout(timer)
  }, [onDecline])

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 bg-white rounded-lg shadow-2xl border border-blue-200 p-4 z-50 animate-bounce">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
          <AvatarFallback className="bg-blue-500 text-white">
            {contact.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{contact.name}</h3>
          <p className="text-sm text-blue-600">Incoming call...</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={onDecline} size="sm" className="bg-red-600 hover:bg-red-700 text-white rounded-full p-2">
            <PhoneOff className="h-4 w-4" />
          </Button>
          <Button onClick={onAccept} size="sm" className="bg-green-600 hover:bg-green-700 text-white rounded-full p-2">
            <Phone className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
