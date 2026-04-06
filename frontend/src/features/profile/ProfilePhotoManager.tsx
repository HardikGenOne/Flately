import { useRef, type ChangeEvent } from 'react'
import type { CloudinaryUploadAvailability } from '@/services/cloudinary'

export type CloudinaryStatusState = CloudinaryUploadAvailability | 'checking'

export function getCloudinaryStatusLabel(status: CloudinaryStatusState): string {
  if (status === 'checking') {
    return 'checking...'
  }

  if (status === 'signed') {
    return 'signed backend available'
  }

  if (status === 'unsigned') {
    return 'unsigned preset fallback'
  }

  return 'unavailable'
}

type ProfilePhotoManagerProps = {
  photos: string[]
  cloudinaryStatus: CloudinaryStatusState
  uploading: boolean
  onUploadFile: (file: File) => Promise<void> | void
  onRemovePhoto: (url: string) => void
  onSetPrimary: (index: number) => void
  statusTestId?: string
  uploadButtonLabel?: string
  helperText?: string
  unavailableMessage?: string
  emptyStateLabel?: string
}

export function ProfilePhotoManager({
  photos,
  cloudinaryStatus,
  uploading,
  onUploadFile,
  onRemovePhoto,
  onSetPrimary,
  statusTestId,
  uploadButtonLabel = 'Choose photo',
  helperText = 'The first photo is your primary image shown in app cards.',
  unavailableMessage = 'Cloudinary uploads are unavailable right now. Please try again in a moment.',
  emptyStateLabel = 'No photos yet. Add one to continue.',
}: ProfilePhotoManagerProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  function openFileChooser(): void {
    fileInputRef.current?.click()
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    await onUploadFile(file)
    event.target.value = ''
  }

  return (
    <div className="space-y-3 rounded-md border border-neutral-border p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-slate-700">Photos</p>
        <p className="text-xs uppercase tracking-wider text-slate-500" data-testid={statusTestId}>
          Cloudinary: {getCloudinaryStatusLabel(cloudinaryStatus)}
        </p>
      </div>

      {cloudinaryStatus === 'unavailable' ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {unavailableMessage}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(event) => {
            void handleFileChange(event)
          }}
          disabled={uploading}
          aria-label="Upload profile photo"
          title="Upload profile photo"
          className="hidden"
        />

        <button
          type="button"
          onClick={openFileChooser}
          disabled={uploading}
          className="rounded-md border border-neutral-border px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {uploadButtonLabel}
        </button>

        <p className="text-xs text-slate-500">{helperText}</p>
      </div>

      {uploading ? <p className="text-sm text-slate-500">Uploading image...</p> : null}

      {photos.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo, index) => (
            <div
              key={`${photo}-${index}`}
              className="overflow-hidden rounded-md border border-neutral-border"
            >
              <img src={photo} alt="Uploaded profile" className="h-36 w-full object-cover" />

              <div className="space-y-2 border-t border-neutral-border px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {index === 0 ? 'Primary photo' : `Photo ${index + 1}`}
                </p>

                <div className="flex gap-2">
                  {index > 0 ? (
                    <button
                      type="button"
                      onClick={() => onSetPrimary(index)}
                      className="rounded border border-neutral-border px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Set as primary
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onRemovePhoto(photo)}
                    className="rounded border border-neutral-border px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-600">{emptyStateLabel}</p>
      )}
    </div>
  )
}