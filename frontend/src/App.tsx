import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "react-router"
import { router } from "./router"
import { Toaster } from "./components/ui/fragments/shadcn-ui/sonner"

import { TooltipProvider } from "./components/ui/fragments/shadcn-ui/tooltip"
import GlobalImageModal from "./components/ui/core/visual/global-image-modal"
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data dianggap aman selama 5 menit, jangan fetch terus
      refetchOnWindowFocus: false, // Matikan fetch otomatis saat layar difokuskan kembali
      retry: 1,
    },
  },
})

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster position="top-center" />
        <RouterProvider router={router} />
        <GlobalImageModal />
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App
