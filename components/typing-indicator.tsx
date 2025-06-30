"use client"

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
        <div className="flex gap-1">
          <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
      <span className="text-sm text-gray-500 italic">En train d'écrire...</span>
    </div>
  )
}