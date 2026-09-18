import { SidebarTrigger } from "@/components/ui/fragments/shadcn-ui/sidebar"
import { Separator } from "@/components/ui/fragments/shadcn-ui/separator"
import { useLocation } from "react-router"

export function AppSidebarHeader() {
  const location = useLocation()

  // Logika dinamis untuk mengambil segment URL terakhir sebagai judul
  const pathSegments = location.pathname.split("/").filter(Boolean)
  const currentSegment = pathSegments[pathSegments.length - 1] || "dashboard"

  // Membersihkan tanda strip (-) jika ada, misal: "master-paket" -> "Master Paket"
  const title = currentSegment.replace(/-/g, " ")

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 content-center items-center gap-2 border-b bg-background px-4 md:hidden">
      {/* Tombol Hamburger untuk memanggil Sheet Sidebar */}
      <SidebarTrigger className="-ml-1" />
      <div className="">
        <Separator orientation="vertical" className="mr-2 h-4" />
      </div>

      {/* Judul Halaman Dinamis */}
      <h1 className="text-sm font-semibold text-foreground capitalize">
        {title}
      </h1>
    </header>
  )
}
