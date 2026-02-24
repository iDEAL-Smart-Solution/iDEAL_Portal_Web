import React, { useRef, useState } from "react"
import axios from "axios"
import axiosInstance from "@/services/api"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface Props {
  studentId?: string
  isPrincipal?: boolean
  onUploaded?: (url: string) => void
}

export function SignatureUploader({ studentId, isPrincipal = false, onUploaded }: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [isUploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (file?: File) => {
    setError(null)
    const f = file || (fileRef.current && fileRef.current.files && fileRef.current.files[0])
    if (!f) return setError("No file selected")

    // Validate size <= 100KB
    if (f.size > 100 * 1024) {
      return setError("File too large. Maximum allowed size is 100KB.")
    }

    // Accept only images
    if (!f.type.startsWith("image/")) {
      return setError("Only image files are allowed.")
    }

    const formData = new FormData()
    formData.append("file", f)
    if (studentId) formData.append("studentId", studentId)
    formData.append("isPrincipal", String(isPrincipal))

    try {
      setUploading(true)
      const resp = await axiosInstance.post(`/ReportCard/sign`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      const url = resp.data?.url
      if (url) {
        onUploaded && onUploaded(url)
      } else {
        setError("Upload succeeded but no url returned.")
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Upload Signature</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isPrincipal ? "Upload Principal Signature" : "Upload Your Signature"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <input ref={fileRef} type="file" accept="image/*" />
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex items-center gap-2">
            <Button onClick={() => handleFile() } disabled={isUploading}>
              {isUploading ? <LoadingSpinner size="sm" /> : "Upload"}
            </Button>
            <Button variant="ghost" onClick={() => fileRef.current && (fileRef.current.value = "")}>Clear</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
