"use client"

import { useState } from "react"
import { Play, Download, FileText, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useMessagingStore } from "@/lib/store"

export function MediaMessageBubble({ message }: { message: any }) {
  const { currentUser } = useMessagingStore()
  const [showMediaViewer, setShowMediaViewer] = useState(false)
  const isOwnMessage = message.sender_id === currentUser?.id

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "0 B"
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const renderMediaContent = () => {
    if (message.type === "image") {
      return (
        <div className="relative group cursor-pointer" onClick={() => setShowMediaViewer(true)}>
          <img
            src={message.media_url || "/placeholder.svg?height=200&width=300"}
            alt="Image partagée"
            className="rounded-lg max-w-xs h-auto"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors" />
        </div>
      )
    }

    if (message.type === "video") {
      return (
        <div className="relative group cursor-pointer max-w-xs" onClick={() => setShowMediaViewer(true)}>
          <video className="rounded-lg w-full h-auto" poster={message.media_url}>
            <source src={message.media_url} type="video/mp4" />
          </video>
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
              <Play className="h-6 w-6 text-gray-800 ml-1" />
            </div>
          </div>
        </div>
      )
    }

    if (message.type === "file") {
      return (
        <div className="flex items-center gap-3 p-3 border rounded-lg max-w-xs bg-muted/20">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{message.file_name || "Document"}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(message.file_size)}</p>
          </div>
          <a href={message.media_url} target="_blank" rel="noopener noreferrer" download={message.file_name}>
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                <Download className="h-4 w-4" />
            </Button>
          </a>
        </div>
      )
    }
    return null
  }

  return (
    <>
      <div className={cn("flex gap-3", isOwnMessage && "flex-row-reverse")}>
        {!isOwnMessage && (
          <Avatar className="h-8 w-8">
            <AvatarImage src={message.sender?.avatar_url || "/placeholder.svg"} />
            <AvatarFallback>{message.sender?.name?.[0]}</AvatarFallback>
          </Avatar>
        )}

        <div className={cn("flex flex-col gap-1", isOwnMessage && "items-end")}>
          {!isOwnMessage && <span className="text-xs text-muted-foreground font-medium">{message.sender?.name}</span>}
          <div className={cn("max-w-xs lg:max-w-md rounded-2xl overflow-hidden", isOwnMessage ? "bg-primary" : "bg-muted")}>
            <div className="p-1">{renderMediaContent()}</div>
            {message.content && (
              <div className="px-3 pb-3">
                <p className={cn("text-sm", isOwnMessage && "text-primary-foreground")}>{message.content}</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 px-1">
             <span className="text-xs text-muted-foreground">{new Date(message.created_at).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}</span>
             {isOwnMessage && message.status && (
                <div className="flex items-center text-xs text-muted-foreground">
                    {message.status === "sending" && <Loader2 className="h-3 w-3 animate-spin" />}
                    {message.status === "sent" && "✓"}
                    {message.status === "delivered" && "✓✓"}
                    {message.status === "read" && <span className="text-blue-500">✓✓</span>}
                </div>
             )}
          </div>
        </div>
      </div>

      {showMediaViewer && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <Button variant="ghost" size="icon" className="absolute z-30 top-4 right-4 text-white hover:bg-white/20" onClick={() => setShowMediaViewer(false)}><X className="h-6 w-6" /></Button>
          {message.type === "image" && (<img src={message.media_url} alt="Image agrandie" className="max-w-full max-h-full object-contain" />)}
          {message.type === "video" && (<video controls autoPlay className="max-w-full max-h-full"><source src={message.media_url} type="video/mp4" /></video>)}
          <div className="absolute bottom-4 left-4 text-white bg-black/50 p-2 rounded-md">
            <p className="text-sm font-medium">{message.sender?.name}</p>
            <p className="text-xs opacity-75">{new Date(message.created_at).toLocaleString('fr-FR')}</p>
            {message.content && <p className="text-sm mt-1">{message.content}</p>}
          </div>
        </div>
      )}
    </>
  )
}

