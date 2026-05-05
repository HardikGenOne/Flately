type EnvValue = string | undefined

function readEnv(key: string, fallback: string): string {
  if (typeof window !== 'undefined' && 'env' in window) {
    const raw = (window as unknown as { env: Record<string, EnvValue> }).env[key]
    if (typeof raw === 'string' && raw.trim() !== '') {
      return raw.trim()
    }
  }

  const rawMeta = import.meta.env[key]
  if (typeof rawMeta === 'string' && rawMeta.trim() !== '') {
    return rawMeta.trim()
  }

  return fallback
}

export const runtimeConfig = {
  apiBaseUrl: readEnv('VITE_API_BASE_URL', import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'),
  socketUrl: readEnv('VITE_SOCKET_URL', import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000'),
  cloudinaryCloudName: readEnv('VITE_CLOUDINARY_CLOUD_NAME', ''),
  cloudinaryUploadPreset: readEnv('VITE_CLOUDINARY_UPLOAD_PRESET', ''),
}
