"use client"

import type React from "react"
import { useState, useRef } from "react"
import {
  SendHorizontal,
  Paperclip,
  Smile,
  X,
  Camera,
  Video,
  FileText,
  ImageIcon,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Download,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useMessages } from "@/hooks/use-messages"
import { useAuth } from "@/hooks/use-auth"
import EmojiPicker from "emoji-picker-react"
import { toast } from "sonner"

interface MediaPreview {
  file: File
  type: "image" | "video" | "file"
  url: string
  caption: string
  isUploading: boolean
}

interface V0StyleMessageInputProps {
  conversationId: string
}

export function V0StyleMessageInput({ conversationId }: V0StyleMessageInputProps) {
  const { user } = useAuth()
  const { sendMessage, sendMediaMessage, startTyping } = useMessages(conversationId, user?.id)

  const [messageText, setMessageText] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showAttachmentModal, setShowAttachmentModal] = useState(false)
  const [mediaPreview, setMediaPreview] = useState<MediaPreview | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleSendMessage = async () => {
    if (mediaPreview) {
      setMediaPreview((prev) => (prev ? { ...prev, isUploading: true } : null))
      try {
        await sendMediaMessage(mediaPreview.file, messageText.trim(), mediaPreview.type)
      } catch (error) {
        console.error("Failed to send media message:", error)
        toast.error("Échec de l'envoi du média.")
      } finally {
        removeMediaPreview()
        setMessageText("")
      }
    } else if (messageText.trim()) {
      try {
        await sendMessage(messageText.trim(), "text")
        setMessageText("")
      } catch (error) {
        console.error("Failed to send message:", error)
        toast.error("Échec de l'envoi du message.")
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    } else {
      startTyping()
    }
  }

  const onEmojiClick = (emojiData: any) => {
    const textarea = textareaRef.current
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newText = messageText.slice(0, start) + emojiData.emoji + messageText.slice(end)
      setMessageText(newText)
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + emojiData.emoji.length
        textarea.focus()
      }, 0)
    }
    setShowEmojiPicker(false)
  }

  const handleFileUpload = (type: "image" | "video" | "file") => {
    setShowAttachmentModal(false)
    if (type === "image") imageInputRef.current?.click()
    else if (type === "video") videoInputRef.current?.click()
    else fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video" | "file") => {
    const file = e.target.files?.[0]
    if (file) {
      createMediaPreview(file, type)
      e.target.value = ""
    }
  }

  const createMediaPreview = (file: File, type: "image" | "video" | "file") => {
    const url = URL.createObjectURL(file)
    setMediaPreview({
      file,
      type,
      url,
      caption: "",
      isUploading: false,
    })
  }

  const removeMediaPreview = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview.url)
      setMediaPreview(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const canSend = mediaPreview || messageText.trim()

  return (
    <>
      <div className="border-t border-border bg-card">
        {mediaPreview && (
          <div className="px-2 sm:px-4 pt-2 sm:pt-4 pb-2">
            <div className="relative bg-muted/30 rounded-lg overflow-hidden">
              {mediaPreview.isUploading ? (
                <div className="h-48 flex flex-col items-center justify-center text-center text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mb-2" />
                  <p>Envoi du média...</p>
                </div>
              ) : (
                <>
                  {mediaPreview.type === "image" && (
                    <img src={mediaPreview.url} alt="Preview" className="w-full max-h-64 object-cover rounded-lg" />
                  )}
                  {mediaPreview.type === "video" && (
                    <video ref={videoRef} src={mediaPreview.url} className="w-full max-h-64 object-cover rounded-lg" controls />
                  )}
                  {mediaPreview.type === "file" && (
                    <div className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-foreground">{mediaPreview.file.name}</p>
                          <p className="text-sm text-muted-foreground">{formatFileSize(mediaPreview.file.size)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8" onClick={removeMediaPreview}>
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        <div className="p-2 sm:p-4">
          <div className="relative flex items-end gap-2">
            <div className="relative flex-1">
              <Textarea
                ref={textareaRef}
                placeholder={mediaPreview ? "Ajouter une légende..." : "Tapez votre message..."}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-16 sm:h-20 resize-none border-2 border-input bg-background/50 p-3 sm:p-4 pr-16 sm:pr-20 text-sm focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring rounded-2xl text-foreground placeholder:text-muted-foreground"
                disabled={mediaPreview?.isUploading}
              />
              <div className="absolute bottom-2 sm:bottom-3 right-2 flex items-center gap-1 sm:gap-2">
                <Button variant="ghost" size="icon" className="h-10 w-10 sm:h-12 sm:w-12 shrink-0" onClick={() => setShowAttachmentModal(true)} disabled={mediaPreview?.isUploading}>
                  <Paperclip className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-muted" onClick={() => setShowEmojiPicker(!showEmojiPicker)} disabled={mediaPreview?.isUploading}>
                  <Smile className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button onClick={handleSendMessage} disabled={!canSend || mediaPreview?.isUploading} size="icon" className="h-7 w-7 sm:h-8 sm:w-8 bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground">
                  {mediaPreview?.isUploading ? <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" /> : <SendHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />}
                </Button>
              </div>
            </div>
          </div>
          {showEmojiPicker && (
            <div className="absolute bottom-20 sm:bottom-24 right-2 sm:right-4 z-50">
              <EmojiPicker onEmojiClick={onEmojiClick} />
            </div>
          )}
        </div>
      </div>

      {showAttachmentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Partager un fichier</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowAttachmentModal(false)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => handleFileUpload("image")}><ImageIcon className="h-6 w-6 text-primary" /><span>Galerie</span></Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => { /* Camera capture logic here */ }}><Camera className="h-6 w-6 text-green-600" /><span>Photo</span></Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => handleFileUpload("video")}><Video className="h-6 w-6 text-purple-600" /><span>Vidéo</span></Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => handleFileUpload("file")}><FileText className="h-6 w-6 text-orange-600" /><span>Document</span></Button>
            </div>
          </div>
        </div>
      )}

      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, "image")} />
      <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleFileChange(e, "video")} />
      <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => handleFileChange(e, "file")} />
      {showEmojiPicker && <div className="fixed inset-0 z-40" onClick={() => setShowEmojiPicker(false)} />}
    </>
  )
}