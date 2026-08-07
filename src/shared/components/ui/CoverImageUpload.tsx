import { useRef, useState, type ChangeEvent } from 'react'
import { Button } from '@/shared/components/ui/Button'

export function CoverImageUpload({
  url,
  onUpload,
  alt = 'Ảnh bìa',
}: {
  url: string | null | undefined
  onUpload: (file: File) => Promise<void>
  alt?: string
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
    <div className="relative flex h-32 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-blue-400 to-brand-blue-600 sm:h-40">
      {url && <img src={url} alt={alt} className="size-full object-cover" />}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        loading={uploading}
        onClick={() => fileInputRef.current?.click()}
        className="absolute bottom-3 right-3"
      >
        {url ? 'Đổi ảnh bìa' : 'Tải ảnh bìa'}
      </Button>
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
