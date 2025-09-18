"use client"

import { Phone, Video, MessageCircle, X, Clock, Users, UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Contact } from "@/types/chat"
import type { User } from "@/types/auth"

interface ContactInfoModalProps {
  contact: Contact
  onClose: () => void
  onStartCall: () => void
  onStartChat: () => void
}

export function ContactInfoModal({ contact, onClose, onStartCall, onStartChat }: ContactInfoModalProps) {
  // Get the full user info from localStorage to access bio
  const getUserInfo = (contactId: string): User | null => {
    const users = JSON.parse(localStorage.getItem("chatzy-users") || "[]")
    return users.find((user: User) => user.id === contactId) || null
  }

  const userInfo = getUserInfo(contact.id)

  const formatLastSeen = (lastSeen?: Date) => {
    if (!lastSeen) return "Unknown"

    const now = new Date()
    const diff = now.getTime() - lastSeen.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Contact Info</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Profile Section */}
          <div className="text-center">
            <div className="relative inline-block">
              <Avatar className="h-24 w-24 mx-auto">
                <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                <AvatarFallback className="bg-blue-500 text-white text-2xl">
                  {contact.isGroup ? (
                    <Users className="h-12 w-12" />
                  ) : (
                    contact.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                  )}
                </AvatarFallback>
              </Avatar>
              {!contact.isGroup && contact.isOnline && (
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
              )}
            </div>

            <h2 className="text-xl font-semibold mt-4 mb-2">{contact.name}</h2>

            <div className="flex items-center justify-center gap-2">
              <Badge variant={contact.isOnline ? "default" : "secondary"} className="mb-2">
                {contact.isOnline ? "Online" : "Offline"}
              </Badge>
              {contact.isGroup && (
                <Badge variant="outline" className="mb-2">
                  <Users className="h-3 w-3 mr-1" />
                  Group
                </Badge>
              )}
            </div>
          </div>

          {/* Bio Section */}
          {userInfo?.bio && (
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3 text-sm">
                <UserIcon className="h-4 w-4 text-blue-500" />
                <div className="flex-1">
                  <p className="font-medium text-blue-700">About</p>
                  <p className="text-gray-700 mt-1 leading-relaxed">{userInfo.bio}</p>
                </div>
              </div>
            </div>
          )}

          {/* Status Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-blue-500" />
              <div>
                <p className="font-medium">Status</p>
                <p className="text-gray-600">{contact.status}</p>
              </div>
            </div>

            {!contact.isGroup && !contact.isOnline && (
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="font-medium">Last seen</p>
                  <p className="text-gray-600">{formatLastSeen(contact.lastSeen)}</p>
                </div>
              </div>
            )}

            {contact.isGroup && (
              <div className="flex items-center gap-3 text-sm">
                <Users className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="font-medium">Members</p>
                  <p className="text-gray-600">{contact.members?.length || 0} members</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 text-sm">
              <MessageCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="font-medium">Last message</p>
                <p className="text-gray-600 truncate">{contact.lastMessage}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={onStartChat} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
              <MessageCircle className="h-4 w-4 mr-2" />
              Message
            </Button>

            {!contact.isGroup && (
              <>
                <Button onClick={onStartCall} variant="outline" className="flex-1">
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
                <Button variant="outline" className="px-3">
                  <Video className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          {/* Additional Info */}
          <div className="pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 space-y-1">
              <p>• Messages are end-to-end encrypted</p>
              <p>• Tap and hold messages to react</p>
              {!contact.isGroup && <p>• Voice calls are simulated</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
