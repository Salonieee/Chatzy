"use client"

import { useState } from "react"
import { Search, MoreVertical, Users, Settings, LogOut, Phone, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Contact } from "@/types/chat"
import type { User } from "@/types/auth"

interface ChatSidebarProps {
  contacts: Contact[]
  selectedContact: Contact | null
  onSelectContact: (contact: Contact) => void
  currentUser: User
  onLogout: () => void
  onEditProfile: () => void
  onCreateGroup: () => void
  onShowCallHistory: () => void
}

export function ChatSidebar({
  contacts,
  selectedContact,
  onSelectContact,
  currentUser,
  onLogout,
  onEditProfile,
  onCreateGroup,
  onShowCallHistory,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)

  const formatLastSeen = (lastSeen?: Date) => {
    if (!lastSeen) return "Unknown"
    const now = new Date()
    const diff = now.getTime() - lastSeen.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  // Filter contacts based on search query
  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const clearSearch = () => {
    setSearchQuery("")
    setShowSearch(false)
  }

  return (
    <div className="w-80 bg-white border-r border-blue-200 flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
              <AvatarFallback className="bg-blue-500 text-white text-sm">
                {currentUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-blue-600"></div>
          </div>
          <div>
            <h1 className="text-lg font-semibold">Chatzy</h1>
            <p className="text-xs text-blue-200">{currentUser.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-blue-700"
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white hover:bg-blue-700">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onCreateGroup}>
                <Users className="h-4 w-4 mr-2" />
                Create Group
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onShowCallHistory}>
                <Phone className="h-4 w-4 mr-2" />
                Call History
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEditProfile}>
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search */}
      {showSearch && (
        <div className="p-3 border-b border-blue-100 bg-blue-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
            <Input
              placeholder="Search contacts and messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 border-blue-200 focus:border-blue-400"
              autoFocus
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-600"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {searchQuery && (
            <p className="text-xs text-blue-600 mt-2">
              {filteredContacts.length} result{filteredContacts.length !== 1 ? "s" : ""} found
            </p>
          )}
        </div>
      )}

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center p-4">
            <div className="text-blue-400">
              {searchQuery ? (
                <>
                  <Search className="h-12 w-12 mx-auto mb-4 text-blue-300" />
                  <p>No results found</p>
                  <p className="text-sm mt-1">Try a different search term</p>
                </>
              ) : (
                <>
                  <Users className="h-12 w-12 mx-auto mb-4 text-blue-300" />
                  <p>No contacts yet</p>
                  <p className="text-sm mt-1">Other users will appear here</p>
                </>
              )}
            </div>
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => onSelectContact(contact)}
              className={`p-3 border-b border-blue-50 cursor-pointer hover:bg-blue-50 transition-colors ${
                selectedContact?.id === contact.id ? "bg-blue-100" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                    <AvatarFallback className="bg-blue-500 text-white">
                      {contact.isGroup ? (
                        <Users className="h-6 w-6" />
                      ) : (
                        contact.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                      )}
                    </AvatarFallback>
                  </Avatar>
                  {!contact.isGroup && contact.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 truncate flex items-center gap-1">
                      {contact.name}
                      {contact.isGroup && <Users className="h-3 w-3 text-blue-500" />}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-blue-600">{contact.timestamp}</span>
                      {contact.unreadCount > 0 && (
                        <Badge className="bg-blue-600 text-white text-xs min-w-[20px] h-5 rounded-full flex items-center justify-center px-1.5">
                          {contact.unreadCount > 99 ? "99+" : contact.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate">{contact.lastMessage}</p>
                  </div>
                  <p className="text-xs text-blue-500 mt-1">
                    {contact.isGroup
                      ? contact.status
                      : contact.isOnline
                        ? contact.status
                        : `Last seen ${formatLastSeen(contact.lastSeen)}`}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
