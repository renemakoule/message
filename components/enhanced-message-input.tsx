"use client"

import type React from "react"
import { useState, useRef } from "react"
import { SendHorizontal, Paperclip, Smile, X, Camera, Video, FileText, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import EmojiPicker from "emoji-picker-react"
import { toast } from "sonner"
import { useMessages } from "@/hooks/use-messages" // <-- CORRECTION: Importer le bon hook

interface EnhancedMessageInputProps {
  conversationId: string
}

export function EnhancedMessageInput({ conversationId }: EnhancedMessageInputProps) {
  // CORRECTION: Utiliser le hook `useMessages` pour obtenir la fonction `sendMessage`
  const { sendMessage } = useMessages(conversationId)

  const [messageText, setMessageText] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showAttachmentModal, setShowAttachmentModal] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const handleSendMessage = () => {
    if (messageText.trim()) {
      sendMessage(messageText.trim())
      setMessageText("")
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value)

    // Auto-resize textarea
    const textarea = e.target
    textarea.style.height = "auto"
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px"
  }

  const onEmojiClick = (emojiData: any) => {
    const textarea = textareaRef.current
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newText = messageText.slice(0, start) + emojiData.emoji + messageText.slice(end)
      setMessageText(newText)

      // Restore cursor position
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

  const handleCameraCapture = (type: "image" | "video") => {
    setShowAttachmentModal(false)

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          video: true,
          audio: type === "video",
        })
        .then((stream) => {
          // Ici vous pourriez ouvrir un modal de capture
          console.log(`Capture ${type} activée`, stream)
          // Pour la démo, on simule juste l'action
          sendMessage(`📷 ${type === "image" ? "Photo" : "Vidéo"} capturée`)
          stream.getTracks().forEach((track) => track.stop())
        })
        .catch((err) => {
          console.error("Erreur accès caméra:", err)
          toast.error("Impossible d'accéder à la caméra.")
        })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0]
    if (file) {
      // Pour une vraie implémentation, il faudrait utiliser `sendMediaMessage` du hook useMessages
      // Mais pour cette démo, on simule juste l'envoi du nom du fichier
      sendMessage(`📎 ${file.name} (${type})`)
      e.target.value = "" // Reset input
    }
  }

  return (
    <>
      <div className="border-t p-4 bg-white">
        <div className="relative">
          {/* Zone de saisie principale */}
          <div className="flex items-end gap-3">
            
            {/* Textarea avec boutons intégrés */}
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                placeholder="Tapez votre message..."
                value={messageText}
                onChange={handleTextareaChange}
                onKeyPress={handleKeyPress}
                className="min-h-[48px] max-h-[120px] resize-none pr-20 py-3 pl-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 transition-colors"
                style={{ height: "48px" }}
              />

              {/* Boutons intégrés dans le textarea */}
              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                {/* Bouton d'attachement */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="mb-1 flex-shrink-0"
                  onClick={() => setShowAttachmentModal(true)}
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
                {/* Bouton emoji */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Smile className="h-4 w-4 text-gray-500" />
                </Button>

                {/* Bouton d'envoi */}
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
                >
                  <SendHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="absolute bottom-16 right-0 z-50">
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                width={350}
                height={400}
                searchDisabled={false}
                skinTonesDisabled={false}
                previewConfig={{
                  showPreview: true,
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modal d'attachement */}
      {showAttachmentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            {/* En-tête */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Partager</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowAttachmentModal(false)} className="rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Options d'attachement */}
            <div className="grid grid-cols-2 gap-4">
              {/* Images */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full h-20 flex flex-col gap-2 border-2 hover:border-blue-500 hover:bg-blue-50 bg-transparent"
                  onClick={() => handleFileUpload("image")}
                >
                  <ImageIcon className="h-6 w-6 text-blue-600" />
                  <span className="text-sm font-medium">Galerie</span>
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-20 flex flex-col gap-2 border-2 hover:border-green-500 hover:bg-green-50 bg-transparent"
                  onClick={() => handleCameraCapture("image")}
                >
                  <Camera className="h-6 w-6 text-green-600" />
                  <span className="text-sm font-medium">Appareil photo</span>
                </Button>
              </div>

              {/* Vidéos et fichiers */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full h-20 flex flex-col gap-2 border-2 hover:border-purple-500 hover:bg-purple-50 bg-transparent"
                  onClick={() => handleFileUpload("video")}
                >
                  <Video className="h-6 w-6 text-purple-600" />
                  <span className="text-sm font-medium">Vidéo</span>
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-20 flex flex-col gap-2 border-2 hover:border-orange-500 hover:bg-orange-50 bg-transparent"
                  onClick={() => handleFileUpload("file")}
                >
                  <FileText className="h-6 w-6 text-orange-600" />
                  <span className="text-sm font-medium">Document</span>
                </Button>
              </div>
            </div>

            {/* Option caméra vidéo */}
            <div className="mt-4">
              <Button
                variant="outline"
                className="w-full h-16 flex items-center justify-center gap-3 border-2 hover:border-red-500 hover:bg-red-50 bg-transparent"
                onClick={() => handleCameraCapture("video")}
              >
                <Video className="h-5 w-5 text-red-600" />
                <span className="font-medium">Enregistrer une vidéo</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Inputs cachés pour les fichiers */}
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
      <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => handleFileChange(e, "document")} />

      {/* Overlay pour fermer l'emoji picker */}
      {showEmojiPicker && <div className="fixed inset-0 z-40" onClick={() => setShowEmojiPicker(false)} />}
    </>
  )
}