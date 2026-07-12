const CLOUD_NAME = 'p01dvbq8'
const UPLOAD_PRESET = 'haifarmer_preset'

export async function uploadImage(file, preset = UPLOAD_PRESET) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', preset)
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, { method: 'POST', body: formData })
  if (!res.ok) { const err = await res.json(); throw new Error(err.error?.message || 'Upload failed') }
  const data = await res.json()
  return data.secure_url
}

export async function uploadMultipleImages(files, preset) {
  return Promise.all(Array.from(files).map(f => uploadImage(f, preset)))
}

export function getCloudinaryUrl(publicId, options = {}) {
  const { width, height, crop = 'fill', quality = 'auto', format = 'auto' } = options
  let base = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`
  const transforms = []
  if (width) transforms.push(`w_${width}`)
  if (height) transforms.push(`h_${height}`)
  transforms.push(`c_${crop}`, `q_${quality}`, `f_${format}`)
  return `${base}/${transforms.join(',')}/${publicId}`
}
