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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useMessagingStore } from "@/lib/store"
import EmojiPicker from "emoji-picker-react"

interface MediaPreview {
  file: File
  type: "image" | "video" | "file"
  url: string
  caption: string
}

interface V0StyleMessageInputProps {
  conversationId: string
}

export function V0StyleMessageInput({ conversationId }: V0StyleMessageInputProps) {
  const { sendMessage, sendMediaMessage } = useMessagingStore()
  const [messageText, setMessageText] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showAttachmentModal, setShowAttachmentModal] = useState(false)
  const [mediaPreview, setMediaPreview] = useState<MediaPreview | null>(null)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [isVideoMuted, setIsVideoMuted] = useState(false)
  const [showVideoControls, setShowVideoControls] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleSendMessage = () => {
    if (mediaPreview) {
      // Envoyer le média avec le messageText comme légende
      sendMediaMessage(conversationId, mediaPreview.file, mediaPreview.type, messageText.trim())
      setMediaPreview(null)
      setMessageText("")
    } else if (messageText.trim()) {
      // Envoyer le message texte
      sendMessage(conversationId, messageText.trim())
      setMessageText("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value)
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
    if (type === "image") {
      imageInputRef.current?.click()
    } else if (type === "video") {
      videoInputRef.current?.click()
    } else {
      fileInputRef.current?.click()
    }
  }

  const handleCameraCapture = async (type: "image" | "video") => {
    setShowAttachmentModal(false)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: type === "video",
      })

      if (type === "image") {
        // Capture photo
        const video = document.createElement("video")
        video.srcObject = stream
        video.play()

        video.onloadedmetadata = () => {
          const canvas = document.createElement("canvas")
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          const ctx = canvas.getContext("2d")
          ctx?.drawImage(video, 0, 0)

          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], `photo-${Date.now()}.jpg`, { type: "image/jpeg" })
              createMediaPreview(file, "image")
            }
          }, "image/jpeg")

          stream.getTracks().forEach((track) => track.stop())
        }
      } else {
        // Enregistrement vidéo (simulation)
        setTimeout(() => {
          stream.getTracks().forEach((track) => track.stop())
          // Simuler un fichier vidéo
          const blob = new Blob([], { type: "video/mp4" })
          const file = new File([blob], `video-${Date.now()}.mp4`, { type: "video/mp4" })
          createMediaPreview(file, "video")
        }, 3000)
      }
    } catch (error) {
      console.error("Erreur accès caméra:", error)
      alert("Impossible d'accéder à la caméra")
    }
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
    })
  }

  const removeMediaPreview = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview.url)
      setMediaPreview(null)
      setIsVideoPlaying(false)
      setShowVideoControls(false)
    }
  }

  const toggleVideoPlay = () => {
    const video = videoRef.current
    if (video) {
      if (isVideoPlaying) {
        video.pause()
        setIsVideoPlaying(false)
      } else {
        video.play()
        setIsVideoPlaying(true)
      }
    }
  }

  const toggleVideoMute = () => {
    const video = videoRef.current
    if (video) {
      video.muted = !video.muted
      setIsVideoMuted(video.muted)
    }
  }

  const downloadMedia = () => {
    if (mediaPreview) {
      const link = document.createElement("a")
      link.href = mediaPreview.url
      link.download = mediaPreview.file.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
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
        {/* Preview du média - VERSION AMÉLIORÉE AVEC CONTRÔLES */}
        {mediaPreview && (
          <div className="px-2 sm:px-4 pt-2 sm:pt-4 pb-2">
            <div className="relative bg-muted/30 rounded-lg overflow-hidden">
              {/* Preview Image */}
              {mediaPreview.type === "image" && (
                <div className="relative group">
                  <img
                    src={mediaPreview.url || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full max-h-64 object-cover rounded-lg"
                  />

                  {/* Contrôles Image */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg">
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white border-0"
                        onClick={downloadMedia}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" className="h-8 w-8" onClick={removeMediaPreview}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Preview Vidéo avec contrôles */}
              {mediaPreview.type === "video" && (
                <div
                  className="relative group cursor-pointer"
                  onMouseEnter={() => setShowVideoControls(true)}
                  onMouseLeave={() => setShowVideoControls(false)}
                >
                  <video
                    ref={videoRef}
                    src={mediaPreview.url}
                    className="w-full max-h-64 object-cover rounded-lg"
                    onClick={toggleVideoPlay}
                    onPlay={() => setIsVideoPlaying(true)}
                    onPause={() => setIsVideoPlaying(false)}
                    muted={isVideoMuted}
                  />

                  {/* Overlay de lecture */}
                  {!isVideoPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                        <Play className="h-8 w-8 text-gray-800 ml-1" />
                      </div>
                    </div>
                  )}

                  {/* Contrôles vidéo */}
                  <div
                    className={`absolute inset-0 transition-opacity ${showVideoControls || !isVideoPlaying ? "opacity-100" : "opacity-0"}`}
                  >
                    {/* Contrôles en bas */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white border-0"
                          onClick={toggleVideoPlay}
                        >
                          {isVideoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>

                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white border-0"
                          onClick={toggleVideoMute}
                        >
                          {isVideoMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white border-0"
                          onClick={downloadMedia}
                        >
                          <Download className="h-4 w-4" />
                        </Button>

                        <Button variant="destructive" size="icon" className="h-8 w-8" onClick={removeMediaPreview}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preview Fichier */}
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

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent" onClick={downloadMedia}>
                        <Download className="h-4 w-4" />
                      </Button>

                      <Button variant="destructive" size="icon" className="h-8 w-8" onClick={removeMediaPreview}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Info fichier en bas */}
              <div className="px-3 pb-2">
                <p className="text-xs text-muted-foreground">
                  {mediaPreview.type === "image" && "📷 Photo"}
                  {mediaPreview.type === "video" && "🎥 Vidéo"}
                  {mediaPreview.type === "file" && "📄 Document"}
                  {" • "}
                  {formatFileSize(mediaPreview.file.size)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Zone de saisie FIXE */}
        <div className="p-2 sm:p-4">
          <div className="relative flex items-end gap-2">
            {/* Container du textarea FIXE */}
            <div className="relative flex-1">
              <Textarea
                ref={textareaRef}
                placeholder={
                  mediaPreview
                    ? `Ajouter une légende pour ${mediaPreview.type === "image" ? "la photo" : mediaPreview.type === "video" ? "la vidéo" : "le fichier"}...`
                    : "Tapez votre message..."
                }
                value={messageText}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                className="h-16 sm:h-20 resize-none border-2 border-input bg-background/50 p-3 sm:p-4 pr-16 sm:pr-20 text-sm focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring rounded-2xl text-foreground placeholder:text-muted-foreground"
              />

              {/* Boutons dans le textarea */}
              <div className="absolute bottom-2 sm:bottom-3 right-2 flex items-center gap-1 sm:gap-2">
                {/* Bouton d'attachement */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 sm:h-12 sm:w-12 shrink-0"
                  onClick={() => setShowAttachmentModal(true)}
                >
                  <Paperclip className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-muted"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Smile className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>

                <Button
                  onClick={handleSendMessage}
                  disabled={!canSend}
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8 bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground"
                >
                  <SendHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="absolute bottom-20 sm:bottom-24 right-2 sm:right-4 z-50">
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                width={window.innerWidth < 640 ? 280 : 320}
                height={window.innerWidth < 640 ? 350 : 400}
                searchDisabled={false}
                skinTonesDisabled={false}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modal d'attachement */}
      {showAttachmentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Partager un fichier</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowAttachmentModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2 border-2 hover:border-primary hover:bg-primary/10 bg-transparent"
                onClick={() => handleFileUpload("image")}
              >
                <ImageIcon className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">Galerie</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2 border-2 hover:border-green-500 hover:bg-green-50 bg-transparent"
                onClick={() => handleCameraCapture("image")}
              >
                <Camera className="h-6 w-6 text-green-600" />
                <span className="text-sm font-medium">Photo</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2 border-2 hover:border-purple-500 hover:bg-purple-50 bg-transparent"
                onClick={() => handleFileUpload("video")}
              >
                <Video className="h-6 w-6 text-purple-600" />
                <span className="text-sm font-medium">Vidéo</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2 border-2 hover:border-orange-500 hover:bg-orange-50 bg-transparent"
                onClick={() => handleFileUpload("file")}
              >
                <FileText className="h-6 w-6 text-orange-600" />
                <span className="text-sm font-medium">Document</span>
              </Button>
            </div>

            <Button
              variant="outline"
              className="w-full h-16 mt-4 flex items-center justify-center gap-3 border-2 hover:border-red-500 hover:bg-red-50 bg-transparent"
              onClick={() => handleCameraCapture("video")}
            >
              <Video className="h-5 w-5 text-red-600" />
              <span className="font-medium">Enregistrer une vidéo</span>
            </Button>
          </div>
        </div>
      )}

      {/* Inputs cachés */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileChange(e, "image")}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => handleFileChange(e, "video")}
      />
      <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => handleFileChange(e, "file")} />

      {/* Overlay pour fermer l'emoji picker */}
      {showEmojiPicker && <div className="fixed inset-0 z-40" onClick={() => setShowEmojiPicker(false)} />}
    </>
  )
}
