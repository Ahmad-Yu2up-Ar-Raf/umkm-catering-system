import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  build: {
    // P3.2 perf: vendor chunking so route navigations revalidate small
    // content chunks instead of one monolithic index bundle. Budgets:
    // JS <300 KB compressed total, CSS <100 KB (see PERFORMANCE_EXECUTION_PLAN.md).
    rollupOptions: {
      output: {
        // Vite 8 (Rolldown) requires the function form — the legacy object
        // map is rejected at build time ("manualChunks is not a function").
        manualChunks: (id: string): string | undefined => {
          if (!id.includes("node_modules")) return undefined
          if (id.includes("node_modules/react-dom") || id.includes("node_modules/react-router") || /node_modules\/react\//.test(id))
            return "vendor-react"
          if (
            id.includes("node_modules/gsap") ||
            id.includes("node_modules/@gsap") ||
            id.includes("node_modules/framer-motion") ||
            id.includes("node_modules/lenis")
          )
            return "vendor-motion"
          if (
            id.includes("node_modules/@tanstack") ||
            id.includes("node_modules/ky") ||
            id.includes("node_modules/zustand")
          )
            return "vendor-data"
          if (
            id.includes("node_modules/radix-ui") ||
            id.includes("node_modules/sonner") ||
            id.includes("node_modules/vaul") ||
            id.includes("node_modules/embla-carousel")
          )
            return "vendor-ui"
          return undefined
        },
      },
    },
  },
})
