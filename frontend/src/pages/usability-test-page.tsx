import { TesterForm } from "@/components/ui/core/block/usability/tester-form"
import { LayoutWrapper } from "@/components/provider/layout-wrapper"

export default function UsabilityTestPage() {
  return (
    <LayoutWrapper>
      <main className="min-h-screen">
        <TesterForm />
      </main>
    </LayoutWrapper>
  )
}