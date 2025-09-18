"use client"

export function TypingIndicator({ contactName }: { contactName: string }) {
  return (
    <div className="flex justify-start mb-4">
      <div className="bg-white text-gray-800 rounded-2xl rounded-bl-sm shadow-sm border border-blue-100 px-4 py-2 max-w-xs">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
          </div>
          <span className="text-xs text-gray-500">{contactName} is typing...</span>
        </div>
      </div>
    </div>
  )
}
