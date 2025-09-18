export interface Contact {
  id: string
  name: string
  avatar: string
  lastMessage: string
  timestamp: string
  unreadCount: number
  isOnline: boolean
  status: string
  isGroup?: boolean
  members?: string[]
  lastSeen?: Date
}

export interface Message {
  id: string
  senderId: string
  senderName?: string
  content: string
  timestamp: Date
  type: "text" | "image" | "video" | "audio" | "voice" | "document"
  isOwn: boolean
  file?: string
  fileName?: string
  fileSize?: string
  replyTo?: string
  voiceDuration?: number
  waveformData?: number[]
}

export interface GroupChat {
  id: string
  name: string
  description: string
  avatar: string
  members: string[]
  admins: string[]
  createdBy: string
  createdAt: Date
}
