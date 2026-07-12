import { useState, useRef } from 'react'
import { uploadImage } from '../../services/uploadService'

export default function ImageUploader({ value, onChange, label = 'Image', folder = '', className = '' }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(value || '')
  const fileRef = useRef()

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      const url = await uploadImage(file, folder ? `haifarmer_${folder}` : undefined)
      onChange(url)
      setPreview(url)
    } catch (err) { onChange(value); setPreview(value) }
    finally { setUploading(false); e.target.value = '' }
  }

  return (
    <div className={className}>
      {label && <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>}
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="flex gap-2">
            <input value={value || ''} onChange={e => { onChange(e.target.value); setPreview(e.target.value) }} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="https://... or upload" />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="shrink-0 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-50">
              {uploading ? '...' : 'Browse'}
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </div>
        {(preview || uploading) && (
          <div className="shrink-0">
            {uploading ? (
              <div className="h-16 w-16 rounded-lg bg-slate-100 animate-pulse flex items-center justify-center text-xs text-slate-400">Uploading...</div>
            ) : preview ? (
              <img src={preview} alt="" className="h-16 w-16 rounded-lg object-cover border" onError={() => setPreview('')} />
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
