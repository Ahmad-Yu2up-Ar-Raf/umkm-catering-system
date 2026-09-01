import {
  StatusPesananOptions,
  MetodePembayaranOptions,
  DEFAULT_STATUS_ICON,
  DEFAULT_METODE_ICON,
  DEFAULT_BADGE_COLOR,
  type StatusPesananType,
  type MetodePembayaranType,
} from "../config/pesanan-badge-config"

export function getStatusPesananIcon(status: StatusPesananType | string | null | undefined) {
  const found = StatusPesananOptions.find((item) => item.value === status)
  return found?.icon ?? DEFAULT_STATUS_ICON
}

export function getStatusPesananLabel(status: StatusPesananType | string | null | undefined): string {
  const found = StatusPesananOptions.find((item) => item.value === status)
  return found?.label ?? (status ? String(status) : "—")
}

export function getStatusPesananColor(status: StatusPesananType | string | null | undefined): string {
  const found = StatusPesananOptions.find((item) => item.value === status)
  return found?.badgeColor ?? DEFAULT_BADGE_COLOR
}

export function getMetodePembayaranIcon(metode: MetodePembayaranType | string | null | undefined) {
  const found = MetodePembayaranOptions.find((item) => item.value === metode)
  return found?.icon ?? DEFAULT_METODE_ICON
}

export function getMetodePembayaranLabel(metode: MetodePembayaranType | string | null | undefined): string {
  const found = MetodePembayaranOptions.find((item) => item.value === metode)
  return found?.label ?? (metode ? String(metode) : "—")
}

export function getMetodePembayaranColor(metode: MetodePembayaranType | string | null | undefined): string {
  const found = MetodePembayaranOptions.find((item) => item.value === metode)
  return found?.badgeColor ?? DEFAULT_BADGE_COLOR
}

// Legacy aliases for directive naming
export const getStatusPesananIconAlias = getStatusPesananIcon
export const getMetodePembayaranIconAlias = getMetodePembayaranIcon
export const getMetodePembayaranColorAlias = getMetodePembayaranColor
