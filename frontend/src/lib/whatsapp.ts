/**
 * Business WhatsApp number — single source of truth, read from `.env`
 * (`VITE_BUSINESS_NUMBER`). All WhatsApp CTAs build their links from here so
 * a number change never requires touching components.
 */
export const BUSINESS_NUMBER = import.meta.env.VITE_BUSINESS_NUMBER

/**
 * Build a `wa.me` deep link with a pre-filled, URL-encoded message.
 * The number is stripped to digits only, so callers may pass `08...`,
 * `+62...`, `628...`, or `62-878-...` forms.
 */
export const getWhatsAppLink = (phoneNumber: string, message: string) => {
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, "")
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`
}
