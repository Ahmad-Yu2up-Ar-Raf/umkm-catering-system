import { create } from "zustand"

/**
 * Active direct-to-Cloudinary upload count across the paket form's media
 * fields. The drawer shells use it to disable submit and guard against
 * closing while files are still in flight.
 */
interface PaketUploadState {
  activeUploads: number
}

export const usePaketUploadStore = create<PaketUploadState>(() => ({
  activeUploads: 0,
}))

export const adjustActiveUploads = (delta: number) =>
  usePaketUploadStore.setState((state) => ({
    activeUploads: Math.max(0, state.activeUploads + delta),
  }))
