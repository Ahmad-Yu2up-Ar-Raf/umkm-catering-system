import { api } from "@/api/client"
import type { UploadTransport } from "react-mediadrop"

/** Canonical Cloudinary product folder — identical prefix to PaketSeeder. */
export const CLOUDINARY_PRODUCTS_FOLDER = "catering-nusantara/products"

interface SignatureResponse {
  signature: string
  timestamp: number
  apiKey: string
  cloudName: string
  folder: string
}

/** One signature per session — Cloudinary's timestamp window is generous, so we reuse it until it nears expiry. */
let cachedSignature: SignatureResponse | null = null

async function getUploadSignature(): Promise<SignatureResponse> {
  const now = Math.floor(Date.now() / 1000)
  if (!cachedSignature || now - cachedSignature.timestamp > 3300) {
    const res = await api
      .post("admin/cloudinary/signature", { json: {} })
      .json<{ data: SignatureResponse }>()
    cachedSignature = res.data
  }
  return cachedSignature
}

/**
 * Build the canonical asset URL from Cloudinary's upload response metadata
 * (public_id + version + format) — guarantees NO delivery transformation can
 * ever leak into the database (same rule as PaketSeeder::canonicalUrl).
 */
export function toCanonicalCloudinaryUrl(upload: {
  public_id?: string
  version?: number | string
  format?: string
  secure_url?: string
}): string {
  if (!upload.public_id || upload.version === undefined || !upload.format) {
    return upload.secure_url ?? ""
  }
  return `https://res.cloudinary.com/${cachedSignature?.cloudName ?? ""}/image/upload/v${upload.version}/${upload.public_id}.${upload.format}`
}

/**
 * Transport that uploads one file straight to Cloudinary (signed, via
 * XMLHttpRequest for cross-browser progress + abort). No retry/concurrency of
 * its own — that's mediadrop's queue's job.
 */
export const cloudinaryTransport: UploadTransport = {
  async upload(file, { onProgress, signal }) {
    const signature = await getUploadSignature()

    const formData = new FormData()
    formData.append("file", file.file)
    formData.append("api_key", signature.apiKey)
    formData.append("timestamp", String(signature.timestamp))
    formData.append("signature", signature.signature)
    formData.append("folder", signature.folder)

    const result = await new Promise<Record<string, unknown>>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open("POST", `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`)
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress({ loaded: event.loaded, total: event.total })
        }
      }
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText) as Record<string, unknown>)
        } else {
          const error = new Error("Upload gagal") as Error & { status?: number }
          error.status = xhr.status
          reject(error)
        }
      }
      xhr.onerror = () => reject(new Error("Gagal terhubung ke Cloudinary"))
      signal.addEventListener(
        "abort",
        () => {
          xhr.abort()
          reject(new Error("Upload dibatalkan"))
        },
        { once: true }
      )
      xhr.send(formData)
    })

    return { response: result }
  },
}
