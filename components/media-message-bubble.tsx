"use client"

import { useState } from "react"
import { Play, Download, FileText, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useMessagingStore } from "@/lib/store"

interface MediaMessageBubbleProps {
  message: {
    id: string
    senderId: string
    senderName: string
    senderAvatar?: string
    content: string
    timestamp: string
    type: "text" | "image" | "video" | "file"
    status?: "sending" | "sent" | "delivered" | "read"
    mediaUrl?: string
    fileName?: string
    fileSize?: string
    uploadProgress?: number
  }
}

export function MediaMessageBubble({ message }: MediaMessageBubbleProps) {
  const { user } = useMessagingStore()
  const [showMediaViewer, setShowMediaViewer] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const isOwnMessage = message.senderId === user?.id

  const formatFileSize = (bytes: number) => {
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
            src={message.mediaUrl || "/placeholder.svg?height=200&width=300"}
            alt="Image partagée"
            className="rounded-lg max-w-xs h-auto"
          />
          {message.status === "sending" && message.uploadProgress !== undefined && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <div className="text-center text-white">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="text-sm">{message.uploadProgress}%</p>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors" />
        </div>
      )
    }

    if (message.type === "video") {
      return (
        <div className="relative group cursor-pointer max-w-xs" onClick={() => setShowMediaViewer(true)}>
          <video className="rounded-lg w-full h-auto" poster="/placeholder.svg?height=200&width=300">
            <source src={message.mediaUrl} type="video/mp4" />
          </video>
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
              <Play className="h-6 w-6 text-gray-800 ml-1" />
            </div>
          </div>
          {message.status === "sending" && message.uploadProgress !== undefined && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <div className="text-center text-white">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="text-sm">{message.uploadProgress}%</p>
              </div>
            </div>
          )}
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
            <p className="text-sm font-medium truncate">{message.fileName || "Document"}</p>
            <p className="text-xs text-muted-foreground">{message.fileSize || "Taille inconnue"}</p>
            {message.status === "sending" && message.uploadProgress !== undefined && (
              <div className="flex items-center gap-2 mt-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="text-xs">{message.uploadProgress}%</span>
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
            <Download className="h-4 w-4" />
          </Button>
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
            <AvatarImage src={message.senderAvatar || "/placeholder.svg"} />
            <AvatarFallback>{message.senderName[0]}</AvatarFallback>
          </Avatar>
        )}

        <div className={cn("flex flex-col gap-1", isOwnMessage && "items-end")}>
          {!isOwnMessage && <span className="text-xs text-muted-foreground font-medium">{message.senderName}</span>}

          <div
            className={cn(
              "max-w-xs lg:max-w-md rounded-2xl overflow-hidden",
              isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted",
            )}
          >
            {/* Contenu média */}
            <div className="p-1">{renderMediaContent()}</div>

            {/* Légende si présente */}
            {message.content && (
              <div className="px-3 pb-3">
                <p className="text-sm">{message.content}</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">{message.timestamp}</span>
            {isOwnMessage && message.status && (
              <Badge variant="secondary" className="text-xs">
                {message.status === "sending" && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                {message.status === "sending" && "Envoi..."}
                {message.status === "sent" && "✓"}
                {message.status === "delivered" && "✓✓"}
                {message.status === "read" && "✓✓"}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Visionneuse de médias */}
      {showMediaViewer && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-full p-4">
            <Button
              variant="ghost"
              size="icon"
              className="absolute z-30 top-4 right-4 text-white hover:bg-white/20"
              onClick={() => setShowMediaViewer(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            {message.type === "image" && (
              <img
                src={message.mediaUrl || "/placeholder.svg"}
                alt="Image agrandie"
                className="max-w-full max-h-full object-contain"
              />
            )}

            {message.type === "video" && (
              <video
                controls
                autoPlay
                className="max-w-full max-h-full"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              >
                <source src={message.mediaUrl} type="video/mp4" />
              </video>
            )}

            {/* Informations du média */}
            <div className="absolute bottom-4 left-4 text-white">
              <p className="text-sm font-medium">{message.senderName}</p>
              <p className="text-xs opacity-75">{message.timestamp}</p>
              {message.content && <p className="text-sm mt-1">{message.content}</p>}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
