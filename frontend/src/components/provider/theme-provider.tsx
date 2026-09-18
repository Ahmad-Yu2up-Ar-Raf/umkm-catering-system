import * as React from "react"

// Paksa tipe hanya menerima 'light'
type Theme = "light"

type ThemeProviderProps = {
  children: React.ReactNode
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeProviderContext = React.createContext<
  ThemeProviderState | undefined
>(undefined)

export function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {

  // Efek ini menjamin elemen <html> selalu memiliki class 'light' secara permanen
  React.useEffect(() => {
    const root = document.documentElement
    root.classList.remove("dark")
    root.classList.add("light")
  }, [])

  const value = React.useMemo(
    () => ({
      theme: "light" as Theme,
      // Function kosong. Jika ada tombol/komponen yang tidak sengaja
      // men-trigger pergantian tema, sistem akan mengabaikannya.
      setTheme: () => {},
    }),
    []
  )

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}
