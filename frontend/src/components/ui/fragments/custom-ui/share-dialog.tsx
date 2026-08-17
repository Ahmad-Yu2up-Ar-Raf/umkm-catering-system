"use client"

import { useState } from "react"
import { toast } from "sonner"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkCircle02Icon,
  Copy01Icon,
  FacebookIcon,
  Link01Icon,
  TelegramIcon,
  TwitterIcon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import { Input } from "@/components/ui/fragments/shadcn-ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/fragments/shadcn-ui/dialog"

import { copyToClipboard, shareUrlFor, type SharePayload } from "@/lib/share"

/** Social targets for the desktop fallback — Hugeicon brand marks. */
const SOCIALS = [
  { name: "WhatsApp", icon: WhatsappIcon, hrefFor: shareUrlFor.whatsapp },
  { name: "Telegram", icon: TelegramIcon, hrefFor: shareUrlFor.telegram },
  { name: "X / Twitter", icon: TwitterIcon, hrefFor: shareUrlFor.twitter },
  { name: "Facebook", icon: FacebookIcon, hrefFor: shareUrlFor.facebook },
] as const

/**
 * FB share dialog — the fallback surface when the Web Share API is
 * unavailable. Direct social deep links + a copy-link field with toast
 * confirmation. Renders nothing until a payload is provided.
 */
export function ShareDialog({
  open,
  onOpenChange,
  payload,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  payload: SharePayload | null
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!payload) return
    const ok = await copyToClipboard(payload.url)
    setCopied(ok)
    if (ok) {
      toast.success("Tautan disalin", {
        description: "Bagikan paket ini dengan siapa pun.",
      })
    } else {
      toast.error("Gagal menyalin tautan", {
        description: "Coba salin tautan secara manual dari kolom di atas.",
      })
    }
    window.setTimeout(() => setCopied(false), 2500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-semibold tracking-tight">
            Bagikan Paket
          </DialogTitle>
          <DialogDescription>
            Pilih aplikasi favorit atau salin tautannya — preview lengkap
            (gambar, judul, deskripsi) akan tampil di sana.
          </DialogDescription>
        </DialogHeader>

        {payload && (
          <div className="flex flex-col gap-5">
            {/* Social channels */}
            <div className="grid grid-cols-2 gap-2.5">
              {SOCIALS.map(({ name, icon, hrefFor }) => (
                <a
                  key={name}
                  href={hrefFor(payload)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors duration-300 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <HugeiconsIcon icon={icon} className="size-4 text-primary" />
                  {name}
                </a>
              ))}
            </div>

            {/* Copy link */}
            <div className="flex items-center gap-2">
              <div className="relative min-w-0 flex-1">
                <HugeiconsIcon
                  icon={Link01Icon}
                  className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  readOnly
                  value={payload.url}
                  className="h-11 pr-3 pl-9"
                  onFocus={(e) => e.currentTarget.select()}
                  aria-label="Tautan paket"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleCopy}
                className="h-11 shrink-0 gap-2 whitespace-nowrap"
              >
                <HugeiconsIcon
                  icon={copied ? CheckmarkCircle02Icon : Copy01Icon}
                  className="size-4"
                />
                {copied ? "Tersalin" : "Salin"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
