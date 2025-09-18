export interface User {
  id: string
  name: string
  email: string
  avatar: string
  isOnline: boolean
  lastSeen: Date
  bio?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}
