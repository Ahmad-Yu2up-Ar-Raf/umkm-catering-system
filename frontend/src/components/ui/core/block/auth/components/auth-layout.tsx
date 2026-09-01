import type React from "react"

import { cn } from "@/lib/utils"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/fragments/shadcn-ui/card"

import { buttonVariants } from "@/components/ui/fragments/shadcn-ui/button"
import { Link } from "react-router"
import { NavbarLogo } from "../../../layout/nav/app-logo"
import MediaItem from "@/components/ui/fragments/custom-ui/media-item"

type AuthLayoutProps = {
  children?: React.ReactNode
  title?: string
  description?: string

  loading?: boolean
  className?: string

  formType?: "login" | "register" | undefined // ✅ Allow undefined
}

export default function AuthLayout({
  children,
  formType,
  loading,
  title = "Selamat Datang!",
  description = "Mulai konsultasi dengan doktermu.",
}: AuthLayoutProps) {
  const formTypeLabel = formType == "register" ? "Login" : "Register"
  const formTypeLink = formType == "register" ? "/login" : "/register"
  return (
    <div className="grid min-h-dvh lg:flex">
      <div className={cn("w-full bg-background p-6 md:p-10")}>
        <div className={cn("relative flex h-full flex-col gap-4")}>
          <div className="flex justify-center gap-2 md:justify-start">
            <Link
              to={"/"}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "flex items-center gap-0 p-0 font-medium hover:bg-transparent [&_span]:text-lg"
              )}
            >
              <NavbarLogo />
            </Link>
          </div>

          <Card className="relative m-auto flex h-fit w-full max-w-sm flex-col justify-center gap-8 border-none bg-transparent p-0 shadow-none ring-0">
            <CardContent className="size-full border-0 p-0">
              <CardHeader className="flex flex-col justify-center gap-4 text-center">
                {/* <AppLogoIcon className="m-auto size-11" /> */}

                <div className="w-full space-y-1 text-center">
                  <CardTitle className="text-lg font-semibold tracking-wide">
                    {title}
                  </CardTitle>
                  <CardDescription className="w-full text-sm text-muted-foreground">
                    {description}
                  </CardDescription>
                </div>
              </CardHeader>

              <div className="relative my-8 flex flex-col gap-4 md:px-7">
                {children}
              </div>
              <CardFooter className="sr-only border-none bg-transparent p-0 text-center">
                <p className="w-full text-center text-xs text-muted-foreground/80 md:text-sm">
                  {formType === "login"
                    ? "Belum punya akun?"
                    : "Sudah punya akun?"}

                  <Link
                    to={formTypeLink}
                    className={cn(
                      "text-muted-foreground/90 underline underline-offset-4 hover:text-primary",

                      loading &&
                        "pointer-events-none cursor-none text-foreground/50"
                    )}
                  >
                    {" "}
                    {formTypeLabel}.{" "}
                  </Link>
                </p>
              </CardFooter>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="relative hidden content-center justify-end bg-background lg:block dark:border-l">
        <MediaItem
          webViewLink={"assets/images/lifestyle/paket-combo-1.png"}

          className="inset- 0 ml-auto h-[89dvh] w-[45dvw] rounded-l-2xl"
        />
      </div>
    </div>
  )
}
