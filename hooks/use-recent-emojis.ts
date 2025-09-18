"use client"

import { useState, useEffect } from "react"

const RECENT_EMOJIS_KEY = "chatzy-recent-emojis"
const MAX_RECENT_EMOJIS = 20

export function useRecentEmojis() {
  const [recentEmojis, setRecentEmojis] = useState<string[]>([])

  useEffect(() => {
    // Load recent emojis from localStorage
    const stored = localStorage.getItem(RECENT_EMOJIS_KEY)
    if (stored) {
      try {
        setRecentEmojis(JSON.parse(stored))
      } catch (error) {
        console.error("Failed to parse recent emojis:", error)
      }
    }
  }, [])

  const addRecentEmoji = (emoji: string) => {
    setRecentEmojis((prev) => {
      // Remove emoji if it already exists
      const filtered = prev.filter((e) => e !== emoji)
      // Add to beginning
      const updated = [emoji, ...filtered].slice(0, MAX_RECENT_EMOJIS)

      // Save to localStorage
      localStorage.setItem(RECENT_EMOJIS_KEY, JSON.stringify(updated))

      return updated
    })
  }

  return { recentEmojis, addRecentEmoji }
}
