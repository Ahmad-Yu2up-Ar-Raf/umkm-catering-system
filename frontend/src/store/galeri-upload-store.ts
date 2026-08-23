import { create } from "zustand"

/**
 * Active direct-to-Cloudinary upload count across the galeri form's media
 * fields. The drawer shells use it to disable submit and guard against
 * closing while files are still in flight.
 */
interface GaleriUploadState {
  activeUploads: number
}

export const useGaleriUploadStore = create<GaleriUploadState>(() => ({
  activeUploads: 0,
}))

export const adjustActiveGaleriUploads = (delta: number) =>
  useGaleriUploadStore.setState((state) => ({
    activeUploads: Math.max(0, state.activeUploads + delta),
  }))