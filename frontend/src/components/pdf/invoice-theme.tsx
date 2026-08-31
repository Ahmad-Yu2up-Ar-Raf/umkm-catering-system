"use client"

import { createContext, useContext, useMemo } from "react"

export interface InvoiceThemeColors {
  background: string
  foreground: string
  primary: string
  primaryForeground: string
  muted: string
  mutedForeground: string
  border: string
  destructive: string
}

export interface InvoiceThemeTypography {
  heading: {
    fontFamily: string
    fontWeight: number
  }
  body: {
    fontFamily: string
    fontSize: number
  }
  accent: {
    fontFamily: string
    fontStyle: string
  }
}

export interface InvoiceThemeSpacing {
  page: {
    marginTop: number
    marginRight: number
    marginBottom: number
    marginLeft: number
  }
  sectionGap: number
  paragraphGap: number
  componentGap: number
}

export interface InvoiceThemePage {
  size: "A4"
  orientation: "portrait"
}

export interface InvoiceTheme {
  name: string
  colors: InvoiceThemeColors
  typography: InvoiceThemeTypography
  spacing: InvoiceThemeSpacing
  page: InvoiceThemePage
}

const defaultInvoiceTheme: InvoiceTheme = {
  name: "catering-nusantara",
  colors: {
    background: "#F4F1E8",
    foreground: "#3A352E",
    primary: "#8C5A2B",
    primaryForeground: "#FAF7EF",
    muted: "#EAE6DA",
    mutedForeground: "#7A7365",
    border: "#DDD6C6",
    destructive: "#A93B32",
  },
  typography: {
    heading: {
      fontFamily: "Fraunces",
      fontWeight: 700,
    },
    body: {
      fontFamily: "Space Grotesk",
      fontSize: 10.5,
    },
    accent: {
      fontFamily: "Instrument Serif",
      fontStyle: "italic",
    },
  },
  spacing: {
    page: {
      marginTop: 48,
      marginRight: 48,
      marginBottom: 56,
      marginLeft: 48,
    },
    sectionGap: 28,
    paragraphGap: 10,
    componentGap: 14,
  },
  page: {
    size: "A4" as const,
    orientation: "portrait",
  },
} satisfies InvoiceTheme as InvoiceTheme

type InvoiceThemeContextValue = {
  theme: InvoiceTheme
}

const InvoiceThemeContext = createContext<InvoiceThemeContextValue | null>(null)

export function useInvoiceTheme(): InvoiceTheme {
  const context = useContext(InvoiceThemeContext)
  if (!context) {
    throw new Error("useInvoiceTheme must be used within an InvoiceThemeProvider")
  }
  return context.theme
}

interface InvoiceThemeProviderProps {
  theme?: InvoiceTheme
  children: React.ReactNode
}

export function InvoiceThemeProvider({
  theme = defaultInvoiceTheme,
  children,
}: InvoiceThemeProviderProps) {
  const value = useMemo(() => ({ theme }), [theme])
  return (
    <InvoiceThemeContext.Provider value={value}>
      {children}
    </InvoiceThemeContext.Provider>
  )
}

export function rupiah(value: number | string): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value))
}

export { defaultInvoiceTheme }