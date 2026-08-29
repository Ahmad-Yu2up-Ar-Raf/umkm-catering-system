"use client"

import { createContext, useContext, useMemo, type ReactNode } from "react"

export interface PdfcnTheme {
  name: string
  primitives: PdfcnPrimitives
  colors: {
    background: string
    foreground: string
    primary: string
    primaryForeground: string
    muted: string
    mutedForeground: string
    border: string
    destructive: string
    success: string
    warning: string
    info: string
  }
  typography: {
    body: { fontFamily: string; fontSize: number; lineHeight: number }
    heading: {
      fontFamily: string
      fontWeight: number
      lineHeight: number
      fontSize: {
        h1: number
        h2: number
        h3: number
        h4: number
        h5: number
        h6: number
      }
    }
  }
  spacing: {
    page: { marginTop: number; marginRight: number; marginBottom: number; marginLeft: number }
    sectionGap: number
    paragraphGap: number
    componentGap: number
  }
  page: { size: "A4" | "Letter" | "A5" | "A3"; orientation: "portrait" | "landscape" }
}

export interface PdfcnPrimitives {
  text: {
    variants: Record<string, { fontSize: number; lineHeight: number }>
    weights: Record<string, number>
  }
  heading: {
    fontFamily: string
    fontWeight: number
    lineHeight: number
    fontSize: Record<string, number>
  }
}

export const defaultPrimitives: PdfcnPrimitives = {
  text: {
    variants: {
      xs: { fontSize: 9, lineHeight: 1.5 },
      sm: { fontSize: 10, lineHeight: 1.5 },
      base: { fontSize: 11, lineHeight: 1.6 },
      lg: { fontSize: 12, lineHeight: 1.6 },
      xl: { fontSize: 14, lineHeight: 1.5 },
      "2xl": { fontSize: 16, lineHeight: 1.4 },
      "3xl": { fontSize: 18, lineHeight: 1.3 },
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  heading: {
    fontFamily: "Times-Roman",
    fontWeight: 700,
    lineHeight: 1.25,
    fontSize: {
      h1: 32,
      h2: 24,
      h3: 20,
      h4: 16,
      h5: 14,
      h6: 12,
    },
  },
}

export interface PdfcnThemeProviderProps {
  theme: PdfcnTheme
  children: ReactNode
}

const PdfcnThemeContext = createContext<PdfcnTheme | null>(null)

export function usePdfcnTheme(): PdfcnTheme {
  const context = useContext(PdfcnThemeContext)
  if (!context) {
    throw new Error("usePdfcnTheme must be used within a PdfcnThemeProvider")
  }
  return context
}

export function PdfcnThemeProvider({ theme, children }: PdfcnThemeProviderProps) {
  const value = useMemo(() => theme, [theme])
  return (
    <PdfcnThemeContext.Provider value={value}>
      {children}
    </PdfcnThemeContext.Provider>
  )
}