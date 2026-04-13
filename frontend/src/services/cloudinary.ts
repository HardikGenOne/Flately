import { runtimeConfig } from '@/config/runtimeConfig'
import { ApiError, apiRequest } from '@/services/api'

type SignedUploadConfig = {
  cloudName: string
  apiKey: string
  folder: string
  timestamp: number
  signature: string
}

export type CloudinaryUploadAvailability = 'signed' | 'unsigned' | 'unavailable'

type CloudinaryUploadResponse = {
  secure_url?: string
  error?: {
    message?: string
  }
}

export class CloudinaryService {
  async getCloudinaryUploadAvailability(): Promise<CloudinaryUploadAvailability> {
    const signedConfig = await this.getSignedUploadConfig()

    if (signedConfig) {
      return 'signed'
    }

    if (runtimeConfig.cloudinaryCloudName && runtimeConfig.cloudinaryUploadPreset) {
      return 'unsigned'
    }

    return 'unavailable'
  }

  async uploadImageToCloudinary(file: File): Promise<string> {
    const signedConfig = await this.getSignedUploadConfig()

    if (signedConfig) {
      return this.uploadWithSignedConfig(file, signedConfig)
    }

    return this.uploadWithUnsignedPreset(file)
  }

  private async parseCloudinaryResponse(response: Response): Promise<string> {
    const json = (await response.json()) as CloudinaryUploadResponse

    if (!response.ok || !json.secure_url) {
      throw new Error(json.error?.message || 'Failed to upload image')
    }

    return json.secure_url
  }

  private async uploadWithSignedConfig(file: File, config: SignedUploadConfig): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('timestamp', String(config.timestamp))
    formData.append('signature', config.signature)
    formData.append('api_key', config.apiKey)
    formData.append('folder', config.folder)

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      },
    )

    return this.parseCloudinaryResponse(response)
  }

  private async uploadWithUnsignedPreset(file: File): Promise<string> {
    const cloudName = runtimeConfig.cloudinaryCloudName
    const uploadPreset = runtimeConfig.cloudinaryUploadPreset

    if (!cloudName || !uploadPreset) {
      throw new Error('Cloudinary is not configured')
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', uploadPreset)

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      },
    )

    return this.parseCloudinaryResponse(response)
  }

  private async getSignedUploadConfig(): Promise<SignedUploadConfig | null> {
    try {
      return await apiRequest<SignedUploadConfig>({
        method: 'POST',
        url: '/uploads/signature',
        data: {},
      })
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 503)) {
        return null
      }

      throw error
    }
  }
}

const cloudinaryService = new CloudinaryService()

export async function getCloudinaryUploadAvailability(): Promise<CloudinaryUploadAvailability> {
  return cloudinaryService.getCloudinaryUploadAvailability()
}

export async function uploadImageToCloudinary(file: File): Promise<string> {
  return cloudinaryService.uploadImageToCloudinary(file)
}
