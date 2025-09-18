"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRecentEmojis } from "@/hooks/use-recent-emojis"

interface EmojiPickerProps {
  isOpen: boolean
  onEmojiSelect: (emoji: string) => void
  onClose: () => void
}

const EMOJI_CATEGORIES = [
  { name: "Recent", icon: "🕒" },
  { name: "Smileys", icon: "😀" },
  { name: "People", icon: "👋" },
  { name: "Animals", icon: "🐶" },
  { name: "Food", icon: "🍎" },
  { name: "Travel", icon: "🚗" },
  { name: "Activities", icon: "⚽" },
  { name: "Objects", icon: "📱" },
  { name: "Symbols", icon: "❤️" },
]

const EMOJIS = {
  Smileys: [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "🤣",
    "😂",
    "🙂",
    "🙃",
    "😉",
    "😊",
    "😇",
    "🥰",
    "😍",
    "🤩",
    "😘",
    "😗",
    "😚",
    "😙",
    "😋",
    "😛",
    "😜",
    "🤪",
    "😝",
    "🤑",
    "🤗",
    "🤭",
    "🤫",
    "🤔",
    "🤐",
    "🤨",
    "😐",
    "😑",
    "😶",
    "😏",
    "😒",
    "🙄",
    "😬",
    "🤥",
  ],
  People: [
    "👋",
    "🤚",
    "🖐️",
    "✋",
    "🖖",
    "👌",
    "🤏",
    "✌️",
    "🤞",
    "🤟",
    "🤘",
    "🤙",
    "👈",
    "👉",
    "👆",
    "🖕",
    "👇",
    "☝️",
    "👍",
    "👎",
    "✊",
    "👊",
    "🤛",
    "🤜",
    "👏",
    "🙌",
    "👐",
    "🤲",
    "🤝",
    "🙏",
    "✍️",
    "💅",
  ],
  Animals: [
    "🐶",
    "🐱",
    "🐭",
    "🐹",
    "🐰",
    "🦊",
    "🐻",
    "🐼",
    "🐨",
    "🐯",
    "🦁",
    "🐮",
    "🐷",
    "🐽",
    "🐸",
    "🐵",
    "🙈",
    "🙉",
    "🙊",
    "🐒",
    "🐔",
    "🐧",
    "🐦",
    "🐤",
    "🐣",
    "🐥",
    "🦆",
    "🦅",
    "🦉",
    "🦇",
    "🐺",
    "🐗",
  ],
  Food: [
    "🍎",
    "🍐",
    "🍊",
    "🍋",
    "🍌",
    "🍉",
    "🍇",
    "🍓",
    "🍈",
    "🍒",
    "🍑",
    "🥭",
    "🍍",
    "🥥",
    "🥝",
    "🍅",
    "🍆",
    "🥑",
    "🥦",
    "🥬",
    "🥒",
    "🌶️",
    "🌽",
    "🥕",
    "🧄",
    "🧅",
    "🥔",
    "🍠",
    "🥐",
    "🍞",
    "🥖",
    "🥨",
  ],
  Travel: [
    "🚗",
    "🚕",
    "🚙",
    "🚌",
    "🚎",
    "🏎️",
    "🚓",
    "🚑",
    "🚒",
    "🚐",
    "🛻",
    "🚚",
    "🚛",
    "🚜",
    "🏍️",
    "🛵",
    "🚲",
    "🛴",
    "🛹",
    "🚁",
    "✈️",
    "🛩️",
    "🛫",
    "🛬",
    "🚀",
    "🛸",
    "🚢",
    "⛵",
    "🚤",
    "🛥️",
    "🛳️",
    "⛴️",
  ],
  Activities: [
    "⚽",
    "🏀",
    "🏈",
    "⚾",
    "🥎",
    "🎾",
    "🏐",
    "🏉",
    "🥏",
    "🎱",
    "🪀",
    "🏓",
    "🏸",
    "🏒",
    "🏑",
    "🥍",
    "🏏",
    "🪃",
    "🥅",
    "⛳",
    "🪁",
    "🏹",
    "🎣",
    "🤿",
    "🥊",
    "🥋",
    "🎽",
    "🛹",
    "🛷",
    "⛸️",
    "🥌",
    "🎿",
  ],
  Objects: [
    "📱",
    "📲",
    "💻",
    "⌨️",
    "🖥️",
    "🖨️",
    "🖱️",
    "🖲️",
    "🕹️",
    "🗜️",
    "💽",
    "💾",
    "💿",
    "📀",
    "📼",
    "📷",
    "📸",
    "📹",
    "🎥",
    "📽️",
    "🎞️",
    "📞",
    "☎️",
    "📟",
    "📠",
    "📺",
    "📻",
    "🎙️",
    "🎚️",
    "🎛️",
    "🧭",
    "⏱️",
  ],
  Symbols: [
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "🤍",
    "🤎",
    "💔",
    "❣️",
    "💕",
    "💞",
    "💓",
    "💗",
    "💖",
    "💘",
    "💝",
    "💟",
    "☮️",
    "✝️",
    "☪️",
    "🕉️",
    "☸️",
    "✡️",
    "🔯",
    "🕎",
    "☯️",
    "☦️",
    "🛐",
    "⛎",
    "♈",
  ],
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ isOpen, onEmojiSelect, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState("Smileys")
  const { recentEmojis, addRecentEmoji } = useRecentEmojis()

  if (!isOpen) return null

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji)
    addRecentEmoji(emoji)
  }

  const getCurrentEmojis = () => {
    if (selectedCategory === "Recent") {
      return recentEmojis
    }
    return EMOJIS[selectedCategory as keyof typeof EMOJIS] || []
  }

  return (
    <div className="absolute bottom-full right-0 mb-2 bg-white border border-blue-200 rounded-lg shadow-lg w-80 z-50">
      {/* Categories */}
      <div className="flex items-center justify-between p-2 border-b border-blue-100 overflow-x-auto">
        {EMOJI_CATEGORIES.map((category) => (
          <Button
            key={category.name}
            variant="ghost"
            size="sm"
            onClick={() => setSelectedCategory(category.name)}
            className={`text-lg p-1 min-w-[32px] ${
              selectedCategory === category.name ? "bg-blue-100 text-blue-600" : "text-gray-500 hover:bg-blue-50"
            }`}
            title={category.name}
          >
            {category.icon}
          </Button>
        ))}
      </div>

      {/* Emojis Grid */}
      <div className="h-48 overflow-y-auto p-2">
        <div className="grid grid-cols-8 gap-1">
          {getCurrentEmojis().map((emoji, index) => (
            <Button
              key={`${emoji}-${index}`}
              variant="ghost"
              size="sm"
              onClick={() => handleEmojiClick(emoji)}
              className="h-8 w-8 p-0 text-lg hover:bg-blue-100 rounded"
              title={emoji}
            >
              {emoji}
            </Button>
          ))}
        </div>

        {selectedCategory === "Recent" && recentEmojis.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-8">No recent emojis yet</div>
        )}
      </div>
    </div>
  )
}

export { EmojiPicker }
export default EmojiPicker
