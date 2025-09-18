"use client"

import { Download, Volume2, Eye, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Message } from "@/types/chat"
import { VoiceMessage } from "@/components/voice-message"

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const handleFileDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement("a")
    link.href = fileUrl
    link.download = fileName
    link.click()
  }

  const handleFileOpen = (fileUrl: string) => {
    window.open(fileUrl, "_blank")
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()
    switch (extension) {
      case "pdf":
        return "📄"
      case "doc":
      case "docx":
        return "📝"
      case "xls":
      case "xlsx":
        return "📊"
      case "ppt":
      case "pptx":
        return "📋"
      case "zip":
      case "rar":
        return "🗜️"
      case "txt":
        return "📃"
      default:
        return "📎"
    }
  }

  const renderMessageContent = () => {
    switch (message.type) {
      case "image":
        return (
          <div className="max-w-xs">
            <div className="relative group cursor-pointer" onClick={() => handleFileOpen(message.file || "")}>
              <img
                src={message.file || "/placeholder.svg?height=200&width=300"}
                alt="Shared image"
                className="rounded-lg w-full h-auto hover:opacity-90 transition-opacity"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=200&width=300"
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            {message.content && message.content !== "Shared image" && <p className="mt-2 text-sm">{message.content}</p>}
          </div>
        )

      case "video":
        return (
          <div className="max-w-xs">
            <div className="relative bg-gray-900 rounded-lg overflow-hidden group cursor-pointer">
              <video
                src={message.file}
                className="w-full h-48 object-cover"
                controls
                onError={(e) => {
                  const target = e.target as HTMLVideoElement
                  target.poster = "/placeholder.svg?height=200&width=300"
                }}
              />
              <div className="absolute top-2 right-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleFileOpen(message.file || "")
                  }}
                  className="bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
            {message.content && message.content !== "Shared video" && <p className="mt-2 text-sm">{message.content}</p>}
          </div>
        )

      case "audio":
        return (
          <div className="flex items-center gap-3 bg-blue-100 p-3 rounded-lg max-w-xs">
            <Button
              size="sm"
              variant="ghost"
              className="p-2"
              onClick={() => {
                const audio = new Audio(message.file)
                audio.play().catch(console.error)
              }}
            >
              <Volume2 className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <div className="h-1 bg-blue-300 rounded-full">
                <div className="h-1 bg-blue-600 rounded-full w-1/3"></div>
              </div>
              <p className="text-xs text-blue-600 mt-1">{message.fileName || "Audio file"}</p>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" className="p-2" onClick={() => handleFileOpen(message.file || "")}>
                <ExternalLink className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="p-2"
                onClick={() => handleFileDownload(message.file || "", message.fileName || "audio")}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )

      case "document":
        return (
          <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg max-w-xs border border-gray-200">
            <div className="text-2xl">{getFileIcon(message.fileName || "")}</div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{message.fileName || "Document"}</p>
              <p className="text-xs text-gray-500">{message.fileSize || "Unknown size"}</p>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="p-2 hover:bg-blue-100"
                onClick={() => handleFileOpen(message.file || "")}
                title="Open"
              >
                <Eye className="h-4 w-4 text-blue-600" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="p-2 hover:bg-green-100"
                onClick={() => handleFileDownload(message.file || "", message.fileName || "document")}
                title="Download"
              >
                <Download className="h-4 w-4 text-green-600" />
              </Button>
            </div>
          </div>
        )

      case "voice":
        return (
          <VoiceMessage
            duration={message.voiceDuration || 30}
            isOwn={message.isOwn}
            audioUrl={message.file}
            waveformData={message.waveformData}
          />
        )

      default:
        return <p className="text-sm">{message.content}</p>
    }
  }

  return (
    <div className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
          message.isOwn
            ? "bg-blue-600 text-white rounded-br-sm"
            : "bg-white text-gray-800 rounded-bl-sm shadow-sm border border-blue-100"
        }`}
      >
        {renderMessageContent()}
        <div className={`text-xs mt-1 ${message.isOwn ? "text-blue-200" : "text-gray-500"}`}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  )
}
