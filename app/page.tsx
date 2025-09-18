"use client"

import { useState, useEffect } from "react"
import { ChatSidebar } from "@/components/chat-sidebar"
import { ChatWindow } from "@/components/chat-window"
import { AuthPage } from "@/components/auth-page"
import { ProfileEditor } from "@/components/profile-editor"
import { GroupCreator } from "@/components/group-creator"
import { CallHistoryModal } from "@/components/call-history-modal"
import { IncomingCallNotification } from "@/components/incoming-call-notification"
import { VoiceCallModal } from "@/components/voice-call-modal"
import type { Contact, Message, GroupChat } from "@/types/chat"
import type { User } from "@/types/auth"

export default function ChatzyApp() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [messages, setMessages] = useState<Record<string, Message[]>>({})
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [showProfileEditor, setShowProfileEditor] = useState(false)
  const [showGroupCreator, setShowGroupCreator] = useState(false)
  const [showCallHistory, setShowCallHistory] = useState(false)
  const [groups, setGroups] = useState<GroupChat[]>([])
  const [readMessages, setReadMessages] = useState<Set<string>>(new Set())
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [incomingCall, setIncomingCall] = useState<Contact | null>(null)
  const [showIncomingCallModal, setShowIncomingCallModal] = useState(false)

  // Simulate incoming calls randomly
  useEffect(() => {
    if (!currentUser || contacts.length === 0) return

    const simulateIncomingCall = () => {
      // 5% chance of receiving a call every 30 seconds
      if (Math.random() < 0.05) {
        const randomContact = contacts[Math.floor(Math.random() * contacts.length)]
        if (randomContact && !randomContact.isGroup) {
          setIncomingCall(randomContact)
        }
      }
    }

    const callSimulationInterval = setInterval(simulateIncomingCall, 30000)
    return () => clearInterval(callSimulationInterval)
  }, [currentUser, contacts])

  // Load all registered users and create contacts
  const loadContacts = (currentUserId: string) => {
    const users = JSON.parse(localStorage.getItem("chatzy-users") || "[]") as User[]
    setAllUsers(users)

    // Filter out current user and create contacts
    const userContacts: Contact[] = users
      .filter((user) => user.id !== currentUserId)
      .map((user) => {
        // Get last message between current user and this contact
        const conversationKey = getConversationKey(currentUserId, user.id)
        const conversationMessages = JSON.parse(localStorage.getItem(`chatzy-conversation-${conversationKey}`) || "[]")
        const lastMessage = conversationMessages[conversationMessages.length - 1]

        // Calculate unread count for this contact
        const unreadCount = conversationMessages.filter(
          (msg: any) => msg.senderId === user.id && !readMessages.has(msg.id),
        ).length

        // Safely handle lastSeen conversion
        const lastSeenDate = user.lastSeen ? new Date(user.lastSeen) : new Date()

        return {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          lastMessage: lastMessage
            ? lastMessage.type === "text"
              ? lastMessage.content
              : lastMessage.type === "voice"
                ? "🎤 Voice message"
                : lastMessage.type === "document"
                  ? `📎 ${lastMessage.fileName || "Document"}`
                  : `📎 ${lastMessage.type}`
            : "Start a conversation",
          timestamp: lastMessage ? formatMessageTime(new Date(lastMessage.timestamp)) : "",
          unreadCount,
          isOnline: user.isOnline || false,
          status: user.isOnline ? "Online" : `Last seen ${formatLastSeen(user.lastSeen)}`,
          lastSeen: lastSeenDate,
        }
      })

    setContacts(userContacts)
  }

  // Generate conversation key for two users (consistent ordering)
  const getConversationKey = (userId1: string, userId2: string) => {
    return [userId1, userId2].sort().join("-")
  }

  // Load messages for a specific conversation
  const loadConversationMessages = (currentUserId: string, contactId: string) => {
    const conversationKey = getConversationKey(currentUserId, contactId)
    const conversationMessages = JSON.parse(localStorage.getItem(`chatzy-conversation-${conversationKey}`) || "[]")

    // Convert timestamp strings back to Date objects and set isOwn property
    const processedMessages = conversationMessages.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
      isOwn: msg.senderId === currentUserId,
    }))

    return processedMessages
  }

  // Save message to conversation
  const saveMessageToConversation = (currentUserId: string, contactId: string, message: Message) => {
    const conversationKey = getConversationKey(currentUserId, contactId)
    const existingMessages = JSON.parse(localStorage.getItem(`chatzy-conversation-${conversationKey}`) || "[]")
    const updatedMessages = [...existingMessages, message]
    localStorage.setItem(`chatzy-conversation-${conversationKey}`, JSON.stringify(updatedMessages))
  }

  // Save call to history
  const saveCallToHistory = (
    contact: Contact,
    type: "incoming" | "outgoing",
    duration: number,
    status: "completed" | "missed" | "declined",
  ) => {
    if (!currentUser) return

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
    const updatedHistory = [callRecord, ...existingHistory].slice(0, 100)
    localStorage.setItem(`chatzy-call-history-${currentUser.id}`, JSON.stringify(updatedHistory))
  }

  // Format message timestamp
  const formatMessageTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    if (days < 7) return date.toLocaleDateString("en-US", { weekday: "short" })
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  // Format last seen time
  const formatLastSeen = (lastSeen?: Date | string) => {
    if (!lastSeen) return "Unknown"

    // Convert to Date object if it's a string
    const lastSeenDate = typeof lastSeen === "string" ? new Date(lastSeen) : lastSeen

    // Check if the date is valid
    if (isNaN(lastSeenDate.getTime())) return "Unknown"

    const now = new Date()
    const diff = now.getTime() - lastSeenDate.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  // Handle incoming call
  const handleIncomingCall = (contact: Contact) => {
    setIncomingCall(contact)
  }

  const handleAcceptIncomingCall = () => {
    if (incomingCall) {
      setSelectedContact(incomingCall)
      setShowIncomingCallModal(true)
      setIncomingCall(null)
    }
  }

  const handleDeclineIncomingCall = () => {
    if (incomingCall) {
      saveCallToHistory(incomingCall, "incoming", 0, "declined")
      setIncomingCall(null)
    }
  }

  const handleEndIncomingCall = (duration?: number) => {
    if (incomingCall && duration) {
      saveCallToHistory(incomingCall, "incoming", duration, "completed")
    }
    setShowIncomingCallModal(false)
    setIncomingCall(null)
  }

  // Mark messages as read when contact is selected
  useEffect(() => {
    if (selectedContact && currentUser) {
      const contactMessages = messages[selectedContact.id] || []
      const newReadMessages = new Set(readMessages)

      contactMessages.forEach((msg) => {
        if (!msg.isOwn && msg.senderId !== currentUser.id) {
          newReadMessages.add(msg.id)
        }
      })

      setReadMessages(newReadMessages)
      localStorage.setItem(`chatzy-read-${currentUser.id}`, JSON.stringify(Array.from(newReadMessages)))

      // Refresh contacts to update unread counts
      loadContacts(currentUser.id)
    }
  }, [selectedContact, messages, currentUser])

  // Load read messages from localStorage
  useEffect(() => {
    if (currentUser) {
      const savedReadMessages = localStorage.getItem(`chatzy-read-${currentUser.id}`)
      if (savedReadMessages) {
        try {
          setReadMessages(new Set(JSON.parse(savedReadMessages)))
        } catch (error) {
          console.error("Failed to load read messages:", error)
        }
      }
    }
  }, [currentUser])

  // Update user status periodically
  useEffect(() => {
    if (!currentUser) return

    const updateUserStatus = () => {
      const users = JSON.parse(localStorage.getItem("chatzy-users") || "[]")
      const updatedUsers = users.map((u: User) =>
        u.id === currentUser.id ? { ...u, isOnline: true, lastSeen: new Date() } : u,
      )
      localStorage.setItem("chatzy-users", JSON.stringify(updatedUsers))

      // Refresh contacts to show updated online status
      loadContacts(currentUser.id)
    }

    // Update status every 30 seconds
    const statusInterval = setInterval(updateUserStatus, 30000)
    updateUserStatus() // Initial update

    return () => clearInterval(statusInterval)
  }, [currentUser])

  // Check for new messages from other users periodically
  useEffect(() => {
    if (!currentUser) return

    const checkForNewMessages = () => {
      contacts.forEach((contact) => {
        const newMessages = loadConversationMessages(currentUser.id, contact.id)
        setMessages((prev) => ({
          ...prev,
          [contact.id]: newMessages,
        }))
      })

      // Refresh contacts to update unread counts and last messages
      loadContacts(currentUser.id)
    }

    // Check for new messages every 5 seconds
    const messageCheckInterval = setInterval(checkForNewMessages, 5000)

    return () => clearInterval(messageCheckInterval)
  }, [currentUser, contacts])

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem("chatzy-current-user")
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        setCurrentUser(user)
        initializeChat(user)
      } catch (error) {
        console.error("Failed to parse saved user:", error)
        localStorage.removeItem("chatzy-current-user")
      }
    }
  }, [])

  const initializeChat = (user: User) => {
    loadContacts(user.id)

    // Load saved groups
    const savedGroups = localStorage.getItem(`chatzy-groups-${user.id}`)
    if (savedGroups) {
      try {
        setGroups(JSON.parse(savedGroups))
      } catch (error) {
        console.error("Failed to load groups:", error)
      }
    }
  }

  // Handle contact selection
  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact)
    if (currentUser) {
      const conversationMessages = loadConversationMessages(currentUser.id, contact.id)
      setMessages((prev) => ({
        ...prev,
        [contact.id]: conversationMessages,
      }))
    }
  }

  const handleLogin = (user: User) => {
    setCurrentUser(user)
    initializeChat(user)
  }

  const handleLogout = () => {
    if (currentUser) {
      // Update user status to offline
      const users = JSON.parse(localStorage.getItem("chatzy-users") || "[]")
      const updatedUsers = users.map((u: User) =>
        u.id === currentUser.id ? { ...u, isOnline: false, lastSeen: new Date() } : u,
      )
      localStorage.setItem("chatzy-users", JSON.stringify(updatedUsers))
    }

    localStorage.removeItem("chatzy-current-user")
    setCurrentUser(null)
    setContacts([])
    setMessages({})
    setSelectedContact(null)
    setGroups([])
    setReadMessages(new Set())
  }

  const handleProfileSave = (updatedUser: User) => {
    setCurrentUser(updatedUser)
    setShowProfileEditor(false)
    // Refresh contacts to show updated profile
    if (updatedUser) {
      loadContacts(updatedUser.id)
    }
  }

  const handleCreateGroup = (group: GroupChat) => {
    if (!currentUser) return

    const newGroups = [...groups, group]
    setGroups(newGroups)
    localStorage.setItem(`chatzy-groups-${currentUser.id}`, JSON.stringify(newGroups))

    // Add group to contacts
    const groupContact: Contact = {
      id: group.id,
      name: group.name,
      avatar: group.avatar,
      lastMessage: "Group created",
      timestamp: "now",
      unreadCount: 0,
      isOnline: true,
      status: `${group.members.length} members`,
      isGroup: true,
      members: group.members,
    }

    setContacts((prev) => [groupContact, ...prev])
    setMessages((prev) => ({ ...prev, [group.id]: [] }))
    setShowGroupCreator(false)
    setSelectedContact(groupContact)
  }

  const handleCallContact = (contact: Contact) => {
    setSelectedContact(contact)
    // The call will be initiated from the chat window
  }

  const handleSendMessage = async (
    content: string,
    type: Message["type"] = "text",
    file?: File,
    voiceData?: { voiceDuration?: number; waveformData?: number[] },
  ) => {
    if (!selectedContact || !currentUser) return

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      content,
      timestamp: new Date(),
      type,
      isOwn: true,
      file: file ? URL.createObjectURL(file) : undefined,
      fileName: file?.name,
      fileSize: file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : undefined,
      voiceDuration: voiceData?.voiceDuration,
      waveformData: voiceData?.waveformData,
    }

    // Add message to local state
    setMessages((prev) => ({
      ...prev,
      [selectedContact.id]: [...(prev[selectedContact.id] || []), newMessage],
    }))

    // Save message to conversation storage
    saveMessageToConversation(currentUser.id, selectedContact.id, newMessage)

    // Update contact's last message and refresh contacts
    setTimeout(() => {
      loadContacts(currentUser.id)
    }, 100)
  }

  if (!currentUser) {
    return <AuthPage onLogin={handleLogin} />
  }

  return (
    <div className="flex h-screen bg-blue-50">
      <ChatSidebar
        contacts={contacts}
        selectedContact={selectedContact}
        onSelectContact={handleSelectContact}
        currentUser={currentUser}
        onLogout={handleLogout}
        onEditProfile={() => setShowProfileEditor(true)}
        onCreateGroup={() => setShowGroupCreator(true)}
        onShowCallHistory={() => setShowCallHistory(true)}
      />
      <ChatWindow
        contact={selectedContact}
        messages={selectedContact ? messages[selectedContact.id] || [] : []}
        onSendMessage={handleSendMessage}
        currentUser={currentUser}
        isTyping={false}
        onIncomingCall={handleIncomingCall}
      />

      {/* Modals */}
      {showProfileEditor && (
        <ProfileEditor user={currentUser} onSave={handleProfileSave} onClose={() => setShowProfileEditor(false)} />
      )}

      {showGroupCreator && (
        <GroupCreator
          contacts={contacts}
          currentUser={currentUser}
          onCreateGroup={handleCreateGroup}
          onClose={() => setShowGroupCreator(false)}
        />
      )}

      {showCallHistory && (
        <CallHistoryModal
          contacts={contacts}
          currentUserId={currentUser.id}
          onClose={() => setShowCallHistory(false)}
          onCallContact={handleCallContact}
        />
      )}

      {/* Incoming Call Notification */}
      {incomingCall && (
        <IncomingCallNotification
          contact={incomingCall}
          onAccept={handleAcceptIncomingCall}
          onDecline={handleDeclineIncomingCall}
        />
      )}

      {/* Incoming Call Modal */}
      {showIncomingCallModal && incomingCall && (
        <VoiceCallModal
          contact={incomingCall}
          isIncoming={true}
          onEndCall={handleEndIncomingCall}
          onAcceptCall={() => {}}
          onDeclineCall={() => {}}
        />
      )}
    </div>
  )
}
