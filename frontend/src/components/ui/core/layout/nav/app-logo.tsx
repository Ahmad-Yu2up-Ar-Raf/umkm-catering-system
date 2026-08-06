import { Link } from "react-router"
import Logo from "@/components/svg/app-logo-svg"

const appName = import.meta.env.VITE_APP_NAME

export default function AppLogo() {
  return (
    <>
      <div className="flex aspect-square size-8 items-center justify-center rounded-xl bg-sidebar-primary">
        <Logo className="size-5 text-pink-50" />
      </div>
      <div className="ml-1 grid flex-1 text-left text-sm">
        <span className="mb-0.5 truncate font-accent leading-tight font-semibold">
          {appName}
        </span>
      </div>
    </>
  )
}

export const NavbarLogo = () => {
  return (
    <Link
      to="/"
      className="relative ml-1 z-20 flex items-center space-x-1.5 py-1 text-xs font-normal text-primary  lg:space-x-2"
    >
      <Logo className="size-7 lg:size-8.5" />

      <p className="font-accent tracking-widest text-base  italic font-bold text-accent-foreground ">
        {appName}
      </p>
    </Link>
  )
}
