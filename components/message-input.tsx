"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Send, Paperclip, Mic, ImageIcon, Video, Smile, FileText, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Message } from "@/types/chat"
import EmojiPicker from "@/components/emoji-picker"
import { VoiceRecorder } from "@/components/voice-recorder"

interface MessageInputProps {
  onSendMessage: (
    content: string,
    type?: Message["type"],
    file?: File,
    voiceData?: { voiceDuration?: number; waveformData?: number[] },
  ) => void
}

export function MessageInput({ onSendMessage }: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim())
      setMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileUpload = (type: Message["type"]) => {
    const input = document.createElement("input")
    input.type = "file"

    switch (type) {
      case "image":
        input.accept = "image/*"
        break
      case "video":
        input.accept = "video/*"
        break
      case "audio":
        input.accept = "audio/*"
        break
      case "document":
        input.accept = ".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
        break
      default:
        input.accept = "*/*"
    }

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const fileName = file.name
        const fileSize = (file.size / 1024 / 1024).toFixed(2) // Size in MB
        onSendMessage(`📎 ${fileName} (${fileSize} MB)`, type, file)
      }
    }

    input.click()
  }

  const handleVoiceMessage = (duration: number, audioBlob?: Blob) => {
    // Generate waveform data for the voice message
    const waveformData = Array.from({ length: Math.floor(duration * 10) }, () => Math.random() * 100)

    onSendMessage("Voice message", "voice", audioBlob, {
      voiceDuration: duration,
      waveformData,
    })
    setShowVoiceRecorder(false)
  }

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji)
    setShowEmojiPicker(false)
  }

  const startVoiceRecording = () => {
    setShowVoiceRecorder(true)
  }

  if (showVoiceRecorder) {
    return <VoiceRecorder onSendVoiceMessage={handleVoiceMessage} onCancel={() => setShowVoiceRecorder(false)} />
  }

  return (
    <div className="relative" onClick={() => setShowEmojiPicker(false)}>
      <div className="bg-white border-t border-blue-200 p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          {/* Attachment Options */}
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
                  <Paperclip className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => handleFileUpload("document")}>
                  <FileText className="h-4 w-4 mr-2 text-red-500" />
                  Document
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFileUpload("image")}>
                  <ImageIcon className="h-4 w-4 mr-2 text-green-500" />
                  Photo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFileUpload("video")}>
                  <Video className="h-4 w-4 mr-2 text-purple-500" />
                  Video
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFileUpload("audio")}>
                  <File className="h-4 w-4 mr-2 text-blue-500" />
                  Audio
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Message Input */}
          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="pr-12 border-blue-200 focus:border-blue-400 rounded-full"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowEmojiPicker(!showEmojiPicker)
                }}
                className={`hover:bg-blue-50 ${showEmojiPicker ? "text-blue-600 bg-blue-50" : "text-blue-600"}`}
              >
                <Smile className="h-4 w-4" />
              </Button>

              {/* Emoji Picker positioned relative to button */}
              <EmojiPicker
                isOpen={showEmojiPicker}
                onEmojiSelect={handleEmojiSelect}
                onClose={() => setShowEmojiPicker(false)}
              />
            </div>
          </div>

          {/* Send/Record Button */}
          {message.trim() ? (
            <Button onClick={handleSend} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3">
              <Send className="h-5 w-5" />
            </Button>
          ) : (
            <Button onClick={startVoiceRecording} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3">
              <Mic className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
