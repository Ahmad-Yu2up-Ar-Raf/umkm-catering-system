import BorderSvg from "@/components/svg/border-svg"

function SiteBorder() {
  return (
    <div className="pointer-events-none fixed inset-0 z-99 flex h-full w-full flex-col justify-between p-2 [&_svg]:size-17 [&_svg]:fill-primary [&_svg]:md:size-22">
      <div className="flex h-fit w-full justify-between">
        <BorderSvg className="left-2 -rotate-90" />
        <BorderSvg className="right-2" />
      </div>
      <div className="flex h-fit w-full justify-between">
        <BorderSvg className="left-2 rotate-180" />
        <BorderSvg className="right-2 rotate-90" />
      </div>
    </div>
  )
}

export default SiteBorder
