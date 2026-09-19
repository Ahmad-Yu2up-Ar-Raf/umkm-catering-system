import { isValidElement } from "react"
import type { DependencyList, ReactNode } from "react"

import { minimalTheme } from "./theme-minimal"

export type PdfcnTheme = typeof minimalTheme

let serializedTheme = minimalTheme

export interface PdfcnThemeProviderProps {
  theme?: PdfcnTheme
  children: ReactNode
}

const renderForSerializer = (
  children: ReactNode,
  theme: PdfcnTheme
): ReactNode => {
  serializedTheme = theme

  if (!isValidElement(children) || typeof children.type !== "function") {
    return children
  }

  return (children.type as (props: unknown) => ReactNode)(children.props)
}

export const PdfcnThemeProvider = ({
  theme,
  children,
}: PdfcnThemeProviderProps) =>
  renderForSerializer(children, theme ?? minimalTheme)

export const usePdfcnTheme = (): PdfcnTheme => serializedTheme

export const useSafeMemo = <T,>(factory: () => T, _deps: DependencyList): T =>
  factory()
