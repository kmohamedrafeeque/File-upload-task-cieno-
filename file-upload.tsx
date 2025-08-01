"use client"

import { useState, useRef, type DragEvent, type ChangeEvent } from "react"
import { Upload, X, File } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FileWithId {
  id: string
  file: File
  previewUrl?: string // Add this line
}

export default function FileUpload() {
  const [files, setFiles] = useState<FileWithId[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    const newFiles: FileWithId[] = Array.from(selectedFiles).map((file) => {
      const fileWithId: FileWithId = {
        id: generateId(),
        file,
      }
      if (file.type.startsWith("image/")) {
        fileWithId.previewUrl = URL.createObjectURL(file)
      }
      return fileWithId
    })

    setFiles((prev) => [...prev, ...newFiles])
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((file) => file.id === id)
      if (fileToRemove?.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl) // Revoke the object URL
      }
      return prev.filter((file) => file.id !== id)
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">File Upload</h2>
        <p className="text-muted-foreground">Select files or drag and drop them here</p>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
            <Upload className="w-6 h-6 text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <p className="text-lg font-medium">
              Drop files here or{" "}
              <button onClick={openFileDialog} className="text-primary hover:underline">
                browse
              </button>
            </p>
            <p className="text-sm text-muted-foreground">Support for multiple file uploads</p>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Selected Files ({files.length})</h3>
            <Button variant="outline" size="sm" onClick={openFileDialog}>
              Add More Files
            </Button>
          </div>

          <div className="space-y-2">
            {files.map((fileItem) => (
              <div key={fileItem.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    {fileItem.previewUrl ? (
                      <img
                        src={fileItem.previewUrl || "/placeholder.svg"}
                        alt={fileItem.file.name}
                        className="w-10 h-10 object-cover rounded-md"
                      />
                    ) : (
                      <File className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{fileItem.file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(fileItem.file.size)}</p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(fileItem.id)}
                  className="flex-shrink-0 h-8 w-8 p-0 bg-black hover:bg-black/80 text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {files.length > 0 && (
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setFiles([])}>
                Clear All
              </Button>
              <Button>Upload Files ({files.length})</Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
