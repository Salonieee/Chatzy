"use client"

import { useState } from "react"
import { Phone, Video, MoreVertical, Users, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageBubble } from "@/components/message-bubble"
import { MessageInput } from "@/components/message-input"
import { VoiceCallModal } from "@/components/voice-call-modal"
import { ContactInfoModal } from "@/components/contact-info-modal"
import type { Contact, Message } from "@/types/chat"
import type { User } from "@/types/auth"

interface ChatWindowProps {
  contact: Contact | null
  messages: Message[]
  onSendMessage: (
    content: string,
    type?: Message["type"],
    file?: File,
    voiceData?: { voiceDuration?: number; waveformData?: number[] },
  ) => void
  currentUser: User
  isTyping?: boolean
  onIncomingCall?: (contact: Contact) => void
}

export function ChatWindow({
  contact,
  messages,
  onSendMessage,
  currentUser,
  isTyping = false,
  onIncomingCall,
}: ChatWindowProps) {
  const [showVoiceCall, setShowVoiceCall] = useState(false)
  const [showContactInfo, setShowContactInfo] = useState(false)

  const handleVoiceCall = () => {
    setShowVoiceCall(true)

    // Save call to history
    if (contact) {
      saveCallToHistory(contact, "outgoing", 0, "initiated")
    }
  }

  const handleEndCall = (duration?: number) => {
    setShowVoiceCall(false)

    // Update call history with duration
    if (contact && duration) {
      saveCallToHistory(contact, "outgoing", duration, "completed")
    }
  }

  const saveCallToHistory = (
    contact: Contact,
    type: "incoming" | "outgoing",
    duration: number,
    status: "completed" | "missed" | "declined" | "initiated",
  ) => {
    const callRecord = {
      id: Date.now().toString(),
      contactId: contact.id,
      contactName: contact.name,
      contactAvatar: contact.avatar,
      type,
      duration,
      timestamp: new Date(),
      status,
    }

    const existingHistory = JSON.parse(localStorage.getItem(`chatzy-call-history-${currentUser.id}`) || "[]")
    const updatedHistory = [callRecord, ...existingHistory].slice(0, 100) // Keep last 100 calls
    localStorage.setItem(`chatzy-call-history-${currentUser.id}`, JSON.stringify(updatedHistory))
  }

  const handleContactInfo = () => {
    setShowContactInfo(true)
  }

  const handleStartChat = () => {
    setShowContactInfo(false)
  }

  const handleStartCallFromInfo = () => {
    setShowContactInfo(false)
    handleVoiceCall()
  }

  if (!contact) {
    return (
      <div className="flex-1 flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-2xl font-semibold text-blue-600 mb-2">Welcome to Chatzy, {currentUser.name}!</h2>
          <p className="text-blue-500">Select a contact to start chatting with real users</p>
          <div className="mt-4 text-sm text-blue-400 space-y-1">
            <p>👥 Chat with registered users</p>
            <p>📞 Make voice calls</p>
            <p>🎤 Send voice messages</p>
            <p>📷 Share photos and videos</p>
            <p>😊 Express with emojis</p>
            <p>🔍 Search contacts and messages</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-blue-600 text-white p-4 flex items-center justify-between border-b border-blue-700">
          <div
            className="flex items-center gap-3 cursor-pointer hover:bg-blue-700 rounded-lg p-2 -m-2 transition-colors"
            onClick={handleContactInfo}
          >
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                <AvatarFallback className="bg-blue-500 text-white">
                  {contact.isGroup ? (
                    <Users className="h-5 w-5" />
                  ) : (
                    contact.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                  )}
                </AvatarFallback>
              </Avatar>
              {!contact.isGroup && contact.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-blue-600"></div>
              )}
            </div>
            <div>
              <h2 className="font-semibold flex items-center gap-2">
                {contact.name}
                {contact.isGroup && <Users className="h-4 w-4" />}
                <Info className="h-3 w-3 opacity-70" />
              </h2>
              <p className="text-sm text-blue-200">{isTyping ? "Typing..." : contact.status}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-blue-700"
              onClick={handleVoiceCall}
              disabled={contact.isGroup}
            >
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-blue-700">
              <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-blue-700">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-blue-50 to-white">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-blue-400">
                <div className="text-4xl mb-2">👋</div>
                <p>Start a conversation with {contact.name}</p>
                <p className="text-sm mt-1">Send a message to begin chatting</p>
              </div>
            </div>
          ) : (
            messages.map((message) => <MessageBubble key={message.id} message={message} />)
          )}
        </div>

        {/* Message Input */}
        <MessageInput onSendMessage={onSendMessage} />
      </div>

      {/* Voice Call Modal */}
      {showVoiceCall && <VoiceCallModal contact={contact} isIncoming={false} onEndCall={handleEndCall} />}

      {/* Contact Info Modal */}
      {showContactInfo && (
        <ContactInfoModal
          contact={contact}
          onClose={() => setShowContactInfo(false)}
          onStartCall={handleStartCallFromInfo}
          onStartChat={handleStartChat}
        />
      )}
    </>
  )
}
