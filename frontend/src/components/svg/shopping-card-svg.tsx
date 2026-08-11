import type { SVGProps } from "react"
const ShoppingCart = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="0.2em"
    height="0.2em"
    fill="var(--primary-foreground)"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    className="lucide lucide-shopping-cart-icon lucide-shopping-cart"
    {...props}
  >
    <circle cx={8} cy={21} r={1} />
    <circle cx={19} cy={21} r={1} />
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
  </svg>
)
export default ShoppingCart
