import { useRef, useState, type ChangeEvent } from 'react'

export function AvatarUpload({
  url,
  onUpload,
  alt = 'Ảnh đại diện',
  label = 'Đổi ảnh',
}: {
  url: string | null | undefined
  onUpload: (file: File) => Promise<void>
  alt?: string
  label?: string
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await onUpload(file)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="relative mx-auto size-32 md:mx-0">
      <div className="size-32 overflow-hidden rounded-full bg-slate-200">
        {url && <img src={url} alt={alt} className="size-full object-cover" />}
      </div>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        aria-label={label}
        className="absolute bottom-0 right-0 flex size-9 items-center justify-center rounded-full bg-brand-blue-500 text-white shadow"
      >
        {uploading ? '…' : <CameraIcon />}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => void handleFileChange(e)}
      />
    </div>
  )
}

function CameraIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 8h3l2-2h6l2 2h3v11H4z" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  )
}
