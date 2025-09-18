"use client"

import { useState, useEffect } from "react"
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, X, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Contact } from "@/types/chat"

interface CallRecord {
  id: string
  contactId: string
  contactName: string
  contactAvatar: string
  type: "incoming" | "outgoing" | "missed"
  duration: number // in seconds, 0 for missed calls
  timestamp: Date
  status: "completed" | "missed" | "declined"
}

interface CallHistoryModalProps {
  contacts: Contact[]
  currentUserId: string
  onClose: () => void
  onCallContact: (contact: Contact) => void
}

export function CallHistoryModal({ contacts, currentUserId, onClose, onCallContact }: CallHistoryModalProps) {
  const [callHistory, setCallHistory] = useState<CallRecord[]>([])

  useEffect(() => {
    loadCallHistory()
  }, [currentUserId])

  const loadCallHistory = () => {
    const history = JSON.parse(localStorage.getItem(`chatzy-call-history-${currentUserId}`) || "[]")
    const processedHistory = history.map((record: any) => ({
      ...record,
      timestamp: new Date(record.timestamp),
    }))
    setCallHistory(
      processedHistory.sort((a: CallRecord, b: CallRecord) => b.timestamp.getTime() - a.timestamp.getTime()),
    )
  }

  const formatCallDuration = (seconds: number) => {
    if (seconds === 0) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formatCallTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (hours < 1) return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    if (days < 1) return `${hours}h ago`
    if (days < 7) return date.toLocaleDateString("en-US", { weekday: "short" })
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const getCallIcon = (record: CallRecord) => {
    switch (record.type) {
      case "incoming":
        return record.status === "missed" ? (
          <PhoneMissed className="h-4 w-4 text-red-500" />
        ) : (
          <PhoneIncoming className="h-4 w-4 text-green-500" />
        )
      case "outgoing":
        return <PhoneOutgoing className="h-4 w-4 text-blue-500" />
      default:
        return <Phone className="h-4 w-4 text-gray-500" />
    }
  }

  const handleCallBack = (record: CallRecord) => {
    const contact = contacts.find((c) => c.id === record.contactId)
    if (contact) {
      onCallContact(contact)
    }
  }

  const clearCallHistory = () => {
    localStorage.removeItem(`chatzy-call-history-${currentUserId}`)
    setCallHistory([])
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[80vh] overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Call History
              </CardTitle>
              <CardDescription>Your recent calls</CardDescription>
            </div>
            <div className="flex gap-2">
              {callHistory.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearCallHistory} className="text-red-600">
                  Clear
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-96">
          {callHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Phone className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No call history yet</p>
              <p className="text-sm">Your calls will appear here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {callHistory.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg cursor-pointer"
                  onClick={() => handleCallBack(record)}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={record.contactAvatar || "/placeholder.svg"} alt={record.contactName} />
                    <AvatarFallback className="bg-blue-500 text-white text-sm">
                      {record.contactName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {getCallIcon(record)}
                      <h3 className="font-medium text-gray-900">{record.contactName}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{formatCallTime(record.timestamp)}</span>
                      {record.duration > 0 && <span>• {formatCallDuration(record.duration)}</span>}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:bg-blue-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCallBack(record)
                    }}
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
